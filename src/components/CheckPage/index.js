import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Row, Col, Icon, Button, Radio, message, Modal, Spin, Drawer, Switch, Card } from 'antd';
import { ActionSheet, ImagePicker, InputItem } from 'antd-mobile';
import lrz from 'lrz';
import Title from '../common/Title';
import SelectButton from '../Register/SelectButton';
import AddressList from '../UserAddressList/AddressList';
import CouponList from '../CouponList/CouponList';
import IDValidator from '../../helper/checkIdCard';
import api from '../../api';
import Weixin from '../../lib/weixin';
import './index.less';
import HospitalList from './HospitalList';
import querystring from 'query-string';
import { centToYuan, refundRountCentPercentToCent } from '../../helper/money';

const DrugIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1311458_hcr150rk9zu.css',
});


const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);

let wrapProps;
if (isIPhone) {
    wrapProps = {
        onTouchStart: e => e.preventDefault(),
    };
}

const FREQUENCY = {
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [4, 1],
    5: [1, 1],
    6: [1, 7],
};

const DRUGSTATUS = {
    0: '正常',
    1: '缺货',
    2: '目录外',
    3: '停售'
}

@mount('check')
class CheckPage extends Component {

    constructor(prop) {
        super(prop);
        this.wx = new Weixin('getLocation');
    }

    @prop()
    patientId;

    @prop()
    patientName;

    @prop()
    checkPatientNameMessage;

    @prop()
    idCard;

    @prop()
    checkIdCardMessage;

    @prop()
    diseaseList = [];

    @prop()
    diseases;

    @prop()
    checked;

    @prop()
    demandList;

    @prop()
    patientInfo;

    @prop()
    address;

    @prop()
    deliveryAddressType;

    @prop()
    fileList = [];

    @prop()
    isNeedFile = true;

    @prop()
    messageIsNeedFileError;

    @prop()
    messageDiseaseError;

    @prop()
    messageFileError;

    @prop()
    loading = true;

    @prop()
    addressListVisible = false;

    @prop()
    hospitalListVisible = false;

    @prop()
    addressList;

    @prop()
    selectedAddress

    @prop()
    selectedHospital;

    @prop()
    couponListVisible = false;

    @prop()
    selectedCoupon;

    @prop()
    page;

    @prop()
    commonList;

    @prop()
    rewardpoints;

    @prop()
    welfare;

    @prop()
    drugCount;

    @prop()
    refundPoint = 0;
    @prop()
    refundLoading = false;

    @prop()
    location;

    @prop()
    freight = {};

    @prop()
    pastHistoryValue;

    @prop()
    pastHistoryInfo;

    @prop()
    allergyValue;

    @prop()
    allergyInfo;

    @prop()
    familyDiseaseValue;

    @prop()
    familyDiseaseInfo;

    @prop()
    abnormalLiverValue;

    @prop()
    abnormalLiverInfo;

    @prop()
    renalDysfunctionValue;

    @prop()
    renalDysfunctionInfo;

    @prop()
    select_value = '1';

    @prop()
    nowpastHistory;

    @prop()
    nowallery

    @prop()
    nowfamilyDisease

    @prop()
    nowabnormalLiver

    @prop()
    nowrenalDysfunction

    @action()
    async refund(val) {
        this.refundLoading = true;
        const drugs = [...this.demandList].map(item => {
            return {
                drugId: item.drugId,
                amount: item.amount,
            }
        });
        if (val) {
            this.refundPoint = (this.rewardpoints || 0) >= (this.drugCount + this.freight.freight) ? (this.drugCount + this.freight.freight) : (this.rewardpoints || 0);
            const drugRefundPoint = (this.rewardpoints || 0) >= this.drugCount ? this.drugCount : (this.rewardpoints || 0);
            this.welfare = await api.post(`/patients/${this.patientId}/welfare`, {
                pointsDeductionAmount: drugRefundPoint,
                drugs,
            });
        } else {
            this.refundPoint = 0;
            this.welfare = await api.post(`/patients/${this.patientId}/welfare`, {
                pointsDeductionAmount: 0,
                drugs,
            });
        }
        this.checked = val;
        this.refundLoading = false;
    }

    componentDidMount() {
        this.prepareWeixin()
    }

    @action()
    async prepareWeixin() {
        const showNum = window.localStorage.getItem('showNum')
        /*         if(!showNum){
                    Modal.warn({
                        title: `此项服务暂不支持医保支付`,
                        okText: "确定",
                        onOk: () => {},
                    });
                } */
        try {
            const patientInfo = await api.get(`/currentPatient`);
            if (!patientInfo) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/check?page=1`)}`
            }
            this.patientId = patientInfo.id;
            this.patientName = patientInfo.name;
            this.idCard = patientInfo.idCard;
            this.diseaseList = await api.get('/cfg/enum/diseases');
            let demandList = [];
            const qs = this.props.history.location.search.slice(this.props.history.location.search.indexOf('?') + 1);
            const queryData = querystring.parse(qs);
            if (queryData && queryData.page) {
                this.page = queryData.page;
                this.commonList = queryData.list;
            }
            if (this.page == 2) {
                demandList = JSON.parse(this.commonList);
            } else {
                demandList = await api.get(`/queryDemandList`, { patientId: this.patientId });
            }

            const unUseDrug = [...demandList].find(drug => drug.status !== 0);
            if (unUseDrug) {
                Modal.error({
                    title: `部分药品库存不足或已停售\t 请删除后继续`,
                    okText: "确定",
                    onOk: () => { window.history.back(-1); },
                });
                this.loading = false;
                return;
            }
            if (!demandList || demandList.length <= 0) {
                Modal.error({
                    title: `请先选择药品`,
                    okText: "确定",
                    onOk: () => { window.history.back(-1); },
                });
                this.loading = false;
                return;
            }
            this.demandList = demandList;

            let drugCount = 0;
            let refundWelfare = 0;
            this.demandList ? [...this.demandList].map((drug) => {
                const drugStats = drug.status;
                drugCount += drugStats === 0 ? drug.amount * drug.priceCent : 0;
                refundWelfare += drugStats === 0 ? drug.amount * drug.priceCent * drug.whScale : 0;
                return drug;
            }) : null;
            this.drugCount = drugCount;
            this.patientInfo = patientInfo;

            //获取运费
            // const freight = await api.get(`/patient/${this.patientId}/freight`, { amount: this.drugCount, deliveryAddressType: 3 });
            // this.freight = freight;

            const addressList = await api.get(`/patients/${this.patientId}/receiverAddress`);
            this.addressList = addressList;
            let selectedAddress = [...addressList].find(item => item.deliveryType === 3 && item.state == 1);
            //如果没有默认地址，则选中第一个
            if (!selectedAddress) {
                selectedAddress = [...addressList].find(item => item.deliveryType !== 2);
            }
            this.selectedAddress = selectedAddress;
            // if (patientInfo.memberType === 1) {
            //     const selectedHospital = [...addressList].find(item => item.deliveryType === 2);
            //     this.selectedHospital = selectedHospital;
            //     this.deliveryAddressType = "2";
            //     this.addressTypeChanged('2');
            // }
            // if (patientInfo.memberType === 2) {
            const selectedHospital = [...addressList].find(item => item.deliveryType === 2);
            if (selectedHospital) {
                this.selectedHospital = selectedHospital;
            }
            if (patientInfo.selfPickUp === 1 && patientInfo.homeDelivery !== 1) {
                this.deliveryAddressType = "2";
                this.addressTypeChanged('2');
            }
            if (patientInfo.homeDelivery === 1) {
                this.deliveryAddressType = "3";
                this.addressTypeChanged('3');
            }
            // }


            const rewardpoints = await api.get(`/patient/${this.patientId}/rewardpoints`);
            this.rewardpoints = rewardpoints;
            // if (patientInfo && this.patientInfo.canUsePoints === 1) {
            const drugs = [...demandList].map(item => {
                return {
                    drugId: item.drugId,
                    amount: item.amount,
                }
            });
            this.welfare = await api.post(`/patients/${this.patientId}/welfare`, {
                pointsDeductionAmount: 0,
                drugs,
            });
            // } else {
            //     this.welfare = {
            //         welfareType: 1,
            //         amount: (refundRountCentPercentToCent(refundWelfare/100)/100).toFixed(2),
            //         integral: refundWelfare/100
            //     }
            // }
            try {
                this.location = await this.wx.getLocation({
                    type: 'gcj02',
                });
            } catch (e) {
                console.error(e);
            }

        } catch (err) {
            message.error("获取基础信息失败。");
            console.error(err);
        }
        window.localStorage.setItem('showNum', 1)
        this.loading = false;
    }

    @action()
    onDiseaseChanged(patientDisease) {
        this.diseases = patientDisease;
        if (this.diseases && this.diseases.length > 0) {
            this.messageDiseaseError = undefined;
        }
    }

    showActionSheet = () => {
        const BUTTONS = ['Operation1', 'Operation2', 'Operation2', 'Delete', 'Cancel'];
        ActionSheet.showActionSheetWithOptions({
            options: BUTTONS,
            cancelButtonIndex: BUTTONS.length - 1,
            destructiveButtonIndex: BUTTONS.length - 2,
            // title: 'title',
            message: 'I am description, description, description',
            maskClosable: true,
            'data-seed': 'logId',
            wrapProps,
        },
            (buttonIndex) => {
                this.setState({ clicked: BUTTONS[buttonIndex] });
            });
    }

    @action()
    async addressTypeChanged(deliveryAddressType) {
        this.deliveryAddressType = deliveryAddressType;
        if (deliveryAddressType === '2') {
            let selectedHospital = this.selectedHospital;
            if (selectedHospital) {
                this.address = {
                    label: selectedHospital.hospitalName,
                    formData: {
                        deliveryRecipientName: selectedHospital.name,
                        deliveryRecipientContact: selectedHospital.machineNumber,
                        deliveryProvinceId: selectedHospital.provincesId,
                        deliveryCityId: selectedHospital.cityId,
                        deliveryAreaId: selectedHospital.areaId,
                        deliveryAddress: selectedHospital.hospitalName,
                    }
                }
            } else {
                this.address = {};
            }
        } else {
            let selectedAddress = this.selectedAddress;
            if (selectedAddress) {
                const label = (selectedAddress.provincesName || '') + (selectedAddress.cityName || '') +
                    (selectedAddress.areaName || '') + (selectedAddress.street || '');
                this.address = {
                    label: label,
                    formData: {
                        deliveryRecipientName: selectedAddress.name,
                        deliveryRecipientContact: selectedAddress.machineNumber,
                        deliveryProvinceId: selectedAddress.provincesId,
                        deliveryCityId: selectedAddress.cityId,
                        deliveryAreaId: selectedAddress.areaId,
                        deliveryAddress: label,
                    }
                }
            } else {
                this.address = {};
            }
        }
        const freight = await api.get(`/patient/${this.patientId}/freight`, { amount: this.drugCount, deliveryAddressType: deliveryAddressType });
        this.freight = freight;
        if (this.checked) {
            this.refundPoint = (this.rewardpoints || 0) >= (this.drugCount + this.freight.freight) ? (this.drugCount + this.freight.freight) : (this.rewardpoints || 0);
        } else {
            this.refundPoint = 0;
        }

    }

    @action()
    orderTypeChanged(e) {
        if (e.target.value === '1') {
            this.isNeedFile = true;
            this.select_value = '1'
        } else {
            this.messageFileError = ''
            if (this.demandList.length > 5) {
                this.select_value = '1'
                Modal.warn({
                    title: `在线复诊开方时，订单内的药品种类数量不能超过5种。`,
                    okText: "确定",
                    onOk: () => { },
                });
            } else {
                this.isNeedFile = false;
                this.select_value = '2'
                this.nowpastHistory = this.pastHistoryValue ? 1 : 2
                this.nowallery = this.allergyValue ? 1 : 2
                this.nowfamilyDisease = this.familyDiseaseValue ? 1 : 2
                this.nowabnormalLiver = this.abnormalLiverValue ? 1 : 2
                this.nowrenalDysfunction = this.renalDysfunctionValue ? 1 : 2
            }
        }
        this.messageIsNeedFileError = undefined;
    }

    @action()
    async onFileChange(files, type, index) {
        this.loading = true;
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
                this.fileList = [...files];
            } catch (e) {
                message.error('上传图片出错。');
            }
        } else {
            this.fileList = [...files]
        }
        if (this.fileList.length > 0) {
            this.messageFileError = '';
        }
        this.loading = false;
    };

    @action()
    async submitOrder() {
        this.loading = true;
        //身份证实名校验
        const { realNameAuthenticationPassed } = this.patientInfo;
        if (realNameAuthenticationPassed !== 1) {
            if (!this.nameCheck(this.patientName)) {
                Modal.error({
                    title: '请输入正确的姓名',
                    okText: "确定",
                });
                this.loading = false;
                return;
            }
            if (!this.idCardCheck(this.idCard)) {
                Modal.error({
                    title: '请输入正确的身份证号',
                    okText: "确定",
                });
                this.loading = false;
                return;
            }
            //身份证号实名校验
            try {
                await api.post(`/patients/${this.patientId}/patientCertification`, {
                    idCard: this.idCard,
                    name: this.patientName,
                });
            } catch (err) {
                Modal.error({
                    title: err.message,
                    okText: "确定",
                });
                this.loading = false;
                return;
                console.log(err);
            }
        }

        const unUseDrug = [...this.demandList].find(drug => drug.status !== 0);
        if (unUseDrug) {
            Modal.error({
                title: `部分药品库存不足或已停售\t 请删除后继续`,
                okText: "确定",
                onOk: () => { window.location.href = '/requirementList' },
            });
            this.loading = false;
            return;
        }
        if (!this.address || !this.address.formData) {
            Modal.error({
                title: '请选择收货地址',
                okText: "确定",
            });
            this.loading = false;
            return;
        }
        if (!this.isNeedFile && ((this.pastHistoryValue === undefined || this.allergyValue === undefined || this.familyDiseaseValue === undefined || this.abnormalLiverValue === undefined || this.renalDysfunctionValue === undefined) || ((this.pastHistoryValue && !this.pastHistoryInfo) || (this.allergyValue && !this.allergyInfo) || (this.familyDiseaseValue && !this.familyDiseaseInfo) || (this.abnormalLiverValue && !this.abnormalLiverInfo) || (this.renalDysfunctionValue && !this.renalDysfunctionInfo)))) {
            message.warn('请完善在线复诊信息')
            this.loading = false;
            return;
        }
        if (this.patientInfo.memberType !== 1 && this.isNeedFile === undefined) {
            Modal.error({
                title: '请选择处方诊断',
                okText: "确定",
            });
            this.messageIsNeedFileError = "请选择处方诊断";
            this.loading = false;
            return;
        }
        if (this.select_value === '1' && this.fileList.length <= 0) {
            Modal.error({
                title: '请上传处方图片',
                okText: "确定",
            });
            this.messageFileError = "请上传处方图片";
            this.loading = false;
            return;
        }
        if (!this.diseases || this.diseases.length === 0) {
            Modal.error({
                title: '请选择处方诊断-疾病',
                okText: "确定",
            });
            this.messageDiseaseError = "请选择处方诊断-疾病";
            this.loading = false;
            return;
        }
        if (this.deliveryAddressType == 3 && this.selectedAddress && this.selectedAddress.cityId !== this.patientInfo.hospital.cityId) {
            Modal.error({
                title: '超出服务范围，无法送货',
                okText: "确定",
            });
            this.loading = false;
            return;
        }

        let periodList = [];
        const drugList = this.demandList.map(drug => {
            const takeTime = isNaN(drug.packageSize / (drug.useAmount * drug.frequency) * drug.amount)
                ? ''
                : Math.ceil(drug.amount * drug.packageSize / (drug.useAmount * FREQUENCY[drug.frequency][0]))
                * FREQUENCY[drug.frequency][1];
            periodList.push(takeTime);
            return {
                drugId: drug.drugId,
                amount: drug.amount,
                useAmount: drug.useAmount,
                frequency: drug.frequency
            }
        });
        const dataForCheck = {
            diseasesIds: this.diseases,
            drugs: drugList,
            period: Math.max(...periodList),
        }
        const checkResult = await api.post(`/patient/${this.patientId}/verifyOrder`, dataForCheck);
        if (checkResult !== null && checkResult.verifyMessage.length > 0) {
            const verifyMessage = checkResult.verifyMessage.filter(item => item.level === 'forbidden');
            if (verifyMessage && verifyMessage.length > 0) {
                Modal.error({
                    title: verifyMessage[0].message,
                    okText: "确定",
                });
                this.loading = false;
                return;
            }
        }
        let orderPicture = '';
        this.fileList.map(item => {
            orderPicture += orderPicture ? ',' + item.urlPath : item.urlPath;
            return item.urlPath;
        });
        const electronicPrescription = {
            PMH: this.pastHistoryInfo,
            AMH: this.allergyInfo,
            FMH: this.familyDiseaseInfo,
            liverDesc: this.abnormalLiverInfo,
            renalDesc: this.renalDysfunctionInfo
        }
        const submitData = {
            diseasesIds: this.diseases,
            drugs: drugList,
            deliveryAddress: { ...this.address.formData, deliveryAddressType: this.deliveryAddressType },
            orderPicture: this.select_value == '1' ? orderPicture : '',
            period: Math.max(...periodList),
            points: this.refundPoint,
            shippingAddress: this.deliveryAddressType === '2' ? this.selectedHospital.hospitalId || this.selectedHospital.id : '',
            prescribingSource: this.isNeedFile ? 3 : 2,
            electronicPrescription: this.isNeedFile ? null : JSON.stringify(electronicPrescription)
        }
        try {
            const order = await api.post(`/patient/${this.patientId}/order`, submitData);
            const { orderNo, id } = order;
            this.props.history.push(`checkSuccess?orderNo=${orderNo}&orderId=${id}`)
        } catch (e) {
            message.error(e.message);
            //刷新积分数据。
            const rewardpoints = await api.get(`/patient/${this.patientId}/rewardpoints`);
            this.rewardpoints = rewardpoints;
            this.loading = false;
            this.isNeedFile = this.select_value === '1' ? true : false;
        }
    }

    @action()
    onAddressBoxClose() {
        this.addressListVisible = false;
    }

    @action()
    onHospitalBoxClose() {
        this.hospitalListVisible = false;
    }

    @action()
    onAddressBoxOpen() {
        if (this.deliveryAddressType == 3) {
            this.addressListVisible = true;
        }
        if (this.patientInfo.memberType == 2 && this.deliveryAddressType == 2) {
            this.hospitalListVisible = true;
        }
    }

    @action()
    addressChanged(address) {
        if (address && this.patientInfo && this.patientInfo.hospital.cityId !== address.cityId) {
            this.addressListVisible = false;
            Modal.error({
                title: '超出服务范围，无法送货',
                okText: "确定",
            });
            return;
        }
        this.selectedAddress = address;
        const label = (address.provincesName) + (address.cityName)
            + (address.areaName) + (address.street);
        this.address = {
            label: label,
            formData: {
                deliveryRecipientName: address.name,
                deliveryRecipientContact: address.machineNumber,
                deliveryProvinceId: address.provincesId,
                deliveryCityId: address.cityId,
                deliveryAreaId: address.areaId,
                deliveryAddress: label,
            }
        }
    }

    @action()
    hospitalChanged(selectedHospital) {
        const { name, address } = selectedHospital;
        const hospital = {
            areaId: address.areaId,
            cityId: address.cityId,
            deliveryType: 2,
            hospitalId: selectedHospital.id,
            hospitalName: selectedHospital.name,
            id: 1,
            machineNumber: this.patientInfo.phone || this.patientInfo.machineNumber,
            name: this.patientInfo.name,
            provincesId: address.provinceId,
            street: address.street,
        }
        this.selectedHospital = hospital;
        if (selectedHospital) {
            this.address = {
                label: name,
                formData: {
                    deliveryRecipientName: this.patientInfo.name,
                    deliveryRecipientContact: this.patientInfo.phone || this.patientInfo.machineNumber,
                    deliveryProvinceId: address.provinceId,
                    deliveryCityId: address.cityId,
                    deliveryAreaId: address.areaId,
                    deliveryAddress: name,
                }
            }
        }
    }

    @action()
    onCouponBoxClose() {
        this.couponListVisible = false;
    }
    @action()
    couponChanged(coupon) {
        this.selectedCoupon = coupon;
    }

    @action()
    nameCheck(val) {
        this.checkPatientNameMessage = '';
        this.patientName = val;
        if (!val) {
            this.checkPatientNameMessage = '不能为空';
            return false;
        }
        if (!(/^[\u4e00-\u9fa5]+$/.test(val))) {
            this.checkPatientNameMessage = '请输入正确的姓名';
            return false;
        }
        return true;
    }
    @action()
    nameChange(val) {
        this.checkPatientNameMessage = '';
        this.patientName = val;
    }
    @action()
    idCardCheck(val) {
        this.checkIdCardMessage = '';
        this.idCard = val;
        if (!val) {
            this.checkIdCardMessage = '不能为空';
            return false;
        }
        const validator = IDValidator;
        const valueStr = String(val);
        if (!validator.isValid(valueStr)) {
            this.checkIdCardMessage = '请输入正确的身份证号';
            return false;
        }
        return true
    }
    @action()
    idCardChange(val) {
        this.checkIdCardMessage = '';
        this.idCard = val;
    }

    @action()
    pastHistory(e) {
        if (e.target.value === '1') {
            this.pastHistoryValue = true
        } else {
            this.pastHistoryValue = false
            this.pastHistoryInfo = undefined
        }
    }
    @action()
    allergy(e) {
        if (e.target.value === '1') {
            this.allergyValue = true
        } else {
            this.allergyValue = false
            this.allergyInfo = undefined
        }
    }
    @action()
    familyDisease(e) {
        if (e.target.value === '1') {
            this.familyDiseaseValue = true
        } else {
            this.familyDiseaseValue = false
            this.familyDiseaseInfo = undefined
        }
    }
    @action()
    abnormalLiver(e) {
        if (e.target.value === '1') {
            this.abnormalLiverValue = true
        } else {
            this.abnormalLiverValue = false
            this.abnormalLiverInfo = undefined
        }
    }
    @action()
    renalDysfunction(e) {
        if (e.target.value === '1') {
            this.renalDysfunctionValue = true
        } else {
            this.renalDysfunctionValue = false
            this.renalDysfunctionInfo = undefined
        }
    }

    @action()
    textChange(item, e, maxLength, isInput) {
        if (isInput) {
            switch (item) {
                case 1:
                    this.pastHistoryInfo = e.target.value;
                    break;
                case 2:
                    this.allergyInfo = e.target.value;
                    break;
                case 3:
                    this.familyDiseaseInfo = e.target.value;
                    break;
                case 4:
                    this.abnormalLiverInfo = e.target.value;
                    break;
                case 5:
                    this.renalDysfunctionInfo = e.target.value;
                    break;
                default:
                    break;

            }
        }
    }

    renderIdCard() {
        const cardTitle = (
            <p className="title">
                <span className="font1">实名认证</span>
                <span className="font2">（请确保填入的信息真实有效）</span>
            </p>
        )
        if (this.patientId && this.patientInfo && this.patientInfo.realNameAuthenticationPassed !== 1) {
            return <Card title={cardTitle} className="idCardCheck">
                <InputItem
                    clear
                    placeholder="请输入姓名"
                    ref={el => this.autoFocusInst = el}
                    onBlur={val => this.nameCheck(val)}
                    defaultValue={this.patientInfo.name}
                    maxLength={8}
                >姓名</InputItem>
                <span style={{ color: 'red' }}>{this.checkPatientNameMessage}</span>
                <InputItem
                    clear
                    placeholder="请输入身份证号"
                    onBlur={(val) => this.idCardCheck(val)}
                    defaultValue={this.patientInfo.idCard}
                    maxLength={18}
                >身份证</InputItem>
                <span style={{ color: 'red' }}>{this.checkIdCardMessage}</span>
            </Card>
        }
    }

    renderPrescription() {
        return (
            <div className='prescription'>
                <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Col style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'left' }} span={7}>过往病史：</Col>
                    <Col span={17}>
                        <Radio.Group value={this.pastHistoryValue !== undefined ? this.pastHistoryValue ? '1' : '2' : undefined}>
                            <Radio.Button value="2" onChange={this.pastHistory}>否</Radio.Button>
                            <Radio.Button value="1" onChange={this.pastHistory}>是</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                {this.pastHistoryValue ? <textarea style={{ width: '100%', height: 80 }} maxLength='200' placeholder='请填写过往病史情况' onChange={(e) => this.textChange(1, e, null, true)}>{this.pastHistoryInfo}</textarea> : null}
                <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Col style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'left' }} span={7}>过敏史：</Col>
                    <Col span={17}>
                        <Radio.Group value={this.allergyValue !== undefined ? this.allergyValue ? '1' : '2' : undefined}>
                            <Radio.Button value="2" onChange={this.allergy}>否</Radio.Button>
                            <Radio.Button value="1" onChange={this.allergy}>是</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                {this.allergyValue ? <textarea style={{ width: '100%', height: 80 }} maxLength='200' placeholder='请填写过敏史情况' onChange={(e) => this.textChange(2, e, null, true)} >{this.allergyInfo}</textarea> : null}
                <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Col style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'left' }} span={7}>家族病史：</Col>
                    <Col span={17}>
                        <Radio.Group value={this.familyDiseaseValue !== undefined ? this.familyDiseaseValue ? '1' : '2' : undefined}>
                            <Radio.Button value="2" onChange={this.familyDisease}>否</Radio.Button>
                            <Radio.Button value="1" onChange={this.familyDisease}>是</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                {this.familyDiseaseValue ? <textarea style={{ width: '100%', height: 80 }} maxLength='200' placeholder='请填写家族病史情况' onChange={(e) => this.textChange(3, e, null, true)} >{this.familyDiseaseInfo}</textarea> : null}
                <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Col style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'left' }} span={7}>肝功能异常：</Col>
                    <Col span={17}>
                        <Radio.Group value={this.abnormalLiverValue !== undefined ? this.abnormalLiverValue ? '1' : '2' : undefined}>
                            <Radio.Button value="2" onChange={this.abnormalLiver}>否</Radio.Button>
                            <Radio.Button value="1" onChange={this.abnormalLiver}>是</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                {this.abnormalLiverValue ? <textarea style={{ width: '100%', height: 80 }} maxLength='200' placeholder='请填写肝功能异常情况' onChange={(e) => this.textChange(3, e, null, true)} >{this.abnormalLiverInfo}</textarea> : null}
                <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Col style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'left' }} span={7}>肾功能异常：</Col>
                    <Col span={17}>
                        <Radio.Group value={this.renalDysfunctionValue !== undefined ? this.renalDysfunctionValue ? '1' : '2' : undefined}>
                            <Radio.Button value="2" onChange={this.renalDysfunction}>否</Radio.Button>
                            <Radio.Button value="1" onChange={this.renalDysfunction}>是</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                {this.renalDysfunctionValue ? <textarea style={{ width: '100%', height: 80 }} maxLength='200' placeholder='请填写肾功能异常情况' onChange={(e) => this.textChange(e, 5)} >{this.renalDysfunctionInfo}</textarea> : null}
                <p style={{ fontSize: 16, fontWeight: 'bold' }}>请如实填写如上问诊信息</p>
            </div>
        )
    }

    render() {
        const requirementList = this.demandList ? this.demandList.map((drug) => {
            const drugStats = drug.status;
            return (
                <Row key={drug.drugId}>
                    <Col span={8}>
                        <div className={drugStats === 0 ? '' : 'unUseImage'}>
                            {
                                drug.outerPackagePicUrl ? <img src={drug.outerPackagePicUrl} /> :
                                    <DrugIcon type="iconzhanweifu_tupian" style={{ fontSize: '83px', paddingTop: '12px' }} className="drugIcon" />
                            }
                            {
                                drugStats === 0 ? null : (
                                    <div className="disabledDrug">
                                        {DRUGSTATUS[drug.status]}
                                    </div>
                                )
                            }
                        </div>
                    </Col>
                    <Col span={16}>
                        <div className={drugStats === 0 ? "drugTitle" : "drugTitle disabledDrugItem"}>{drug.commonName}{drug.productName ? `(${drug.productName})` : ''}</div>
                        <div className={drugStats === 0 ? "amount" : "amount disabledDrugItem"} style={{ paddingTop: '16px' }}>
                            ￥{(drug.priceCent / 100).toFixed(2)}
                            <span className={drugStats === 0 ? "drugNum" : "drugNum disabledDrugItem"}> X {drug.amount}</span>
                        </div>
                    </Col>
                </Row>
            );
        }) : null;

        const spin = <Icon type="loading" style={{ fontSize: 24, color: '#C8161D' }} spin />;
        const t = this.patientName;
        return (
            <Spin spinning={this.loading} indicator={spin} >
                <div className="checkPage">
                    <Title>用药登记</Title>
                    <div className="requirementList">
                        {this.renderIdCard()}

                        <div className="sendBox">
                            <p className="sendType">收货方式</p>
                            <Radio.Group value={this.deliveryAddressType}>
                                <Radio.Button value="3" disabled={this.patientInfo && (this.patientInfo.homeDelivery !== 1)} onChange={(e) => this.addressTypeChanged(e.target.value)} className="radioRight">送货上门</Radio.Button>
                                <Radio.Button value="2" disabled={this.patientInfo && (this.patientInfo.selfPickUp !== 1)} onChange={(e) => this.addressTypeChanged(e.target.value)}>定点取药</Radio.Button>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className="address" >
                        <div className="addressItem">
                            <div className="sendType">收货地址</div>
                            <div className="sendAddress">
                                <div className="test" onClick={this.onAddressBoxOpen}>
                                    {this.address && this.address.label ? <div style={{ color: '#222222' }}>{this.address.label}</div> : '添加收货地址'}
                                    <i className="iconfont" style={{ fontSize: '18px' }} >&#xe62b;</i>
                                </div>
                            </div>
                        </div>
                        <div className="addressSend">
                            {this.freight && this.deliveryAddressType == '3' ? (
                                <div>
                                    {this.freight.ceilAmount ? <span className="addressSend-1">满{(this.freight.ceilAmount || 0) / 100}免配送费</span> : null}
                                    <span className="addressSend-2">快递{(this.freight.freight || 0) / 100}元</span> </div>
                            ) : null
                            }
                        </div>
                    </div>
                    <Drawer
                        title=""
                        placement="bottom"
                        closable={false}
                        onClose={this.onAddressBoxClose}
                        visible={this.addressListVisible}
                        className="checkViewBox"
                        height={474}
                    >
                        <AddressList
                            selectedAddress={this.selectedAddress}
                            patientId={this.patientId}
                            onClose={this.onAddressBoxClose}
                            visible={this.addressListVisible}
                            onSelect={this.addressChanged}
                        />
                    </Drawer>
                    <Drawer
                        title=""
                        placement="bottom"
                        closable={false}
                        onClose={this.onHospitalBoxClose}
                        visible={this.hospitalListVisible}
                        className="checkViewBox"
                        height={474}
                    >
                        <HospitalList
                            patientId={this.patientId}
                            patientInfo={this.patientInfo}
                            onClose={this.onHospitalBoxClose}
                            onSelect={this.hospitalChanged}
                            patientAddress={this.patientInfo ? this.patientInfo.address : {}}
                            location={this.location}
                            defaultHospital={this.selectedHospital}
                        />
                    </Drawer>
                    <div className="requirementList">
                        <div className="drugBox">
                            <p className="sendType">药品清单</p>
                            <div className="requirementList">
                                {requirementList}
                            </div>
                        </div>
                    </div>
                    {/* {this.patientInfo && this.patientInfo.memberType === 1 ? null : ( */}
                    <div className="requirementList">
                        <div className="drugBox">
                            <p className="sendType" style={{ marginBottom: 10 }}>处方</p>
                            <Radio.Group value={this.select_value}>
                                <Radio.Button value="2" onChange={this.orderTypeChanged}>在线复诊开方</Radio.Button>
                                <Radio.Button value="1" onChange={this.orderTypeChanged}>自传处方</Radio.Button>
                            </Radio.Group>
                            {this.messageIsNeedFileError ? <span className="errorTip" >{this.messageIsNeedFileError}</span> :
                                null}
                            {this.isNeedFile ?
                                <ImagePicker
                                    length="4"
                                    files={this.fileList}
                                    onChange={(files, operationType, index) => this.onFileChange(files, operationType, index)}
                                    onImageClick={(index, fs) => console.log('rrrr', index, fs)}
                                    selectable={this.fileList && this.fileList.length < 5}
                                    multiple
                                /> : this.renderPrescription()
                            }
                            {this.select_value === '1' && this.messageFileError ? <span className="errorTip" >{this.messageFileError}</span> : null}
                            <p className='tip'>为了保证您的用药需求登记准确有效、成功提交，请在提交登记前务必上传自有处方或在线复诊开方。</p>
                        </div>
                    </div>
                    {/* )} */}
                    <div className="requirementList">
                        <div className="drugBox">
                            <p className="sendType">诊断</p>
                            <SelectButton
                                selectedButton={this.diseases || []}
                                onSelect={this.onDiseaseChanged}
                                isMore={true}
                                selectList={this.diseaseList || []}
                            />
                            <div style={{ marginTop: '-10px', paddingTop: '10px' }}>
                                {this.messageDiseaseError ? <span className="errorTip" >{this.messageDiseaseError}</span> :
                                    null}
                            </div>
                        </div>
                    </div>
                    <div className="address" style={{ marginTop: '8px', }}>
                        <div className="defaultItem" style={{ paddingBottom: '8px' }}>
                            <div className="sendType">优惠券</div>
                            <div className="sendAddress">
                                <a>
                                    无可用优惠券
                                <i className="iconfont" style={{ fontSize: '18px' }}>&#xe62b;</i>
                                </a>
                            </div>
                        </div>
                        <Drawer
                            title=""
                            placement="bottom"
                            closable={false}
                            onClose={this.onCouponBoxClose}
                            visible={this.couponListVisible}
                            className="checkViewBox"
                            height={474}
                        >
                            <CouponList
                                selectedAddress={this.selectedCoupon}
                                patientId={this.patientId}
                                onClose={this.onCouponBoxClose}
                                visible={this.couponListVisible}
                                onSelect={this.couponChanged}
                            />
                        </Drawer>
                    </div>
                    {
                        this.patientInfo && this.patientInfo.canUsePoints === 1 ? (
                            <div className="address refundPoint" style={{ marginTop: '1px' }}>
                                <div className="defaultItem" style={{ padding: '0px' }}>
                                    <div className="sendType" style={{ width: '130px' }}>积分抵药费</div>
                                    <div className="sendAddress">
                                        <Switch
                                            checked={this.checked}
                                            onChange={this.refund}
                                            color="#C8161D"
                                            loading={this.refundLoading}
                                        />
                                    </div>
                                </div>
                                {this.checked ? (
                                    <div>
                                        <div className="defaultItem pointItem" style={{ padding: '0px', paddingTop: '18px', marginTop: '10px' }}>
                                            <div className="sendType" style={{ fontWeight: 300, color: '#666666' }}>积分余额</div>
                                            <div className="sendAddress" style={{ fontSize: '18px', color: '#222222' }}>
                                                {this.rewardpoints}
                                            </div>
                                        </div>
                                        <div className="defaultItem " style={{ padding: '0px', paddingTop: '8px', paddingBottom: '16px' }}>
                                            <div className="sendType" style={{ fontWeight: 300, color: '#666666' }}>本次抵扣</div>
                                            <div className="sendAddress" style={{ fontSize: '18px', color: '#222222' }}>
                                                {this.refundPoint}分({(this.refundPoint / 100).toFixed(2)}元)
                                            </div>
                                        </div>
                                        <div className="defaultItem pointItem" style={{ padding: '10px 0px' }}>
                                            <div className="sendAddress" style={{ width: '100%', color: '#666666' }}>
                                                使用积分抵扣的订单不支持医院代收费
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                            </div>
                        ) : null
                    }
                    <div className="address" style={{ marginTop: '1px' }}>
                        <div className="defaultItem">
                            <div  >
                                万户良方拥有《互联网药品信息服务证书》，具备展示药学服务的能力。点击提交后，您将获得以下服务：<br />
                                1、由PBM中心药房直接为您提供药学服务；<br />
                                2、凭处方在家或到约定的医疗机构领取预订药品。
                        </div>
                        </div>
                    </div>
                    <div className="submitButtonBox">
                        <Row className="box">
                            <Col span="16">
                                <div style={{ height: '22px' }}><span className="text">合计 : </span><span className="count">¥{((this.drugCount - this.refundPoint + (this.freight ? this.freight.freight || 0 : 0)) / 100).toFixed(2)}</span></div>
                                <div style={{ height: '18px' }}><span className="text">可获: </span><span className="text"> {this.welfare ? this.welfare.integral : 0}分</span></div>
                            </Col>
                            <Col span="8">
                                <Button type="primary" className="button" onClick={() => this.submitOrder()}>提交</Button>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Spin>
        );
    }

}
export default CheckPage;
