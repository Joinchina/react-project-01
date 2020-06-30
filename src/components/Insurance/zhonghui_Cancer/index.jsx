import React, { Component } from 'react'
import {Toast,Button,Modal as MobileModal} from 'antd-mobile';
import Title from '../../common/Title';
import fail_get from '../../../assets/images/fail_get.png';
import suc_get from '../../../assets/images/suc_get.png';
import './index.less'
import question from './question.json'
import api from '../../../api';
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
export default class index extends Component {
    constructor(props){
        super(props)
        this.state={
            question:question,
            title:'健康问询',
            bao:'我是服务包名字',
            select:[],
            ispuy:false,
        }
    }
    //生命周期
    async componentDidMount(){
        const patient = await api.get(`/currentPatient`);
        this.setState({ patientInfo: patient })
        const cid= getQueryVariable('cid')
        if(cid){
            this.setState({
                cid
            })
        };
        this.setState({
            bao:this.props.insurance.payload.packageName
        })
        
    }
    //点击选择
    selectQuestion(item,el){
        //判断是否是Q1只能单选
        if(item.question.indexOf('Q1')>=0){
            //先清空selct
            item.select=[];
            item.select.push(el)
        }else{
            //先判断是否存在以上皆无qieselect中没有，有清空，再进行判断点击了谁
            if(item.select.indexOf('以上皆无')>=0){
                item.select=[];
                item.select.push(el)
            }else{
                //不是q1得情况下要判断是否选择得是以上皆无，如果是则清空
                if(el==='以上皆无'){
                    item.select=[];
                    item.select.push(el)
                }else{
                    //判断是否已存在，不存在时才添加
                    if(item.select.indexOf(el)<0){
                        item.select.push(el)
                    }
                }
            }
        }
        this.setState({
            question:question
        })
    }
    //点击下一步
    down_etmp(){
        //如果有没选的则出提示
        const {question}=this.state;
        question.map((item,index)=>{
            if(item.select.length==0){
                Toast.fail(`Q${index+1}未回答，请先回答`)
                this.gobuy=false
                return
            }
        })
        if(question[0].select.length>0 && question[1].select.length>0 && question[2].select.length>0 && question[3].select.length>0 && question[4].select.length>0 && question[5].select.length>0){
            this.ispuy()
        }
    }
    //计算选择的答案并且计算出是否可以购买
    ispuy(){
        const {question,select,ispuy}=this.state
        question.map((item,index)=>{
            if(index===0&&item.select[0]!='否' ){
                select.push({question:item.question,select:item.select})
            }
            if(index!=0&&item.select[0]!='以上皆无'){
                select.push({question:item.question,select:item.select})
            }
        })
        if(question[0].select[0]=='否' && question[1].select[0]=='以上皆无' && question[2].select[0]=='以上皆无' && question[3].select[0]=='以上皆无' && question[4].select[0]=='以上皆无' && question[5].select[0]=='以上皆无'){
            this.setState({
                ispuy:true
            })
        }else{
            this.setState({
                ispuy:false
            })
        }

        this.setState({
            title:'问询结果'
        })
             
    }
    submitForm(number){
        switch (number) {
            case 1:
                this.props.history.push(`/insurance/${this.props.match.params}?cid=${this.state.cid}`);
                break;
            case 2:
                this.props.history.push(`/newHealthHomePage`)
                break;
            case 3:
                //问询过了的购买
                this.Order()
                break;        
            default:
                break;
        }
    }
    //支付
    async Order(){
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
            Toast.fail('您所在城市尚未开通该服务，敬请谅解。',200);
            return;
        }
        const disease = this.state.question.map(item => ({
            question: item.question,
            answer: item.select.join(','),
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
                this.props.history.push(`/insurancePaySuccess/${order.insuranceOrderId}`);
            } if (order && order.payStatus === 0) {
                Toast.loading('正在支付...', 666);
                this.payOrder(order);
            } else {
                Toast.fail(order.message || '未知异常', 3);
            }
        } catch (e) {
            if (e.code === 422) {//存在未支付订单
                console.error(e.data);
                Toast.hide()
                const insuranceOrderId = e.data;
                MobileModal.alert(e.message, null, [
                    { text: '确定', onPress: () => this.props.history.push(`/serviceInfo/${insuranceOrderId}`) }
                ]);
                return;
            }
            console.error('error', e.message);
            Toast.fail(e.message, 3);
        }
    }
    //唤起支付
    payOrder = (payData) => {
        try {
            const payInfo = JSON.parse(payData.payInfo);
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
                    Toast.loading('正在检查支付结果，请稍候', 666);
                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                        await _that.startChecking(payData);
                    } else {
                        _that.setState({ payState: 'error', checkTimer: null });
                        Toast.hide()
                        MobileModal.alert('支付失败', '支付失败，请重新支付', [
                            { text: '确定', onPress: () => _that.props.history.push(`/serviceInfo/${payData.insuranceOrderId}`) }
                        ]);
                    }
                });
            }
        } catch (e) {
            Toast.fail(e.message, 3);
        }
    }
    async startChecking(payData) {
        const { insuranceOrderBillId, insuranceOrderId, payOrderId } = payData;
        let finish = false;
        this.check(insuranceOrderBillId, insuranceOrderId, payOrderId).then(status => finish = status);
        for (let i = 4; i > 0; i--) {
           
            if (finish) {
                if (finish === 'success') {
                    
                    this.props.history.push(`/insurancePaySuccess/${insuranceOrderId}?isNeedUpload=${payData.needMedicationData}`);
                }
               
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
        const {question,title,bao,select,ispuy} = this.state
        return (
            <div  className="zhonghui_cancer">
                <Title>{title}</Title>
                {title==='健康问询'?<div className="form healthInquiry">
                    <div className="proNotice">
                        <span className="imp">重要</span>
                        <span>
                            非常感谢您选择 北京万户良方科技有限公司（以下简称“我们”） 提供的综合健康管理服务, 我们将为会员（被保险人）投保重大疾病补偿医疗保障。<span style={{color:'red'}}>为保障权益，请您以实际情况告知被保险人的健康状况，以便于有效投保。</span>如未如实告知，保险公司将有权拒赔，谢谢配合。我们会根据您的实际健康状况安排对应保险公司承保。谢谢您的理解和支持。
                        </span>
                    </div>
                </div>:null}
                {
                   question&&question.length>0&&title==='健康问询'?question.map((item,index)=>{
                       return (                                
                            <div className="question_box" key={index}>
                                <h1 dangerouslySetInnerHTML={{__html:item.question}}></h1>
                                <div className="answer_box">
                                        {
                                            item.answer.map((el,i)=>{
                                                return <span key={i} className={item.select.indexOf(el.name)>=0?"select":"noselect"} onClick={()=>this.selectQuestion(item,el.name)}>{el.name}</span>
                                            })
                                        }
                                </div>
                                <p>{item.note}</p>
                            </div>
                       )
                   }):null 
                }
                {title==='健康问询'?<div className="down_one" onClick={()=>this.down_etmp()}>下一步</div>:null}
                {/* 下面展示问询结果 */}
                {
                    title==='问询结果'&&ispuy===false?
                        <div className="answer_end">
                            <div className="top_box">
                                <img src={fail_get} alt="" className="step_img_sty"/>
                                <p className='step_3_title_sty'>{`很遗憾，被保险人无法领取和购买${bao}`}</p>
                            </div>
                            <div style={{ backgroundColor: '#EEEEEE', height: 10, width: '100%'}}/>
                            <div className='step_3_box_2'>
                                <div>
                                    {select && select.length>0? select.map((item,i) => {                                       
                                        return (
                                            <div className="list_item_sty" key={i}>
                                                <h1 dangerouslySetInnerHTML={{__html:item.question}}></h1>
                                                {
                                                    item.select.map((el,index)=>{
                                                        return <div className="answer_box" key={index}>
                                                            <span>{el}</span>
                                                        </div>
                                                    })
                                                }
                                            </div>
                                        )                                        
                                    }) : null}
                                    <div style={{ fontSize: 14, color: '#999999',margin:'20px 0' }}>如有疑问，您可以拨打服务电话400-010-1516获得进一步的帮助。</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 15}}>
                                    <Button className="primaryButton_1" onClick={() => this.submitForm(1)}>返回</Button>
                                    <Button className="primaryButton_2" onClick={() => this.submitForm(2)}>回首页</Button>
                                </div>
                            </div>
                        </div>
                    :null
                }
                {
                    title==='问询结果'&&ispuy===true?
                    <div className="answer_end">
                        <div className="top_box">
                            <img src={suc_get} alt="" className="step_img_sty"/>
                            <p className='step_3_title_sty'>{`被保险人未存在影响权益享受的情况，已获得${bao}的权益资格，如需付款，请尽快。`}</p>
                        </div>
                        <div className='step_3_box_2'>
                        <Button className="primaryButton_2" onClick={() => this.submitForm(3)}>确认购买</Button>
                        </div>                        
                    </div>
                :null
                }
            </div>
        )
    }
}
