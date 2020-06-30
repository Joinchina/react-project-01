import React from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { InputItem } from 'antd-mobile'
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import Weixin from '../../lib/weixin';
import Logo from '../../states/images/logo.png';
import './index.less';
import querystring from 'querystring';
@mount('userBind')
class Login extends React.Component {

    @prop()
    redirectUrl;

    @prop()
    disabledGetCapchar = true;

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
    phone;

    @prop()
    capchar;

    @prop()
    weixinUser

    @prop()
    loading = false;

    wx = new Weixin('closeWindow');

    @action()
    async bind() {
        this.loading = true;
        this.errorPhoneMessage = '';
        this.props.form.validateFields(async (err, values) => {
            if (!values.telephone || !values.telephone.replace(/\s+/g, "")) {
                this.errorPhone = true;
                this.errorPhoneMessage = '请输入正确的手机号码';
                this.loading = false;
                return;
            }
            if (!(/^1[3456789]\d{9}$/.test(values.telephone.replace(/\s+/g, "")))) {
                this.errorPhone = true;
                this.errorPhoneMessage = '请输入正确的手机号码';
                this.loading = false;
                return;
            }
            if (!this.capchar) {
                this.errorSms = true;
                this.errorCodeMessage = '请输入验证码';
                this.loading = false;
                return;
            }
            try {
                await api.get('/patients/bindCheck', {
                    phone: values.telephone.replace(/\s+/g, "")
                })
                this.bindPatient(values);
            } catch (err) {
                console.error('err', err, err.code);
                if (err.code == 2) {
                    Modal.info({
                        content: '该手机号未注册，是否去注册？',
                        onOk: () => {
                            this.gotoBind(values.telephone.replace(/\s+/g, ""));
                        },
                        okText: '确定',
                    });
                } else if (err.code == 3) {
                    // Modal.confirm({
                    //     content: '该手机号已存在且已开通微信服务，登录后仅可在此微信号下使用PBM服务。',
                    //     okText: '确认',
                    //     okType: 'primary',
                    //     cancelText: '取消',
                    //     onOk: () => {
                    //         this.bindPatient(values);
                    //     },
                    //     onCancel: () => { },
                    // });
                    this.bindPatient(values);
                } else {
                    this.errorPhoneMessage = err.message
                }
                this.loading = false;
                return;
            }

        })
    }

    async bindPatient(values) {
        try {
            const patientId = await api.post(`/verify-patient`, {
                mobilePhone: values.telephone.replace(/\s+/g, ""),
                code: this.capchar,
            });
            await api.post(`/bind/patient/${patientId}`);
            const patient = await api.get('currentPatient');
            if (patient.memberType == 2) {
                await api.post(`/checkHospital`, { id: patient.id, provinceId: this.weixinUser.address.provinceId, cityId: this.weixinUser.address.cityId });
            } else if (patient.memberType == 1) {
                const address = {
                    address: {
                        provinceId: patient.hospital.provinceId,
                        cityId: patient.hospital.provinceName,
                        province: patient.hospital.provinceName,
                        city: patient.hospital.cityName
                    }
                }
                await api.get('/saveCityList', address)
            }
            // 获取用户详情，如果没有选择会员类型  到选择会员类型页面
            // const patient = await api.get(`/patient/${patientId}`);
            if (!patient.memberType) {
                this.props.history.push(`/user/memberType?patientId=${patientId}`);
                return;
            }
            //否则：返回登录前页面
            if (this.props.location.search) {
                const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
                const q = querystring.parse(qs);
                const { r } = q;
                console.log('r',r)
                if (r) {
                    if (r == '/orderCommonList') {
                        window.location.href = `${r}?page=1`;
                    } else {
                        window.location.href = r;
                    }
                } else {
                    window.WeixinJSBridge.invoke('closeWindow');
                }
            } else {
                window.WeixinJSBridge.invoke('closeWindow');
            }
        } catch (err) {

            this.errorCodeMessage = err.message;
        }
        this.loading = false;
    }

    @action()
    mobelInputChange() {
        this.errorPhoneMessage = '';
    }

    @action()
    capcharInputChange(value) {
        if (value > 9999) {
            const val = `${value}`.slice(0, 4)
            this.capchar = val;
        } else {
            this.capchar = value;
        }
        this.errorSms = false;
        this.errorCodeMessage = null;
    }

    componentDidMount() {
        this.prepareWeixin()
    }

    @action()
    async prepareWeixin() {
        const patient = await api.get('currentPatient');
        this.weixinUser = await api.get('/currentUser');
        if (patient) {
            this.props.history.push('/newHealthHomePage');
            return;
        }
        await this.wx.ready();

    }

    gotoBind(phone) {
        if (phone) {
            const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            let q = querystring.parse(qs);
            const search = querystring.stringify({ ...q, mobile: phone });
            window.location.href = `/user/register?${search}`
        } else {
            window.location.href = `/user/register${window.location.search}`
        }

    }


    @action()
    async getCapchar() {
        this.props.form.validateFields(async (err, values) => {
            const mobilePhone = values.telephone ? values.telephone.replace(/\s+/g, "") : '';
            if (!(/^1[3456789]\d{9}$/.test(mobilePhone))) {
                this.errorPhone = true;
                this.errorPhoneMessage = '请输入正确的手机号码';
                return;
            } else {
                try {
                    await await api.get('/patients/bindCheck', {
                        phone: mobilePhone
                    })
                    this.sendMessage(values.telephone.replace(/\s+/g, ""));
                } catch (err) {
                    if (err.code == 2) {
                        Modal.confirm({
                            content: '该手机号未注册，是否去注册？',
                            onOk: () => {
                                this.gotoBind(mobilePhone);
                            },
                            okText: '确定',
                            cancelText: '取消',
                            onCancel: () => {
                                this.props.form.setFieldsValue({
                                    telephone: '',
                                });
                            }
                        });
                    } else if (err.code == 3) {
                        this.sendMessage(values.telephone.replace(/\s+/g, ""));
                    } else {
                        this.errorPhoneMessage = err.message
                    }
                    return;
                }
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

    render() {
        const { getFieldDecorator } = this.props.form;

        const FormItem = Form.Item;
        return (
            <div className="loginBox">
                <Title>登录</Title>
                <Form className="form">
                    <div style={{ height: '75px' }}>
                        <FormItem>
                            {getFieldDecorator('telephone', {
                                initialValue: this.phone,
                                rules: [],
                            })(
                                <InputItem placeholder="请输入您的手机号"
                                    onKeyUp={(e) => this.mobelInputChange(e)}
                                    style={{ height: '44px' }}
                                    className="numberInput loginInput"
                                    type="phone"
                                    clear
                                ><i className="iconfont">&#xe627;</i></InputItem>
                            )}
                        </FormItem>
                        {this.errorPhoneMessage ? <span className="errorTip" >{this.errorPhoneMessage}</span> :
                            null}
                    </div>

                    <div style={{ paddingTop: '15px' }} >
                        {/* <FormItem style={{ flex: 43, }}>
                            {getFieldDecorator('capchar', {
                                rules: [],
                            })(

                            )}
                        </FormItem> */}
                        <InputItem placeholder="短信验证码"
                            maxLength={4}
                            onChange={(e) => this.capcharInputChange(e)}
                            value={this.capchar}
                            extra={
                                <Button
                                    className="addonAfterButton"
                                    disabled={this.timeCount ? true : false}
                                    onClick={() => this.getCapchar()}>{this.timeCount ? `${this.timeCount}s重新获取` : '获取验证码'}</Button>
                            }
                            clear
                            className="numberInput loginInput"
                            type="number"
                            style={{ height: '44px' }}
                        ><i className="iconfont">&#xe62e;</i></InputItem>
                    </div>
                    {this.errorCodeMessage ? <span className="errorTip">{this.errorCodeMessage}</span> :
                        null}
                    <FormItem style={{ paddingTop: '47px' }} >
                        <Button
                            onClick={() => this.bind()}
                            className="submitButton"
                            loading={this.loading}
                            disabled={this.loading}
                        >登 录</Button>
                    </FormItem>
                    <Button type="link" style={{ width: '100%', marginTop: '27px' }} onClick={() => this.gotoBind(this.phone)}>
                        新用户注册
                    </Button>
                </Form>

                <div className="logo">
                    <img src={Logo} className="logoImg" />
                </div>
            </div>
        )
    }

}
Login = Form.create()(Login);

export default Login;
