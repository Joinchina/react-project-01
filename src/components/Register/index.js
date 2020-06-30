import React from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { InputItem } from 'antd-mobile'
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import Weixin from '../../lib/weixin';
import Logo from '../../states/images/logo.png';
import './index.less';
import NotificationModal from './NotificationModal';
import querystring from 'querystring';

@mount('register')
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
    readMeVisible;

    @prop()
    notificationCode;

    @prop()
    openList;

    @prop()
    weixinUser;

    @prop()
    loading = false;

    wx = new Weixin('closeWindow');

    @action()
    async bind() {
        this.loading = true;
        this.errorPhoneMessage = '';
        this.props.form.validateFields(async (err, values) => {
            if (!values.phone) {
                this.errorPhone = true;
                this.errorPhoneMessage = '请输入正确的手机号码';
                this.loading = false;
                return;
            }
            if (!(/^1[345678]\d{9}$/.test(values.phone.replace(/\s+/g, "")))) {
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
            const patients = await await api.get('/patients/signCheck', {
                phone: values.phone.replace(/\s+/g, "")
            })
            if (patients) {
                let content = '该手机号已注册，是否去登录？';
                Modal.confirm({
                    content,
                    okText: '是',
                    okType: 'primary',
                    cancelText: '否',
                    onOk: () => {
                        this.gotoBind(values.phone.replace(/\s+/g, ""));
                    },
                    onCancel: () => {
                        this.props.form.setFieldsValue({
                            phone: '',
                        });
                        this.errorPhoneMessage = '';
                    },
                });
                this.loading = false;
                return;
            } else {
                this.bindPatient(values);
            }

        })
    }

    async bindPatient(values) {
        try {
            const patientId = await api.post(`/verify-patient`, {
                mobilePhone: values.phone.replace(/\s+/g, ""),
                code: this.capchar,
            });
            let ishave
            if (this.weixinUser.address && this.weixinUser.address.cityId) {
                ishave = this.openList.find((i) => i.cityId == this.weixinUser.address.cityId)
            }
            const bjId = this.openList.find((i) => i.cityId == '110100')
            const hosId = ishave ? ishave.hospitalId : bjId.hospitalId
            const data = {
                memberType: 1,
                phone: values.phone.replace(/\s+/g, ""),
                name: values.phone.replace(/\s+/g, ""),
                hospitalId: hosId,
                recommendBusinessCode: this.recommendBusinessCode,
            }

            try {
                const patientId = await api.post(`/patients`, data);
                await api.post(`/bind/patient/${patientId}`);
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
                    this.props.history.push('/newHealthHomePage');
                }
                this.disabledBind = false;
            } catch (e) {
                this.disabledBind = false;
                this.loading = false;
                console.error(e);
                message.error(e.message);
            }
        } catch (err) {
            this.loading = false;
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
        this.weixinUser = await api.get('/currentUser');
        const patient = await api.get('currentPatient');
        if (patient) {
            this.props.history.push('/newHealthHomePage');
            return;
        }
        await this.wx.ready();
        this.openList = await api.get('/openInfo');
    }

    gotoBind(phone) {
        if (phone) {
            const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            let q = querystring.parse(qs);
            const search = querystring.stringify({ ...q, mobile: phone });
            window.location.href = `/user/bind?${search}`
        } else {
            window.location.href = `/user/bind${window.location.search}`
        }
    }


    @action()
    async getCapchar() {
        this.props.form.validateFields(async (err, values) => {
            const mobilePhone = values.phone.replace(/\s+/g, "");
            if (!(/^1[345678]\d{9}$/.test(mobilePhone))) {
                this.errorPhone = true;
                this.errorPhoneMessage = '请输入正确的手机号码';
                return;
            } else {
                const patients = await await api.get('/patients/signCheck', {
                    phone: mobilePhone
                })
                if (patients) {
                    let content = '该手机号已注册，是否去登录？';
                    Modal.confirm({
                        content,
                        okText: '是',
                        okType: 'primary',
                        cancelText: '否',
                        onOk: () => {
                            this.gotoBind(mobilePhone);
                        },
                        onCancel: () => {
                            this.props.form.setFieldsValue({
                                phone: '',
                            });
                            this.errorPhoneMessage = '';
                        },
                    });
                    return;
                } else {
                    this.sendMessage(mobilePhone);
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

    @action()
    readMe(readMeVisible, notificationCode) {
        this.readMeVisible = readMeVisible;
        this.notificationCode = notificationCode;
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const FormItem = Form.Item;
        return (
            <div className="loginBox">
                <Title>注册</Title>
                <NotificationModal visible={this.readMeVisible} notificationCode={this.notificationCode} readMe={this.readMe} />
                <Form className="form">
                    <div style={{ height: '75px' }}>
                        <FormItem>
                            {getFieldDecorator('phone', {
                                initialValue: this.phone ? this.phone.replace(/\s+/g, "") : '',
                                rules: [],
                            })(
                                <InputItem placeholder="请输入您的手机号"
                                    onChange={(e) => this.mobelInputChange(e)}
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
                            className="numberInput loginInput"
                            type="digit"
                            clear
                            value={this.capchar}
                            extra={
                                <Button
                                    className="addonAfterButton"
                                    disabled={this.timeCount ? true : false}
                                    onClick={() => this.getCapchar()}>{this.timeCount ? `${this.timeCount}s重新获取` : '获取验证码'}</Button>
                            }
                            style={{ height: '44px' }}
                        ><i className="iconfont">&#xe62e;</i></InputItem>
                    </div>
                    {this.errorCodeMessage ? <span className="errorTip">{this.errorCodeMessage}</span> :
                        null}
                    <FormItem style={{ paddingTop: '47px' }} >
                        <Button
                            // disabled={this.loading}
                            loading={this.loading}
                            onClick={() => this.bind()}
                            className="submitButton"
                        >同意协议并注册</Button>
                    </FormItem>
                    <div style={{ paddingTop: '24px', color: '#707070' }}>
                        <span>已阅读并同意以下协议</span>
                    </div>
                    <Button type="link" style={{ height: '25px', fontSize: '14px', paddingLeft: '0px' }} onClick={() => this.readMe(true, 1)}>
                        万户健康慢病综合管理服务平台服务协议
                    </Button>
                    <Button type="link" style={{ height: '25px', fontSize: '14px', paddingLeft: '0px' }} onClick={() => this.readMe(true, 2)}>
                        隐私政策
                    </Button>
                    {/* <Button type="link" style={{ height: '25px', fontSize: '14px', paddingLeft: '0px' }} onClick={() => this.readMe(true, 3)}>
                        法律声明
                    </Button> */}
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
