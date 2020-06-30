import React, { Component } from 'react';
import api from '../../api';
import { Form, Row, Col, Button, Checkbox, Modal, message,Icon } from 'antd';
import { InputItem, Toast, Modal as MobileModal, WhiteSpace } from 'antd-mobile';
import IDValidator from '../../helper/checkIdCard';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import lrz from 'lrz';
import IdCardChecked from '../../states/images/idCard.png';
import NotificationModal from './NotificationModal';
import NotificationModalForLogin from '../Register/NotificationModal';
import ClauseModal from './ClauseModal';
import html2canvas from 'html2canvas';
import querystring from 'query-string';
import './index.less';
import '../../config'
const FormItem = Form.Item;
//获取？号后面的参数
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    if(!query) return;
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}

function getAgeByBirthday(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
}

function IdCardCheck(UUserCard) {
    if(!UUserCard) return;
    //获取年龄
    var myDate = new Date();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
    if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
        age++;
    } else if(UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) == day+1){
        age++
    }
    return age
}

const FormMap = [{
    label: 'phone',
    value: '手机号',
}, {
    label: 'patientName',
    value: '本人姓名',
}, {
    label: 'idCard',
    value: '本人身份证号',
}, {
    label: 'relationWithInsurer',
    value: '会员服务被保人',
}, {
    label: 'insuredName',
    value: '会员姓名',
}, {
    label: 'insuredIdCard',
    value: '身份证号',
}, {
    label: 'insuredPhone',
    value: '会员手机号',
}, {
    label: 'insuranceType',
    value: '保障方案',
}, {
    label: 'guarantee',
    value: '有无医保',
}, {
    label: 'poverty',
    value: '是否贫困',
}, {
    label: 'code',
    value: '激活码',
}
]

// const relationShipList = [{
//     value: 1,
//     type: 1,
//     label: '本人',
// }, {
//     value: 3,
//     type: 2,
//     label: '父母',
// }, {
//     value: 2,
//     type: 2,
//     label: '配偶',
// }]
@mount('insurance')
class Insurance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openList: [],
            isLogin: false,
            fileList: [],
            insurancePackages: [],
            povertyList: [],
            guaranteeList: [],
            relationShipList: [],
            loading: false,
            patientInfo: null,
            checkPatientLoading: false,
            checkPatientError: false,
            isPublicSecurityChecked: false,
            readMeVisible: false,
            checkPhoneVisible: false,
            readMeVisibleForRegister: false,
            isMerage: false,
            clauseModal: false,
            clauseData:{},
            addUserDisabled:false,
            buyrecord:[],//购买人历史记录
            buypeoplelist:[],//购买人列表
            // historyname:'',//默认购买人姓名
            // historycard:'',//默认身份证
            // historyphone:'',//默认电话
            chooseadd:false,//点击新增时是否选中
            agreement:[],//我已阅读协议
            defaultData:[],//默认数据用来屏蔽以前的逻辑
        }
    }
    @prop()
    timeCount;


    async componentDidMount() {
        this.setState({ loading: true });
        Toast.loading("加载中", 30);
        const cid= getQueryVariable('cid')
        if(cid){
            this.setState({
                cid
            })
        }
        try {
            const patient = await api.get(`/currentPatient`);
            const { insurancePackageId } = this.props.match.params;
            this.insurancePackageId = insurancePackageId || this.props.insurancePackageId;
            if (patient) {
                this.setState({ patientInfo: patient, isLogin: true })
                if (patient.realNameAuthenticationPassed !== 1) {
                    this.props.form.validateFields(["patientName", "idCard"]);
                } else {
                    this.setState({ isPublicSecurityChecked: true });
                }
                //请求历史购买人历史记录
                const buyrecord=await api.get(`/insurance_order/histories?id=${patient.id}`)
                // console.log('我是获取的购买历史记录',buyrecord)
                this.setState({
                    buyrecord:buyrecord
                })
            } else {
                const openList = await api.get('/openInfo');
                this.setState({ openList });
            }

            const poverty = this.props.insurance && this.props.insurance.payload ? this.props.insurance.payload.poverty : null;
            const insurancePackages = await api.get(`/insurance_packages/${this.insurancePackageId}/products`);

            document.title = insurancePackages[0].navTitle || '';
            const { relationDicts } = insurancePackages[0];
            // console.log('@@@@@@@@@@@@@@@@@@',relationDicts)
            const relationShipList = relationDicts && relationDicts.length > 0
                ? relationDicts.map(item => (
                    {
                        ...item,
                        type: item.value == 1 ? 1 : 2,

                    }
                )) : [];
            //循环数据将数据放到标签中，取出服务包的年龄
            //去除服务包年龄
            let ageListArr=[];
            insurancePackages.map(item=>{ageListArr.push(item.minAge),ageListArr.push(item.maxAge)});
            ageListArr.sort((a,b)=>{return a-b});
            let buylist=this.state.buyrecord;
            const minage=ageListArr[0];
            const maxage=ageListArr[ageListArr.length-1];
            //当前服务包的年龄最大值和最小值
            this.setState({
                minage,
                maxage
            })
            console.log("当前服务包的年龄最大值和最小值",minage,maxage)
            relationShipList.map(item=>{
                item.buyhostory=[];
                if(buylist.length>0){
                    buylist.map(el=>{

                        let age=IdCardCheck(el.insuredIdCard)
                        //设置一下数据计算年龄
                        if(minage<=age&&age<=maxage){
                            if(item.value==el.relationShip){
                                item.buyhostory.push(el)
                            }
                        }
                    })
                }

            })
            //设置默认数据协议
            if(this.props.insuranceConfig.notification){
                this.setState({
                    agreement:this.props.insuranceConfig.notification.filter(item=>(item.relationWithInsurer==1||item.relationWithInsurer==3))
                });
            }
            const povertyList = [];
            if (insurancePackages && insurancePackages.find(item => item.poverty === 0)) {
                povertyList.push(0);
            }
            if (insurancePackages && insurancePackages.find(item => item.poverty === 1)) {
                povertyList.push(1);
            }
            const guaranteeList = [];
            if (insurancePackages && insurancePackages.find(item => item.guarantee === 0)) {
                guaranteeList.push(0);
            }
            if (insurancePackages && insurancePackages.find(item => item.guarantee === 1)) {
                guaranteeList.push(1);
            }
            this.setState({ insurancePackages, povertyList, guaranteeList, relationShipList });
            // relationShipList.map((item,index)=>{
            //     if(item.value===3){
            //         this.props.form.setFieldsValue({ relationWithInsurer: 3 });
            //         return true;
            //     }else if(item.value===1){
            //         this.props.form.setFieldsValue({ relationWithInsurer: 1 });
            //         return true;
            //     }else if(item.value===2){
            //         this.props.form.setFieldsValue({ relationWithInsurer: 2 });
            //         return true;
            //     }else{
            //         this.props.form.setFieldsValue({ relationWithInsurer: 4 });
            //         return true;
            //     }

            // })

            const insurerIdCard = this.props.form.getFieldValue('insurerIdCard')
            const initPackagePro = await this.getInitPackagePro(insurancePackages, insurerIdCard || null, poverty);
            this.setState({ selectedPackagePro: initPackagePro,defaultData:JSON.parse(JSON.stringify(initPackagePro)) });
            const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            const queryData = querystring.parse(qs);
            if (queryData && queryData.relation_ship) {
                if (relationDicts && relationDicts.find(item => item.value == queryData.relation_ship)) {
                    this.props.form.setFieldsValue({ relationWithInsurer: parseInt(queryData.relation_ship) });
                }
                const subData = localStorage.getItem("sub-data");
                if (subData) {
                    this.props.setInsurance({
                        environmentAssessment: true,
                        evalData: JSON.parse(subData)
                    });
                }
                localStorage.setItem('sub-data', null);
            }
            //返回页面 初始化
            if (this.props.insurance && this.props.insurance.payload) {
                const { setFieldsValue } = this.props.form;
                const insuranceForm = this.props.insurance.payload;
                setFieldsValue(insuranceForm);
                setFieldsValue(insuranceForm);
                if (insuranceForm.fileList) {
                    this.setState({ fileList: insuranceForm.fileList });
                }
                if (insuranceForm && insuranceForm.isPhoneCheck) {
                    this.setState({ isPhoneCheck: insuranceForm.isPhoneCheck });
                }
                this.props.form.validateFields(['insuranceType']);

                this.setState({ loading: false });
                //新增默认情况下是否有历史
                const { getFieldValue } = this.props.form;
                const relationWithInsurer = getFieldValue('relationWithInsurer');
                relationShipList.map(item=>{
                    if(item.value===relationWithInsurer){
                        this.setHostory(item)
                    }
                })
                Toast.hide();
            }
        } catch (e) {
            console.error('error', e);
            MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>加载失败', '点击确定刷新重试</span>, [
                { text: '确定', onPress: () => this.props.history.go(0) }
            ]);
        }
        //如果有激活码，则设置激活码
        const code= getQueryVariable('cid')
        if(code){
            this.props.form.setFieldsValue({'code':code})
        }
    }

    async checkIsPublicSecurityChecked(name, idCard) {
        const checkResult = await api.get(`/idCardCheck`, { idCard, name });
        return checkResult;
    }

    async getInitPackagePro(insurancePackages, idCard, poverty, guarantee) {
        const relationWithInsurer = this.props.form.getFieldValue('relationWithInsurer');
        if (relationWithInsurer === 1) {
            idCard = this.props.form.getFieldValue('idCard');
        }
        const initPackagePro = await this.formatPackagePro(insurancePackages, idCard, poverty, guarantee);
        if (initPackagePro && initPackagePro.insurancePackagePros && initPackagePro.insurancePackagePros.length > 0) {
            const { form } = this.props;
            const insuranceForm = this.props.insurance.payload || {};
            let item;
            if (insuranceForm && insuranceForm.insuranceGradeName) {
                item = initPackagePro.insurancePackagePros.find(item => item.gradeName === insuranceForm.insuranceGradeName);
            }
            if (!item) {
                item = initPackagePro.insurancePackagePros[0];
            }
            form.setFieldsValue({ insuranceType: item.id });
            this.props.setInsurance({ insuranceType: item.id, insuranceGradeName: item.gradeName });
        }
        return initPackagePro;
    }
    async formatPackagePro(insurancePackages, idCard, poverty, guarantee) {
        this.setState({ isAgeForbidden: false, isPovertyForbidden: false });
        const { patientInfo } = this.state;
        let insurancePackageList = [...insurancePackages];
        insurancePackageList = await Promise.all(insurancePackageList.map(item => {
            let { insurancePackagePros } = item;
            insurancePackagePros = insurancePackagePros.sort((a, b) => {
                const aPrice = this.getPrice(patientInfo ? patientInfo.membershipLevel : 'common', a);
                const bPrice = this.getPrice(patientInfo ? patientInfo.membershipLevel : 'common', b);
                return aPrice - bPrice;
            });
            const minPrice = this.getPrice(patientInfo ? patientInfo.membershipLevel : 'common', insurancePackagePros[0]);

            return {
                ...item,
                minPrice: minPrice,
                insurancePackagePros,
            }
        }));
        insurancePackageList = insurancePackageList.sort((a, b) => {
            return a.minPrice - b.minPrice;
        });
        if (idCard) {
            const validator = IDValidator;
            const idCardStr = String(idCard);
            const birthday = validator.getInfo(idCardStr).birth;
            const age = IdCardCheck(idCardStr);
            const pPro = insurancePackageList[0]
            const ageList = insurancePackageList.filter(item => item.minAge !== null && item.maxAge !== null);
            this.setState({ isAgeForbidden: false });
            if (ageList && ageList.length > 0) {
                insurancePackageList = insurancePackageList.filter(item => age >= item.minAge && age <= item.maxAge);
                if (!insurancePackageList || insurancePackageList.length <= 0) {
                    this.setState({ isAgeForbidden: true });
                    Modal.error({
                        title: '保障服务被保人年龄不符合承保范围',
                        onOk() {
                        },
                        okText: '确认',
                    });
                    return pPro;
                }
            }
        }
        if (guarantee !== undefined && guarantee !== null) {
            const pPro = insurancePackageList[0]
            insurancePackageList = insurancePackageList.filter(item => item.guarantee === guarantee);
            if (!insurancePackageList || insurancePackageList.length <= 0) {
                return pPro;
            }
        }
        if (poverty !== undefined && poverty !== null) {
            const pPro = insurancePackageList[0]
            insurancePackageList = insurancePackageList.filter(item => item.poverty === poverty);
            if (!insurancePackageList || insurancePackageList.length <= 0) {
                this.setState({ isPovertyForbidden: true });
                return pPro;
            }
        }

        return insurancePackageList[0];
    }

    getPrice(membershipLevel, insurancePackagePro) {
        //有可能是0
        return membershipLevel && insurancePackagePro && insurancePackagePro.memeberGradePrices && insurancePackagePro.memeberGradePrices[membershipLevel] !== null
            ? insurancePackagePro.memeberGradePrices[membershipLevel]
            : (insurancePackagePro ? insurancePackagePro.salesPrice : 0);
    }

    async onFileChange(files, type, index) {
        Toast.loading("文件上传中...", 600);
        this.setState({ loading: true });
        if (type === 'add') {
            const file = files[files.length - 1];
            const zipFile = await lrz(file.url, { quality: 0.7, width: 1280, height: 1280, });
            const name = file.file.name;
            const preview = zipFile.base64;
            const param = {
                data: preview.substr(preview.indexOf(';base64,') + ';base64,'.length),
                suffix: name.substring(name.lastIndexOf('.') + 1, name.length),
                prefixPath: 'orderinfo',
            }
            try {
                const urlPath = await api.post('/uploadImages', param);
                files[files.length - 1] = {
                    ...file,
                    urlPath,
                }
                this.setState({ fileList: [...files] });
                this.props.form.setFieldsValue({ fileList: [...files] });
                this.props.setInsurance({ fileList: [...files] });
            } catch (e) {
                Toast.fail('上传图片出错。', 3);
            }
        } else {
            this.setState({ fileList: [...files] });
            this.props.form.setFieldsValue({ fileList: [...files] });
            this.props.setInsurance({ fileList: [...files] });
        }
        if (this.state.fileList.length > 0) {
            this.messageFileError = '';
        }
        Toast.hide();
        this.setState({ loading: false });
    };

    toInsuranceServicePlan = () => {
        const { history, scroolPosition } = this.props;
        scroolPosition();
        history.push(`/insuranceServicePlan/${this.insurancePackageId}`);
    }

    async guaranteeOnChange(value) {
        this.checkLogin();
        const idCard = this.props.form.getFieldValue('insuredIdCard');
        const poverty = this.props.form.getFieldValue('poverty');
        const { insurancePackages } = this.state;
        const initPackagePro = await this.getInitPackagePro(insurancePackages, idCard, poverty, value);
        console.log('initPackageProaaaaaaaaaaa',initPackagePro)
        if ((initPackagePro.guarantee !== value) || (poverty !== undefined && poverty !== null && initPackagePro.poverty !== poverty)) {
            MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>本服务暂不支持{value === 0 ? '无医保' : '有医保'}用户购买</span>, null, [
                { text: '确定', onPress: () => { } }
            ]);
            return;
        }
        const { setFieldsValue } = this.props.form;
        const preInsuranceType = this.props.form.getFieldValue('insuranceType');
        const preIndex = initPackagePro.insurancePackagePros.find(i => i.id === preInsuranceType);
        setFieldsValue({ guarantee: value, insuranceType: preIndex >= 0 ? preInsuranceType : initPackagePro.insurancePackagePros[0].id });
        this.props.setInsurance({ guarantee: value });
        this.setState({ selectedPackagePro: initPackagePro });
    }
    async povertyOnChange(value) {
        this.checkLogin();
        const idCard = this.props.form.getFieldValue('insuredIdCard');
        const guarantee = this.props.form.getFieldValue('guarantee');
        const { insurancePackages } = this.state;
        const initPackagePro = await this.getInitPackagePro(insurancePackages, idCard, value, guarantee);
        if ((initPackagePro.poverty !== value) || (guarantee !== undefined && guarantee !== null && initPackagePro.guarantee !== guarantee)) {
            MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>本服务暂不支持{value === 0 ? '非贫困' : '贫困'}用户购买</span>, null, [
                { text: '确定', onPress: () => { } }
            ]);
            return;
        }
        const { setFieldsValue } = this.props.form;
        const preInsuranceType = this.props.form.getFieldValue('insuranceType');
        const preIndex = initPackagePro.insurancePackagePros.find(i => i.id === preInsuranceType);
        setFieldsValue({ poverty: value, insuranceType: preIndex >= 0 ? preInsuranceType : initPackagePro.insurancePackagePros[0].id });
        this.props.setInsurance({ poverty: value });
        this.setState({ selectedPackagePro: initPackagePro });
    }

    checkPatientName = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        if (!(/^[\u4e00-\u9fa5]+$/.test(value))) {
            callback('请输入正确的姓名');
            return;
        }
        callback();
    }

    checkinsuredName = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        if (!(/^[\u4e00-\u9fa5]+$/.test(value))) {
            callback('请输入正确的姓名');
            return;
        }
        const patientName = this.props.form.getFieldValue('patientName');
        if (patientName === value) {
            callback('被保人姓名不可与购买人相同');
            return;
        }
        callback();
    }
    checkIdCard = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        const validator = IDValidator;
        const valueStr = String(value);
        if (!validator.isValid(valueStr)) {
            callback('请输入正确的身份证号');
            return;
        }
        callback();
    }
    checkInsuredIdCard = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        const validator = IDValidator;
        const valueStr = String(value);
        if (!validator.isValid(valueStr)) {
            callback('请输入正确的身份证号');
            return;
        }
        const idCard = this.props.form.getFieldValue('idCard')
        if (idCard === value) {
            callback('被保人身份证号不可与购买人相同');
            return;
        }
        const { insurancePackages } = this.state;
        const poverty = this.props.form.getFieldValue("poverty");
        const initPackagePro = await this.getInitPackagePro(insurancePackages, value, poverty);
        this.setState({ selectedPackagePro: initPackagePro });
        callback();

    }

    checkPhone = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        if (!(/^1\d{10}$/.test(value.replace(/\s+/g, "")))) {
            this.errorPhone = true;
            callback('请输入正确的手机号码');
            return;
        }
    }

    checkInsuredPhone = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        if (!(/^1\d{10}$/.test(value.replace(/\s+/g, "")))) {
            this.errorPhone = true;
            callback('请输入正确的手机号码');
            return;
        }
        const phone = this.props.form.getFieldValue('phone') || this.state.patientInfo.phone;
        if (phone === value) {
            callback('为保障会员权益的使用，被保人手机号不可与购买人相同');
            return;
        }
    }

    checkCode = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        const checkValue = await api.get('/insurance_order/fork_code', { code: value });
        if (!checkValue) {
            callback('激活码有误');
            return;
        }
        if (checkValue.status === 1) {
            callback('激活码已被使用');
            return;
        } if (checkValue.insurancePackageId != this.insurancePackageId) {
            callback('激活码不属于本会员服务');
            return;
        }
        callback();

    }
    async getImg() {
        return html2canvas(this.formRf).then(function (canvas) {
            return canvas.toDataURL();
        });
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    async mergerPatient(name, idcard, id) {
        let { patientInfo } = this.state;
        const post_data = {
            originalPatient: patientInfo.id,
            targetPatient: id,
            name,
            idcard,
        }
        try{
            await api.post(`/patients/merge`, post_data);
            await api.post(`/bind/patient/${id}`);
            const patient = await api.get(`/currentPatient`);
            message.success('帐号合并完成，请继续点击购买');
            this.setState({isMerage: true, patientInfo: patient,checkPatientLoading: false})
            return;
        }catch(e){
            message.error(e.message);
            this.setState({ loading: false,checkPatientLoading: false, isMerage: false });
            return;
        }
    }

    async submitOrder() {
        this.props.form.validateFields(async (err, values) => {
            console.log(err,values)
            try {
                if (err) {
                    const { tabPage, toBuy } = this.props;
                    if (tabPage !== 1) {
                        toBuy();
                    }
                    if (err.code) {
                        this.stepThreeTab.scrollIntoView({ behavior: 'smooth' });
                    }
                    if (err.insuranceType) {
                        this.stepTwoTab.scrollIntoView({ behavior: 'smooth' });
                    }
                    if (err.idCard || err.patientName || err.phone || err.poverty) {
                        this.stepOneTab.scrollIntoView({ behavior: 'smooth' });
                    }

                    let errorList = Object.keys(err).sort((a, b) => {
                        const aObj = FormMap.findIndex(item => item.label === a);
                        const bObj = FormMap.findIndex(item => item.label === b);
                        return aObj-bObj;
                    });
                    const errorFile = FormMap.find(item => item.label === errorList[0]);
                    const errorObj = err[errorFile.label].errors;
                    if (errorFile) {
                        //此时如果有错误就将页面滑倒第三个tab项
                        // console.log(this.props)
                        this.props.errorTab()
                        let message = `${errorFile.value}输入有误：${errorObj[0].message}`
                        // console.log(`${errorFile.value}`)
                        if(`${errorFile.value}`==='有无医保'){
                            message=`请选择${errorFile.value}`
                        }else if(`${errorObj[0].message}`==='不能为空'){
                            message=`请输入${errorFile.value}`
                        }
                        Toast.info(message, 3);
                        // MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>{message}</span>, null, [
                        //     { text: '确定', onPress: () => { } }
                        // ]);
                    }
                    return;
                }
                console.log(values)
                if (this.state.isAgeForbidden) {
                    Modal.error({
                        title: '保障服务被保人年龄不符合承保范围',
                        onOk() {
                        },
                        okText: '确认',
                    });
                    return;
                }
                this.props.setInsurance({ ...values });
                await this.setPromise({ loading: true });
                const { isProhibit } = this.state;
                if (isProhibit) {
                    this.setState({ loading: false });
                    return;
                }
                const { readMe } = values;
                if (!readMe) {
                    this.readMeTab.scrollIntoView({ behavior: 'smooth' });
                    this.setState({ loading: false });
                    MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>请阅读并同意服务协议</span>, null, [
                        { text: '确定', onPress: () => { } }
                    ]);
                    return;
                }
                let { patientInfo, selectedPackagePro } = this.state;
                //投保人身份证号校验
                if(!this.state.isMerage){
                    this.setState({ checkPatientLoading: true });
                    try {
                        await api.get(`/idCardCheck`, { idCard: values.idCard, name: values.patientName, patientId: patientInfo ? patientInfo.id : '' });
                        this.setState({ isPublicSecurityChecked: true, checkPatientLoading: false });
                    } catch (e) {
                        if(e.code == 2){
                            const that = this;
                            MobileModal.alert('', `存在相同身份证号的帐号，姓名：${e.data.name}${e.data.phone ? '，手机号：'+e.data.phone:''}。请确认是否为您的帐号并进行合并？`, [
                                { text: '取消', onPress: () => {
                                    that.setState({loading: false,checkPatientLoading: false});
                                    message.error('因身份证号重复暂时无法购买，请致电400-010-1516联系我们解决。')
                                    }
                                },
                                { text: '确认', onPress: () => this.mergerPatient(values.patientName, values.idCard, e.data.patientId) },
                            ])
                            this.setState({ loading: false,checkPatientLoading: false });
                            Toast.hide();
                            return;
                        }else{
                            this.setState({ checkPatientError: true, checedResult: `${e.message}`, checkPatientLoading: false });
                            console.error(e);
                            // preview = undefined;
                            this.setState({ loading: false });
                            return;
                        }
                    }
                    //被保险人身份证号校验
                    if (values.relationWithInsurer !== 1) {
                        this.setState({ checkPatientLoading: true });
                        try {
                            await api.get(`/idCardCheck`, { idCard: values.insuredIdCard, name: values.insuredName, patientId: '' });
                            this.setState({ isPublicSecurityChecked: true, checkPatientLoading: false });
                        } catch (e) {
                            this.setState({ checkPatientError: true, checedResult: `${e.message}`, checkPatientLoading: false });
                            console.error(e);
                            // preview = undefined;
                            this.setState({ loading: false });
                            return;
                        }
                    }
                    Toast.loading("正在创建订单...", 600);
                    //如果是未注册会员则注册并绑定
                    if (!this.state.isLogin && !patientInfo) {
                        const patientData = {
                            memberType: 2,
                            phone: values.phone.replace(/\s+/g, ""),
                            name: values.patientName,
                            idCard: values.idCard,
                            hospitalId: this.state.openList[0].hospitalId,
                        }
                        let patientId;
                        try {
                            patientId = await api.post(`/patients`, patientData);
                        } catch (error) {
                            this.stepOneTab.scrollIntoView({ behavior: 'smooth' });
                            this.setState({ loading: false, isPublicSecurityChecked: false });
                            if (error.code === 100) {
                                // preview = undefined;
                                this.setState({ loading: false });
                                Toast.hide();
                                Toast.fail('会员信息与其他会员信息重复，请重新输入');
                                return;
                            }
                            this.setState({ loading: false });
                            Toast.hide();
                            Toast.fail(error.message);
                            return;
                        }

                        if (patientId) {
                            try {
                                const currentUser = await api.get('/currentUser');
                                await api.post(`/checkHospital`, {
                                    id: patientId,
                                    provinceId: currentUser.address.provinceId,
                                    cityId: currentUser.address.cityId,
                                })
                            } catch (error) {
                                console.error(error);
                            }
                            try {
                                await api.post(`/bind/patient/${patientId}`);
                                const patient = await api.get(`/currentPatient`);
                                patientInfo = patient;
                                this.setState({ patientInfo: patient });
                            } catch (e) {
                                console.error(e);
                            }
                        } else {
                            this.setState({ loading: false });
                            Toast.hide();
                            return;
                        }

                    }
                    //如果是身份证修改用户 则修改
                    if (patientInfo) {
                        const updateData = {
                            idCard: values.idCard,
                            name: values.patientName,
                        }
                        try {
                            await api.post(`/patients/${patientInfo.id}/patientCertification`, updateData);
                            const patient = await api.get(`/currentPatient`);
                            patientInfo = patient;
                            this.setState({ patientInfo: patient });
                        } catch (error) {
                            console.error(error);
                            if(error.code == 2){
                                const that = this;
                                MobileModal.alert('', `存在相同身份证号的帐号，姓名：${error.data.name}${error.data.phone ? '，手机号：'+error.data.phone:''}。请确认是否为您的帐号并进行合并？`, [
                                    { text: '取消', onPress: () => {that.setState({loading: false});message.error('因身份证号重复暂时无法购买，请致电400-010-1516联系我们解决。')} },
                                    { text: '确认', onPress: () => this.mergerPatient(values.patientName, values.idCard, error.data.patientId) },
                                ])
                                this.setState({ loading: false });
                                Toast.hide();
                                return;
                            }else{
                                this.setState({ loading: false });
                                Toast.hide();
                                Toast.fail(error.message);
                                return;
                            }
                        }
                    }
                }
                //校验是否可以购买保险
                try {
                    const checkParam = {
                        idCard: values.relationWithInsurer === 1 ? patientInfo.idCard : values.insuredIdCard,
                        insurancePackageProsId: values.insuranceType,
                    }
                    await api.get(`/insurance_order/verifyPatientInsuranceOrder`, checkParam);
                } catch (error) {
                    if (error.code === 422) {//存在未支付订单
                        console.error(error.data);
                        Toast.hide();
                        MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>
                            {error.message}
                        </span>, null, [
                            { text: '确定', onPress: () => this.props.history.push(`/service/${error.data}`) }
                        ]);
                        return;
                    }
                    console.error(error);
                    this.setState({ loading: false });
                    Toast.hide();
                    Toast.fail(error.message);
                    return;
                }
                let urlPath;
                this.props.setInsurance({selectedPackagePro})
                const selectedInsuranceType = selectedPackagePro.insurancePackagePros.find(item => item.id === values.insuranceType);
                let payPrice = this.getPrice(patientInfo ? patientInfo.membershipLevel : 'common', selectedInsuranceType);
                let postData = {
                    insurerId: patientInfo.id,
                    insurerName: values.patientName,
                    insurerIdCard: values.idCard,
                    insurerPhone: (values.phone || patientInfo.phone).replace(/\s+/g, ""),

                    insuredName: values.insuredName,
                    insuredPhone: (values.insuredPhone || '').replace(/\s+/g, ""),
                    insuredIdCard: values.insuredIdCard,
                    relationWithInsurer: values.relationWithInsurer,

                    poverty: values.poverty,
                    // povertyPics,
                    insurancePackageProsId: values.insuranceType,
                    payWay: 1,
                    usePoints: 0,
                    useAccount: 0,
                    payments: [{ payWay: 'self_charge', amount: payPrice }],
                    authorizationPics: urlPath,
                    code: values.code,
                    memberId:global.payOrder.beijing,
                    cid:this.state.cid
                }
                if (values.relationWithInsurer === 1) {
                    postData = {
                        ...postData,
                        insuredName: values.patientName,
                        insuredPhone: (values.phone || patientInfo.phone).replace(/\s+/g, ""),
                        insuredIdCard: values.idCard,
                    }
                }
                const { insuranceConfig } = this.props;
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
                if(selectedPackagePro.areas && selectedPackagePro.areas.length && !selectedPackagePro.areas.find(item => item.cityId ? item.cityId === cityId : item.provincesId ? item.provincesId == provinceId : null)){
                    Toast.hide();
                    message.error('您所在城市尚未开通该服务，敬请谅解。')
                    return;
                }
                //这里不走问询1直接支付
                if(insuranceConfig.diseaseType === 'noDisease'){
                    postData = {
                        ...postData,
                        healthEnquiries: null,
                    }
                    this.subPayOrder(postData)
                }else{
                    this.props.setInsurance({ postData })
                    // 这是走安心
                    if (insuranceConfig.diseaseType === 'config') {
                        this.props.history.push(`/anxinInsurance`);
                    }else if(insuranceConfig.diseaseType === 'cancer'){
                        console.log('我是跳转时的信息',this.props)
                        const insurance=JSON.stringify(this.props.insurance)
                        this.props.history.push(`/zhonghuiCancer/${this.insurancePackageId}?cid=${this.state.cid}`);
                    } else {
                        this.props.history.push(`/insuranceDiseaseV2/${this.insurancePackageId}?cid=${this.state.cid}`);
                    }
                }
                Toast.hide();
                this.setState({ loading: false });
            } catch (error) {
                this.setState({ loading: false });
                Toast.fail(error.message, 3);
            }
        });
    }

    insuranceTypeOnChange = (item) => {
        this.checkLogin();
        const { form } = this.props;
        form.setFieldsValue({ insuranceType: item.id });
        this.props.setInsurance({ insuranceType: item.id, insuranceGradeName: item.gradeName });
    }

    async subPayOrder(data){
        try {
            const order = await api.post(`/patients/insurance_orders`, data);
            this.setState({ orderInfo: order });
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

    readMe = (isAgree) => {
        const { form } = this.props;
        form.setFieldsValue({ readMe: isAgree });
        this.setState({ readMeVisible: false });
    }

    validateModalPhone() {
        this.props.form.validateFields(['phone'], async (errors, values) => {
            if (errors && errors.phone) {
                const message = `手机号错误:${errors.phone.errors[0].message}`;
                MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>{message}</span>, null, [
                    { text: '确定', onPress: () => { } }
                ]);
                this.setState({ phoneError: errors.phone.errors[0] });
                return;
            }
            this.setState({ phoneError: null });
        });
    }

    @action()
    async getCapchar() {
        if (this.timeCount) {
            return
        }
        this.props.form.validateFields(['phone'], async (errors, values) => {
            if (errors && errors.phone) {
                const message = `手机号错误:${errors.phone.errors[0].message}`;
                MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>{message}</span>, null, [
                    { text: '确定', onPress: () => { } }
                ]);
                return;
            }
            try {
                const patientId = await api.get(`/patients/available`, { phone: values.phone.replace(/\s+/g, "") });
                if (patientId) {
                    const patientInfo = await api.get(`/patient/${patientId}`);
                    this.setState({ prePatientInfo: patientInfo });
                }
                this.setState({ checkPhoneVisible: true });
                this.sendMessage(values.phone.replace(/\s+/g, ""));
            } catch (err) {
                Toast.error(err.message);
                return;
            }

        })
    }

    async sendMessage(mobilePhone) {
        try {
            this.errorPhoneMessage = null;
            await api.post(`/patient-sms-send`, {
                mobilePhone
            })
            this.disabledBind = false;
            this.setTimeCount();
        } catch (err) {
            this.errorPhoneMessage = err.message
        }
    }

    @action()
    async setTimeCount() {
        for (var i = 60; i >= 0; i--) {
            if (!i) {
                this.disabledGetCapchar = false;
            }
            this.timeCount = i;
            await this.timeout(1000);
        }
    }

    timeout(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time)
        })
    }

    inputBlur() {
        const { scroolInit } = this.props;
        scroolInit();
        //校验输入的信息是否存在于购买历史中
        // const list=this.state.buyrecord;
        // //获取输入额身份证号
        // const idcard=this.props.form.getFieldValue('insuredIdCard')
        // if(idcard){
        //     list.map(item=>{
        //         if(item.insuredIdCard==idcard){
        //             Modal.error({
        //                 title: '会员信息已存在',
        //                 onOk() {
        //                 },
        //                 okText: '确认',
        //             });
        //         }
        //     })
        // }
        // console.log(list)
        // console.log(idcard)
    }
    checkLogin() {
        const { patientInfo, isPhoneCheck } = this.state;
        if (!patientInfo && !isPhoneCheck) {
            MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>
                手机号尚未完成验证，请先验证
            </span>, null, [
                { text: '确定', onPress: () => this.phoneInput.focus() },
            ]);
            return false;
        } else {
            /* window.scrollTo(0, window.innerHeight); */
            /* const { scroolPosition } = this.props;
            scroolPosition(); */
            return true;
        }

    }

    @action()
    capcharInputChange(value) {
        if (value > 9999) {
            const val = `${value}`.slice(0, 4)
            this.setState({ capchar: val });
        } else {
            this.setState({ capchar: value });
        }
        this.errorSms = false;
        this.errorCodeMessage = null;
    }

    validateCapcharOnBlur = () => {
        const { capchar } = this.state;
        if (!capchar) {
            const message = `验证码错误:不能为空`;
            MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>{message}</span>, null, [
                { text: '确定', onPress: () => { } }
            ]);
            this.setState({ capcharError: { message: '不能为空' } });
            return;
        }
        this.setState({ capcharError: null });
    }
    //校验验证码
    validateCapchar = () => {
        this.setState({ registeLoading: true });
        this.validateModalPhone();
        this.validateCapcharOnBlur();
        const { capchar, phoneError, } = this.state;
        if (phoneError) {
            const message = `手机号错误:${phoneError}`;
            MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>{message}</span>, null, [
                { text: '确定', onPress: () => { } }
            ]);
        }
        if (!capchar) {
            this.setState({ registeLoading: false });
            return;
        }
        const _that = this;
        this.props.form.validateFields(['phone'], async (errors, values) => {
            if (errors && errors.phone) {
                this.setState({ registeLoading: false });
                return;
            }
            try {
                const patientId = await api.post(`/verify-patient`, {
                    mobilePhone: values.phone.replace(/\s+/g, ""),
                    code: capchar,
                });
                if (patientId) {
                    //验证成功后，锁定手机号，如果有对应患者 查询初始化并绑定。
                    this.setState({ checkPhoneVisible: false, isPhoneCheck: true });
                    this.props.setInsurance({ isPhoneCheck: true });
                    const patientInfo = await api.get(`/patient/${patientId}`);
                    this.setState({ patientInfo: { ...patientInfo, id: patientId } });
                    this.props.form.setFieldsValue({
                        idCard: patientInfo.idCard,
                        patientName: patientInfo.name,
                    });
                    try {
                        await api.post(`/bind/patient/${patientId}`);
                    } catch (error) {
                        console.error(error);
                    }
                    const user = await api.get('/currentUser');
                    const { hospital } = patientInfo;
                    if (user && user.address) {
                        const userAddress = user.address;
                        if (userAddress.provinceId != hospital.provinceId ||
                            userAddress.cityId != hospital.cityId) {
                            const address = {
                                address: {
                                    provinceId: hospital.provinceId,
                                    cityId: hospital.cityId,
                                    province: hospital.provinceName,
                                    city: hospital.cityName
                                }
                            }
                            if (patientInfo.memberType === 2) {
                                await api.post(`/checkHospital`, {
                                    id: patientId,
                                    provinceId: userAddress.provinceId,
                                    cityId: userAddress.cityId,
                                })
                            } else {
                                // api.get('/saveCityList', address);
                                // MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>
                                //     {`您的会员类型不支持在${userAddress.city}享受当前服务，如需帮助请在线联系客服或致电400-010-1516；`}
                                // </span>, "", [
                                //     { text: '确定', onPress: () => this.props.history.push('/newHealthHomePage') }
                                // ]);
                            }
                        }
                    }
                    this.props.form.setFieldsValue({ insuranceType: null });
                    const poverty = this.props.form.getFieldValue("poverty");

                    const idCard = this.props.form.getFieldValue('insuredIdCard');
                    const { insurancePackages } = this.state;
                    const initPackagePro = await _that.getInitPackagePro(insurancePackages, idCard, poverty);
                    this.setState({ selectedPackagePro: initPackagePro });
                    if (patientInfo.realNameAuthenticationPassed === 1) {
                        this.setState({ isPublicSecurityChecked: true });
                    } else {
                        this.props.form.validateFields(["patientName", "idCard"]);
                    }
                } else {
                    const patientData = {
                        memberType: 2,
                        phone: values.phone.replace(/\s+/g, ""),
                        name: values.phone.replace(/\s+/g, ""),
                        hospitalId: this.state.openList[0].hospitalId,
                    }
                    let patientId;
                    try {
                        patientId = await api.post(`/patients`, patientData);
                    } catch (error) {
                        this.stepOneTab.scrollIntoView({ behavior: 'smooth' });
                        this.setState({ loading: false, isPublicSecurityChecked: false });
                        if (error.code === 100) {
                            this.setState({ loading: false });
                            Toast.hide();
                            Toast.fail('会员信息与其他会员信息重复，请重新输入');
                            this.setState({ registeLoading: false });
                            return;
                        }
                        this.setState({ loading: false });
                        Toast.hide();
                        Toast.fail(error.message);
                        this.setState({ registeLoading: false });
                        return;
                    }
                    if (patientId) {
                        try {
                            this.setState({ checkPhoneVisible: false, isPhoneCheck: true });
                            this.props.setInsurance({ isPhoneCheck: true });
                            const currentUser = await api.get('/currentUser');
                            await api.post(`/checkHospital`, {
                                id: patientId,
                                provinceId: currentUser.address.provinceId,
                                cityId: currentUser.address.cityId,
                            })
                        } catch (error) {
                            console.error(error);
                        }
                        try {
                            await api.post(`/bind/patient/${patientId}`);
                            const patient = await api.get(`/currentPatient`);
                            this.setState({ patientInfo: patient });
                        } catch (e) {
                            console.error(e);
                        }
                    }

                }
            } catch (err) {
                const message = `验证码错误:${err.message}`;
                MobileModal.alert(<span style={{ color: '#222222', lineHeight: '24px' }}>{message}</span>, null, [
                    { text: '确定', onPress: () => { } }
                ]);
                this.setState({ capcharError: { message: err.message } });
            }
            this.setState({ registeLoading: false });

        });
    }
    // 打开条款弹窗
    async openNotice(item) {
        //将pdf的预览更改为弹窗
        const { scroolPosition } = this.props;
        scroolPosition();
        //根据articleId接口请求获取文章内容
        if(!item.articleId){
            message.error('文章articleId不存在',5);
            return
        }
        const articleInfo = await api.get('/getArticleDetail', { articleId: item.articleId});
        if(articleInfo){
            this.setState({
                clauseModal:true,
                clauseData:articleInfo
            })
        }else{
            message.error('未发现',5);
        }
        // this.props.history.push(`/notice?filePath=${encodeURIComponent(item.url)}&fileName=${encodeURIComponent(item.name)}`);
    }
    closeModal(val){
        this.setState({
            clauseModal:val,
            clauseData:{}
        })
    }
    readMeForRegister(readMeVisible, notificationCode) {
        this.setState({ notificationCode: notificationCode, readMeVisibleForRegister: readMeVisible })
    }

    relationWithInsurerOnchange = async (item) => {
        //保险协议,根据勾选的人显示不同的协议
        let arr=this.props.insuranceConfig.notification;
        if(arr&&arr.length>0){
            if (item.label=='本人') {
                this.setState({
                    agreement:arr.filter(el => (el.relationWithInsurer ==1||el.relationWithInsurer==2))
                })
            }else{
                this.setState({
                    agreement:arr.filter(el => (el.relationWithInsurer ==1||el.relationWithInsurer==3))
                })
            }
        }
        const { relationShipList } = this.state;
        if (!this.checkLogin()) {
            return;
        }
        const { form } = this.props;
        const relationWithInsurer = form.getFieldValue('relationWithInsurer');
        const relation = relationShipList.find(re => re.value === relationWithInsurer);
        if (relationWithInsurer && relation && relation.type !== item.type) {
            form.setFieldsValue({ readMe: false });
            this.props.setInsurance({ readMe: false });
        }
        form.setFieldsValue({ relationWithInsurer: item.value, insuredName:'',insuredIdCard:'',insuredPhone:''});
        this.props.setInsurance({ relationWithInsurer: item.value, });

        // if(item.value===1){
        //     return
        // }else{
            setTimeout(() => {
                this.setHostory(item)
            }, 0);
        // };
        const { insurancePackages } = this.state;
        const poverty = this.props.form.getFieldValue("poverty");
        const insurerIdCard = this.props.form.getFieldValue("insurerIdCard");
        const initPackagePro = await this.getInitPackagePro(insurancePackages, insurerIdCard, poverty);
        if (item.value == 1) {
            this.setState({ selectedPackagePro: initPackagePro });
        };
        this.setState({
            chooseadd:false,
            selectedPackagePro:this.state.defaultData
        })
    }
    //校验合法
    async Cardlegal(){
        //获取身份证里面的年龄
        const card=this.props.form.getFieldValue('insuredIdCard')
        console.log(this.props)
        if(!card){
            return
        }
        const age = IdCardCheck(card);
        console.log(age)
        const { insurancePackages,patientInfo } = this.state;
        const insurancePackageList=JSON.parse(JSON.stringify(insurancePackages));
        const ageList = insurancePackageList.filter(item => item.minAge !== null && item.maxAge !== null);
        let isTrue=false;
        if (ageList && ageList.length > 0) {
            ageList.filter(item => {
                if(age>=item.minAge&&age<=item.maxAge&&isTrue===false){
                    isTrue=true
                }
            });
        };
        if(isTrue===false){
            Modal.error({
                title: '保障服务被保人年龄不符合承保范围',
                onOk() {
                },
                okText: '确认',
            });
        }
        //计算新的价格
        const idCard = this.props.form.getFieldValue('insuredIdCard');
        const poverty = this.props.form.getFieldValue('poverty');
        const initPackagePro = await this.getInitPackagePro(insurancePackages, idCard, poverty);
        console.log('initPackageProaaaaaaaaaaa',initPackagePro)
        this.setState({ selectedPackagePro: initPackagePro})
        //计算新的价格
    }
    //点击切换或者默认时，去渲染值
    setHostory(item){
        //过滤到不合法的
        if(item.buyhostory.length>0){
            this.setState({
                buypeoplelist:[...item.buyhostory],
                addUserDisabled:true,
            })
            this.props.form.setFieldsValue({insuredName:item.buyhostory[0].insuredName,insuredIdCard:item.buyhostory[0].insuredIdCard,insuredPhone:item.buyhostory[0].insuredPhone});
            this.Cardlegal()
        }else{
            this.setState({
                buypeoplelist:[],
                addUserDisabled:false,
            })
            this.props.form.setFieldsValue({insuredName:'',insuredIdCard:'',insuredPhone:''});
        }
    }
    //点击新增用户
    add_user(){
        //激活表单
        this.setState({
            addUserDisabled:false,
            chooseadd:true
        })
        this.props.form.setFieldsValue({insuredName:'',insuredIdCard:'',insuredPhone:''});
    }
    selectpeople(item){
        console.log(item)

        this.setState({
            addUserDisabled:true,
            chooseadd:false,
        })
        this.props.form.setFieldsValue({insuredName:item.insuredName,insuredIdCard:item.insuredIdCard,insuredPhone:item.insuredPhone});
        //会获取不到身份证号，放到任务队列的后面
        setTimeout(()=>{
            this.Cardlegal()
        },100)
    }
    renderInsured() {
        const { relationShipList,buypeoplelist} = this.state;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const relationWithInsurer = getFieldValue('relationWithInsurer');
        const ast =relationShipList.length ? JSON.parse(JSON.stringify(relationShipList)) : []
        // console.log('数据初始化时的问题',relationShipList,buypeoplelist,relationWithInsurer)
        const i1 = ast && ast.findIndex(i => i.value == 3)
        const i1_data = ast && ast.find(i => i.value == 3)
        const i2 = ast && ast.findIndex(i => i.value == 2)
        const i2_data = ast && ast.find(i => i.value == 2)
        if(i1_data && i2_data){
            ast.splice(i1, 1, i2_data)
            ast.splice(i2, 1, i1_data)
        };
        const relationShip = ast.length && ast[0] !== undefined && ast.map((item, index) => {
            const className = relationWithInsurer == item.value ? 'button12 selectedButton' : 'button12 selectButton';
            return <Col span={8} key={index} className="textAlign-1 marginBottom16">
                <Button
                    className={className}
                    onClick={() => this.relationWithInsurerOnchange(item)}
                    style={{ height: '36px' }}
                >
                    {item.label}
                </Button>
            </Col>
        });
        return <div>
            <FormItem>
                {getFieldDecorator('relationWithInsurer', {
                    rules: [{ required: true, message: '不能为空' }],
                })(
                    <Row>
                        {relationShip}
                    </Row>
                )}
            </FormItem>
            {relationWithInsurer !== 1 ? <div>
                {buypeoplelist.length>0?<div className="choose_member">
                    <h1>可选会员</h1>
                    <Button style={{ height: '36px' }} onClick={()=>this.add_user()} className={this.state.chooseadd?'selectedButton':'selectButton'}>
                        <Icon type="plus" />新增
                    </Button>
                    {buypeoplelist?buypeoplelist.map((item,i)=>{
                        return (
                            <Button style={{ height: '36px' }} onClick={()=>this.selectpeople(item)} className={item.insuredIdCard===this.props.form.getFieldValue('insuredIdCard')?'selectedButton':'selectButton'}>
                                {'*'+item.insuredName.substr(1,10)}
                            </Button>
                        )
                    }):null}
                </div>:null}
                <FormItem ref={ref => this.notificationRef = ref}>
                    {getFieldDecorator('insuredName', {
                        validateTrigger: 'onBlur',
                        // initialValue:this.state.historyname,
                        rules: [
                            { required: true, message: '不能为空' },
                            { validator: this.checkPatientName },
                        ]
                    })(
                        <InputItem placeholder="会员姓名"
                            onBlur={() => this.inputBlur()}
                            style={{ height: '44px',lineHeight:'normal' }}
                            className="formInput new_formInput"
                            editable={!this.state.addUserDisabled}
                            onChange={val => { this.props.setInsurance({ insuredName: val }) }}
                        ><span className="requiredSpan" >*</span>会员姓名</InputItem>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('insuredIdCard', {
                        validateTrigger: 'onBlur',
                        // initialValue:this.state.historycard,
                        rules: [
                            { required: true, message: '不能为空' },
                            { validator: this.checkInsuredIdCard },
                        ],
                    })(
                        <InputItem placeholder="身份证号"
                            onBlur={() => this.inputBlur()}
                            style={{ height: '44px',lineHeight:'normal' }}
                            className="formInput new_formInput"
                            editable={!this.state.addUserDisabled}
                            onChange={val => { this.props.setInsurance({ insuredIdCard: val }) }}
                        ><span className="requiredSpan" >*</span>身份证号</InputItem>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('insuredPhone', {
                        validateTrigger: 'onBlur',
                        // initialValue:this.state.historyphone,
                        rules: [
                            { required: true, message: '不能为空' },
                            { validator: this.checkInsuredPhone },
                        ],
                    })(
                        <InputItem placeholder="会员手机号"
                            onBlur={() => this.inputBlur()}
                            style={{ height: '44px',lineHeight:'normal' }}
                            className="formInput new_formInput"
                            editable={!this.state.addUserDisabled}
                            onChange={val => { this.props.setInsurance({ insuredPhone: val }) }}
                        ><span className="requiredSpan" >*</span>会员手机号</InputItem>
                    )}
                </FormItem>
            </div> : null}

        </div>
    }

    render() {
        const {
            patientInfo, loading, checkPatientLoading,
            selectedPackagePro,
            isPublicSecurityChecked, checkPatientError, povertyList, guaranteeList,
            checedResult, isLogin, checkPhoneVisible, phoneError,
            capcharError, isPhoneCheck,
            prePatientInfo,
            buyinfo
        } = this.state;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const guarantee = getFieldValue('guarantee');
        const poverty = getFieldValue('poverty');
        const insuranceType = getFieldValue('insuranceType');
        const readMe = getFieldValue('readMe');
        const phone = getFieldValue('phone');
        const relationWithInsurer = getFieldValue('relationWithInsurer');
        const { insurancePackagePros } = selectedPackagePro || {};
        let selectedInsuranceType;
        //保障档次
        const insurancePackageProList = insurancePackagePros ? insurancePackagePros.map((item, index) => {
            const isSelected = item.id === insuranceType;
            selectedInsuranceType = (item.id === insuranceType && !selectedInsuranceType) ? item : selectedInsuranceType;
            const className = isSelected ? 'button12 selectedButton' : 'button12 selectButton';
            return <Col span={12} key={index} className="textAlign-1 marginBottom16">
                <Button className={className} onClick={() => this.insuranceTypeOnChange(item)}>{item.gradeName}</Button>
            </Col>
        }) : null;
        selectedInsuranceType = selectedInsuranceType || (insurancePackagePros ? insurancePackagePros[0] : null);
        const insuranceServices = selectedInsuranceType && selectedInsuranceType.insuranceServices ? selectedInsuranceType.insuranceServices : [];
        //服务内容
        const serviceList = insuranceServices.map((item, index) => {

            const isLast = index === insuranceServices.length - 1;
            const style = isLast ? { borderBottom: 'unset' } : null;
            return (
                <div key={index} style={{ paddingTop: '10px' }}>
                    <Row className="serviceItem" style={style} >
                        <Col span={24} className="textAlign-1" style={{ fontWeight: 600 }}>
                            <pre>{item.serviceName}</pre>
                        </Col>
                    </Row>
                    {/* <Row className="serviceItem" style={style} >
                        <Col span={24} className="textAlign-1">
                            <pre style={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }} >{item.notes}</pre>
                        </Col>
                    </Row> */}
                </div>
            )
        });
        //保费价格
        const memberPrice = this.getPrice(patientInfo ? patientInfo.membershipLevel : 'common', selectedInsuranceType);
        const salesPrice = selectedInsuranceType ? selectedInsuranceType.salesPrice || 0 : 0;
        const marketPrice = selectedInsuranceType ? selectedInsuranceType.marketPrice || 0 : 0;
        let idCardExtra;
        if (isPublicSecurityChecked) {
            idCardExtra = <img src={IdCardChecked} style={{ height: '36px', width: 'unset' }} />
        }
        let membershipLevelIcon;
        if (patientInfo && patientInfo.membershipLevelIconURL) {
            membershipLevelIcon = <img src={patientInfo.membershipLevelIconURL} style={{ height: '36px', width: 'unset', marginRight: '8px' }} />
        }
        return (<div className="insurance" ref={ref => this.formRf = ref}>


            <Modal
                visible={checkPatientLoading}
                footer={null}
                closable={false}
                width={315}
            >
                <div className="stateModalBox">
                    <img src={IdCardChecked} />
                    <p>身份信息验证中......</p>
                </div>
            </Modal>
            <Modal
                visible={checkPatientError}
                footer={null}
                closable={false}
                width={315}
            >
                <div className="stateModalBox">
                    <img src={IdCardChecked} />
                    <p>{checedResult}</p>
                    <Button className="submitButton" style={{ width: '120px' }} onClick={() => this.setState({ checkPatientError: false })}>返回</Button>
                </div>
            </Modal>
            <Modal
                visible={checkPhoneVisible}
                onCancel={() => this.setState({ checkPhoneVisible: false })}
                footer={null}
                closable={true}
                width={'90%'}
            >
                <div className="phoneModalBox">
                    {
                        prePatientInfo ? '' : <div style={{ color: '#c8161e' }}>本服务只对会员开放，请先注册</div>
                    }
                    <InputItem placeholder="手机号"
                        style={{ height: '50px' }}
                        type="phone"
                        className="formInput"
                        editable={false}
                        ref={ref => this.phoneInput = ref}
                        onBlur={() => this.validateModalPhone()}
                        onChange={val => { this.props.setInsurance({ phone: val }); this.props.form.setFieldsValue({ phone: val }); }}
                        extra={
                            <Button
                                className="getCapcharBtn"
                                style={{ border: 'unset', padding: 'unset', color: 'orange', fontSize: '14px', backgroundColor: 'unset', borderColor: 'unset',marginTop:'-40px' }}
                                disabled={this.timeCount ? true : false}
                                onClick={() => this.getCapchar()}>{this.timeCount ? `${this.timeCount}s重新获取` : '获取验证码'}</Button>
                        }
                        value={phone}
                    >手机号</InputItem>
                    <span style={{ color: 'red' }}>{phoneError ? phoneError.message : ''}</span>
                    <InputItem placeholder="短信验证码"
                        maxLength={4}
                        onChange={(val) => this.capcharInputChange(val)}
                        value={this.state.capchar}
                        className="formInput"
                        type="number"
                        style={{ height: '44px' }}
                        onBlur={this.validateCapcharOnBlur}
                    >验证码</InputItem>
                    <span style={{ color: 'red' }}>{capcharError ? capcharError.message : ''}</span>
                    <div style={{ fontSize: '16px', paddingTop: '10px' }} > 查看来自【万户健康】的短信获得验证码</div>
                    <Row style={{ textAlign: 'center' }}>
                        <Button
                            className="submitButton" onClick={() => this.validateCapchar()}
                            loading={this.state.registeLoading}
                            disabled={this.state.registeLoading}
                            style={{fontSize:'18px',
                                color:' #fff',
                                backgroundColor: '#C8161D',
                                border:' unset',
                                borderRadius:' 5px',
                                fontWeight: 300}}
                        >

                            {prePatientInfo ? '登录' : '同意协议并注册'}
                        </Button>
                    </Row>
                    {prePatientInfo ? '' : (
                        <Row>
                            <div style={{ paddingTop: '24px', color: '#707070' }}>
                                <span>已阅读并同意以下协议</span>
                            </div>
                            <Button type="link" className="linkBtn" style={{ height: '25px', fontSize: '14px', paddingLeft: '0px' }} onClick={() => this.readMeForRegister(true, 1)}>
                                万户健康慢病综合管理服务平台服务协议
                            </Button>
                            <Button type="link" className="linkBtn" style={{ height: '25px', fontSize: '14px', paddingLeft: '0px' }} onClick={() => this.readMeForRegister(true, 2)}>
                                隐私政策
                            </Button>
                        </Row>
                    )}
                </div>

            </Modal>
            <NotificationModal visible={this.state.readMeVisible} readMe={this.readMe} isAgree={readMe} insuranceConfig={this.state.agreement} relationWithInsurer={relationWithInsurer} />
            <NotificationModalForLogin visible={this.state.readMeVisibleForRegister} notificationCode={this.state.notificationCode} readMe={(visible, code) => this.readMeForRegister(visible, code)} />
            {/* 协议阅读 */}
            <ClauseModal visible={this.state.clauseModal} data={this.state.clauseData}
            closeModal={(val)=>this.closeModal(val)}
            />
            <Form>
                <div className="formItemBox" ref={ref => this.stepOneTab = ref}>
                    <Row className="stepTitle">
                        <div className="step"><div>1</div></div>
                        <div className="title">本人信息</div>
                    </Row>
                    {isLogin ? null :
                    <FormItem>
                        {getFieldDecorator('phone', {
                            initialValue: patientInfo ? patientInfo.name : '',
                            validateTrigger: 'onBlur',
                            rules: [
                                { required: true, message: '不能为空' },
                                { validator: this.checkPhone },
                            ]
                        })(
                            <InputItem placeholder="手机号"
                                style={{ height: '44px' }}
                                type="phone"
                                className="formInput"
                                ref={ref => this.phoneInput = ref}
                                onChange={val => { this.props.setInsurance({ phone: val }) }}
                                editable={!isPhoneCheck}
                                extra={
                                    isPhoneCheck ? null :
                                        <Button
                                            style={{ border: 'unset', padding: 'unset', color: 'orange', fontSize: '14px' }}
                                            disabled={this.timeCount ? true : false}
                                            onClick={() => this.getCapchar()}>{this.timeCount ? `${this.timeCount}s重新获取` : '获取验证码'}</Button>
                                }

                            ><span className="requiredSpan">*</span>手机号</InputItem>
                        )}
                    </FormItem>}
                    <FormItem ref={ref => this.notificationRef = ref}>
                        {getFieldDecorator('patientName', {
                            initialValue:patientInfo && !isPhoneCheck ? patientInfo.name : '' ,
                            validateTrigger: 'onBlur',
                            rules: [
                                { required: true, message: '不能为空' },
                                { validator: this.checkPatientName },
                            ]
                        })(
                            <InputItem placeholder="请输入姓名"
                                onBlur={() => this.inputBlur()}
                                style={{ height: '44px', }}
                                className="formInput"
                                editable={!isPublicSecurityChecked}
                                onChange={val => { this.props.setInsurance({ patientName: val }) }}
                                extra={isPublicSecurityChecked ? <div>{membershipLevelIcon}{idCardExtra}</div> : ''}
                                onFocus={() => this.checkLogin()}

                            ><span className="requiredSpan">*</span>姓名</InputItem>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('idCard', {
                            initialValue: patientInfo ? patientInfo.idCard : '',
                            validateTrigger: 'onBlur',
                            rules: [
                                { required: true, message: '不能为空' },
                                { validator: this.checkIdCard },
                            ],
                        })(
                            <InputItem placeholder="请输入身份证"
                                onBlur={() => this.inputBlur()}
                                style={{ height: '44px'}}
                                className="formInput"
                                editable={!isPublicSecurityChecked}
                                onChange={val => { this.props.setInsurance({ idCard: val }) }}
                                onFocus={() => this.checkLogin()}
                            ><span className="requiredSpan">*</span>身份证</InputItem>
                        )}
                    </FormItem>

                    <Row className="stepTitle" >
                        <div className="step"><div>2</div></div>
                        <div className="title">为谁购买（会员）</div>
                        <div className="titleButton"></div>
                    </Row>
                    {this.renderInsured()}
                    {guaranteeList && guaranteeList.length > 0 ? (
                        <FormItem>
                            {getFieldDecorator('guarantee', {
                                rules: [{ required: true, message: '不能为空' }],
                            })(
                                <Row className="itemBox">
                                    <Col span={6} className="itemTitle">
                                        <span className="requiredSpan">*</span>有无医保
                                </Col>
                                    <Col span={18} className="itemField">
                                        <Button className={guarantee === 1 ? 'selectedButton' : 'selectButton'} onClick={() => this.guaranteeOnChange(1)}>有医保</Button>
                                        <Button className={guarantee === 0 ? 'selectedButton' : 'selectButton'} onClick={() => this.guaranteeOnChange(0)}>无医保</Button>
                                    </Col>
                                </Row>
                            )}
                        </FormItem>
                    ) : null}

                    {povertyList && povertyList.length > 0 ? (
                        <FormItem>
                            {getFieldDecorator('poverty', {
                                rules: [{ required: true, message: '不能为空' }],
                            })(
                                <Row className="itemBox">
                                    <Col span={6} className="itemTitle">
                                        <span className="requiredSpan">*</span>是否贫困
                                </Col>
                                    <Col span={18} className="itemField">
                                        <Button className={poverty === 1 ? 'selectedButton' : 'selectButton'} onClick={() => this.povertyOnChange(1)}>贫困</Button>
                                        <Button className={poverty === 0 ? 'selectedButton' : 'selectButton'} onClick={() => this.povertyOnChange(0)}>非贫困</Button>
                                    </Col>
                                </Row>
                            )}
                        </FormItem>
                    ) : null}

                    <div ref={ref => this.stepTwoTab = ref} ></div>
                    <Row className="stepTitle" >
                        <div className="step"><div>2</div></div>
                        <div className="title">请选择服务方案</div>
                        <div className="titleButton"></div>
                    </Row>
                    <FormItem>
                        {getFieldDecorator('insuranceType', {
                            rules: [{ required: true, message: '不能为空' }],
                        })(
                            <Row>
                                {insurancePackageProList}
                            </Row>
                        )}
                    </FormItem>

                    <div className="serviceBox">
                        {serviceList}
                    </div>
                    <Row className="stepTitle" >
                        <div className="step"><div>3</div></div>
                        <div className="title">会员服务费</div>
                    </Row>
                    <Row className="itemTitle">
                        <Col span={12}>
                            实付年费
                         </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            {marketPrice ?
                                <div>
                                    <span style={{ color: '#9A9A9A', textDecoration: 'line-through' }}>
                                        ¥{((marketPrice) / 100)}/年
                                    </span>
                                    <br />
                                </div> : null
                            }
                            <span>{membershipLevelIcon}¥{((memberPrice || 0) / 100)}/年</span>
                        </Col>
                    </Row>
                    <div ref={ref => this.stepThreeTab = ref}></div>
                    {selectedPackagePro && selectedPackagePro.buyWithCode === 1 ? <div>
                        <Row className="stepTitle">
                            <div className="step"><div>4</div></div>
                            <div className="title">请输入服务激活码</div>
                        </Row>
                        <FormItem ref={ref => this.notificationRef = ref}>
                            {getFieldDecorator('code', {
                                validateTrigger: 'onBlur',
                                rules: [
                                    { required: true, message: '不能为空' },
                                    { validator: this.checkCode },
                                ]
                            })(
                                <InputItem placeholder="请输入服务激活码"
                                    style={{ height: '44px' }}
                                    className="formInput"
                                    onChange={val => { this.props.setInsurance({ code: val }) }}
                                    onFocus={() => this.checkLogin()}
                                ><span className="requiredSpan">*</span>激活码</InputItem>
                            )}
                        </FormItem>
                    </div> : null}
                </div>
                <div style={{ padding: '16px' }}>
                    {selectedPackagePro
                        && selectedPackagePro.isShow
                        ? <Row className="itemTitle" style={{ fontSize: '16px', color: '#222222' }}>
                            领取前请仔细阅读
                            {selectedPackagePro.insurancePackageSpecs.map((item, index) => {
                            if (item.type !== 101) {
                                return;
                            }
                            return <a href="javascript:void(0)" key={index} className="linkBtn" type="link" onClick={() => { this.openNotice(item) }}>《{item.name}》</a>
                            })}
                        </Row>
                        : null}
                </div>
                <WhiteSpace size="lg" />
                <div ref={ref => this.readMeTab = ref}>
                    <FormItem style={{ marginBottom: '52px' }}>
                        {getFieldDecorator('readMe', {
                            rules: [],
                        })(
                            <Row className="readMe">
                                <Checkbox checked={readMe} onChange={() => this.setState({ readMeVisible: true })}>我已阅读并同意:</Checkbox>
                                {
                                    this.state.agreement && this.state.agreement.length > 0 ?
                                    this.state.agreement.map(item => {
                                            return <a onClick={() => this.setState({ readMeVisible: true })} className="linkBtn"> 《{item.name}》&nbsp;&nbsp;&nbsp;&nbsp;</a>
                                        }) : null
                                }
                            </Row>
                        )}
                    </FormItem>
                </div>

                <div className="submitButtonBox" style={{
                    position: 'fixed',
                    bottom: '0px',
                    width: '100%',
                }}>
                    <Row className="box">
                        <Col span={14}>
                            {marketPrice ?
                                <div style={{ paddingLeft: '16px' }}>
                                    <span style={{ color: '#9A9A9A', textDecoration: 'line-through' }}>
                                        ¥{((marketPrice) / 100)}/年
                                    </span>
                                    <br />
                                </div> : null
                            }
                            <div className="text" style={marketPrice ? { lineHeight: '27px' } : {}}> ¥{((memberPrice || 0) / 100)}/年
                            </div>
                        </Col>
                        <Col span={10}>
                            <Button
                                loading={loading}
                                disabled={loading}
                                type="primary"
                                className="button"
                                onClick={() => this.submitOrder()}>
                                {memberPrice ? '立即购买' : '确定'}
                            </Button>
                        </Col>
                    </Row>
                </div>

            </Form>
        </div>)
    }
}

Insurance = Form.create()(Insurance);

export default Insurance;
