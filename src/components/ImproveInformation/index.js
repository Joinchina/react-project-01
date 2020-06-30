import React from 'react';
import { Form, Input, Button, message, Select, Checkbox, Modal } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import Weixin from '../../lib/weixin';
import IDValidator from '../../helper/checkIdCard';
import SelectButton from '../Register/SelectButton';
import AddressSelect from '../common/SearchInput/SearchInput';
import successImg from '../../states/images/success.png';

import './index.less';

const Option = Select.Option;

@mount('improveInformation')
class ImproveInformation extends React.Component {

    @prop()
    redirectUrl;

    @prop()
    disabledGetCapchar;

    @prop()
    errorCodeMessage;

    @prop()
    timeCount;

    @prop()
    timer;

    @prop()
    disabledBind;

    @prop()
    errorPhone;

    @prop()
    errorSms;

    @prop()
    errorPhoneMessage;

    @prop()
    errorIdCardMessage;

    @prop()
    errorNameMessage;

    @prop()
    errorHospitalMessage;

    @prop()
    errorReadAgreementMessage;

    @prop()
    hospitalListData;

    @prop()
    initHospital;

    @prop()
    name;

    @prop()
    phone;

    @prop()
    address;
    @prop()
    patientAddress;

    @prop()
    hospital;

    @prop()
    idCard;

    @prop()
    patientId;

    @prop()
    diseaseList = [];

    @prop()
    diseases;

    @prop()
    insurancesList = [];

    @prop()
    insurance;

    @prop()
    errorInsurancesMessage;

    @prop()
    provinceList = [];
    @prop()
    cityList = [];
    @prop()
    areaList = [];


    wx = new Weixin('closeWindow');

    @action()
    async prepareWeixin() {
        try {
            this.loading = true;
            await this.gethospitalListData();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    this.location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                    await this.gethospitalListData({ latitude: position.coords.latitude, longitude: position.coords.longitude })
                });
            }
        } catch (err) {
            await this.gethospitalListData()
        }
        try {
            this.insurancesList = await api.get('/cfg/enum/insurances');
            this.diseaseList = await api.get('/cfg/enum/diseases');
            this.provinceList = await api.get('/cfg/enum/regions');
            this.props.form.setFieldsValue({
                diseases: this.diseases,
                insurance: [this.insurance],
            });
            this.address = this.address || this.patientAddress;
            if(this.address && this.address.street){
                this.props.form.setFieldsValue({
                    street: this.address.street,
                });
            }
            if(this.address && this.address.provinceId
                && this.address.cityId && this.address.areaId){
                const provincesList = await api.get('/cfg/enum/regions');
                const province = provincesList.find((item) => item.id === this.address.provinceId);
                let param = {provinceId: this.address.provinceId}
                const cityList = await api.get('/cfg/enum/regions',param);
                const city = cityList.find((item) => item.id === this.address.cityId);
                param = {provinceId: this.address.provinceId, cityId: this.address.cityId}
                const areaList = await api.get('/cfg/enum/regions',param);
                const area = areaList.find((item) => item.id === this.address.areaId);
                this.props.form.setFieldsValue({
                    address:{
                        provinceId: province.id,
                        provinceName: province.name,
                        cityId: city.id,
                        cityName: city.name,
                        areaId: area.id,
                        areaName: area.name,
                    }
                });
            }

        } catch (err) {
            message.error("获取基础信息失败。");
        }
        this.loading = false;
        await this.wx.ready();
    }

    @action()
    async gethospitalListData(locationObj) {
        try {
            if (locationObj) {
                var locationArray = [locationObj.latitude, locationObj.longitude];
                this.hospitalListData = await api.get('/local-hospital', { location: locationArray });
                if (this.hospitalListData && this.hospitalListData.length > 0) {
                    this.initHospital = this.hospitalListData[0].id;
                }
                this.loading = false;
            } else {
                this.hospitalListData = await api.get('/local-hospital', {});
            }
            if (this.hospital && this.hospital.id) {
                this.initHospital = this.hospital.id;
            }
        } catch (err) {
            this.errorHospitalMessage = '获取社区医院失败';
        }
    }


    @action()
    async bind() {
        this.props.form.validateFields(async (err, values) => {
            let checkFlag = true;
            if (!values.name) {
                this.errorNameMessage = '请输入姓名';
                checkFlag = false;
            }
            if (!values.hospitalId) {
                this.errorHospitalMessage = '请选择签约机构';
                checkFlag = false;
            }
            if (!(await this.validateIdCard())) {
                checkFlag = false;
            }
            if (checkFlag) {
                const data = {
                    ...values,
                    address: {
                        provinceId: values.address ? values.address.provinceId : null,
                        cityId: values.address ? values.address.cityId : null,
                        areaId: values.address ? values.address.areaId : null,
                        street: values.street,
                    },
                    insurance: values.insurance ? values.insurance[0] : null,
                    patientId: this.patientId,
                }
                try {
                    values.potentialId = this.patientId;
                    await api.post(`/perfectInformation`, data);
                    let img = <img src={successImg} className="messageImg"/>;
                    Modal.success({
                        title: img,
                        content: '您已开通PBM微信服务，可使用在线订药、咨询医务助理等服务。',
                        onOk: () => this.wx.closeWindow(),
                        okText: '回首页',
                    });
                } catch (e) {
                    console.error(e);
                    message.error(e.message);
                }
            }

        })
    }

    @action()
    inputOnCange(e) {
        if (!e.target.value) {
            this.errorNameMessage = '请输入姓名';
        } else {
            this.errorNameMessage = '';
        }
    }

    @action()
    async idCardChange() {
        this.errorIdCardMessage = '';
    }
    @action()
    async idCardBlur(e) {
        this.errorIdCardMessage = null;
        if (e.target.value) {
            const validator = IDValidator;
            const valueStr = String(e.target.value);
            if (!validator.isValid(valueStr)) {
                this.errorIdCardMessage = "请输入正确的身份证号";
            }
        }else {
            this.errorIdCardMessage = "请输入正确的身份证号";
        }
    }
    @action()
    async validateIdCard() {
        let checkFlag = true;
        this.errorIdCardMessage = undefined;
        const val = this.props.form.getFieldValue('idCard');
        if (val) {
            const validator = IDValidator;
            const valueStr = String(val);
            if (!validator.isValid(valueStr)) {
                this.errorIdCardMessage = "请输入正确的身份证号";
                checkFlag = false;
            } else {
                const patients = await await api.get('/patients/signCheck', {
                    idCard: valueStr
                })
                if (patients) {
                    Modal.confirm({
                        content: '该身份证号已存在，请确认当前输入是否正确：正确则请点击确认，系统将返回公众号首页，您可在此联系客服协调处理；错误则请点击取消，返回重新输入。',
                        okText: '确认',
                        okType: 'primary',
                        cancelText: '取消',
                        onOk: () => window.wx.closeWindow(),
                        onCancel: () => {
                            this.props.form.setFieldsValue({
                                idCard: '',
                            });

                        },
                    });
                    return false;
                } else {
                    return true;
                }
            }
        }else{
            this.errorIdCardMessage = "请输入正确的身份证号";
            return false;
        }
        return checkFlag;
    }


    componentDidMount() {
        this.prepareWeixin()
    }


    gotoBind(phone) {
        window.location = `/user/bind?mobile=${phone}`
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

    onDiseaseChanged = (patientDisease) => {
        const { setFieldsValue } = this.props.form;
        setFieldsValue({ diseases: patientDisease });
    }

    @action()
    onInsuranceChanged(insurance){
        const { setFieldsValue } = this.props.form;
        setFieldsValue({ insurance });
        this.errorInsurancesMessage = '';
    }

    @action()
    closeAddress(val) {
        this.address = val;
    }
    @action()
    setAddress(val) {
        this.address = val || '';
    }


    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const FormItem = Form.Item;
        const diseases = getFieldValue('diseases');
        const insurance = getFieldValue('insurance');
        return (
            <div className="improveInformation">
                <Title>完善信息</Title>
                <Form className="form">
                    <div className="formItemLabel">
                        手机号
                    </div>
                    <Input maxLength='11' placeholder="请输入"
                        onBlur={(e) => this.mobelInputChange(e)}
                        disabled
                        value={this.phone}
                    />
                    <div className="formItemLabel">
                        姓名
                    </div>
                    <FormItem>
                        {getFieldDecorator('name', {
                            initialValue: this.name,
                            rules: [],
                        })(
                            <Input maxLength="20" placeholder="请输入"
                                onBlur={(e) => this.inputOnCange(e)}
                            />
                        )}
                    </FormItem>
                    {this.errorNameMessage ? <span className='errorTip'>{this.errorNameMessage}</span> : null}
                    <div className="formItemLabel">
                        签约机构
                    </div>
                    <FormItem>
                        {getFieldDecorator('hospitalId', {
                            rules: [],
                            initialValue: this.initHospital,
                        })(
                            <Select placeholder="请选择" style={{ height: '46px' }}
                                onChange={this.selectOnCange}>
                                {
                                    this.hospitalListData && this.hospitalListData.length != 0 ? this.hospitalListData.map((item) => {
                                        return (
                                            <Option key={item.id} value={item.id} className="registerSelect">
                                                {item.name}
                                            </Option>);
                                    }) : null
                                }
                            </Select>
                        )}
                    </FormItem>
                    {this.errorHospitalMessage ? <span className="errorTip">{this.errorHospitalMessage}</span> : null}
                    <div className="formItemLabel">
                        医保类型
                    </div>
                    <FormItem>
                        {getFieldDecorator('insurance', {
                            rules: [],
                        })(
                            <SelectButton
                                selectedButton={insurance || []}
                                onSelect={this.onInsuranceChanged}
                                isMore={true}
                                selectList={this.insurancesList || []}
                                isShowDefault6Button={false}
                                isSingle={true}
                            />

                        )}
                    </FormItem>
                    <div className="formItemLabel">
                        身份证号
                    </div>
                    <FormItem>
                        {getFieldDecorator('idCard', {
                            initialValue: this.idCard,
                            rules: [],
                        })(
                            <Input maxLength="18" placeholder="请输入"
                                onBlur={this.idCardBlur}
                                onChange={this.idCardChange}
                            />
                        )}
                    </FormItem>
                    {this.errorIdCardMessage ? <span className="errorTip">{this.errorIdCardMessage}</span> : null}
                    <div className="formItemLabel">
                        居住地址
                        <span className="tip2" style={{ paddingLeft: '5px' }}>非必填</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('address', {
                            rules: [],
                        })(
                            <AddressSelect
                                style={{}}
                                selectedValue={this.address}
                                handleCloseBack={(val) => this.closeAddress(val)}
                                onChange={(val) => this.setAddress(val)} />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('street', {
                            rules: [],
                        })(
                            <Input maxLength="18" placeholder="请输入详细地址"
                                onBlur={this.idCardBlur}
                                onChange={this.idCardChange}
                            />
                        )}
                    </FormItem>
                    <div className="formItemLabel">
                        现有疾病
                        <span className="tip2" style={{ paddingLeft: '5px' }}>非必填</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('diseases', {
                            rules: [],
                        })(
                            <SelectButton
                                selectedButton={diseases || []}
                                onSelect={this.onDiseaseChanged}
                                isMore={true}
                                selectList={this.diseaseList || []}
                            />

                        )}
                    </FormItem>
                    {this.errorReadAgreementMessage ? <span className='errorTip'>{this.errorReadAgreementMessage}</span> : null}
                    <FormItem style={{ textAlign: 'center', marginTop: 10 }}>
                        <Button
                            onClick={() => this.bind()}
                            className="submitButton"
                        >
                            完善信息
                        </Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}
ImproveInformation = Form.create()(ImproveInformation);

export default ImproveInformation;
