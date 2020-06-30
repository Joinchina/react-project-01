import React, { Component } from 'react';
import { Modal, Checkbox, Spin, message } from 'antd';
import { InputItem, Toast, Modal as MobileModal, WhiteSpace, Button } from 'antd-mobile';
import Title from '../../common/Title';
import Disease from './Disease';
import querystring from 'query-string';
import api from '../../../api';
import fail_get from '../../../assets/images/fail_get.png';
import suc_get from '../../../assets/images/suc_get.png';
import finish_get from '../../../assets/images/finish_get.png';

const diseaseInquiries = [
    {
        question: '被保险人正在或曾经患有下列疾病或情况：',
        answer: [
            { name: "没有以下任何一种疾病和情况", value: "NONE" },
            { name: "恶性肿瘤(含原位癌、白血病、肉瘤)", },
            { name: "艾滋病病毒感染" },
            { name: "精神类疾病", },
            { name: "瘫痪", },
            { name: "脑血管畸形", },
            { name: "肿瘤指标异常", },
            { name: "（全职或兼职）从事高风险职业（见特殊职业种类表）", },
        ],
    },
    {
        question: '被保险人是否患有下列疾病、症状或体征：',
        answer: [
            {
                name: "没有以下任何一种疾病、症状或体征", value: "NONE"
            },
            {
                name: "肝硬化、乙肝携带者/乙型肝炎、丙型肝炎/丙肝抗体阳性者、肝功能衰竭",
                result: "肝脏的恶性肿瘤及原位癌、肝功能衰竭失代偿期、严重自身免疫性肝炎、肝移植；"
            },
            {
                name: "慢性肾炎、肾病综合征、肾功能不全、肾功能异常、蛋白尿大于（+）",
                result: "肾脏的恶性肿瘤及原位癌、终末期肾病、肾功能衰竭、系统性红斑狼疮并发肾功能损害、溶血性尿毒综合征、肾移植；"
            },
            {
                name: "慢性阻塞性肺病、慢性支气管炎、支气管扩张",
                result: "气管/支气管/肺部的恶性肿瘤及原位癌、肺动脉高压、肺原性心脏病、肺泡蛋白质沉积症；"
            },
            {
                name: "风湿性心脏病、心脏瓣膜异常",
                result: "心脏瓣膜手术、艾森门格综合征、急性心肌梗塞、冠状动脉搭桥术、肺源性心脏病、感染性心内膜炎、心脏粘液瘤；"
            },
            {
                name: "主动脉夹层",
                result: "主动脉手术、主动脉夹层血肿；"
            },
            {
                name: "脑梗、脑缺血/脑供血不足/后循环缺血、脑出血、脑中风 ",
                result: "脑中风后遗症、瘫痪、昏迷、语音能力丧失、痴呆、植物人状态；"
            },
            {
                name: "冠心病、心肌梗塞/心肌梗死、心绞痛/心肌缺血   ",
                result: "心肌梗塞（心肌梗死）、冠状动脉搭桥术；"
            },
            {
                name: "眼底病变、糖尿病视网膜病变",
                result: "双面失明；"
            },
        ],
    },
    {
        question: '被保险人正在或曾经患有下列疾病或情况：',
        answer: [
            { name: "无", value: "NONE" },
            { name: "口腔" },
            { name: "鼻" },
            { name: "咽部" },
            { name: "肺、气管、支气管" },
            { name: "肝脏" },
            { name: "胆囊" },
            { name: "胰腺" },
            { name: "纵隔" },
            { name: "淋巴结" },
            { name: "颅内" },
            { name: "皮肤" },
            { name: "肾、肾上腺、输尿管" },
            { name: "膀胱" },
            { name: "食管" },
            { name: "胃、十二指肠、小肠" },
            { name: "大肠/结肠" },
            { name: "直肠" },
            { name: "前列腺" },
            { name: "甲状腺（指最大结节尺寸＞1.5cm、或者分级曾达到4级或5级）" },
        ],
    },
    {
        question: '被保险人目前或既往是否有以下疾病/情况：',
        answer: [
            { name: "没有以下任何一种疾病", value: "NONE" },
            { name: "肢体缺失" },
            { name: "良性脑肿瘤" },
            { name: "脑炎/脑膜炎" },
            { name: "失聪（单耳聋/双耳聋）" },
            { name: "失明（单眼/双眼）" },
            { name: "瘫痪" },
            { name: "阿尔茨海默病" },
            { name: "帕金森病" },
            { name: "肺动脉高压" },
            { name: "语音能力丧失" },
            { name: "再生障碍性贫血" },
            { name: "痴呆/智力障碍" },
            { name: "川崎病" },
            { name: "克罗恩病" },
            { name: "溃疡性结肠炎" },
            { name: "重症肌无力" },
            { name: "骨髓纤维化" },
            { name: "象皮病" },
            { name: "多发性硬化" },
            { name: "肺源性心脏病" },
            { name: "硬皮病" },
            { name: "（肢体）坏疽" },
        ],
    },
    {
        question: '被保险人正在或曾经患有下列疾病或情况：',
        answer: [
            { name: "无", value: "NONE" },
            { name: "口腔" },
            { name: "鼻" },
            { name: "咽部" },
            { name: "肺、气管、支气管" },
            { name: "肝脏" },
            { name: "胆囊" },
            { name: "胰腺" },
            { name: "纵隔" },
            { name: "淋巴结" },
            { name: "颅内" },
            { name: "皮肤" },
            { name: "肾、肾上腺、输尿管" },
            { name: "膀胱" },
            { name: "食管" },
            { name: "胃、十二指肠、小肠" },
            { name: "大肠/结肠" },
            { name: "直肠" },
            { name: "卵巢、输卵管" },
            { name: "子宫/宫颈/外阴" },
            { name: "甲状腺（指最大结节尺寸＞1.5cm、或者分级曾达到4级或5级）" },
        ],
    },
]

const PatientOrderStatusChoices = [
    {
        value: '0',
        label: '待确认',
    }, {
        value: '1',
        label: '已领取',
    }, {
        value: '2',
        label: '核保中',
    }, {
        value: '3',
        label: '已承保',
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
    }
];

function Getsex(psidno){
    var sexno,sex
    if(psidno.length==18){
        sexno=psidno.substring(16,17)
    }else if(psidno.length==15){
        sexno=psidno.substring(14,15)
    }else{
        alert("错误的身份证号码，请核对！")
        return false
    }
    var tempid=sexno%2;
    if(tempid==0){
        sex=false;
    }else{
        sex=true;
    }
    return sex
}

const ass = {
    '1': '您的健康信息已收到。我们将尽快完成投保手续，并及时反馈保险公司的核保结果。谢谢',
    '2': '被保险人的健康信息已收到。我们将短信通知被保险人投保信息，获得被保险人同意或默认后完成投保手续，并及时反馈保险公司的核保结果，谢谢！',
    '3': '待定'
}

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}

export default class HealthInquiry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: "1",
            selectedDisease: {},
            readMeVisible1: false,
            readMeVisible: false,
            isLoading: false
        }
    }

    async componentDidMount() {
        try{
            /* const querydata = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            const orderdata = JSON.parse(querystring.parse(querydata).postData) */
            /* const orderInfo = await api.get(`/orderInfo`, {orderNo: orderdata.orderNo, channel: orderdata.channel}); */
            /* const insuranceOrderInfo = await api.get(`/insuranceOrderInfo`, {orderId: orderdata.orderId}); */
            const orderdata = this.props.insurance.payload;
            this.setState({
                /* insuranceOrderInfo, */
                insurancename: orderdata && orderdata.insuredName,
                relationWithInsurer: orderdata && orderdata.relationWithInsurer,
                sex: Getsex(orderdata && orderdata.insuredIdCard),
                orderdata,
            })
        }catch(err){

        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search !== this.props.location.search) {
            this.ref.scrollIntoView();
            const qs = nextProps.location.search.slice(nextProps.location.search.indexOf('?') + 1);
            const queryData = querystring.parse(qs);
            if (queryData && queryData.step) {
                this.setState({ step: queryData.step });
            } else {
                this.setState({ step: '1' });
            }

        }
    }

    onDiseaseChanged = (patientDisease, key) => {
        const { selectedDisease } = this.state;
        selectedDisease[key] = patientDisease
        this.setState({ selectedDisease })
    }

    async submitForm(item,tap) {
        const { selectedDisease, sex } = this.state;
        if(!item){
            this.props.history.push(`/newHealthHomePage`)
            return;
        }
        if(item == 9){
            if(tap == 1 && !this.state.readMeVisible){
                Modal.warn({
                    title: `请被保险人先阅读并同意上述注意事项，再确认领取`,
                    okText: "确定",
                    onOk: () => {},
                });
                return;
            }
            if(tap == 2 && !this.state.readMeVisible1){
                Modal.warn({
                    title: `请被保险人先阅读并同意上述注意事项，再确认领取`,
                    okText: "确定",
                    onOk: () => {},
                });
                return;
            }
        }
        if(item === 8 && ((selectedDisease.Q1 && !selectedDisease.Q1.length) || !selectedDisease.Q1)){
            Modal.warn({
                title: `有问题未回答，请先回答`,
                okText: "确定",
                onOk: () => {},
            });
            return;
        }
        if (item == 3) {
            if(sex){
                if(!selectedDisease.Q2 || !selectedDisease.Q4 || !selectedDisease.Q3 ){
                    Modal.warn({
                        title: `有问题未回答，请先回答`,
                        okText: "确定",
                        onOk: () => {},
                    });
                    return;
                }
                if((selectedDisease.Q2 && !selectedDisease.Q2.length) || (selectedDisease.Q3 && !selectedDisease.Q3.length) || (selectedDisease.Q4 && !selectedDisease.Q4.length)) {
                    Modal.warn({
                        title: `有问题未回答，请先回答`,
                        okText: "确定",
                        onOk: () => {},
                    });
                    return;
                }
            }else{
                if(!selectedDisease.Q2 || !selectedDisease.Q4 || !selectedDisease.Q5 ){
                    Modal.warn({
                        title: `有问题未回答，请先回答`,
                        okText: "确定",
                        onOk: () => {},
                    });
                    return;
                }
                if((selectedDisease.Q2 && !selectedDisease.Q2.length) || (selectedDisease.Q5 && !selectedDisease.Q5.length) || (selectedDisease.Q4 && !selectedDisease.Q4.length)) {
                    Modal.warn({
                        title: `有问题未回答，请先回答`,
                        okText: "确定",
                        onOk: () => {},
                    });
                    return;
                }
            }
        }
        if(item === 8 && selectedDisease.Q1[0] === "没有以下任何一种疾病和情况"){
            this.props.history.push(`/anxinInsurance?step=2`)
        }else if(item === 8 && selectedDisease.Q1[0] !== "没有以下任何一种疾病和情况"){
            this.props.history.push(`/anxinInsurance?step=3`)
        }else if(item == 3 && sex && (selectedDisease.Q2[0] !== "没有以下任何一种疾病、症状或体征" || selectedDisease.Q3[0] !== "无" || selectedDisease.Q4[0] !== "没有以下任何一种疾病")){
            this.props.history.push(`/anxinInsurance?step=4`)
        }else if(item == 3 && sex && (selectedDisease.Q2[0] === "没有以下任何一种疾病、症状或体征" || selectedDisease.Q3[0] === "无" || selectedDisease.Q4[0] === "没有以下任何一种疾病")){
            this.props.history.push(`/anxinInsurance?step=5`)
        }else if(item == 3 && !sex && (selectedDisease.Q2[0] !== "没有以下任何一种疾病、症状或体征" || selectedDisease.Q5[0] !== "无" || selectedDisease.Q4[0] !== "没有以下任何一种疾病")){
            this.props.history.push(`/anxinInsurance?step=4`)
        }else if(item == 3 && !sex && (selectedDisease.Q2[0] === "没有以下任何一种疾病、症状或体征" || selectedDisease.Q5[0] === "无" || selectedDisease.Q4[0] === "没有以下任何一种疾病")){
            this.props.history.push(`/anxinInsurance?step=5`)
        }else if(item !== 9){
            this.props.history.push(`/anxinInsurance?step=${item}`)
        }else if(item == 9){
            await this.setPromise({isSubloading: true})
            this.submitOrder()
        }
    }

    async submitOrder() {
        const { selectedDisease, sex } = this.state;
        const nowDisesesList = [];
        nowDisesesList.push(selectedDisease.Q1)
        nowDisesesList.push(selectedDisease.Q2)
        nowDisesesList.push(sex ? selectedDisease.Q3 : selectedDisease.Q5)
        nowDisesesList.push(selectedDisease.Q4)
        let isQ1 = false;
        let isQ2 = false;
        let isQ3 = false;
        let info_1 = '保险公司将不承担被保险人以下几种重大疾病相关的治疗费用给付责任：';
        if(selectedDisease.Q2 && selectedDisease.Q2.length > 0 && selectedDisease.Q2[0] !='没有以下任何一种疾病、症状或体征'){
            {selectedDisease.Q2.map((i, index) => {
                const showres = diseaseInquiries[1].answer.find(j => j.name == i)
                info_1 = info_1 + showres.result + `${index == selectedDisease.Q2.length - 1 ? '' : '、'}`
            })}
            isQ1 = true;
        }
        let info_2 = '保险公司将不承担被保险人以下部位的恶性肿瘤及原位癌治疗责任：';
        if(sex && selectedDisease.Q3 && selectedDisease.Q3.length > 0 && selectedDisease.Q3[0] !='无'){
            selectedDisease.Q3.map((i, index) => {
                info_2 = info_2 + i + '的恶性肿瘤及原位癌' + `${index == selectedDisease.Q3.length - 1 ? '' : '、'}`
            })
            isQ2 = true
        }else if(!sex && selectedDisease.Q5 && selectedDisease.Q5.length > 0 && selectedDisease.Q5[0] !='无'){
            selectedDisease.Q5.map((i, index) => {
                info_2 = info_2 + i + '的恶性肿瘤及原位癌' + `${index == selectedDisease.Q5.length - 1 ? '' : '、'}`
            })
            isQ2 = true
        }
        let info_3 = '保险公司将不承担被保险人该种情况的赔付责任：';
        if(selectedDisease.Q4 && selectedDisease.Q4.length > 0 && selectedDisease.Q4[0] !='没有以下任何一种疾病'){
            selectedDisease.Q4.map((i, index) => {
                info_3 = info_3 + i + `${index == selectedDisease.Q4.length - 1 ? '' : '、'}`
            })
            isQ3 = true
        }
        const insuranceForm = this.props.insurance.payload;
        const { environmentAssessment, evalData } = insuranceForm;
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
        Toast.loading("正在创建订单...", 600);
        let { authorizationPics } = insuranceForm.postData;
        const disease = nowDisesesList.map((item, index) => ({
            question: diseaseInquiries[index].question,
            answer: item.join(','),
        }))
        info_1 = isQ1 ? info_1 + ';' : '';
        info_2 = isQ2 ? info_2 + ';' : '';
        info_3 = isQ3 ? info_3 : '';
        const postData = {
            ...insuranceForm.postData,
            healthEnquiries: disease,
            authorizationPics,
            diseasesInfo: info_1 + info_2 + info_3,
        }
        try {
            const order = await api.post(`/patients/insurance_orders`, postData);
            this.setState({ orderInfo: order });
            if (environmentAssessment && order && order.insuredId) {
                await api.post(`/environmentAssessment`, {
                    ...evalData,
                    isSave: 1,
                    patientId: order.insuredId,
                });
            }
            if (order && order.payStatus === 1) {
                Toast.hide();
                this.props.history.push(`/insurancePaySuccess/${order.insuranceOrderId}`);
            } if (order && order.payStatus === 0) {
                Toast.hide();
                Toast.loading('正在支付...', 666);
                this.payOrder(order);
            }else{
                Toast.hide();
                Toast.fail(order.message || '未知异常', 3);
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

    readpdf() {
        this.setState({
            readMeVisible1: !this.state.readMeVisible1
        })
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    openPdfPage(item) {
        this.props.history.push(`/notice?filePath=${encodeURIComponent(item.url)}&fileName=${encodeURIComponent(item.name)}`);
    }

    render() {
        const { step, selectedDisease, insuranceOrderInfo, readMeVisible1, sex, relationWithInsurer } = this.state;
        const showText1 = '被保险人的健康信息已收到。我们将短信通知被保险人投保信息，获得被保险人同意或默认后完成投保手续，并及时反馈保险公司的核保结果，谢谢！';
        const showText2 = '您的健康信息已收到。我们将尽快完成投保手续，并及时反馈保险公司的核保结果，谢谢！';
        let showtitle = '';
        if(step == '1'){
            showtitle = '健康问询'
        }else if(step == '2'){
            showtitle = '健康问询'
        }else if(step == '3'){
            showtitle = '问询结果'
        }else if(step == '4'){
            showtitle = '问询结果'
        }else if(step == '5'){
            showtitle = '问询结果'
        }else if(step == '9'){
            showtitle = '领取成功'
        }else if(step == '10'){
            showtitle = '保障详情'
        }
        return <div className="anxininsurance healthInquiry_box" ref={ref => this.ref = ref}>
            <Title>{showtitle}</Title>
            {
                step === '1' ? <div>
                    <div className="form healthInquiry">
                        <div className="proNotice">
                            <span className="imp">重要</span>
                            <span>
                                非常感谢您选择 北京万户良方科技有限公司（以下简称“我们”） 提供的综合健康管理服务, 我们将为会员（被保险人）投保重大疾病补偿医疗保障。<span style={{color:'red'}}>为保障权益，请您以实际情况告知被保险人的健康状况，以便于有效投保。</span>如未如实告知，保险公司将有权拒赔，谢谢配合。我们会根据您的实际健康状况安排对应保险公司承保。谢谢您的理解和支持。
                            </span>
                        </div>
                    </div>
                    <div className="healthInquiry">
                        <div className="title2" >
                            <span>Q1</span>
                            被保险人是否正在或曾经患有下列疾病或情况（必填，可多选）：
                        </div>
                        <Disease
                            patientDisease={selectedDisease.Q1 || []}
                            callbackParent={(selected) => this.onDiseaseChanged(selected, 'Q1')}
                            diseaseList={diseaseInquiries[0].answer}
                            {...this.props}
                        />
                        <Button type="primary" className="primaryButton" onClick={() => this.submitForm(8)}>下一步</Button>
                    </div>
                </div> : null
            }
            {step === '2' ? <div className="healthInquiry">
                <div className="title2" >
                    <span>Q2</span>
                    被保险人是否患有下列疾病、症状或体征（必填，可多选）：
                </div>
                <Disease
                    patientDisease={selectedDisease.Q2 || []}
                    callbackParent={(selected) => this.onDiseaseChanged(selected, 'Q2')}
                    diseaseList={diseaseInquiries[1].answer}
                />
                <div className="title2" >
                    <span>Q3</span>
                    被保险人是否在下列部位患有尚未手术切除的良性肿瘤/息肉/结节/新生物/占位/肿块/包块/团块/肿物/赘生物（必填，可多选）：
                </div>
                <Disease
                    patientDisease={sex ? selectedDisease.Q3 || [] : selectedDisease.Q5 || []}
                    callbackParent={(selected) => this.onDiseaseChanged(selected, sex ? 'Q3' : 'Q5')}
                    diseaseList={sex ? diseaseInquiries[2].answer : diseaseInquiries[4].answer}
                />
                <div className="title2" >
                    <span>Q4</span>
                    被保险人目前或既往是否有以下疾病/情况（必填，可多选）：
                </div>
                <Disease
                    patientDisease={selectedDisease.Q4 || []}
                    callbackParent={(selected) => this.onDiseaseChanged(selected, 'Q4')}
                    diseaseList={diseaseInquiries[3].answer}
                />
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 15}}>
                    <Button type="primary" className="primaryButton_1" onClick={() => this.submitForm(1)}>返回</Button>
                    <Button type="primary" className="primaryButton_2" onClick={() => this.submitForm(3)}>下一步</Button>
                </div>
            </div> : null}
            {
                step === '3' ? <div className="healthInquiry_step3">
                    <div className='step_3_box_1'>
                        <img src={fail_get} className="step_img_sty"/>
                        <p className='step_3_title_sty'>很抱歉，被保险人因下列疾病或情况无法参与重大疾病医疗保障：</p>
                    </div>
                    <div style={{ backgroundColor: '#EEEEEE', height: 10, width: '100%'}}/>
                    <div className='step_3_box_2'>
                        <div>
                            {selectedDisease.Q1 && selectedDisease.Q1.length ? selectedDisease.Q1.map((i) => {
                                return (
                                    <div className='list_item_sty'  style={{ marginBottom: 10 }}>{i}</div>
                                )
                            }) : null}
                            <div style={{ fontSize: 14, color: '#999999', paddingRight: 30 }}>如有疑问，您可以拨打服务电话400-010-1516获得进一步的帮助。</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 15}}>
                            <Button type="primary" className="primaryButton_1" onClick={() => this.submitForm(1)}>返回</Button>
                            <Button type="primary" className="primaryButton_2" onClick={() => this.submitForm()}>确认</Button>
                        </div>
                    </div>
                </div> : null
            }
            {
                step === '5' ? <div className="healthInquiry_step3">
                    <div className='step_3_box_1'>
                        <img src={suc_get} className="step_img_sty"/>
                        <p className='step_3_title_sty'>问询完毕，点击"确认领取"即可领取重大疾病保障。</p>
                        <div onClick={() => this.setState({ readMeVisible: !this.state.readMeVisible })}>
                            <Checkbox checked={this.state.readMeVisible} onChange={() => this.setState({ readMeVisible: !this.state.readMeVisible })}>被保险人已阅读并同意上述事项</Checkbox>
                        </div>
                    </div>
                    <div className='step_3_box_2'>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 15}}>
                            <Button type="primary" className="primaryButton_1" onClick={() => this.submitForm(2)}>返回</Button>
                            <Button type="primary" className="primaryButton_2" onClick={() => this.submitForm(9, 1)}>确认购买</Button>
                        </div>
                    </div>
                </div> : null
            }
            {
                step === '4' ? <div className="healthInquiry_step3">
                    <div className='step_3_box_1'>
                        <img src={suc_get} className="step_img_sty"/>
                        <p className='step_3_title_sty'>问询完毕，点击"确认购买"即可领取重大疾病保障，但有如下事项需确认:</p>
                    </div>
                    <div style={{ backgroundColor: '#EEEEEE', height: 10, width: '100%'}}/>
                    <div className='step_3_box_2'>
                        <div>
                            {selectedDisease && selectedDisease.Q2 && selectedDisease.Q2.length && selectedDisease.Q2[0] !='没有以下任何一种疾病、症状或体征' ? <div>
                                <div style={{ color: '#000000', fontSize: 18, marginBottom: 16 }}><span className='titleBeat_sty' />保险公司将不承担被保险人以下几种重大疾病相关的治疗费用给付责任：</div>
                                {selectedDisease.Q2.map((i) => {
                                    const showres = diseaseInquiries[1].answer.find(j => j.name == i)
                                    return (
                                        <div className='list_item_sty' style={{ marginBottom: 10 }}>{showres.result}</div>
                                    )
                                })}
                            </div>: null}
                            {selectedDisease ? (sex && selectedDisease.Q3 && selectedDisease.Q3[0] !='无') || (!sex && selectedDisease.Q5 &&selectedDisease.Q5[0] !='无') ? <div>
                                <div style={{ color: '#000000', fontSize: 18, marginBottom: 16 }}><span className='titleBeat_sty' />保险公司将不承担被保险人以下部位的恶性肿瘤及原位癌治疗责任：</div>
                                {sex ? selectedDisease.Q3.map((i) => {
                                    return (
                                        <div className='list_item_sty' style={{ marginBottom: 10 }}>{i}的恶性肿瘤及原位癌</div>
                                    )
                                }) : selectedDisease.Q5.map((i) => {
                                    return (
                                        <div className='list_item_sty' style={{ marginBottom: 10 }}>{i}的恶性肿瘤及原位癌</div>
                                    )
                                })}
                            </div> : null : null}
                            {selectedDisease && selectedDisease.Q4 && selectedDisease.Q4.length && selectedDisease.Q4[0] !='没有以下任何一种疾病' ? <div>
                                <div style={{ color: '#000000', fontSize: 18, marginBottom: 16 }}><span className='titleBeat_sty' />保险公司将不承担被保险人该种情况的赔付责任：</div>
                                {selectedDisease.Q4.map((i) => {
                                    return (
                                        <div className='list_item_sty' style={{ marginBottom: 10 }}>{i}</div>
                                    )
                                })}
                            </div> : null}
                        </div>
                        <div onClick={() => this.readpdf()} style={{ marginBottom: 10 }}>
                            <Checkbox checked={this.state.readMeVisible1} onChange={() => this.readpdf()}>被保险人已阅读并同意上述事项</Checkbox>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 15}}>
                            <Button type="primary" className="primaryButton_1" onClick={() => this.submitForm(1)}>返回</Button>
                            <Button type="primary" className="primaryButton_2" onClick={() => this.submitForm(9, 2)}>确认购买</Button>
                        </div>
                    </div>
                </div> : null
            }
        </div>
    }
}
