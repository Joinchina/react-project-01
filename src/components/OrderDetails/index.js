import React from 'react';
import SuccessIcon from '../../states/images/success_icon.png';
import mount, { prop } from '@wanhu/react-redux-mount';
import Title from '../common/Title';
import { centToYuan } from '../../helper/money';
import { Icon, Row, Col, Button, Modal } from 'antd';
import { Grid, Carousel } from 'antd-mobile';
import './index.less';

const DrugIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_hcr150rk9zu.css',
});


const STATUS = {
    '10': '用户已确认',
    '20': '用户已确认',
    '30': '用户已确认',
    '35': '用户已确认',
    '40': '用户已确认',
    '45': '用户已确认',
    '50': '用户已确认',
    '60': '完成',
    '70': '完成',
    '97': '用户已确认',
    '98': '已撤销',
    '99': '完成'
}

@mount('orderDetail')
class OrderDetails extends React.Component {

    state = {
        flowListVisible: false,
        flowList: [],
        imgVisible: false,
        selectedIndex: 0,
    }
    @prop()
    orderId;

    @prop()
    order;

    @prop()
    orderLogs;

    @prop()
    returnDetail;

    @prop()
    expressFlowList;

    toReturnDetail() {
        window.location.href = `/orderRetrun/${this.orderId}`;
    }

    onFlowBoxClose() {
        this.setState({ flowListVisible: false });
    }

    openImgBox(index) {
        this.setState({ imgVisible: true, selectedIndex: index });
    }
    render() {
        const drugList = this.order.drugs.map((drug, index) => {
            return <Row key={drug.drugId} className="drugBox" >
                <Col span={8} className="imgBox">
                    {drug.outerPackagePicUrl ? <img src={drug.outerPackagePicUrl} /> :
                        <DrugIcon type="iconzhanweifu_tupian" style={{ fontSize: '82px' }} className="drugIcon" />
                    }
                </Col>
                <Col span={16} style={index === (this.order.drugs.length) - 1 ? { borderBottom: 'unset' } : {}}>
                    <Row>
                        <Col span={17}>
                            <div className="drugName">{drug.commonName}{drug.productName ? `(${drug.productName})` : ''}</div>
                            <div className="packageSize">2.5mg*28片/盒</div>
                        </Col>
                        <Col span={7} style={{ paddingRight: '16px' }}>
                            <div className="amount" style={{ textAlign: 'right' }}>
                                ￥{(drug.priceCent / 100).toFixed(2)}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className="count"> x {drug.amount}</span>
                                {drug.isReturn ? (
                                    <div style={{ float: 'right' }}>
                                        <Button shape="round" className="returnButton" onClick={() => this.toReturnDetail()}>{this.returnDetail && this.returnDetail.status === 1 ? '退款完成' : '退款中'}</Button>
                                    </div>
                                ) : null}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        });
        return (
            <div className="OrderDetail">
                <Title>详情</Title>
                {this.order.status === 99 || this.order.status === 70 ? (
                    <div className="orderStatuBox">
                        <div style={{ minHeight: '40px' }}> <img src={SuccessIcon} /> </div>
                        <div className="status">{STATUS[this.order.status]}</div>
                        <div className="refund">
                            {this.order.refundIntegral ? <p>本次获得福利：<b>{this.order.refundIntegral}</b>积分</p> : <p></p>}
                        </div>
                    </div>
                ) : null}
                <div className="labelBox" style={{ borderBottom: '8px solid #E8E8E8', paddingRight: '0px', background: '#fff' }}>
                    <div className="label">
                        清单
                    </div>
                    <div className="orderDetailList">
                        {drugList}
                    </div>
                </div>
                {
                    this.order.orderPicture && this.order.orderPicture.length > 0 ? (
                        <div className="labelBox">
                            <div className="label">
                                处方诊断
                        </div>
                            <Grid data={this.order.orderPicture}
                                columnNum={4}
                                renderItem={(dataItem, index) => (
                                    <div style={{ padding: '0px', }} onClick={() => this.openImgBox(index)}>
                                        <img src={dataItem} style={{ width: '75px', height: '75px', borderRadius: '6px' }} alt="" />
                                    </div>
                                )}
                            />
                        </div>) : null
                }
                <Modal
                    visible={this.state.imgVisible}
                    footer={null}
                    closable={false}
                    className="imgCarouselModal"
                >
                    <Carousel
                        selectedIndex={this.state.selectedIndex}
                        dots={false}
                        className="imgCarousel"
                    >
                        {this.order.orderPicture.map(item => {
                            return (
                                <div className="imgItem" onClick={() => { this.setState({ imgVisible: false }) }}>
                                    <img src={item} alt="" />
                                </div>
                            )
                        })}
                    </Carousel>
                </Modal>

                <div className="labelBox" style={{ borderBottom: '8px solid #E8E8E8' }}>
                    <div className="label">
                        诊断
                    </div>
                    <div className="value" >
                        <div>{this.order.diagnoses.join('  ')}</div>
                    </div>
                </div>
            </div>
        )
    }
    getStyles() {
        return {
            orderStatuBox: {
                height: '155px',
                padding: '30px 0px 22px 0px',
                textAlign: 'center',
            },
            successIcon: {
                coloe: '#44B82A',
            }
        }
    }
}

export default OrderDetails
