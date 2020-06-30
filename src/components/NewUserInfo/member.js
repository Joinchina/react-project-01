import React from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { InputItem } from 'antd-mobile';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import Weixin from '../../lib/weixin';
import SelectButton from '../Register/SelectButton';
import IDValidator from '../../helper/checkIdCard';
import './member.less';
import Region from '../common/region';

const phoneTest = /^1\d{10}$/;

@mount('newUserMember')
class NewUserMember extends React.Component {

    @prop()
    userInfo;

    @prop()
    disabledBind = false;

    @prop()
    errorIdCardMessage;

    @prop()
    errorNameMessage;

    @prop()
    errorHospitalMessage;

    @prop()
    errorAddressMessage;

    @prop()
    errorStreetMessage;

    @prop()
    errorDiseaseMessage;

    @prop()
    errorMemberTypeMessage;

    @prop()
    errorPhoneMessage;

    @prop()
    errorMachinePhoneMessage;

    @prop()
    hospitalListData;

    @prop()
    initHospital;

    @prop()
    phone;

    @prop()
    diseaseList = [];

    @prop()
    insurancesList = [];

    @prop()
    errorInsurancesMessage;

    @prop()
    openList = [];

    @prop()
    address;

    @prop()
    recommendBusinessCode;

    @prop()
    memberType;

    @prop()
    patientId;

    @prop()
    loading = true;


    wx = new Weixin('closeWindow');

    constructor() {
        super();
        this.state = { newAddress: [], selectedRegion: [] }
    }


    componentDidMount() {
        this.prepareWeixin()
    }

    @action()
    async prepareWeixin() {
        try {
            this.userInfo = await api.get(`/currentPatient`);
            this.patientId = this.userInfo.id;
            this.openList = await api.get('/openInfo');
            this.insurancesList = await api.get('/cfg/enum/insurances');
            this.diseaseList = await api.get('/cfg/enum/diseases');
            setTimeout(() => {
                this.props.form.setFieldsValue({
                    idCard: this.userInfo.idCard,
                    memType: this.userInfo.memberType == 1 ? '保障会员' : this.userInfo.memberType == 2 ? '绿A会员' : '',
                    hospital: this.userInfo.hospital.name || '',
                    hospitalDoctor: this.userInfo.hospital.doctorName || '',
                    name: this.userInfo.name || '',
                    phone: this.userInfo.phone ? this.userInfo.phone.slice(0, 3) + ' ' + this.userInfo.phone.slice(3, 7) + ' ' + this.userInfo.phone.slice(7) : ' ',
                    street: this.userInfo.address.street || '',
                    insurance: [this.userInfo.insurance] || '',
                    machinePhone: this.userInfo.machineNumber || '',
                });
                if (this.userInfo.diseases && this.userInfo.diseases.length) {
                    const ast = []
                    this.userInfo.diseases.map((i) => {
                        ast.push(i.id)
                    })
                    this.props.form.setFieldsValue({ diseases: ast || '' })
                }
            }, 0)
            this.setState({
                selectedRegion: [this.userInfo.address.provinceId, this.userInfo.address.cityId, this.userInfo.address.areaId],
                newAddress: [this.userInfo.address.provinceId, this.userInfo.address.cityId, this.userInfo.address.areaId]
            })
        } catch (err) {
            message.error("获取基础信息失败。");
        }
        this.loading = false;
        await this.wx.ready();
    }

    addressChange(address) {
        this.setState({
            newAddress: address
        })
    }

    @action()
    async bind() {
        this.props.form.validateFields(async (err, values) => {
            this.disabledBind = true;
            let checkFlag = true;
            if (!values.name) {
                this.errorNameMessage = '请输入姓名';
                checkFlag = false;
            }
            if (!this.inputOnCange(values.name)) {
                checkFlag = false;
            }
            if (!this.idCardOnCange(values.idCard)) {
                checkFlag = false;
            }
            if (!values.phone) {
                this.errorPhoneMessage = '请输入手机号码';
                checkFlag = false;
            }
            let nowphone = ''
            if (values.phone) {
                nowphone = values.phone.replace(/\s+/g, "")
            }
            if (values.phone && !phoneTest.test(nowphone)) {
                this.errorPhoneMessage = '请输入正确的手机号码';
                checkFlag = false;
            } else {
                this.errorPhoneMessage = '';
            }
            const nowAddress = this.state.newAddress.filter(Boolean);
            if (nowAddress.length === 0 || nowAddress.length < 3) {
                this.errorAddressMessage = "请选择省/市/区";
                checkFlag = false;
            }
            if (!values.street) {
                this.errorStreetMessage = '请输入详细地址'
                checkFlag = false;
            }
            if (checkFlag) {
                //身份证号实名校验
                try {
                    await api.post(`/patients/${this.patientId}/patientCertification`, {
                        idCard: values.idCard,
                        name: values.name,
                    });
                } catch (error) {
                    message.error(error.message);
                    this.disabledBind = false;
                    return;
                }

                const data = {
                    name: values.name || '',
                    idCard: values.idCard || '',
                    phone: nowphone || '',
                    patientId: this.patientId,
                    address: {
                        provinceId: this.state.newAddress[0] || '',
                        cityId: this.state.newAddress[1] || '',
                        areaId: this.state.newAddress[2] || '',
                        street: values.street || '',
                    },
                    insurance: values.insurance && values.insurance.length ? values.insurance[0] : null,
                    diseases: values.diseases || [],
                    machineNumber: values.machinePhone,
                }
                try {
                    await api.post(`/perfectInformation`, data);
                    message.success('修改成功')
                    window.location.href = '/user/info'
                    this.disabledBind = false;
                } catch (e) {
                    this.disabledBind = false;
                    console.error(e);
                    message.error(e.message);
                }
            }
            this.disabledBind = false;
        })
    }

    @action()
    inputOnCange(val) {
        if (!val) {
            this.errorNameMessage = '请输入姓名';
            return false;
        }
        if (!(/^[\u4e00-\u9fa5]+$/.test(val))) {
            this.errorNameMessage = '请输入正确的姓名';
            return false;
        }
        this.errorNameMessage = '';
        return true;

    }

    @action()
    idCardOnCange(val) {
        if (!val) {
            this.errorIdCardMessage = '请输入身份证号';
            return false;
        }
        const validator = IDValidator;
        const valueStr = String(val);
        if (!validator.isValid(valueStr)) {
            this.errorIdCardMessage = '请输入正确的身份证号';
            return false
        }
        this.errorIdCardMessage = '';
        return true;
    }

    @action()
    inputPhoneOnCange(e) {
        if (!e.target.value) {
            this.errorPhoneMessage = '请输入手机号码';
        } else {
            this.errorPhoneMessage = '';
        }
    }

    @action()
    inputMachinePhoneOnCange(e) {
        if (!e.target.value) {
            this.errorMachinePhoneMessage = '请输入其他联系方式';
        } else {
            this.errorMachinePhoneMessage = '';
        }
    }

    gotoBind(phone) {
        window.location = `/user/bind?mobile=${phone}`
    }

    // 手机号码修改
    @action()
    mobelInputChange(e) {
        const nowInpPhone = e && e.replace(/\s+/g, "")
        if (nowInpPhone && nowInpPhone.length == 11 && !phoneTest.test(nowInpPhone)) {
            this.errorPhoneMessage = '请输入正确的手机号码';
        } else {
            this.errorPhoneMessage = '';
        }
    }

    @action()
    onDiseaseChanged(patientDisease) {
        const { setFieldsValue } = this.props.form;
        setFieldsValue({ diseases: patientDisease });
        if (patientDisease && patientDisease.length > 0) {
            this.errorDiseaseMessage = null;
        }
    }

    @action()
    onInsuranceChanged(insurance) {
        const { setFieldsValue } = this.props.form;
        setFieldsValue({ insurance });
        this.errorInsurancesMessage = '';
    }

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const FormItem = Form.Item;
        const diseases = getFieldValue('diseases');
        const insurance = getFieldValue('insurance');
        return (
            <Spin spinning={this.loading}>
                <div className="register memChange">
                    <Title>基本信息</Title>
                    <Form className="form">
                        {this.userInfo ?
                            <div>
                                <div className="formItemLabel">
                                    <span style={{ color: 'red', marginRight: 5 }}>*</span>姓名
                            </div>
                                <FormItem>
                                    {getFieldDecorator('name', {
                                        rules: [],
                                    })(
                                        <Input maxLength={8} placeholder="请输入姓名"
                                            disabled={this.userInfo && this.userInfo.realNameAuthenticationPassed === 1}
                                            onBlur={(e) => this.inputOnCange(e.target.value)}
                                            style={this.userInfo && this.userInfo.realNameAuthenticationPassed === 1 ? {} : { color: '#222222' }}
                                        />
                                    )}
                                </FormItem>
                                {this.errorNameMessage ? <span className='errorTip'>{this.errorNameMessage}</span> : null}
                                <div className="formItemLabel">
                                    身份证号
                            </div>
                                <FormItem>
                                    {getFieldDecorator('idCard', {
                                        rules: [],
                                    })(
                                        <Input maxLength={18}
                                            disabled={this.userInfo && this.userInfo.realNameAuthenticationPassed === 1}
                                            onBlur={e => this.idCardOnCange(e.target.value)}
                                            style={this.userInfo && this.userInfo.realNameAuthenticationPassed === 1 ? {} : { color: '#222222' }}
                                        />
                                    )}
                                </FormItem>
                                {this.errorIdCardMessage ? <span className='errorTip'>{this.errorIdCardMessage}</span> : null}

                                {this.userInfo && this.userInfo.memberType == 1 ? (
                                    <div>
                                        <div className="formItemLabel">
                                            签约机构
                                    </div>
                                        <FormItem>
                                            {getFieldDecorator('hospital', {
                                                rules: [],
                                            })(
                                                <Input disabled style={{ borderWidth: 0 }}
                                                />
                                            )}
                                        </FormItem>
                                        <div className="formItemLabel">
                                            签约医生
                                    </div>
                                        <FormItem>
                                            {getFieldDecorator('hospitalDoctor', {
                                                rules: [],
                                            })(
                                                <Input disabled style={{ borderWidth: 0 }}
                                                />
                                            )}
                                        </FormItem>
                                    </div>
                                ) : null}
                                <div className="formItemLabel">
                                    <span style={{ color: 'red', marginRight: 5 }}>*</span>手机号码
                            </div>
                                <FormItem>
                                    {getFieldDecorator('phone', {
                                        rules: [],
                                    })(
                                        <InputItem placeholder="请输入您的手机号"
                                            onChange={(e) => this.mobelInputChange(e)}
                                            style={{ height: '44px', fontSize: 18 }}
                                            className="numberInput loginInput"
                                            type="phone"
                                            clear
                                        />
                                    )}
                                </FormItem>
                                {this.errorPhoneMessage ? <span className='errorTip'>{this.errorPhoneMessage}</span> : null}
                                <div className="formItemLabel">
                                    其他联系方式
                            </div>
                                <FormItem>
                                    {getFieldDecorator('machinePhone', {
                                        rules: [],
                                    })(
                                        <Input maxLength={50} placeholder="请输入其他联系方式"
                                            onBlur={(e) => this.inputMachinePhoneOnCange(e)}
                                        />
                                    )}
                                </FormItem>
                                {this.errorMachinePhoneMessage ? <span className='errorTip'>{this.errorMachinePhoneMessage}</span> : null}
                                <div className="formItemLabel">
                                    <span style={{ color: 'red', marginRight: 5 }}>*</span>居住地址
                            </div>
                                <Region
                                    selectedValue={this.state.selectedRegion}
                                    onSelect={(value) => this.addressChange(value)}
                                />
                                {this.errorAddressMessage ? <span className='errorTip'>{this.errorAddressMessage}</span> : null}
                                <FormItem>
                                    {getFieldDecorator('street', {
                                        rules: [],
                                    })(
                                        // <Input maxLength={50} placeholder="请输入详细地址"
                                        //     onBlur={(e) => this.inputPhoneOnCange(e)}
                                        // />
                                        <textarea style={{ width: '100%', height: 88, fontSize: 16, marginTop: 5 }} maxLength={50} placeholder="请输入详细地址" />
                                    )}
                                </FormItem>
                                {this.errorStreetMessage ? <span className='errorTip'>{this.errorStreetMessage}</span> : null}
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
                                        // isSingle={true}
                                        />

                                    )}
                                </FormItem>
                                {this.errorInsurancesMessage ? <span className='errorTip'>{this.errorInsurancesMessage}</span> : null}
                                <div className="formItemLabel">
                                    现有疾病
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
                                {this.errorDiseaseMessage ? <span className='errorTip'>{this.errorDiseaseMessage}</span> : null}
                                <FormItem style={{ textAlign: 'center', marginTop: 10 }}>
                                    <Button
                                        disabled={this.disabledBind}
                                        onClick={() => this.bind()}
                                        className="submitButton"
                                    >
                                        保 存
                                </Button>
                                </FormItem>
                            </div>
                            : null}
                    </Form>
                </div>
            </Spin>
        )
    }
}
NewUserMember = Form.create()(NewUserMember);

export default NewUserMember;
