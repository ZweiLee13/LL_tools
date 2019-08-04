/**
 * Created by hao.cheng on 2017/5/3.
 */
import React, { Component } from 'react';
import { Input, Form, Button, Row, Col, Card, Icon, Select, Table, Radio, Checkbox, Popover } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import baseDate from '../../common/baseDate.js';
import { object } from 'prop-types';

const { Option } = Select;
const FormItem = Form.Item;
const InputGroup = Input.Group;

function handleChange(value) {
    console.log(`selected ${value}`);
}

// 结果显示窗口
function ResultCard(props: { showResult: Boolean, showMsg1: string, result: Array<string> }) {
    if (!props.showResult) {
        return null;
    }

    return (
        <div style={{ background: '#ECECEC', padding: '30px' }}>
            <Card title="计算结果" bordered={false} >
                {
                    props.result.map((item, index) => {
                        return <p key={index}>{item}</p>
                    })
                }
            </Card>
        </div>
    );
}



class ExpComputations extends Component {

    state = {
        size: 'large',
        expTabel: baseDate.getExpTable(),
        initTabel: baseDate.initTabel(),
        out: {
            showResult: false,
            showMsg1: ""
        },
    };

    handleSizeChange = (e: { target: { value: any; }; }) => {
        this.setState({ size: e.target.value });
    };

    getExpTabel = () => {
        return baseDate.getExpTable();
    }

    handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
        let values = this.props.form.getFieldsValue();
        let result = this.getExp(values);
        let msg = this.getExpProject(result, values);
        values.showResult = true;
        values.showMsg1 = ` 从【${values.currentLevel}】级到【${values.nextLevel}】级 需要 【${result} 】经验`;
        //生成升级方案
        //优先使用桶，圣灵，狗粮
        //考虑是否有育成圣灵
        values.result = msg
        this.setState({ out: values });
        //console.log( this.state.expTabel[this.state.expTabel.totalType[values.typeIndex]][values.currentLevel])

    };
    //计算升级所需经验值
    getExp(values: any) {
        let exp = this.state.expTabel;
        console.log(this.state.expTabel)
        let totalType = exp.totalType[values.typeIndex]
        let type = exp.type[values.typeIndex]
        console.log(exp[totalType][values.currentLevel - 1])
        let currentExpTotal: number;
        if (Number.parseInt(values.currentLevel) === 0) {
            currentExpTotal = 0;
            //对输入进行修正
            values.currentLevel = 1;
        } else {
            currentExpTotal = Number.parseInt(exp[totalType][values.currentLevel - 1]) - Number.parseInt(values.nextLevelDvalue) + Number.parseInt(exp[type][values.currentLevel]);
        }
        let nextExpTotal: number = exp[totalType][values.nextLevel - 1]
        let result = nextExpTotal - currentExpTotal;
        return result;
    }
    //计算升级方式
    getExpProject(needExp: number, values: { other: Array<string>, selfSettingExp: number, currentLevel: number, nextLevel: number, blackArmor: number, platinumArmor: number }) {
        let exp = this.state.expTabel;
        let n = needExp % exp.armor.platinum;
        let a = "a";
        let useBlackArmorCount = 0;
        let usePlatinumArmorCount = 0;
        let blackArmorExp = exp.armor.black;
        let platinumArmorExp = exp.armor.platinum;
        //使用桶修正值
        const correctedValue = {
            platinum: 1.0,
            black: 1.0
        }
        //母猪祝福加成值
        const blessingValue = 1.1;
        /**
        * 判断母猪祝福加成
        */
       let blessing:boolean = values.other.indexOf('1')>-1;
        if (blessing) {
            blackArmorExp = blackArmorExp * blessingValue;
            platinumArmorExp = platinumArmorExp * blessingValue;
        }
        /**
         * 步骤1 处理自定义经验
         */
        console.log('part1|%d - %d = %d', needExp, values.selfSettingExp, needExp - values.selfSettingExp)
        let changeExp = needExp - values.selfSettingExp * (blessing ? blessingValue : 1);
        /**
         * 步骤2 判断 是否使用桶
         */
        if (values.other.indexOf('0') > -1) {
            console.log(1)
            //在经验大于4W时 至少使用黑桶 1
            //其余使用白桶
            if (changeExp >= blackArmorExp && values.blackArmor > 0) {
                //使用黑桶
                useBlackArmorCount = Math.min(Math.floor(changeExp / blackArmorExp), values.blackArmor);
                changeExp = changeExp - useBlackArmorCount * blackArmorExp;
                usePlatinumArmorCount = Math.min(Math.floor(changeExp / platinumArmorExp), values.platinumArmor);
                changeExp = changeExp - usePlatinumArmorCount * platinumArmorExp;
            } else if (values.platinumArmor > 0) {
                //使用白桶
                usePlatinumArmorCount = Math.min(Math.floor(changeExp / exp.armor.platinum), values.platinumArmor);
                changeExp = changeExp - usePlatinumArmorCount * platinumArmorExp;
            }
        }
        console.log("黑白桶：%d|%d", useBlackArmorCount, usePlatinumArmorCount)
        let result = this.getExpProjectCost(needExp, changeExp, useBlackArmorCount, usePlatinumArmorCount, values.currentLevel, values.nextLevel,blackArmorExp,platinumArmorExp);

        //结果显示
        /**
         * 从【XXX】等级到【XXX】等级 需要【XXX】经验
         * 1.使用狗粮 增加【XXX】 经验提升等级 到 【XX】级 距离【XXX】经验到下一级
         * 2.使用【N】次【X】个桶+【X】个圣灵到XX等级
         * 完成
         */
        /**
         * 算法一：
         * 总经验= 桶经验 X N + 剩余经验
         * 剩余经验 = 狗粮XN
         * 算法二：
         * 总经验 = 祝福圣灵X N + 桶经验 X N +圣灵经验
         * 注意 
         * 1.祝福可能大于或小于 桶经验  
         * 2.
         */
        return result;
    };

    getExpProjectCost(needExp: number, changeExp: number, useBlackArmorCount: number, usePlatinumArmorCount: number, currentLevel: number, nextLevel: number,blackArmorExp:number,platinumArmorExp:number ) {

        let result = [];


        result.push(`LV${currentLevel}->LV${nextLevel},需消耗【${needExp}】经验`)
        let i = 0;
        if (changeExp > 0) {
            i = i + 1;
            result.push(`${i}.使用狗粮提升【${changeExp}】经验`)
        }
        if (usePlatinumArmorCount > 0) {
            i = i + 1
            result.push(`${i}.使用【${usePlatinumArmorCount}】组白桶提升【${usePlatinumArmorCount * platinumArmorExp}】经验`)
        }
        if (useBlackArmorCount > 0) {
            i = i + 1
            result.push(`${i}.使用【${useBlackArmorCount}】组黑桶提升【${useBlackArmorCount * blackArmorExp}】经验`)
        }
        console.log(result)

        return result;
    }

    getFields() {
        const { getFieldDecorator } = this.props.form;
        const children = [];
        const labelStr = ["银圣灵", "金圣灵", "白圣灵", "黑圣灵", "小银", "小金", "小白", "小黑", "白桶", "黑桶"]
        const count = labelStr.length;
  
        for (let i = 0; i < labelStr.length; i++) {
            children.push(

                <Col span={6} key={i} style={{}}>

                    <FormItem
                        {...formItemLayout}
                        label={labelStr[i]}

                    >
                        {getFieldDecorator(`field-${i}`, {
                            initialValue: 0
                        })(<Input placeholder="placeholder" style={{ width: 50 }} />)}
                    </FormItem>


                </Col>,
            );
        }
        return children;
    }


    render() {
        const { size } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 14,
                    offset: 8,
                },
            },
        };
        const inputLayout = {
            width: 100
        }

        const columns = [
            {
                title: '等级',
                dataIndex: 'level',
                key: 'level',
            },
            {
                title: '银',
                dataIndex: 'silver',
                key: 'silver',
            },
            {
                title: '金',
                dataIndex: 'gold',
                key: 'gold',
            },
            {
                title: '白金/蓝宝石',
                dataIndex: 'platinum',
                key: 'platinum',
            },
            {
                title: '黑',
                dataIndex: 'black',
                key: 'black',
            },
        ];

        const currentPrefixLevel = getFieldDecorator('currentFixLevel', {
            initialValue: '0',
        })(
            <Select style={{ width: 90 }}>
                <Option value="0">未cc</Option>
                <Option value="1">cc</Option>
                <Option value="2">一觉</Option>
                <Option value="3">二觉</Option>
            </Select>
        );

        const nextPrefixLevel = getFieldDecorator('nextPrefixLevel', {
            initialValue: '0',
        })(
            <Select style={{ width: 90 }}>
                <Option value="0">未cc</Option>
                <Option value="1">cc</Option>
                <Option value="2">一觉</Option>
                <Option value="3">二觉</Option>
            </Select>
        );

        const optiont = {
            initialValue: "0"
        }



        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom />
                <Row gutter={10}>
                    <Col className="gutter-row" md={12}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="pb-m">
                                    <h3>经验计算器</h3>
                                </div>
                                <span className="card-tool"><Icon type="sync" /></span>
                                <Form onSubmit={this.handleSubmit}>
                                    <FormItem
                                        {...formItemLayout}
                                        label="类型"
                                    >
                                        {getFieldDecorator('typeIndex', { initialValue: "0" })(
                                            <Radio.Group buttonStyle="solid" >
                                                <Radio.Button value="0">银</Radio.Button>
                                                <Radio.Button value="1">金</Radio.Button>
                                                <Radio.Button value="2">白金/蓝宝石</Radio.Button>
                                                <Radio.Button value="3">黑</Radio.Button>
                                            </Radio.Group>
                                        )}
                                    </FormItem>



                                    <FormItem
                                        {...formItemLayout}
                                        label="当前等级"

                                    >
                                        {getFieldDecorator('currentLevel', { initialValue: 0 })(
                                            <Input style={inputLayout} />
                                        )}
                                    </FormItem>

                                    <FormItem
                                        {...formItemLayout}
                                        label="目标等级"

                                    >
                                        {getFieldDecorator('nextLevel', { initialValue: 50 })(
                                            <Input style={inputLayout} />
                                        )}
                                    </FormItem>

                                    <FormItem
                                        {...formItemLayout}
                                        label="距离下一级经验"

                                    >
                                        {getFieldDecorator('nextLevelDvalue', { initialValue: 0 })(
                                            <Input className=".ant-input-group-addon" style={inputLayout} />
                                        )}
                                    </FormItem>


                                    <FormItem
                                        {...formItemLayout}
                                        label="单个狗粮经验"
                                    >
                                        {getFieldDecorator('stuffExp', { initialValue: 0 })(
                                            <Input className=".ant-input-group-addon" style={inputLayout} />
                                        )}
                                    </FormItem>

                                    <FormItem
                                        {...formItemLayout}
                                        label="自定经验"
                                    >
                                        {getFieldDecorator('selfSettingExp', { initialValue: 0 })(
                                            <Input className=".ant-input-group-addon" style={inputLayout} />

                                        )}
                                    </FormItem>
                                    <Row gutter={24}>
                                        <Col span={6}></Col>
                                        <Col span={6}  {...formItemLayout} >
                                            <FormItem
                                                {...formItemLayout}
                                                label="白桶"
                                            >
                                                {getFieldDecorator('platinumArmor', { initialValue: 99 })(
                                                    <Input className=".ant-input-group-addon" style={inputLayout} />

                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={6}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="黑桶"
                                            >
                                                {getFieldDecorator('blackArmor', { initialValue: 0 })(
                                                    <Input className=".ant-input-group-addon" style={inputLayout} />

                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <FormItem
                                        {...formItemLayout}
                                        label="其他"
                                    >
                                        {getFieldDecorator('other', {
                                            initialValue: ['0'],
                                        })(
                                            <Checkbox.Group style={{ width: '100%' }}>
                                                <Row>
                                                    <Col span={8}>
                                                        <Checkbox value="0">是否使用桶</Checkbox>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Checkbox value="1">是否拥有育成精灵</Checkbox>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Checkbox disabled value="2">是否使用祝福圣灵</Checkbox>
                                                    </Col>

                                                </Row>
                                            </Checkbox.Group>,
                                        )}
                                    </FormItem>

                                    {/* <Row gutter={24}>{this.getFields()}</Row> */}

                                    <FormItem {...tailFormItemLayout}>
                                        <Button type="primary" htmlType="submit" size="large">计算</Button>
                                    </FormItem>

                                </Form>
                                <div className="pb-m">
                                    <ResultCard showResult={this.state.out.showResult} showMsg1={this.state.out.showMsg1} result={this.state.out.result} />
                                </div>


                                <span className="card-tool"><Icon type="sync" /></span>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={12}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="pb-m">
                                    <h3>经验表</h3><h4>(总经验值|当前等级升级需要经验值)</h4>
                                    <Table dataSource={this.state.initTabel} columns={columns} bordered defaultExpandAllRows pagination={false} size="small" />
                                </div>
                                <span className="card-tool"><Icon type="sync" /></span>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}
const ExpComputation = Form.create()(ExpComputations);



export default ExpComputation;