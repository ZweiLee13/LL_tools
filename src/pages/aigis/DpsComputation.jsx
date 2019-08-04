/**
 * Created by hao.cheng on 2017/5/3.
 */
import React from 'react';
import { Row, Col, Card, Timeline, Icon } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import b1 from '../../style/imgs/b1.jpg';


class DpsComputation extends React.Component {
    render() {
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
                                <ul className="list-group no-border">
                                    <li className="list-group-item">
                                        <span className="pull-left w-40 mr-m">
                                            <img src={b1} className="img-responsive img-circle" alt="test" />
                                        </span>
                                        <div className="clear">
                                            <span className="block">鸣人</span>
                                            <span className="text-muted">终于当上火影了！</span>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="pull-left w-40 mr-m">
                                            <img src={b1} className="img-responsive img-circle" alt="test" />
                                        </span>
                                        <div className="clear">
                                            <span className="block">佐助</span>
                                            <span className="text-muted">吊车尾~~</span>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="pull-left w-40 mr-m">
                                            <img src={b1} className="img-responsive img-circle" alt="test" />
                                        </span>
                                        <div className="clear">
                                            <span className="block">小樱</span>
                                            <span className="text-muted">佐助，你好帅！</span>
                                        </div>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="pull-left w-40 mr-m">
                                            <img src={b1} className="img-responsive img-circle" alt="test" />
                                        </span>
                                        <div className="clear">
                                            <span className="block">雏田</span>
                                            <span className="text-muted">鸣人君。。。那个。。。我。。喜欢你..</span>
                                        </div>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={12}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="pb-m">
                                    <h3>访问量统计</h3>
                                    <small>最近7天用户访问量</small>
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

export default DpsComputation;