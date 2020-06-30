import React, { Component } from 'react';

import api from '../../api';
import Comlon from '../common/Comlon';
import Title from '../common/Title';
import { Card, WingBlank, WhiteSpace, Toast, Flex } from 'antd-mobile';
import { Row, Col, Button, Spin, Icon } from 'antd';
import './serviceinfo.less'
import '../../config'
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});
const OrderStatusChoices = [{
    value: '0',
    label: '待确认',
}, {
    value: '1',
    label: '已下单',
}, {
    value: '2',
    label: '核保中',
}, {
    value: '3',
    label: '保障中',
}, {
    value: '4',
    label: '已完成',
}, {
    value: '5',
    label: '已出险',
}, {
    value: '6',
    label: '已撤单',
}, {
    value: '7',
    label: '失效',
}];


function getLabel(itemMap, itemValue) {
    const item = itemMap.find(i => i.value == itemValue);
    return item ? item.label : '';
}

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}
class InsuranceList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            insuranceList: [],
            isInit: true,
            patientInfo: null,
        }
    }
    async componentDidMount() {
        try {
            const patient = await api.get(`/currentPatient`);
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/insuranceList`)}`
            }
            const insuranceList = await api.get(`/patients/${patient.id}/insuranceOrder`);
            this.setState({ insuranceList, isInit: false, patientInfo: patient });
        } catch (e) {
            console.error(e);
        }
    }
    toInsuranceInfo(orderId) {
        this.props.history.push(`/serviceInfo/${orderId}`);
    }

    toPayOrder = async (insuranceId) => {
        Toast.loading('正在支付...', 666);
        const patient = await api.get(`/currentPatient`);
        try {
            const payData = await api.post(`/patients/${patient.id}/insurance_orders/${insuranceId}/pay?memeberId=${global.payOrder.beijing}`);
            if (payData.payStatus === 1) {
                Toast.hide();
                Toast.success('订单已支付');
                const insuranceInfo = await api.get(`/patients/insurance_order/${insuranceId}`);
                this.setState({ insuranceInfo });
            } else {
                this.payOrder(payData);
            }
        } catch (error) {
            Toast.hide();
            Toast.fail(error.message);
        }
    }

    //唤起支付
    payOrder = (payData) => {
        try {
            const payInfo = JSON.parse(payData.payInfo);
            this.setState({ payState: 'checking' });
            if (window.WeixinJSBridge) {
                const _that = this;
                window.WeixinJSBridge.invoke(
                    'getBrandWCPayRequest', {
                    "appId": payInfo.appId,     //公众号名称，由商户传入
                    "timeStamp": payInfo.timeStamp,         //时间戳，自1970年以来的秒数
                    "nonceStr": payInfo.nonceStr, //随机串
                    "package": payInfo.package,
                    "signType": payInfo.signType,         //微信签名方式：
                    "paySign": payInfo.paySign //微信签名
                }, async function (res) {
                    Toast.hide();
                    Toast.loading('正在检查支付结果，请稍候', 666);
                    _that.setState({ err_msg: res.err_msg });
                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                        await _that.startChecking(payData);
                    } else {
                        _that.setState({ payState: 'error', checkTimer: null });
                        Toast.hide();
                        Toast.fail('支付失败，请重新支付');
                    }
                    _that.setState({ isBtnDisabled: false });
                });
            }
        } catch (e) {
            Toast.hide();
            Toast.fail(e.message, 3);
            this.setState({
                payState: 'error',
                isBtnDisabled: false,
            });
        }
    }

    async startChecking(payData) {
        const { insuranceOrderBillId, insuranceOrderId, payOrderId  } = payData;
        let finish = false;
        this.check(insuranceOrderBillId, insuranceOrderId, payOrderId).then(status => finish = status);
        for (let i = 4; i > 0; i--) {
            this.setState({
                checkTimer: i
            });
            if (finish) {
                if (finish === 'success') {
                    const { patientInfo } = this.state;
                    Toast.hide();
                    const insuranceList = await api.get(`/patients/${patientInfo.id}/insuranceOrder`);
                    this.setState({ insuranceList });
                }
                this.setState({ payState: finish, checkTimer: null });
                return;
            }
            await timeout(1000);
        }
        Toast.info('检查订单状态超时。如果您已扣款，请勿重新支付。');
    }

    async check(insuranceOrderBillId, insuranceOrderId, payOrderId) {
        const { patientInfo } = this.state;
        while (true) {
            try {
                const data = await api.get(`/patients/${patientInfo.id}/insurance_orders/${insuranceOrderId}/insurance_order_bills/${insuranceOrderBillId}/payment_info/${payOrderId}`);
                if (data.status === 3) {
                    this.setState({ orderResult: data });
                    return 'success';
                }
                if (data.status === 4) {
                    return 'fail';
                }
            } catch (e) {
                console.warn(e);
            }
            await timeout(2000);
        }
    }


    renderWait() {
        if (this.state.isInit || this.state.insuranceList.length === 0) {
            return (
                <div style={{ height: '100vh',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center' }}>
                    <Spin spinning={this.state.isInit}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                            <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                            <span
                                style={{
                                    opacity: 1,
                                    fontSize: 16,
                                    fontFamily: 'Hiragino Sans GB',
                                    letterSpacing: 0,
                                }}
                            >暂无服务单信息</span>
                        </div>
                    </Spin>
                </div>
            )
        };
    }
    toServiceNotice(url) {
        this.props.history.push(`/notice?filePath=${encodeURIComponent(url)}&fileName=${encodeURIComponent('服务通知书')}`);
    }
    render() {
        const { insuranceList } = this.state;
        console.log(insuranceList)
        const insurances = insuranceList ? insuranceList.map(item => {
            const label = getLabel(OrderStatusChoices, item.status);
            return (
                <WingBlank size="lg">
                    <WhiteSpace size="lg" />
                    <Card>
                        {/* <Card.Header
                            onClick={() => this.toInsuranceInfo(item.orderId)}
                            title={`单号：${item.orderNo}`}
                            extra={}
                        /> */}
                        <Card.Body className="insuranceBody">
                            <div onClick={() => this.toInsuranceInfo(item.orderId)}>
                                <Row>
                                    <Col span={24} style={{ fontSize: 18, color: '#222222',paddingRight:'100px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                        {item.insurancePackageName}
                                        <span style={{ color: '#F48E18',position: 'absolute',right: 0}}>
                                            {item.payStatus === 0 && item.status == 0 ? '待付款' : label}
                                        </span>
                                    </Col>
                                </Row>
                                {/* <Row>
                                    <ul style={{ paddingLeft: 30 }}>
                                        {item.products && item.products.length ? item.products.map((i) => {
                                            return (
                                                <li>{i.insuranceProductName}</li>
                                            )
                                        }) : null}
                                    </ul>
                                </Row> */}
                                <Row>
                                    <Col span={6}>服务会员:</Col>
                                    <Col span={18}>{item.insuredName || ''}</Col>
                                </Row>
                                {item.serviceStartDate && item.serviceEndDate ? <Row>
                                    <Col span={6}>服务效期:</Col>
                                    <Col span={18}>{item.serviceStartDate}-{item.serviceEndDate}</Col>
                                </Row> : null}

                            </div>
                            <Row className="payRow">
                                {/* 合计:￥{(item.amount / 100).toFixed(2)} */}
                                {item.payStatus !== 0 && item.needMedicationData && item.status === 0 ? <Button className="payButton" onClick={() => this.props.history.push(`/newMedicineCredentials?r=${encodeURIComponent('/insuranceList')}`)}>激活</Button> : null}
                                {/* {item.serviceNotice ? <Button className="payButton" onClick={() => this.toServiceNotice(item.serviceNotice)}>服务通知书</Button> : null} */}
                                {item.payStatus === 0 && item.status == 0 ? <Button className="payButton" onClick={() => this.toPayOrder(item.orderId)}>去支付</Button> : null}
                            </Row>
                        </Card.Body>
                    </Card>
                </WingBlank>
            );
        }) : null;
        return (
            <div className="insuranceList">
                <Title>服务订单</Title>
                <Comlon {...this.props} />
                {this.renderWait()}
                {insurances}
            </div>
        )
    }
}

export default InsuranceList;
