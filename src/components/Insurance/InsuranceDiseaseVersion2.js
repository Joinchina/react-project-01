import React, { Component } from 'react';
import api from '../../api';
import Title from '../common/Title';
import { Row, Col, Button, Checkbox, message } from 'antd';
import { Toast, Modal as MobileModal, WhiteSpace } from 'antd-mobile';
import Disease from './DiseaseVersion2';
import InsuranceDiseaseModal from './InsuranceDiseaseModal';
import html2canvas from 'html2canvas';
import querystring from 'query-string';

import checkFail from './images/insurance_check_fail.png';
import checkSuccess from './images/insurance_check_success.png';
import ClauseModal from './ClauseModal';
import './select.less'
function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}
//获取？号后面的参数
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}
// function IdCardCheck(UUserCard) {
//     //获取年龄
//     var myDate = new Date();
//     var month = myDate.getMonth() + 1;
//     var day = myDate.getDate();
//     var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
//     if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
//         age++;
//     } else if(UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) == day+1){
//         age++
//     }
//     return age
// }
class InsuranceDisease extends Component {
    constructor(props) {
        super(props);
        console.log('我是接收的peops',this.props)
        this.state = {
            insurancePackageId: null,
            isMore: false,
            isUnusual: false,
            diseaseInquiries: [],
            forbiddenList: null,
            warningList: null,
            forbiddenSub: false,
            warningSub: false,
            readAndAgree: false,
            step: '1',
            orderInfo: null,
            packageName: null,
            clauseModal: false,
            clauseData:{},
            heightbless:false,
            issix:false,
        }
    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        this.setState({ patientInfo: patient })
        const cid= getQueryVariable('cid')
        if(cid){
            this.setState({
                cid
            })
        }
        const { insurancePackageId } = this.props.match.params;
        let diseaseInquiries = await api.get(`/insurance_packages/${insurancePackageId}/disease_inquiries/v2`);
        if (!diseaseInquiries) {
            diseaseInquiries = await api.get(`/insurance_packages/${window.INSURANCE_PACKAGE_ID}/disease_inquiries/v2`);
        }
        if (diseaseInquiries && diseaseInquiries.diseases) {
            const forbiddenList = [...diseaseInquiries.diseases].filter(item => item.type === 'forbidden');
            const warningList = [...diseaseInquiries.diseases].filter(item => item.type === 'warning');
            this.setState({
                forbiddenList,
                warningList,
                isMore: diseaseInquiries.isMore || false,
                moreUrl: diseaseInquiries.moreUrl,
                moreImg: diseaseInquiries.moreImg,
                isUnusual: diseaseInquiries.isUnusual || false,
                cancerUrl:diseaseInquiries.cancerUrl,
                cancerImg:diseaseInquiries.cancerImg,
            });
            if (!forbiddenList || forbiddenList.length <= 0) {
                this.setState({ step: '2' })
            }
        }
        let insuranceConfig = await api.get(`/insurance/${insurancePackageId}/config`);
        if (!insuranceConfig) {
            insuranceConfig = await api.get(`/insurance/${window.INSURANCE_PACKAGE_ID}/config`);
        }
        this.setState({ companyName: insuranceConfig ? insuranceConfig.companyName : '' });
        this.setState({ insurancePackageId });

        // 初始化页面数据
        if (this.props.insurance && this.props.insurance.payload) {
            const insuranceForm = this.props.insurance.payload;
            const { packageName } = insuranceForm
            this.setState({ packageName })
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

    onDiseaseChanged = (selectedDisease, type, index) => {
        const { forbiddenList, warningList } = this.state;
        if (type === 'forbidden') {
            const disease = forbiddenList[index];
            forbiddenList[index] = {
                ...disease,
                selectedDisease,
            }
        }
        if (type === 'warning') {
            const disease = warningList[index];
            warningList[index] = {
                ...disease,
                selectedDisease,
            }
        }
        this.setState({ forbiddenList, warningList });
        //判断是否有<q2-6></q2-6>
        if(forbiddenList.length>1&&forbiddenList[1].selectedDisease){
            console.log(forbiddenList[1].selectedDisease)
            const list=forbiddenList[1].selectedDisease;
            list.map(item=>{
                if(item.indexOf('6')>=0){
                    this.setState({
                        issix:true
                    })
                }
            })
        }
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
        const { forbiddenList, warningList } = this.state;
        if (page === 1) {
            this.setState({ forbiddenSub: true });
            const isSubmit = [...forbiddenList].filter(item => !item.selectedDisease || item.selectedDisease <= 0);
            if (isSubmit && isSubmit.length > 0) {
                MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>
                    请填写问题：<strong>{isSubmit[0].question}</strong>
                </span>, null, [
                    { text: '确定', onPress: () => { } },
                ]);
                return;
            }
            const isForbidden = this.getResult(forbiddenList);
            if (isForbidden && isForbidden.length > 0) {
                this.setState({ step: '3' });
                this.props.history.push(`${this.props.location.pathname}?step=3`);
                return;
            } else if (warningList && warningList.length > 0) {
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
            this.setState({ warningSub: true });
            const isSubmit = [...warningList].filter(item => !item.selectedDisease || item.selectedDisease <= 0);
            if (isSubmit && isSubmit.length > 0) {
                MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>
                    请填写问题：<strong>{isSubmit[0].question}</strong>
                </span>, null, [
                    { text: '确定', onPress: () => { } },
                ]);
                return;
            }
            this.setState({ step: '3' });
            this.props.history.push(`${this.props.location.pathname}?step=3`);
        }
    }

    async getImg() {
        return html2canvas(document.body).then(function (canvas) {
            return canvas.toDataURL();
        });
    }

    async openNotice() {
         //根据articleId接口请求获取文章内容
         //获取当前localtion判断环境,
         let id=0;
         if(window.location.href.indexOf('demo')>=0 || window.location.href.indexOf('local')>=0){
            //测试
            id=364
        }else{
            //线上
            id=395
        }
         const articleInfo = await api.get('/getArticleDetail', { articleId: id});
         if(articleInfo){
             this.setState({
                 clauseModal:true,
                 clauseData:articleInfo
             })
         }else{
             Toast.fail('未发现', 5);
         }
        // this.props.history.push(`/notice?filePath=${encodeURIComponent(url)}&fileName=${encodeURIComponent('众惠财产相互保险社职业分类表')}`);
    }
    closeModal(val){
        this.setState({
            clauseModal:val,
            clauseData:{}
        })
    }
    async submitOrder(isBack) {
        const { forbiddenList, warningList } = this.state;
        const isForbidden = this.getResult(forbiddenList);
        if (isBack) {
            this.props.resetInsurance();
            this.props.history.push(`/insurance/${this.state.insurancePackageId}`);
            return;
        }
        const { readAndAgree } = this.state;
        if (!readAndAgree) {
            return;
        }
        Toast.loading("正在创建订单...", 600);
        const insuranceForm = this.props.insurance.payload;
        const { environmentAssessment, evalData } = insuranceForm;
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
        const disease = [...forbiddenList, ...warningList].map(item => ({
            question: item.question,
            answer: item.selectedDisease.join(','),
        }))
        const postData = {
            ...insuranceForm.postData,
            healthEnquiries: disease,
            authorizationPics,
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
            } else {
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

    getResult(questionList) {
        return questionList ? [...questionList].filter(item => {
            if (!item.selectedDisease) {
                return false;
            }
            const diseaseNone = item.answer.find(item => item.value === 'NONE');
            const f = item.selectedDisease.filter(d => d !== diseaseNone.name);
            return f && f.length > 0;
        }) : null
    }

    getIsUnusual(questionList) {
        let checkResult = false;
        if (!questionList) {
            return false;
        }
        [...questionList].forEach(item => {
            const { unusual, selectedDisease } = item;
            if (unusual && selectedDisease) {
                for (const d of selectedDisease) {
                    console.log(d)
                    if (unusual.indexOf(d) >= 0) {
                        checkResult = true;
                        break;
                    }
                }
            }
        })
        return checkResult;
    }


    getForbiddenResult(diseaseList) {
        const questionList = diseaseList ? [...diseaseList].filter(item => {
            const none = item.answer.find(a => a.value === 'NONE');
            item.selectedDisease = item.selectedDisease
                ? item.selectedDisease.filter(d => d !== none.name)
                : item.selectedDisease
            if (item.key === "Q1" && item.selectedDisease.length > 0 && item.selectedDisease[0] === '是') {
                item.selectedDisease = ['因被保险人专职或兼职从事高风险职业']
            }
            return { ...item }
        }) : null
        return questionList;
    }

    toMore(number){
        switch (number) {
            case 1:
                const { moreUrl } = this.state;
                this.props.setInsurance({ readMe: false });
                this.props.history.push(`${moreUrl}?cid=${this.state.cid}`)
                break;
            case 2:
                const { cancerUrl } = this.state;
                this.props.setInsurance({ readMe: false });
                this.props.history.push(`${cancerUrl}?cid=${this.state.cid}`)
                break;

            default:
                break;
        }
    }
    render() {
        const {
            forbiddenList, warningList,
            step, diseaseModalVisible,
            packageName, isMore, isUnusual, moreImg,heightbless,issix
        } = this.state;
        let _forbiddenList = [];
        const isForbidden = this.getResult(forbiddenList);
        const checkIsUnusual = this.getIsUnusual(forbiddenList);
        if (step === '3') {
            _forbiddenList = this.getForbiddenResult(forbiddenList);
        }
        //是否禁止
        const checkForbidden = isUnusual ? checkIsUnusual : (isForbidden && isForbidden.length > 0)
        console.log('xxxxxxxxxxxxxxxxxxxxx',checkIsUnusual,isMore,issix,checkForbidden,_forbiddenList)
        return <div className="insuranceDisease " ref={ref => this.ref = ref}>
            <Title>{step === '1' || step === '2' ? '健康问询' : '问询结果'}</Title>
            <InsuranceDiseaseModal onClose={() => this.setState({ diseaseModalVisible: false })} visible={diseaseModalVisible} />
            {/* 职业对比表 */}
            <ClauseModal visible={this.state.clauseModal} data={this.state.clauseData}
            closeModal={(val)=>this.closeModal(val)}/>
            {
                step === '1' ? <div>
                    <div style={{ padding: '0px 16px' }}>
                        <div className="form healthInquiry">
                            <div className="proNotice">
                                <span className="imp" style={{
                                    textAlign: 'center',
                                    background:'#EB4D3D',
                                    color:' #FFFFFF',
                                    padding: '2px 9px',
                                    height:'22px',
                                    borderRadius:'15px',
                                    fontSize: '16px',
                                    fontWeight:'300',
                                    marginRight:' 5px'
                                }}>重要</span>
                                <span>
                                非常感谢您选择 北京万户良方科技有限公司（以下简称“我们”） 提供的综合健康管理服务, 我们将为会员（被保险人）投保重大疾病补偿医疗保障。<span style={{color:'red'}}>为保障权益，请您以实际情况告知被保险人的健康状况，以便于有效投保。</span>如未如实告知，保险公司将有权拒赔，谢谢配合。我们会根据您的实际健康状况安排对应保险公司承保。谢谢您的理解和支持。
                                </span>
                            </div>
                        </div>
                        {
                            forbiddenList && forbiddenList.length > 0 ? forbiddenList.map((item, index) => {

                                return <div>
                                    <Row className="stepTitle" style={{ display: 'flex' }}>
                                        <div className="step"><div>{index + 1}</div></div>
                                        <div className="title">{item.question}</div>
                                    </Row>
                                    <Disease
                                        patientDisease={item.selectedDisease || []}
                                        callbackParent={(selected) => this.onDiseaseChanged(selected, item.type, index)}
                                        diseaseList={item.answer}
                                    />
                                    <div style={{ color: '#C8161D' }}>
                                        {this.state.forbiddenSub && (!item.selectedDisease || item.selectedDisease.length <= 0) ? '不能为空' : ''}
                                    </div>
                                    {item.remark
                                        ?
                                        <div>
                                            职业比对详见
                                            <a className="linkBtn" type="link" onClick={() => { this.openNotice() }}>《众惠财产相互保险社职业分类表》</a>
                                        </div> : null}
                                </div>
                            }) : null
                        }
                        <Row className="warningTip" />
                    </div>
                    <div className="submitButtonBox">
                        <Row className="box">
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    className="button"
                                    onClick={() => this.nextPage(1)}>
                                    下一步
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }
            {step === '2' ? <div>
                <div style={{ padding: '0px 16px' }}>
                    {
                        warningList && warningList.length > 0 ? warningList.map((item, index) => {
                            return <div>
                                <Row className="stepTitle" style={{ display: 'flex' }}>
                                    <div className="step"><div>{index + (forbiddenList ? forbiddenList.length : 0) + 1}</div></div>
                                    <div className="title">{item.question}</div>
                                </Row>
                                <Disease
                                    patientDisease={item.selectedDisease || []}
                                    callbackParent={(selected) => this.onDiseaseChanged(selected, item.type, index)}
                                    diseaseList={item.answer}
                                />
                                <div style={{ color: '#C8161D' }}>
                                    {this.state.warningSub && (!item.selectedDisease || item.selectedDisease.length <= 0) ? '不能为空' : ''}
                                </div>
                            </div>
                        }) : null
                    }

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
                                onClick={() => this.nextPage(2)}
                            >
                                下一步
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div> : null}
            {
                step === '3' ? <div >
                    <div style={{ textAlign: 'center', paddingTop: '20px', background: '#FFFFFF' }}>
                        {checkForbidden ? <img src={checkFail} style={{ width: '120px' }} /> : <img src={checkSuccess} style={{ width: '120px' }} />}
                    </div>
                    <div style={{ fontSize: '20px', padding: '20px', background: '#FFFFFF' }}>
                        <strong>&nbsp;&nbsp;&nbsp;&nbsp;
                        {checkForbidden
                                ? `很遗憾，被保险人无法参与${packageName || ''}。因下列情况无法获得服务权益:`
                                : `祝贺，被保险人已获得${packageName || ''}的权益，请尽快购买。`}
                        </strong>
                    </div>
                    <div style={{ fontSize: '18px', padding: '20px', marginBottom: '30px', paddingTop: 0, background: '#FFFFFF' }}>
                        {checkForbidden && _forbiddenList.length > 0 ? _forbiddenList.map(item => {
                            return (
                                <div>
                                    <div style={{ textAlign: 'left', padding: '3px 0px' }}>
                                            {item.selectedDisease.map(el=>{
                                                return <p>{el}</p>
                                            })}
                                    </div>
                                </div>
                            )
                        }) : ''}
                        {
                           checkForbidden && _forbiddenList && _forbiddenList.length > 0 ? <div onClick={()=>this.toMore(2)} style={{ marginTop: 20 }}>
                                <strong  > 基于被保险人的健康情况，保险公司还提供了恶性肿瘤补充医疗保障，请您酌情选择：</strong>
                                <img src={this.state.cancerImg} style={{ width: '100%' }} />
                            </div> : null
                        }
                        {
                            !checkIsUnusual && isMore &&!issix && checkForbidden && _forbiddenList && _forbiddenList.length > 0 ? <div onClick={()=>this.toMore(1)} style={{ marginTop: 20 }}>
                                <strong  > 为充分保障大病风险，推荐为被保险人购买：</strong>
                                <img src={moreImg} style={{ width: '100%' }} />
                            </div> : null
                        }
                    </div>

                    {checkForbidden ?
                        <div style={{ textAlign: 'left', padding: '0px 20px', marginTop: '5px', fontSize: '16px', color: '#9a9a9a', paddingBottom: '65px' }} >
                            如需帮助，您可以拨打服务电话<a href="tel:400-010-1516">400-010-1516</a>获得进一步的帮助。
                             </div> : null
                    }
                    {!checkForbidden ?
                        <div style={{ marginLeft: '20px' }}>
                            <Checkbox onChange={(e) => {
                                this.setState({ readAndAgree: e.target.checked })
                            }}>被保险人已阅读并知晓上述事项</Checkbox>
                        </div> : null
                    }

                    <div className="submitButtonBox">
                        {checkForbidden ?
                            <div>
                                <Row>
                                    <Col span={12} style={{ height: '52px' }} >
                                        <Button className="normalButton" onClick={() => this.submitOrder(1)}>返回</Button>
                                    </Col>
                                    <Col span={12} style={{ height: '52px' }} >
                                        <Button className="normalButton" onClick={() => this.props.history.push(`/newHealthHomePage`)}>回首页</Button>
                                    </Col>
                                </Row>
                            </div>
                            : null}
                        {!checkForbidden ?
                            <Row className="box">
                                <Col span={24}>
                                    <Button
                                        type="primary"
                                        className="button"
                                        onClick={() => this.submitOrder()}>
                                        立即购买
                                    </Button>
                                </Col>
                            </Row> : null
                        }
                    </div>
                </div> : null
            }


        </div>
    }
}

export default InsuranceDisease;
