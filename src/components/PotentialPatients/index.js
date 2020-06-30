import React from 'react';
import logoImg1 from './images/ty-hd-1.png';
import logoImg2 from './images/ty-hd-2.png';
import logoImg3 from './images/ty-hd-3.png';
import { Form, Input, Button, message, Select, Modal } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import Disease from './Disease';
import { distanceBetweenCoordinate } from '../../lib/latlng'
import './index.less'

const Option = Select.Option;

@mount('potentialPatients')
class PotentialPatients extends React.Component {
    constructor(prop) {
        super(prop);
        this.activityId = this.props.match.params.activityId || '';
        this.channelType = this.props.match.params.channelType || '';
        this.channelId = this.props.match.params.channelId || '';
    }

    @prop()
    disabledGetCapchar;

    @prop()
    loading;

    @prop()
    errorCodeMessage;

    @prop()
    timeCount;

    @prop()
    disabledBind;

    @prop()
    errorPhone;

    @prop()
    errorSms;

    @prop()
    hospitalListData;

    @prop()
    initHospital;

    @prop()
    location;

    @prop()
    errorPhoneMessage;

    @prop()
    errorNameMessage;

    @prop()
    errorHospitalMessage;

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
        this.loading = false;
    }

    @action()
    async gethospitalListData(locationObj) {
        try {
            if (locationObj) {
                var locationArray = [locationObj.latitude, locationObj.longitude];
                this.hospitalListData = await api.get('/local-hospital', { location: locationArray });
                if(this.hospitalListData && this.hospitalListData.length>0){
                    this.initHospital = this.hospitalListData[0].id;
                }
                this.loading = false;
            } else {
                this.hospitalListData = await api.get('/local-hospital', {});
            }
            if (this.channelType == 1 && this.channelId) {
                this.initHospital = this.channelId;
            }
        } catch (err) {
            this.message = '获取社区医院失败';
        }
    }

    @action()
    async bind() {
        this.props.form.validateFields(async (err, values) => {
            let checkFlag = true;
            if (!values.name) {
                this.errorNameMessage = '请输入您的姓名';
                window.scrollTo(0,260);
                checkFlag = false;
            }
            if (!values.phone) {
                this.errorPhoneMessage = '请输入正确的手机号码';
                window.scrollTo(0,260);
                checkFlag = false;
            }
            const errorMsg = await this.getCapchar(values.phone);
            if (errorMsg) {
                checkFlag = false;
                this.errorPhoneMessage = errorMsg;
            }
            if (!values.hospitalId) {
                this.errorHospitalMessage = '请选择服务机构';
                window.scrollTo(0,260);
                checkFlag = false;
            }
            if (!checkFlag) {
                return;
            }
            try {
                await api.post(`/potentialPatients`, {
                    activityId: this.activityId,
                    channelType: this.channelType,
                    channelId: this.channelId,
                    name: values.name,
                    phone: values.phone,
                    diseases: values.diseases,
                    liveStreet: values.liveStreet,
                    hospitalId: values.hospitalId
                });
                Modal.success({
                    title: '登记成功',
                    content: '稍后PBM工作人员将与您联系，请保持手机接听畅通，感谢参与!',
                    okText: '确定',
                    className: 'registerBox',
                    onOk: () =>  { this.props.form.resetFields()},
                });
            } catch (err) {
                message.error(err.message);
            }
        })
    }



    @action()
    mobelInputChange() {
        this.errorPhone = false;
        this.errorPhoneMessage = null;
        this.props.form.validateFields(async (err, values) => {
            const mobilePhone = values.phone;
            this.errorPhoneMessage = await this.getCapchar(mobilePhone);
        })
    }

    @action()
    capcharInputChange() {
        this.errorSms = false;
        this.errorCodeMessage = null;
    }

    componentDidMount() {
        this.prepareWeixin();
    }

    @action()
    async getCapchar(mobilePhone) {
        if (!(/^1[345678]\d{9}$/.test(mobilePhone))) {
            return '请输入正确的手机号码';
        }
        try {
            const verify = await api.get(`mobiles/${mobilePhone}/verify`, { activityId: this.activityId });
            return verify;
        } catch (e) {
            return e.message;
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

    countDistance = (dis1, dis2) => {
        let distance = Math.round(distanceBetweenCoordinate(dis1, dis2));
        if (distance >= 1000) {
            distance = (distance / 1000).toFixed(1) + 'km';
        } else if (distance < 1000) {
            distance = distance + 'm'
        }
        return distance;
    }
    onDiseaseChanged = (patientDisease) => {
        const { setFieldsValue } = this.props.form;
        setFieldsValue({ diseases: patientDisease });
    }

    @action()
    inputOnCange(value) {
        if (!value) {
            this.errorNameMessage = '请输入您的姓名';
        } else {
            this.errorNameMessage = '';
        }
    }

    @action()
    selectOnCange(value) {
        if (!value) {
            this.errorHospitalMessage = '请选择服务机构';
        } else {
            this.errorHospitalMessage = '';
        }
    }

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const diseases = getFieldValue('diseases');
        const styles = this.getStyles();
        const FormItem = Form.Item;
        return (
            <div className="registerBox">
                <Title>万户PBM·太原市医改惠民项目</Title>
                <div><img src={logoImg1} style={styles.logo} /></div>
                <Form className="form">
                    <div className="formTitle">
                        参加惠民项目，请预约登记信息
                    </div>
                    <div className="formItemLabel">
                        姓名
                        <span className="tip1">*</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('name', {
                            rules: [],
                        })(
                            <Input maxLength="20" placeholder="登记姓名方便沟通"
                                onChange={this.inputOnCange}
                            />
                        )}
                    </FormItem>
                    {this.errorNameMessage ? <span style={styles.tip}>{this.errorNameMessage}</span> : null}
                    <div className="formItemLabel">
                        手机号
                        <span className="tip1">*</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('phone', {
                            rules: [],
                        })(
                            <Input maxLength="11"
                                placeholder="便于工作人员及时联系您"
                                onKeyUp={(e) => this.mobelInputChange(e)}
                            />
                        )}
                    </FormItem>
                    {this.errorPhoneMessage ? <span style={styles.tip}>{this.errorPhoneMessage}</span> : null}
                    <div className="formItemLabel">
                        您方便前往的PBM服务机构是
                        <span className="tip1">*</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('hospitalId', {
                            rules: [],
                            initialValue: this.initHospital,
                        })(
                            <Select placeholder="请选择服务机构" style={{ height: '46px' }}
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
                    {this.errorHospitalMessage ? <span style={styles.tip}>{this.errorHospitalMessage}</span> : null}
                    <div className="formItemLabel" style={{ marginBottom: '12px' }}>
                        您希望加强关注或管理的病症
                        <span className="tip2">（可多选、非必填）</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('diseases', {
                            rules: [],
                        })(
                            <Disease
                                patientDisease={diseases || []}
                                callbackParent={this.onDiseaseChanged}
                            />
                        )}
                    </FormItem>
                    <div className="tip">
                        如有其他病症，可稍后告知PBM工作人员。
                    </div>
                    <div className="formItemLabel">
                        您的居住地址
                        <span className="tip2">（非必填）</span>
                    </div>
                    <FormItem>
                        {getFieldDecorator('liveStreet', {
                            rules: [],
                        })(
                            <Input maxLength="50" placeholder="便于就近为您服务"
                            />
                        )}
                    </FormItem>
                    <FormItem style={{ textAlign: 'center', marginTop: 30 }}>
                        <Button
                            disabled={this.disabledBind}
                            onClick={() => this.bind()}
                            className="submitButton"
                        >提交信息</Button>
                    </FormItem>
                    <div className="contantpbm">
                        提交信息48小时内，PBM工作人员与您电话联系
                    </div>
                    <div><img src={logoImg2} style={styles.logo} />
                        <img src={logoImg3} style={styles.logo3} /></div>
                </Form>

            </div>
        )
    }

    getStyles() {
        return {
            logo: {
                width: '100%',
            },
            logo3: {
                width: '100%',
                marginTop: '-10px',
            },
            code: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
            },
            tip: {
                color: '#c8161e',
                fontSize: 14,
                letterSpacing: 2,
            },
            errorImg: {
                width: 12,
                height: 12,
                marginRight: 5,
            },
            bindBtn: {
                marginTop: 15,
            },
        }
    }
}
PotentialPatients = Form.create()(PotentialPatients);

export default PotentialPatients;
