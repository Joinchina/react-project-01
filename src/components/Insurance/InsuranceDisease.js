import React, { Component } from 'react';
import api from '../../api';
import Title from '../common/Title';
import { Row, Col, Button, Icon, message } from 'antd';
import { Toast, Modal as MobileModal, WhiteSpace } from 'antd-mobile';
import Disease from './Disease';
import InsuranceDiseaseModal from './InsuranceDiseaseModal';
import html2canvas from 'html2canvas';
import querystring from 'query-string';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_tku1v1sg9vl.js',
});

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}

class InsuranceDisease extends Component {
    constructor(props) {
        super(props);
        this.state = {
            insurancePackageId: null,
            diseaseInquiries: [],
            prohibitDisease: [],
            warnByPositionDisease: [],
            warnOldIllnessDisease: [],
            otherDisease: [],
            step: '1',
            orderInfo: null,
        }
    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        this.setState({ patientInfo: patient })

        const { insurancePackageId } = this.props.match.params;
        const diseaseInquiries = await api.get(`/insurance_packages/${insurancePackageId}/disease_inquiries`);
        let insuranceConfig = await api.get(`/insurance/${insurancePackageId}/config`);
        if (!insuranceConfig) {
            insuranceConfig = await api.get(`/insurance/${window.INSURANCE_PACKAGE_ID}/config`);
        }
        this.setState({ companyName: insuranceConfig ? insuranceConfig.companyName : '' });
        this.setState({ diseaseInquiries, insurancePackageId });
        if (this.props.insurance && this.props.insurance.payload) {
            const insuranceForm = this.props.insurance.payload;
            const { prohibitDisease, warnByPositionDisease, warnOldIllnessDisease, otherDisease } = insuranceForm;
            this.setState({
                prohibitDisease: prohibitDisease || [],
                warnByPositionDisease: warnByPositionDisease || [],
                warnOldIllnessDisease: warnOldIllnessDisease || [],
                otherDisease: otherDisease || [],
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search !== this.props.location.search) {
            const qs = nextProps.location.search.slice(nextProps.location.search.indexOf('?') + 1);
            const queryData = querystring.parse(qs);
            if (queryData && queryData.step) {
                this.setState({ step: queryData.step });
            } else {
                this.setState({ step: '1' });
            }

        }
    }

    onDiseaseChanged = (patientDisease, setDisease) => {
        setDisease(patientDisease);
    }

    onOtherDiseaseChanged = (patientDisease, groupName) => {
        let { selectedDisease } = this.state;
        let otherDisease = [];
        if (!selectedDisease) {
            selectedDisease = {}
        }
        selectedDisease[groupName] = patientDisease;
        Object.keys(selectedDisease).forEach(function (key) {
            otherDisease.push(...selectedDisease[key]);
        });
        this.setState({ selectedDisease, otherDisease });
    }

    nextPage(page) {
        this.ref.scrollIntoView();
        const { prohibitDisease, warnByPositionDisease, warnOldIllnessDisease, otherDisease } = this.state;
        if (page === 1) {
            if (prohibitDisease.length <= 0) {
                this.setState({ step: '2' });
                this.props.history.push(`${this.props.location.pathname}?step=2`);
                return;
            } else {
                this.setState({ step: '3' });
                this.props.history.push(`${this.props.location.pathname}?step=3`);
                return;
            }

        }
        if (page === 2) {
            const diseaseList = [...prohibitDisease, ...warnByPositionDisease, ...warnOldIllnessDisease];
            if (diseaseList.length > 0) {
                this.setState({ step: '3' });
                this.props.history.push(`${this.props.location.pathname}?step=3`);
            } else {
                this.submitOrder()
            }
        }
    }

    async getImg() {
        return html2canvas(document.body).then(function (canvas) {
            return canvas.toDataURL();
        });
    }

    async submitOrder() {
        const { prohibitDisease, warnByPositionDisease, warnOldIllnessDisease, otherDisease } = this.state;
        if (prohibitDisease && prohibitDisease.length > 0) {
            this.props.resetInsurance();
            this.props.history.push(`/service/${this.state.insurancePackageId}`);
        } else {
            Toast.loading("正在创建订单...", 600);
            let healthInquiryResults = [...warnByPositionDisease, ...warnOldIllnessDisease, ...otherDisease];
            if (healthInquiryResults && healthInquiryResults.length > 0) {
                healthInquiryResults = healthInquiryResults.map(item => ({ diseaseCode: item, isChecked: 0 }));
            }
            const insuranceForm = this.props.insurance.payload;
            let { authorizationPics } = insuranceForm.postData;
            const { areas } = insuranceForm.selectedPackagePro;
            const weixinUser = await api.get('/currentUser');
            const now_patient = await api.get(`/currentPatient`);
            let cityId = null;
            let provinceId = null;
            if(now_patient){
                if(now_patient.memberType == 1){ //保障
                    cityId = now_patient.hospital.cityId
                    provinceId = now_patient.hospital.provinceId
                }else{ // 绿A
                    cityId = weixinUser && weixinUser.address ? weixinUser.address.cityId : now_patient && now_patient.hospital && now_patient.hospital.cityId ? now_patient.hospital.cityId : null;
                    provinceId = weixinUser && weixinUser.address ? weixinUser.address.provinceId : now_patient && now_patient.hospital && now_patient.hospital.provinceId ? now_patient.hospital.provinceId : null
                }
            }else{
                cityId = weixinUser && weixinUser.address && weixinUser.address.cityId;
                provinceId = weixinUser && weixinUser.address && weixinUser.address.provinceId
            }
            if(areas && areas.length && !areas.find(item => item.cityId ? item.cityId === cityId : item.provincesId ? item.provincesId == provinceId : null)){
                Toast.hide();
                message.error('您所在城市尚未开通该服务，敬请谅解。');
                return;
            }
            const postData = {
                ...insuranceForm.postData,
                healthInquiryResults,
                authorizationPics,
            }
            try {
                const order = await api.post(`/patients/insurance_orders`, postData);
                this.setState({ orderInfo: order });
                if (order && order.payStatus === 1) {
                    Toast.hide();
                    this.props.history.push(`/insurancePaySuccess/${order.insuranceOrderId}`);
                }
                if (order && order.payStatus === 0) {
                    Toast.hide();
                    Toast.loading('正在支付...', 666);
                    this.payOrder(order);
                }
            } catch (e) {
                if (e.code === 422) {//存在未支付订单
                    console.error(e.data);
                    Toast.hide();
                    const insuranceOrderId = e.data;
                    MobileModal.alert(e.message, null, [
                        { text: '确定', onPress: () => this.props.history.push(`/serviceInfo/${insuranceOrderId}`) }
                    ]);
                    return;
                }
                console.error('error', e.message);
                this.setState({ loading: false });
                Toast.hide();
                Toast.fail(e.message, 3);
            }

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
                        MobileModal.alert('支付失败', '支付失败，请重新支付', [
                            { text: '确定', onPress: () => _that.props.history.push(`/serviceInfo/${payData.insuranceOrderId}`) }
                        ]);
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
                    Toast.hide();
                    this.setState({ step: '4' });
                    this.props.history.push(`/insurancePaySuccess/${insuranceOrderId}?isNeedUpload=${payData.needMedicationData}`);
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


    render() {
        const {
            diseaseInquiries, prohibitDisease, warnByPositionDisease,
            warnOldIllnessDisease, otherDisease, selectedDisease,
            step, err_msg, diseaseModalVisible,
            companyName
        } = this.state;
        const prohibitList = [...diseaseInquiries].filter(item => item.restriction === 'prohibit');
        const warnByPositionList = [...diseaseInquiries].filter(item => item.restriction === 'warn_by_position');
        const warnOldIllnessList = [...diseaseInquiries].filter(item => item.restriction === 'warn_old_illness');
        let otherList = [...diseaseInquiries].filter(item => item.restriction === 'others');
        const length = prohibitDisease.length || 0 + warnByPositionDisease.length || 0 + warnOldIllnessDisease.length || 0;

        let otherDiseaseList = [];
        while (otherList && otherList.length > 0) {
            const disease = otherList[0];
            const diseaseGroup = {
                groupName: disease.category,
                groupDisease: [...otherList].filter(item => item.category === disease.category),
                selectedDisease: selectedDisease ? selectedDisease[disease.category] : [],
            }
            otherDiseaseList.push(diseaseGroup);
            otherList = otherList.filter(item => item.category !== disease.category);
        }
        let prohibits = [];
        let warnByPositions = [];
        let warnOldIllnesses = [];
        let other = [];
        prohibitDisease.map(item => {
            const disease = diseaseInquiries.find(disease => disease.diseaseCode === item);
            prohibits.push(disease.diseaseName);
        });
        warnByPositionDisease.map(item => {
            const disease = diseaseInquiries.find(disease => disease.diseaseCode === item);
            warnByPositions.push(disease.diseaseName);
        });
        warnOldIllnessDisease.map(item => {
            const disease = diseaseInquiries.find(disease => disease.diseaseCode === item);
            warnOldIllnesses.push(disease.diseaseName);
        });
        return <div className="insuranceDisease " ref={ref => this.ref = ref}>
            <Title>{step === '1' || step === '2' ? '健康问询' : '问询结果'}</Title>
            <InsuranceDiseaseModal onClose={() => this.setState({ diseaseModalVisible: false })} visible={diseaseModalVisible} />
            {
                step === '1' ? <div>
                    <div style={{ padding: '0px 16px' }}>
                        <Row className="stepTitle" style={{ display: 'flex' }}>
                            <div className="title">
                                本人承诺所填写的健康信息真实有效，因提供信息与实际情况不符而产生的一切后果由本人承担，如有隐瞒或告知不实【{companyName}】有权终止《万户良方慢病综合管理计划服务协议》并对协议终止前发生的任何保险事故不承担任何责任。
                            </div>
                        </Row>
                        <Row className="stepTitle" style={{ display: 'flex' }}>
                            <div className="step"><div>1</div></div>
                            <div className="title">本人正在或曾经患有下列疾病或症状<strong>（如有，则不能获得万户良方慢病综合管理计划中的保险保障）</strong>：</div>
                        </Row>
                        <Disease
                            patientDisease={prohibitDisease || []}
                            callbackParent={(selected) => this.onDiseaseChanged(selected, (selected) => { this.setState({ prohibitDisease: selected }) })}
                            diseaseList={prohibitList}
                        />
                        <Row className="stepTitle" style={{ display: 'flex' }}>
                            <div className="step"><div>2</div></div>
                            <div className="title">本人正在或曾经患有下列疾病或症状（如患有以下疾病中的一种或几种，保险公司<strong>将分别不承担肝、肾、肺的所有疾病治疗费用给付责任</strong>）：</div>
                        </Row>
                        <Disease
                            patientDisease={warnByPositionDisease || []}
                            callbackParent={(selected) => this.onDiseaseChanged(selected, (selected) => { this.setState({ warnByPositionDisease: selected }) })}
                            diseaseList={warnByPositionList}
                        />
                        <Row className="stepTitle" style={{ display: 'flex' }}>
                            <div className="step"><div>3</div></div>
                            <div className="title">本人正在或曾经患有下列疾病或症状（如患有以下疾病中的一种或几种，保险公司<strong>将不承保旧病复发治疗费用给付责任，但承担新部位的新发病症的治疗费用给付责任</strong>）：</div>
                        </Row>
                        <Disease
                            patientDisease={warnOldIllnessDisease || []}
                            callbackParent={(selected) => this.onDiseaseChanged(selected, (selected) => { this.setState({ warnOldIllnessDisease: selected }) })}
                            diseaseList={warnOldIllnessList}
                        />
                        <Row className="warningTip" />
                    </div>
                    <div className="submitButtonBox">
                        <Row className="box">
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    className="button"
                                    onClick={() => this.nextPage(1)}>
                                    {length > 0 ? '下一步' : '以上疾病皆无，下一步'}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }
            {step === '2' ? <div>
                <div style={{ padding: '0px 16px' ,width: '100vw'}}>
                    <Row className="stepTitle" style={{ display: 'flex' }}>
                        <div className="step"><div>4</div></div>
                        <div className="title">本人正在或曾经患有合同约定的其他疾病（如患有以下疾病中的一种或几种，保险公司<strong>将不承担已有疾病的治疗费用给付责任</strong>，但对于参与保障前<strong>未患有的其他疾病</strong>的治疗按照合同约定进行赔付）：</div>
                    </Row>
                    {otherDiseaseList && otherDiseaseList.length > 0 ?
                        otherDiseaseList.map(item => {
                            return <div>
                                <Row className="stepTitle" style={{ display: 'flex' }}>
                                    <div className="title">{item.groupName}</div>
                                </Row>
                                <Disease
                                    patientDisease={item.selectedDisease || []}
                                    callbackParent={(selected) => this.onOtherDiseaseChanged(selected, item.groupName)}
                                    diseaseList={item.groupDisease}
                                />
                            </div>
                        }) : null}

                    <WhiteSpace size="lg" />
                    <WhiteSpace size="lg" />
                    <WhiteSpace size="lg" />
                    <WhiteSpace size="lg" />
                    <WhiteSpace size="lg" />
                </div>
                <div className="submitButtonBox">
                    <Row className="box">
                        <Col span={24}>
                            <Button
                                type="primary"
                                className="button"
                                onClick={() => this.nextPage(2)}>
                                {otherDisease.length > 0 ? '确认提交' : '以上疾病皆无，确认提交'}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div> : null}
            {
                step === '3' ? <div >
                    <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                        <MyIcon type={prohibitDisease && prohibitDisease.length > 0 ? 'iconzhanweifu-bukegoumai' : 'iconzhanweifu-kegoumai'} style={{ fontSize: '120px' }} />
                    </div>
                    <div style={{ fontSize: '20px', padding: '20px', }}>
                        <strong>&nbsp;&nbsp;&nbsp;&nbsp;
                        {prohibitDisease && prohibitDisease.length > 0 ? '抱歉，您不能领取万户宝' : (warnByPositionDisease && warnByPositionDisease.length > 0) ||
                                (warnOldIllnessDisease && warnOldIllnessDisease.length > 0) ? '感谢，您可以领取万户宝' : ''}
                            {}
                        </strong>
                    </div>
                    <div style={{ fontSize: '18px', padding: '20px', }}>
                        {prohibitDisease && prohibitDisease.length > 0 ? <div>
                            &nbsp;&nbsp;&nbsp;&nbsp;您正在或曾经患有的以下病症（共{prohibits.length}项）不能获得万户良方慢病综合管理计划中的保险保障：
                        <div style={{ textAlign: 'center' }}> {prohibits.join(',')}</div>
                        </div> : ''}
                        {(!prohibitDisease || prohibitDisease.length <= 0) && warnByPositionDisease && warnByPositionDisease.length > 0
                            ? <div>
                                <strong> &nbsp;&nbsp;&nbsp;&nbsp;因投保前正在或曾经患有以下疾病，保险公司将不承担该疾病所在器官（肝、肾或肺的一种或多种）的所有疾病治疗费用给付责任：</strong>
                                <div style={{ textAlign: 'center', padding: '3px 0px' }}> {warnByPositions.join(',')}</div>
                            </div> : ''}
                        {(!prohibitDisease || prohibitDisease.length <= 0) && warnOldIllnessDisease && warnOldIllnessDisease.length > 0
                            ? <div>
                                <strong> &nbsp;&nbsp;&nbsp;&nbsp;您正在或曾经患有的以下病症（共{warnOldIllnesses.length}项），保险公司将不承保旧病复发治疗费用给付责任，但承担新部位的新发病症的治疗费用给付责任：</strong>
                                <div style={{ textAlign: 'center', padding: '3px 0px' }}> {warnOldIllnesses.join(',')}</div>
                            </div> : ''}
                    </div>
                    <div className="submitButtonBox">
                        <Row className="box">
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    className="button"
                                    onClick={() => this.submitOrder()}>
                                    {prohibitDisease && prohibitDisease.length > 0 ? '返回' : '确认接受'}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }


        </div>
    }
}

export default InsuranceDisease;
