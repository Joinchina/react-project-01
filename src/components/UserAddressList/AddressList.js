import React, { Component } from 'react';
import { Icon, message, Button, Drawer, Row, Col, Switch, Spin, Input, Form } from 'antd';
import { InputItem } from 'antd-mobile';
import api from '../../api';
import propTypes from 'prop-types';
import Region from '../common/region';
import './index.less';

const FormItem = Form.Item;

const errorTip = {
    name: '请输入收货人姓名',
    machineNumber: "请输入收货人手机号",
    provincesId: "请选择省/市/区",
    street: "请输入街道、楼牌号码"
}
class AddressList extends Component {

    static propTypes = {
        patientId: propTypes.string.isRequired,
        isSelected: propTypes.bool,
        onClose: propTypes.func,
        onSelect: propTypes.func,
        visible: propTypes.bool,
    }

    static defaultProps = {
        isSelected: true,
        onClose: () => { },
        onSelect: () => { },
        visible: false,
    };


    constructor(props) {
        super(props);
        this.state = {
            patientId: null,
            addressList: [],
            addBoxVisible: false,
            newAddress: {},
            addressTipMessage: {},
            selectedAddress: {},
            selectedValue: null,
            selectedRegion: ['', '', ''],
            loading: true,
        }
    }

    async componentDidMount() {
        const { patientId } = this.props;
        this.setState({ patientId });
        await this.initList(patientId)
    }

    async initList(patientId) {
        try {
            const addressList = await api.get(`/patients/${patientId}/receiverAddress`);
            this.setState({ addressList });
            const address = addressList.find(item => item.deliveryType == 2);
            if (address) {
                const selectedRegion = [
                    address.provincesId || '',
                    address.cityId || '',
                    address.areaId || '',
                ]
                this.setState({ selectedRegion });
            }
        } catch (e) {
            console.error(e);
            message.error('获取地址信息失败，请刷新重试。');
        }
        this.setState({ loading: false });
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.visible && nextProps.visible !== this.props.visible) {
            const { patientId } = this.state;
            await this.initList(patientId);
        }
    }

    onClose() {
        const { onClose } = this.props;
        onClose();
    }

    onAddBoxClose() {
        this.setState({ addBoxVisible: false, newAddress: {} });
    }

    async addNewAddress() {
        this.setState({ loading: true });
        const newAddress = {};
        const { addressList } = this.state;
        const addressItems = [...addressList].filter(item => item.deliveryType === 3);
        if (addressItems.length == 0) {
            newAddress.state = 1;
            newAddress.stateDisabled = true;
        }
        this.setState({ addBoxVisible: true, newAddress, addressTipMessage: {}, selectedRegion: null });
        this.props.form.setFieldsValue({
            state: '',
            name: '',
            machineNumber: '',
            street: '',
        });
        this.setState({ loading: false });
    }

    async saveNewAddress() {
        this.setState({ loading: true });
        this.props.form.validateFields(async (err, values) => {
            const { patientId, newAddress, addressTipMessage, addressList } = this.state;
            let checkFlag = true
            if (!newAddress.name) {
                addressTipMessage.name = errorTip.name;
                checkFlag = false;
            }
            if (!newAddress.machineNumber) {
                addressTipMessage.machineNumber = errorTip.machineNumber;
                checkFlag = false;
            }
            if (newAddress.machineNumber && !(/^1[345678]\d{9}$/.test(newAddress.machineNumber.replace(/\s+/g, "")))) {
                checkFlag = false;
                addressTipMessage.machineNumber = '请输入正确的手机号码';
            }
            if (!newAddress.provincesId || !newAddress.cityId || !newAddress.areaId) {
                addressTipMessage.provincesId = errorTip.provincesId;
                checkFlag = false;
            }
            if (!newAddress.street) {
                addressTipMessage.street = errorTip.street;
                checkFlag = false;
            }
            if (!checkFlag) {
                this.setState({ addressTipMessage, loading: false });
                return;
            } else {
                try {
                    if (newAddress.id) {
                        await api.put(`/patients/${patientId}/receiverAddress/${newAddress.id}`, newAddress);
                        this.initList(patientId);
                        this.setState({ addBoxVisible: false, newAddress: {} });
                    } else {
                        const address = [...addressList].filter(item => item.deliveryType === 3)
                        if (!address || address.length <= 0) {
                            newAddress.state = 1;
                        }
                        await api.post(`/patients/${patientId}/receiverAddress`, newAddress);
                        this.initList(patientId);
                        this.setState({ addBoxVisible: false, newAddress: {} });
                    }
                    this.setState({ loading: false });
                } catch (e) {
                    this.setState({ loading: false });
                    console.error(e);
                }
            }
        })

    }
    checkWxScroll(){
        var ua = navigator.userAgent.toLowerCase();
        var u = navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (ua.match(/MicroMessenger/i) == 'micromessenger' && !!u) {
            var currentPosition, timer;
            var speed = 0;//页面滚动距离
            timer = setInterval(function () {
                currentPosition = document.documentElement.scrollTop || document.body.scrollTop;
                currentPosition -= speed;
                window.scrollTo(0, currentPosition);//页面向上滚动
                currentPosition += speed; //speed变量
                window.scrollTo(0, currentPosition);//页面向下滚动
                clearInterval(timer);
            }, 1);
        }
    }
    editAddress(address) {
        this.setState({
            addBoxVisible: true,
            newAddress: { ...address },
            addressTipMessage: {},
            selectedRegion: [address.provincesId, address.cityId, address.areaId]
        });
        this.props.form.setFieldsValue(address);
    }
    async deleteAddress(address) {
        const { patientId } = this.state;
        try {
            this.setState({ loading: true });
            await api.del(`/patients/${patientId}/receiverAddress/${address.id}`);
            message.success("删除成功");
            await this.initList(patientId);
            this.setState({ loading: false });
        } catch (e) {
            console.error(e);
            message.success("删除失败");
            this.initList(patientId);
            this.setState({ loading: false });
        }

    }

    addressChange(address) {
        const { newAddress, addressTipMessage } = this.state;
        newAddress.provincesId = address[0];
        newAddress.cityId = address[1];
        newAddress.areaId = address[2];
        if (!address[0] || !address[1] || !address[2]) {
            addressTipMessage.provincesId = errorTip.provincesId;
        } else {
            addressTipMessage.provincesId = '';
        }
        this.setState({ newAddress, addressTipMessage, selectedRegion: address });
    }

    updateAddress(item, val, maxLength, isInput) {
        let value = val
        if (isInput) {
            value = val.target.value;
        }
        const { newAddress, addressTipMessage } = this.state;
        if (value) {
            addressTipMessage[item] = '';
        } else {
            addressTipMessage[item] = errorTip[item];
        }
        if (item === 'machineNumber' && !(/^1[345678]\d{9}$/.test(value.replace(/\s+/g, "")))) {
            addressTipMessage.machineNumber = '请输入正确的手机号码';
        }
        if (maxLength && value.length > maxLength) {
            value = value.substr(0, maxLength);
        }
        newAddress[item] = value;
        if (item === 'state') {
            newAddress[item] = value ? 1 : 0;
        }
        this.setState({ newAddress, addressTipMessage });
    }

    selectAddress(address) {
        const { onSelect } = this.props;
        onSelect(address);
        this.onClose();
    }
    render() {
        const { addBoxVisible, addressList, newAddress, addressTipMessage, selectedRegion } = this.state;
        const { selectedAddress, isSelected } = this.props;
        const { getFieldDecorator } = this.props.form;
        const liveAddress = addressList.find(item => item.deliveryType === 1);
        const addresss = addressList.filter(item => item.deliveryType === 3);
        let addressForAll = [];
        if(liveAddress){
            addressForAll = [liveAddress];
        }
        addressForAll = [...addressForAll, ...addresss];
        const addressItems = addressForAll ? addressForAll.map((item, index) => {
            if (item.deliveryType !== 3 && item.deliveryType !== 1) {
                return null;
            }
            const selected = selectedAddress && selectedAddress.id === item.id
            return (
                <div key={item.id || `address_${index}`} className="addressItem" style={selected ? { border: '1px solid rgba(200,22,29,1)' } : null}>
                    <div className="closeButton">
                    {item.deliveryType === 1 ? null :<Icon type="close" onClick={() => this.deleteAddress(item)} style={{ fontSize: '18px', color: '#9A9A9A' }} />}
                    </div>
                    <Row >
                        <Col span={20} onClick={() => this.selectAddress(item)}>
                            <div >
                                {item.state == 1 ? <span className="address-selected">默认</span> : null}
                                {item.deliveryType === 1 ? <span className="address-selected">住址</span> : null}
                                <span className="address-name">{item.name}</span>
                                <span className="address-no">{item.machineNumber}</span>
                            </div>
                            <div className="addressDetail">
                                {item.provincesName}  {item.cityName}{item.areaName}{item.street}
                            </div>
                        </Col>
                        <Col span={4} className="editButtonBox" style={{ textAlign: 'center' }}>
                        {item.deliveryType === 1 ? null :<div className="editButton" onClick={() => this.editAddress(item)}>编辑 </div>}
                        </Col>
                    </Row>
                </div>
            );
        }) : null;
        return (
            <Spin spinning={this.state.loading} >
                <div className="addressList" style={{ height: '100%' }}>
                    {
                        isSelected ? <div style={{ textAlign: 'right' }}>
                            <Icon type="close-circle" onClick={() => this.onClose()} style={{ fontSize: '24px', color: '#9A9A9A' }} />
                        </div> : null
                    }

                    <div style={{ height: isSelected ? '350px' : 'calc(100% - 50px)', overflow: 'auto' }}>
                        {addressItems}
                    </div>
                    <div>
                        <Button onClick={() => this.addNewAddress()} className="addNewAddressBtn">
                            新增收货地址
                        </Button>
                    </div>
                    <Drawer
                        title=""
                        placement="bottom"
                        closable={false}
                        onClose={() => this.onAddBoxClose()}
                        visible={addBoxVisible}
                        className="checkViewBox addressDrawer"
                        height={510}
                    >
                        <Spin spinning={this.state.loading} >
                        <div className="addressAddBox">
                            <Form className="form">
                                <div style={{ textAlign: 'right' }} className="closeIcon" style={{right: '0px', top: '0px'}}>
                                    <Icon type="close-circle" onClick={() => this.onAddBoxClose()} style={{ fontSize: '24px', color: '#9A9A9A' }} />
                                </div>
                                <div style={{paddingTop: '10px'}}>
                                    <div className="formItemLabel">
                                        收货人
                                    </div>
                                    <FormItem>
                                        {getFieldDecorator('name', {
                                            rules: [],
                                        })(
                                            <Input
                                                placeholder="请输入收货人姓名"
                                                onChange={(e) => this.updateAddress('name', e, null, true)}
                                                className="addressInput"
                                                maxLength={10}
                                                style={{
                                                    background: '#F9F9F9 !important',
                                                    padding: '0px',
                                                    fontSize: '18px' ,
                                                    fontFamily: 'Source Han Sans',
                                                    color: '#666666',
                                                }}
                                            />
                                        )}
                                    </FormItem>
                                    <div className="addressErrorTip">{addressTipMessage.name}</div>
                                    <div className="formItemLabel">
                                        手机号码
                                    </div>
                                    <FormItem>
                                        {getFieldDecorator('machineNumber', {
                                            rules: [],
                                        })(
                                            <InputItem
                                                placeholder="请输入收货人手机号"
                                                onChange={(value) => this.updateAddress('machineNumber', value, 18)}
                                                type="phone"
                                                className="numberInput"
                                            />
                                        )}
                                    </FormItem>

                                    <div className="addressErrorTip">{addressTipMessage.machineNumber}</div>
                                    <div className="formItemLabel">
                                        所在省/市/区
                                    </div>
                                    <FormItem>
                                        {getFieldDecorator('address', {
                                            rules: [],
                                        })(
                                            <Region
                                                selectedValue={selectedRegion}
                                                onSelect={(value) => this.addressChange(value)}
                                            />
                                        )}
                                    </FormItem>


                                    <div className="addressErrorTip">{addressTipMessage.provincesId}</div>
                                    <div className="formItemLabel">
                                        详细地址
                                    </div>
                                    <FormItem style={{ height: '65px' }}>
                                        {getFieldDecorator('street', {
                                            rules: [],
                                        })(
                                            <textArea
                                                className="streetItem"
                                                maxLength={50}
                                                onChange={(value) => this.updateAddress('street', value, null, true)}
                                                placeholder="街道、楼牌号码"
                                                onBlur={this.checkWxScroll}
                                            />
                                        )}
                                    </FormItem>
                                    <div className="addressErrorTip">{addressTipMessage.street}</div>
                                    <Row>
                                        <Col span={20}>
                                            <div className="formItemLabel">
                                                设置为默认地址
                                        </div>
                                        </Col>
                                        <Col span={4}>
                                            <Switch
                                                onChange={(value) => this.updateAddress('state', value)}
                                                checked={newAddress.state == 1}
                                                disabled={newAddress.stateDisabled}
                                            />
                                        </Col>
                                    </Row>
                                    <div style={{ color: '#666666', fontSize: '14px' }}>
                                        设置默认地址后，每次结算会自动使用该地址
                                    </div>
                                </div>
                                <div style={{ paddingTop: '16px' }}>
                                    <Button onClick={() => this.saveNewAddress()} className="submitButton" style={{
                                        fontSsize:'18px',
                                        color:' #fff',
                                        backgroundColor: '#C8161D',
                                        border: 'unset',
                                        borderRadius: '5px',
                                        fontWeight: '300',
                                        width:'100%'
                                    }}>
                                        保存
                                    </Button>
                                </div>
                            </Form>
                        </div>
                        </Spin>
                    </Drawer>
                </div>
            </Spin>
        );
    }
}

AddressList = Form.create()(AddressList);
export default AddressList;
