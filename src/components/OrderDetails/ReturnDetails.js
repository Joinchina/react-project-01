import React, { Component } from 'react';
import Title from '../common/Title';
import { Row, Col } from 'antd';
import mount, { prop } from '@wanhu/react-redux-mount';

@mount('returnDetail')
class ReturnDetails extends Component {

    @prop()
    returnDetail;

    @prop()
    orderId;

    render() {
        const drugList = this.returnDetail.drugs ? this.returnDetail.drugs.map(drug => {

            return (
                <Row className="drugBox" >
                    <Col span={8} className="imgBox">
                        <img src={drug.outerPackagePicUrl} />
                    </Col>
                    <Col span={16} style={{ borderBottom: 'unset' }}>
                        <Row>
                            <Col span={17}>
                                <div className="drugName">{drug.drugName}</div>
                                <div className="packageSize">{drug.standard}</div>
                            </Col>
                            <Col span={7} style={{ paddingRight: '16px' }}>

                                <div style={{ textAlign: 'right' }}>
                                    <span className="count"> x {drug.number}</span>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            );
        }) : null;
        return (
            <div style={{ margin: '20px 16px', background: '#fff', padding: '12px' }} className="OrderDetail">
                <Title>退款详情</Title>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>退款详情</div>
                    <div className="orderDetailList">
                        {drugList}
                    </div>
                </div>
                <div className="labelBox" style={{ borderTop: '1px solid #E8E8E8', borderBottom: 'unset', padding: 'unset', paddingTop: '40px' }}>
                    <div className="value" >
                        <Row>
                            <Col span={8} className="value" style={{ color: '#666666' }}>现金退款</Col>
                            <Col span={16} className="orderDate">¥{this.returnDetail.amount || <span>&nbsp;</span>}</Col>
                        </Row>
                        {this.returnDetail.returnPoints * 1 ? (
                            <Row>
                                <Col span={8} className="value" style={{ color: '#666666' }}>积分退回</Col>
                                <Col span={16} className="orderDate">{this.returnDetail.returnPoints || <span>&nbsp;</span>} </Col>
                            </Row>
                        ) : null}
                        {this.returnDetail.refundAmount * 1 ? (
                            <Row>
                                <Col span={8} className="value" style={{ color: '#666666' }}>扣减现金</Col>
                                <Col span={16} className="orderDate">{-this.returnDetail.refundAmount || <span>&nbsp;</span>} </Col>
                            </Row>
                        ) : null}
                        {this.returnDetail.returnRefundPoints * 1 ? (
                            <Row>
                                <Col span={8} className="value" style={{ color: '#666666' }}>扣减积分</Col>
                                <Col span={16} className="orderDate">{-this.returnDetail.returnRefundPoints || <span>&nbsp;</span>} </Col>
                            </Row>
                        ) : null}
                        <Row>
                            <Col span={8} className="value" style={{ color: '#9A9A9A' }}>申请时间</Col>
                            <Col span={16} className="orderDate" style={{ color: '#9A9A9A' }}>{this.returnDetail.applyDate} </Col>
                        </Row>
                        <Row>
                            <Col span={8} className="value" style={{ color: '#9A9A9A' }}>退款时间</Col>
                            <Col span={16} className="orderDate" style={{ color: '#9A9A9A' }}>{this.returnDetail.auditDate} </Col>
                        </Row>

                    </div>
                </div>
            </div>
        );
    }
}

export default ReturnDetails;
