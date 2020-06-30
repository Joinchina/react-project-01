import React from 'react';
import { Form, Input, Button, message, Select, Modal, Icon } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import querystring from 'querystring';
import api from '../../api';
import Title from '../common/Title';
import Weixin from '../../lib/weixin';
import SelectButton from './SelectButton';
import IDValidator from '../../helper/checkIdCard';
import './index.less';
import Region from '../common/region';

/* const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1310653_ig3w0ieeee9.js',
}); */

const Option = Select.Option;

@mount('memberType')
class MemberType extends React.Component {

    constructor(prop) {
        super(prop);
        this.wx = new Weixin('getLocation', 'closeWindow');
    }

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
    errorDiseaseMessage;

    @prop()
    errorMemberTypeMessage;

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
    memberType = 2;

    @prop()
    locationHref;

    @prop()
    selectedRegion;

    @prop()
    errorStreetMessage;

    @prop()
    weixinUser

    @action()
    async prepareWeixin() {
        try {
            const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            const q = querystring.parse(qs);
            const { mobilePhone, r } = q;
            this.locationHref = r;
            this.phone = mobilePhone;
            this.loading = true;
        } catch (err) {
            console.warn(err);
        }
        try {
            this.weixinUser = await api.get('/currentUser');
            this.openList = await api.get('/openInfo');
            this.insurancesList = await api.get('/cfg/enum/insurances');
            this.diseaseList = await api.get('/cfg/enum/diseases');

        } catch (err) {
            message.error("获取基础信息失败。");
        }
        this.loading = false;
        await this.wx.ready();

        //获取定位
        this.location = await this.wx.getLocation({
            type: 'gcj02',
        });
        if (this.openList && this.openList.length > 0) {
            const selectAddress = this.openList[0]
            // this.selectedRegion = [selectAddress.provinceId, selectAddress.cityId, ''];
        }
        if (this.location) {
            const geocode = await api.get('/geocode', {
                latitude: this.location.latitude,
                longitude: this.location.longitude,
            });
            if (geocode && this.selectedRegion && this.selectedRegion.length === 3) {
                if (this.selectedRegion[0] === geocode.provinceId && this.selectedRegion[1] === geocode.cityId) {
                    this.selectedRegion = [geocode.provinceId, geocode.cityId, geocode.areaId]
                }
            }
        }
    }

    @action()
    async bind() {
        if (!this.memberType) {
            this.errorMemberTypeMessage = "请选择会员类型";
            return;
        }
        this.props.form.validateFields(async (err, values) => {
            this.disabledBind = true;
            let checkFlag = true;
            if (!values.name) {
                this.errorNameMessage = '请输入姓名';
                checkFlag = false;
            }
            if (!values.idCard) {
                this.errorIdCardMessage = "请输入身份证号";
                checkFlag = false;
            } else {
                if (! await this.validateIdCard()) {
                    checkFlag = false;
                }
            }
            if (!this.selectedRegion || !this.selectedRegion[0] || !this.selectedRegion[1] || !this.selectedRegion[2]) {
                this.errorAddressMessage = "请选择您所在的省/市/区";
                checkFlag = false;
            }
            if (!values.street) {
                this.errorStreetMessage = "请输入详细地址";
                checkFlag = false;
            }
            if (!values.hospitalId && this.memberType === 1) {
                this.errorHospitalMessage = '请选择签约机构';
                checkFlag = false;
            }
            if (!values.insurance && this.memberType === 1) {
                this.errorInsurancesMessage = '请选择医保类型';
                checkFlag = false;
            } else {
                this.errorInsurancesMessage = '';
            }
            // if (!values.diseases) {
            //     this.errorDiseaseMessage = '请选择现有疾病';
            //     checkFlag = false;
            // }
            if (checkFlag) {
                const ishave = this.openList.find((i) => i.cityId == this.weixinUser.address.cityId)
                const bjId = this.openList.find((i) => i.cityId == '110100')
                const hosId = ishave ? ishave.hospitalId : bjId.hospitalId
                const data = {
                    memberType: this.memberType,
                    phone: this.phone,
                    name: values.name,
                    idCard: values.idCard,
                    hospitalId: hosId,
                    address: {
                        provinceId: this.selectedRegion[0],
                        cityId: this.selectedRegion[1],
                        areaId: this.selectedRegion[2],
                        street: values.street,
                    },
                    insurance: values.insurance ? values.insurance[0] : null,
                    diseases: values.diseases,
                    recommendBusinessCode: this.recommendBusinessCode,
                }

                try {
                    const patientId = await api.post(`/patients`, data);
                    await api.post(`/bind/patient/${patientId}`);
                    if (this.locationHref) {
                        window.location.href = this.locationHref;
                    } else {
                        window.location.href = '/user/info';
                    }
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
    inputOnCange(e) {
        if (!e.target.value) {
            this.errorNameMessage = '请输入姓名';
        } else {
            if (!(/^[\u4e00-\u9fa5]+$/.test(e.target.value))) {
                this.errorNameMessage = '请输入正确的姓名';
            } else {
                this.errorNameMessage = '';
            }
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
        } else {
            this.errorIdCardMessage = "请输入正确的身份证号";
        }
    }
    @action()
    async validateIdCard() {
        let checkFlag = true;
        this.errorIdCardMessage = null;
        const val = this.props.form.getFieldValue('idCard');
        if (val) {
            const validator = IDValidator;
            const valueStr = String(val);
            if (!validator.isValid(valueStr)) {
                this.errorIdCardMessage = "身份证号有误，请重新填写。";
                checkFlag = false;
            } else {
                try {
                    const patients = await api.get('/patients/signCheck', {
                        idCard: valueStr
                    })
                    if (patients) {
                        window.scrollTo(0,260);
                        Modal.confirm({
                            content: '身份证号已存在。如您确认身份证号无误，请联系客服处理。',
                            okText: '确认',
                            okType: 'primary',
                            cancelText: '取消',
                            onOk: () => {
                                window.wx.closeWindow();
                            },
                            onCancel: () => {
                                this.props.form.setFieldsValue({
                                    idCard: '',
                                });
                            },
                        });
                        window.scrollTo(0,260);
                        return false;
                    }
                } catch (e) {
                    console.error(e);
                    message.info(e);
                }


            }
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
    selectOnCange(value) {
        if (value) {
            this.errorHospitalMessage = '';
        }
        const hospital = this.hospitalListData.find((item) => item.id === value);
        const address = this.props.form.getFieldValue('address');
        if (!address) {
            this.props.form.setFieldsValue({ address: hospital.address });
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

    @action()
    closeAddress(val) {
        this.address = val;
    }
    @action()
    setAddress(val) {
        this.address = val || '';
    }

    @action()
    cityOnCange(val) {
        if (val) {
            this.errorAddressMessage = null;
        }
        if (this.memberType === 1) {
            this.gethospitalListData(val);
        }
    }
    @action()
    addressChange(address) {
        this.selectedRegion = address;
        if (!this.selectedRegion || !this.selectedRegion[0] || !this.selectedRegion[1] || !this.selectedRegion[2]) {
            this.errorAddressMessage = "请选择您所在的省/市/区";
        } else {
            this.errorAddressMessage = "";
        }
    }

    @action()
    streetOnCange(e) {
        if (!e.target.value) {
            this.errorStreetMessage = '请输入详细地址';
        } else {
            this.errorStreetMessage = '';
        }
    }


    @action()
    async gethospitalListData(val) {
        const city = this.openList.find(item => item.areaId === val);
        const where = {
            "provinceName": city.provinceName,
            "cityName": city.cityName,
            "status": 0
        }
        try {
            if (this.location) {
                var locationArray = [this.location.latitude, this.location.longitude];

                this.hospitalListData = await api.get('/hospital', { nearBy: locationArray, where });
                if (this.hospitalListData && this.hospitalListData.length > 0) {
                    this.initHospital = this.hospitalListData[0].id;
                }
                this.loading = false;
            } else {
                this.hospitalListData = await api.get('/hospital', { where });
            }
        } catch (err) {
            this.message = '获取社区医院失败';
        }
    }
    @action()
    selectMemberType(memberType) {
        this.errorMemberTypeMessage = null;
        this.memberType = memberType;
        const { getFieldValue } = this.props.form;
        const address = getFieldValue('address');
        if (address && memberType == 1) {
            this.gethospitalListData(address);
        }
    }

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const FormItem = Form.Item;
        const diseases = getFieldValue('diseases');
        const insurance = getFieldValue('insurance');
        return (
            <div className="register">
                <Title>完善资料</Title>
                <Form className="form">
                    {/* <div className="tipTitle" style={{ textAlign: "left" }}>
                        <span>注册成功！选择一种会员类型吧</span>
                    </div>
                    <div className="cardBox">
                        <a onClick={() => this.selectMemberType(2)}>
                            <img src={ACard} className="card" />
                            <div className="selectedIcon">
                                <MyIcon type={this.memberType === 2 ? 'icontubiao_fuli-mian' : 'icontubiao_fuli-xian-1'} style={{ fontSize: '28px' }} />
                            </div>
                        </a>
                    </div>
                    <div style={{ marginTop: '16px' }} className="cardBox">
                        <a onClick={() => this.selectMemberType(1)}>
                            <img src={Card} className="card" />
                            <div className="selectedIcon">
                                <MyIcon type={this.memberType === 1 ? 'icontubiao_fuli-mian' : 'icontubiao_fuli-xian-1'} style={{ fontSize: '28px' }} />
                            </div>
                        </a>
                    </div>
                    {this.errorMemberTypeMessage ? <span className='errorTip'>{this.errorMemberTypeMessage}</span> : null} */}
                    {this.memberType ?
                        <div>
                            <div className="tipTitle">
                                <span>完善会员资料</span>
                            </div>
                            <div className="formItemLabel">
                                姓名
                            </div>
                            <FormItem>
                                {getFieldDecorator('name', {
                                    rules: [],
                                })(
                                    <Input maxLength={20} placeholder="请输入姓名"
                                        onBlur={(e) => this.inputOnCange(e)}
                                        onChange={this.inputOnCange}
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
                                    <Input maxLength={18} placeholder="请输入身份证号"
                                        onBlur={this.idCardBlur}
                                        onChange={this.idCardChange}
                                    />
                                )}
                            </FormItem>
                            {this.errorIdCardMessage ? <span className="errorTip">{this.errorIdCardMessage}</span> : null}
                            <div className="formItemLabel">
                                居住地址
                            </div>
                            <FormItem>
                                {getFieldDecorator('address', {
                                    rules: [],
                                })(
                                    <div style={{ borderBottom: '1px solid #e8e8e8' }}>
                                        <Region
                                            selectedValue={this.selectedRegion}
                                            onSelect={(value) => this.addressChange(value)}
                                            placeholder="请选择您所在的省/市/区"
                                            allowArea={['340000', '340200']}
                                        />
                                    </div>
                                )}
                            </FormItem>
                            {this.errorAddressMessage ? <span className='errorTip'>{this.errorAddressMessage}</span> : null}
                            <FormItem>
                                {getFieldDecorator('street', {
                                    rules: [],
                                })(
                                    <Input maxLength={50} placeholder="请输入详细地址"
                                        onBlur={(e) => this.streetOnCange(e)}
                                    />
                                )}
                            </FormItem>
                            {this.errorStreetMessage ? <span className='errorTip'>{this.errorStreetMessage}</span> : null}

                            {this.memberType === 1 ? (
                                <div>
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
                                        保险类型
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
                                    {this.errorInsurancesMessage ? <span className='errorTip'>{this.errorInsurancesMessage}</span> : null}

                                </div>
                            ) : null}
                            {/* <div className="formItemLabel">
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
                            {this.errorDiseaseMessage ? <span className='errorTip'>{this.errorDiseaseMessage}</span> : null} */}
                        </div>
                        : null}

                    <FormItem style={{ textAlign: 'center', marginTop: 20 }}>
                        <Button
                            disabled={this.disabledBind}
                            onClick={() => this.bind()}
                            className="submitButton"
                        >
                            保 存
                        </Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}
MemberType = Form.create()(MemberType);

export default MemberType;
