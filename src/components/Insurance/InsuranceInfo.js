import React, { Component } from 'react';
import api from '../../api';
import Title from '../common/Title';
import { WingBlank, WhiteSpace, Toast } from 'antd-mobile';
import InfoBanner from '../../states/images/insurance_info.png';
import { Row, Col, Button } from 'antd';
import './serviceinfo.less'
const OrderStatusChoices = [
    // {
    //     value: '0',
    //     label: '待确认',
    // }, {
    //     value: '1',
    //     label: '已下单',
    // }, {
    //     value: '2',
    //     label: '核保中',
    // },
    {
        value: '3',
        label: '已承保',
    }, {
        value: '4',
        label: '已完成',
    }, {
        value: '5',
        label: '已出险',
    },
    {
        value: '6',
        label: '已撤单',
    },
    //{
    //     value: '7',
    //     label: '失效',
    // }
];


function getLabel(itemMap, itemValue) {
    const item = itemMap.find(i => i.value == itemValue);
    return item ? item.label : '';
}

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}

class InsuranceInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            serviceId: null,
            productName: null,
            insuranceInfo: {},
            patientInfo: null,
        }
    }

    async componentDidMount() {
        const { serviceId, productName } = this.props.match.params;
        const insuranceInfo = await api.get(`/patients/insurance_order/${serviceId}`);
        this.setState({ insuranceInfo, serviceId, productName });
    }

    toInsuranceServicePlan(packageId, prosId) {
        this.props.history.push(`/insuranceServicePlan/${packageId}?prosId=${prosId}`);
    }

    toPayOrder = async () => {
        Toast.loading('正在支付...', 666);
        const { serviceId } = this.props.match.params;
        const patient = await api.get(`/currentPatient`);
        this.setState({ patientInfo: patient })
        try {
            const payData = await api.post(`/patients/${patient.id}/insurance_orders/${serviceId}/pay`);
            if (payData.payStatus === 1) {
                Toast.hide();
                Toast.success('订单已支付');
                const insuranceInfo = await api.get(`/patients/insurance_order/${serviceId}`);
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
        const { insuranceOrderBillId, insuranceOrderId, payOrderId } = payData;
        let finish = false;
        this.check(insuranceOrderBillId, insuranceOrderId, payOrderId).then(status => finish = status);
        for (let i = 4; i > 0; i--) {
            this.setState({
                checkTimer: i
            });
            if (finish) {
                if (finish === 'success') {
                    const { serviceId } = this.state;
                    Toast.hide();
                    const insuranceInfo = await api.get(`/patients/insurance_order/${serviceId}`);
                    this.setState({ insuranceInfo });
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

    toServiceNotice(url) {
        this.props.history.push(`/notice?filePath=${encodeURIComponent(url)}&fileName=${encodeURIComponent('服务通知书')}`);
    }

    openNotice(item) {
        // let url=item.url;
        // url='https:'+url.substring(5,url.length)
        // this.props.history.push(`/notice?filePath=${encodeURIComponent(url)}&fileName=${encodeURIComponent(item.name)}`);
        window.location.href=item.url
    }

    setFormatTime(date) {
        if (date) {
            const n_1 = date.split('-')
            return `${n_1[0]}年${n_1[1]}月${n_1[2]}日`
        } else {
            return '--'
        }
    }

    render() {
        let { insuranceInfo, productName } = this.state;
        insuranceInfo = insuranceInfo || {};
        const label = getLabel(OrderStatusChoices, insuranceInfo.orderStatus);
        const { packageProduct, insured, createInfo, paymentInfo } = insuranceInfo;
        const productItem = packageProduct ? packageProduct.map((item, index) => {
            return (
                <div key={index} style={{ marginBottom: 10, marginLeft: 10 }}>
                    <div><pre style={{ marginBottom: 0, fontWeight: 'bold', whiteSpace:'pre-wrap', wordWrap: 'break-word'}}>{item.insuranceName}</pre></div>
                    <pre style={{ fontSize: '14px', color: '#666666', marginBottom: 0,  whiteSpace:'pre-wrap', wordWrap: 'break-word' }}>{item.notes || ''}</pre>
                </div>
            );
        }) : null;

        const currentProduct = packageProduct ? packageProduct.find(item => item.productType === 1 && item.productName === productName) : {};

        let coverageAmount = currentProduct ? currentProduct.coverageAmount : 0;
        coverageAmount = coverageAmount > 10000 ? `${(coverageAmount / 10000).toFixed(0)}万元` : `${coverageAmount || ''}元`
        return (
            <div className="insuranceInfo">
                <Title>我的保险</Title>
                <WingBlank size="lg">
                    <WhiteSpace size="lg" />
                    <div className="title">
                        <img src={InfoBanner} style={{ width: '100%' }} />
                        <div className="titleText" style={{ display: 'block', top: '18px' }}>
                            <div>{insuranceInfo.packageName}</div>
                            <div
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 300,
                                    opacity: 0.7
                                }}
                            >
                                <span>{insuranceInfo.insuranceCompany}</span>
                            </div>
                        </div>
                        {label ? <div className="titleButton">
                            <div><Button className="payButton" >{label}</Button></div>
                        </div> : null}
                    </div>
                </WingBlank>
                <WingBlank size="lg" className="info" style={{ borderBottom: '1px solid rgb(232, 232, 232)' }}>
                    <WhiteSpace size="lg" />
                    <Row>
                        <Col span={8}>保单号</Col>
                        <Col span={16} className="rightValue">{insuranceInfo.teamInsurOrderNo || '--'}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>被保人</Col>
                        <Col span={16} className="rightValue">{insured ? insured.insuredName : '--'}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>保障额度</Col>
                        <Col span={16} className="rightValue">{coverageAmount ? coverageAmount : '--'}</Col>
                    </Row>
                </WingBlank>
                <WingBlank size="lg">
                    <WhiteSpace size="lg" />
                    <Row className="stepTitle">
                        <div className="title">保险责任</div>
                        <div className="titleButton">
                        </div>
                    </Row>
                </WingBlank>
                <WingBlank size="lg" className="info" >
                    <WhiteSpace size="lg" />
                    {productItem}
                    <Row className="stepTitle">
                        <div className="title">保险期间</div>
                        <div className="titleButton">
                        </div>
                    </Row>
                    <Row>
                        <Col span={12}>生效日期</Col>
                        <Col span={12} className="rightValue">{this.setFormatTime(insuranceInfo.startDate || '')}</Col>
                    </Row>
                    <Row>
                        <Col span={12}>终止日期</Col>
                        <Col span={12} className="rightValue">{this.setFormatTime(insuranceInfo.endDate || '')}</Col>
                    </Row>
                    {insuranceInfo.serviceNotice ? <Row>
                        <Col span={16}><strong>保险凭证</strong></Col>
                        <Col span={8} className="rightValue linkBtn">
                            <a onClick={() => {
                                this.openNotice({
                                    url: insuranceInfo.serviceNotice,
                                    name: '保险凭证',
                                })
                            }}>查看电子保单</a>
                        </Col>
                    </Row> : null}

                </WingBlank>
                {insuranceInfo && insuranceInfo.insurancePackageSpecs && insuranceInfo.insurancePackageSpecs.length && insuranceInfo.insurancePackageSpecs.filter(j => j.type == 1).length ? <div style={{ borderTop: '8px solid #E8E8E8', borderBottom: '1px solid #E8E8E8' }}>
                    <WingBlank size="lg">
                        <WhiteSpace size="lg" />
                        {insuranceInfo && insuranceInfo.insurancePackageSpecs && insuranceInfo.insurancePackageSpecs.length > 0 ? <Row className="itemTitle" style={{ fontSize: '14px', color: '#666666' }}>
                            <Col style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>相关文件</Col>
                            {insuranceInfo.insurancePackageSpecs.map((item, index) => {
                                if (item.type !== 1) {
                                    return;
                                }
                                return (<span key={index} className="linkBtn" style={{ paddingLeft: '0px' }} type="link" onClick={() => { this.openNotice(item) }}><a>{item.name}</a></span>)
                            })}
                        </Row>
                            : null}
                        <WhiteSpace size="lg" />
                    </WingBlank>
                </div> : null}
                <div style={{ borderTop: '8px solid #E8E8E8', }}>
                    <WingBlank size="lg">
                        <WhiteSpace size="lg" />
                        <Row className="stepTitle">
                            <div className="title">相关信息</div>
                        </Row>
                        <WhiteSpace size="lg" />
                    </WingBlank>
                </div>
                <WingBlank size="lg" className="info">
                    <Row>
                        <Col span={8}>关联服务单号</Col>
                        <Col span={16} className="rightValue">{insuranceInfo.orderNo}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>领取时间</Col>
                        <Col span={16} className="rightValue">{createInfo ? createInfo.createDate : '--'}</Col>
                    </Row>
                </WingBlank>
                <WingBlank size="lg" >
                    <WhiteSpace size="lg" />
                    {/* insuranceInfo.status === 0 && insuranceInfo.payStatus !== 0 && insuranceInfo.needMedicationData ? <Button className="PayButton" onClick={() => this.props.history.push(`/newMedicineCredentials?r=${encodeURIComponent(`/insurances/${insuranceId}`)}`)}>激活</Button> : null */}
                    {insuranceInfo.payStatus === 0 && insuranceInfo.status === 0 ? <Button className="PayButton" onClick={() => this.toPayOrder()}>去付款</Button> : null}
                    {/* insuranceInfo.insuranceRoute ? <Button className="PayButton" onClick={() => this.toServiceNotice(insuranceInfo.serviceNotice)}>服务通知书</Button> : null */}
                    <WhiteSpace size="lg" />
                </WingBlank>
            </div>
        )
    }
}

export default InsuranceInfo;
