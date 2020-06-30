import React, { Component } from 'react';
import api from '../../api';
import Title from '../common/Title';
import { WingBlank, WhiteSpace, Toast, Button,Modal } from 'antd-mobile';
import InfoBanner from '../../states/images/insurance_info.png';
import { Row, Col, Avatar} from 'antd';
import './serviceinfo.less'
import '../../config'
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

class InsuranceInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            insuranceId: null,
            insuranceInfo: {},
            patientInfo: null,
            videoDoctor:false,
            hint:'',
        }
    }

    async componentDidMount() {
        const { insuranceId } = this.props.match.params;
        const insuranceInfo = await api.get(`/patients/insurance_order/${insuranceId}`);
        // insuranceInfo.packageProduct.push(
        //     {
        //         "productName": "视频医生服务",
        //         "coverageAmount": "",
        //         "deductibleAmount": "",
        //         "scale":"",
        //         "productType":1,// 1保险
        //         "notes":""//备注
        //     }
        // );
        const serviceList = await api.get(`/patient/insurance_order/inservice`, {patientId: insuranceId});
        this.setState({
            serviceList
        })
        console.log('服务单详情',insuranceInfo)

        this.setState({ insuranceInfo, insuranceId });
    }
4
    toInsuranceServicePlan(packageId, prosId) {
        this.props.history.push(`/insuranceServicePlan/${packageId}?prosId=${prosId}`);
    }

    toPayOrder = async () => {
        Toast.loading('正在支付...', 666);
        const { insuranceId } = this.props.match.params;
        const patient = await api.get(`/currentPatient`);
        this.setState({ patientInfo: patient })
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
        const { insuranceOrderBillId, insuranceOrderId, payOrderId } = payData;
        let finish = false;
        this.check(insuranceOrderBillId, insuranceOrderId, payOrderId).then(status => finish = status);
        for (let i = 4; i > 0; i--) {
            this.setState({
                checkTimer: i
            });
            if (finish) {
                if (finish === 'success') {
                    const { insuranceId } = this.state;
                    Toast.hide();
                    const insuranceInfo = await api.get(`/patients/insurance_order/${insuranceId}`);
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

    setFormatTime(date) {
        if (date) {
            const n_1 = date.split('-')
            return `${n_1[0]}年${n_1[1]}月${n_1[2]}日`
        } else {
            return '--'
        }
    }
    async toDetail(item) {
        console.log(item)
        let { insuranceInfo, insuranceId,serviceList} = this.state;
        //判断点击的是否是视频医生如果是则return
        if (item.productName==='在线视频医生服务'){
            //查看是否激活
            const res = await api.get(`/getCodeStatus`, {patientId: insuranceId});
            if (res && (res.status == 3 || res.status == 4)) {
                //被激活且服务账号为本人
                if(insuranceInfo.relationWithInsurer==1){
                    Modal.alert(null, '您所访问的页面将跳转到由北京和缓医疗科技有限公司提供服务的和缓视频医生系统，您是否同意授权该系统获取并使用您的个人信息以提供相关服务。', [
                        { text: '否', onPress: () => {} },
                        { text: '是', onPress: () => this.props.history.push(`/myDoctor`) },
                    ])
                }else{
                    Toast.info('该服务已由其他微信账号绑定，您不可使用。', 5);
                }
            } else {
                //未激活且不是本人
                Modal.alert(null, '该服务将绑定到当前的微信号，并仅可在此微信内提供服务，是否继续？', [
                    { text: '否', onPress: () => {} },
                    { text: '是', onPress: () =>Modal.alert(null, '您所访问的页面将跳转到由北京和缓医疗科技有限公司提供服务的和缓视频医生系统，您是否同意授权该系统获取并使用您的个人信息以提供相关服务。', [
                        { text: '否', onPress: () => {} },
                        { text: '是', onPress: () => this.props.history.push(`/myDoctor`) },
                    ])  },
                ])

            }

        }
        if (item.productType === 1&&item.productName!='在线视频医生服务') {
            this.props.history.push(`/insurances/${this.state.insuranceId}/${item.productName}`);
        }
        if (item.productType === 2&&item.productName!='在线视频医生服务') {
            this.props.history.push(`/myMedicalReport?insuranceProductName=${item.insuranceProductName}&gradeName=${item.gradeName||''}`);
        }
    }
    showModal = () => {
        this.setState({
            videoDoctor: true,
        });
    };

    okhideModal = () => {
        this.setState({
            videoDoctor: false,
        });
        this.props.history.push(`/myDoctor`)
    };
    hideModal = () => {
        this.setState({
            videoDoctor: false,
        });
    };
    render() {
        let { insuranceInfo, insuranceId } = this.state;
        insuranceInfo = insuranceInfo || {};
        const label = getLabel(OrderStatusChoices, insuranceInfo.orderStatus);
        const { packageProduct, insured, createInfo, paymentInfo, orderStatus } = insuranceInfo;
        const productItem = packageProduct ? packageProduct.map((item, index) => {
            return (
                <Row>
                    <Col span={item.productType === 1 || item.productType === 2 ? 18 : 18}>
                        <div key={index} style={{ marginBottom: 10, marginLeft: 10, lineHeight: '30px' }}>
                            <div><pre style={{ marginBottom: 0, fontWeight: 'bold', whiteSpace:'pre-wrap', wordWrap: 'break-word' }}>{item.productName}</pre></div>
                            <pre style={{ marginBottom: 0,fontSize: '14px', color: '#666666', whiteSpace:'pre-wrap', wordWrap: 'break-word' }}>{item.notes || ''}</pre>
                        </div>
                    </Col>
                    {
                    orderStatus != 0 && orderStatus != 6 && orderStatus != 7 && (item.productType === 1 || item.productType === 2 || item.productType === 4) ?
                    <Col span={6}>
                        <Button className="_insDetail" onClick={() => this.toDetail(item)} style={{
                            border:' 1px solid #F48E18 !important',
                            borderRadius: '15px',
                            color: '#F48E18',
                            backgroundColor: 'unset',
                            height: '30px',
                            lineHeight: '30px',
                            marginLeft: '5px',
                            fontSize: '14px',}}>
                            {item.productName=='在线视频医生服务'?'视频通话':'查看详情'}
                        </Button>
                    </Col>
                     : null
                     }

                </Row>
            );
        }) : null;
        return (
            <div className="insuranceInfo">
                {/* 点击视频医生时的提示 */}
                <Modal
                    visible={this.state.videoDoctor}
                    onOk={this.okhideModal}
                    onCancel={this.hideModal}
                    closable={false}
                    okText="是"
                    cancelText="否"
                    >
                    <p>{this.state.hint}</p>
                </Modal>
                <Title>服务单详情</Title>
                <WingBlank size="lg">
                    <WhiteSpace size="lg" />
                    <div className="title">
                        <img src={InfoBanner} style={{ width: '100%' }} />
                        <div className="titleText" style={{ display: 'block', top: '15px' }}>
                            <div>{insuranceInfo.packageName}</div>
                            <div
                                style={{
                                    fontSize: '16px',
                                    opacity: '0.7',
                                    fontWeight: 300,
                                }}
                            >
                                <Avatar size="small" icon="user" style={{ color: '#FFFFFF', border: '1px solid', background: 'unset', marginRight: '5px' }} />
                                <span>{insured ? insured.insuredName : '--'}
                                {insuranceInfo.relationWithInsurerName ? `（${insuranceInfo.relationWithInsurerName}）`: ''}
                                </span>
                            </div>
                        </div>
                        <div className="titleButton">
                            <div><Button className="payButton">{insuranceInfo.payStatus === 0 && insuranceInfo.orderStatus < 3 ? '待付款' : label}</Button></div>
                        </div>
                    </div>
                </WingBlank>
                <WingBlank size="lg">
                    <WhiteSpace size="lg" />
                    <Row className="stepTitle">
                        <div className="title">服务产品</div>
                        <div className="titleButton">
                        </div>
                    </Row>
                </WingBlank>
                <WingBlank size="lg" className="info">
                    <WhiteSpace size="lg" />
                    {productItem}
                </WingBlank>

                <div style={{ borderTop: '8px solid #E8E8E8' }}>
                    <WingBlank size="lg" className="info" >
                        <WhiteSpace size="lg" />
                        <Row className="stepTitle">
                            <div className="title">服务效期</div>
                            <div className="titleButton">
                            </div>
                        </Row>
                        <Row>
                            <Col span={12}>服务开始日期</Col>
                            <Col span={12} className="rightValue">{this.setFormatTime(insuranceInfo.serviceStartDate || '')}</Col>
                        </Row>
                        <Row>
                            <Col span={12}>服务终止日期</Col>
                            <Col span={12} className="rightValue">{this.setFormatTime(insuranceInfo.serviceEndDate || '')}</Col>
                        </Row>
                    </WingBlank>
                </div>
                <div style={{ borderTop: '8px solid #E8E8E8' }}>
                    <WingBlank size="lg" className="info" >
                        <WhiteSpace size="lg" />
                        <Row className="stepTitle">
                            <Col className="title">
                                缴费金额
                            </Col>
                            <Col className="rightValue">
                                <span style={{ color: '#C8161D', fontSize: 20 }}>¥ {insuranceInfo ? ((insuranceInfo.amount || 0) / 100).toFixed(2) : ''}</span>（年缴）
                            </Col>
                        </Row>

                    </WingBlank>
                </div>

                <div style={{ borderTop: '8px solid #E8E8E8', borderBottom: '1px solid #E8E8E8' }}>
                    <WingBlank size="lg">
                        <WhiteSpace size="lg" />
                        <Row className="stepTitle">
                            <div className="title">订单信息</div>
                        </Row>
                        <WhiteSpace size="lg" />
                    </WingBlank>
                </div>
                <WingBlank size="lg" className="info">
                    <WhiteSpace size="lg" />
                    <Row>
                        <Col span={8}>服务单号</Col>
                        <Col span={16} className="rightValue">{insuranceInfo.orderNo}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>领取时间</Col>
                        <Col span={16} className="rightValue">{createInfo ? createInfo.createDate : '--'}</Col>
                    </Row>
                </WingBlank>
                <WingBlank size="lg" >
                    <WhiteSpace size="lg" />
                    {insuranceInfo.status === 0 && insuranceInfo.payStatus !== 0 && insuranceInfo.needMedicationData ? <Button className="PayButton" onClick={() => this.props.history.push(`/newMedicineCredentials?r=${encodeURIComponent(`/insurances/${insuranceId}`)}`)}>激活</Button> : null}
                    {insuranceInfo.payStatus === 0 && insuranceInfo.orderStatus < 3? <Button className="PayButton" onClick={() => this.toPayOrder()}>去付款</Button> : null}
                    {/* {insuranceInfo.insuranceRoute ? <Button className="PayButton" onClick={() => this.toServiceNotice(insuranceInfo.serviceNotice)}>服务通知书</Button> : null} */}
                    <WhiteSpace size="lg" />
                </WingBlank>
            </div>
        )
    }
}

export default InsuranceInfo;
