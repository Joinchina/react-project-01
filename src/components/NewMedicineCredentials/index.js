import React, { Component } from 'react';
import { Row, Col, Button, message, Select, Icon } from 'antd';
import { List, DatePicker, ImagePicker, Toast } from 'antd-mobile';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import lrz from 'lrz';
import api from '../../api';
import Title from '../common/Title';
import './index.less'
import querystring from 'querystring';

const Option = Select.Option;

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_mqklq2h0zn.js',
});

const DrugIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_hcr150rk9zu.css',
});

@mount('newMedicineCredentials')
class NewMedicineCredentials extends Component {

    @prop()
    fileList = [];

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            searchList: [],
            hosList: [],
            demandList: [],
            selectHosId: '',
        }
    }

    async componentDidMount() {
        try {
            const patient = await api.get(`/currentPatient`);
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            const hosList = await api.get(`/hospital`, { where: { cityId: 340200 } });
            this.setState({
                hosList,
                patientId: patient.id
            })
        } catch (e) {
            message.error(e.message)
        }
    }

    async handleSearch(value) {
        if (value) {
            try {
                const drugList = await api.get(`/warehouses`, { search: value })
                this.setState({
                    searchList: drugList
                })
            } catch (e) {
                this.setState({ searchList: [] });
                message.error(e.message)
            }
        } else {
            this.setState({ searchList: [] });
        }
    };

    handleChange(value) {
        const { demandList, searchList } = this.state;
        this.setState({
            demandList: [searchList[value], ...demandList]
        })
    };

    formatDate(date) {
        /* eslint no-confusing-arrow: 0 */
        const pad = n => n < 10 ? `0${n}` : n;
        const dateStr = `${pad(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        /* const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`; */
        return `${dateStr}`;
    }

    @action()
    async onFileChange(files, type, index) {
        Toast.loading("文件上传中...", 600);
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
        Toast.hide();
        this.loading = false;
    };

    onChange(value) {
        this.setState({
            selectHosId: value
        })
    }

    handleBlur() {
        this.setState({ searchList: [] })
    }

    delDrug(data) {
        const { demandList } = this.state;
        const delIndex = demandList.findIndex(i => i.drug === data)
        demandList.splice(delIndex, 1);
        this.setState({
            demandList
        })
    }

    changeAmount(id, item) {
        const { demandList } = this.state;
        const changeIndex = demandList.findIndex(i => i.drugId === id)
        if (item < 0) {
            demandList[changeIndex].amount = demandList[changeIndex].amount ? demandList[changeIndex].amount - 1 > 0 ? demandList[changeIndex].amount - 1 : demandList[changeIndex].amount : 1
        } else {
            demandList[changeIndex].amount = demandList[changeIndex].amount ? demandList[changeIndex].amount + 1 < 99 ? demandList[changeIndex].amount + 1 : demandList[changeIndex].amount : 2
        }
        this.setState({
            demandList
        })
    }

    async subDrugOrder() {
        const { date, demandList, selectHosId } = this.state;
        let orderPicture = '';
        let drugList = []
        if (!demandList.length) {
            message.error('请选择购药清单')
            return;
        } else {
            drugList = demandList.map((i) => ({ drugId: i.drugId, amount: i.amount || 1 }))
        }
        if (!selectHosId) {
            message.error('请选择购药机构')
            return;
        }
        if (!date) {
            message.error('请选择购药时间')
            return;
        }
        if (this.fileList.length) {
            this.fileList.map(item => {
                orderPicture += orderPicture ? ',' + item.urlPath : item.urlPath;
                return item.urlPath;
            });
        } else {
            message.error('请选择购药凭证')
            return;
        }
        let cyear = ''
        let cmonth = ''
        let cday = ''
        if (date) {
            cyear = date.getFullYear()
            cmonth = date.getMonth() + 1
            cday = date.getDate()
        }
        const where = {
            "buyDate": `${cyear}-${cmonth}-${cday}`,
            "hospitalId": selectHosId,
            "drugs": drugList,
            "pictures": orderPicture
        }
        try {
            await api.post(`/patients/${this.state.patientId}/purchaseVoucher`, where)
            if (this.props.location.search) {
                const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
                const q = querystring.parse(qs);
                const { r } = q;
                if (r) {
                    if (r.indexOf('/insuranceList') >=0 || r.indexOf('/insurances') >= 0) {
                        message.success('保障服务激活成功')
                    } else {
                        message.success('保存购药凭证成功')
                    }
                    this.props.history.go(-1);
                } else {
                    message.success('保存购药凭证成功')
                    this.props.history.push('/newHealthHomePage')
                }
            } else {
                message.success('保存购药凭证成功')
                this.props.history.push('/newHealthHomePage')
            }
        } catch (e) {
            message.error(e.message)
        }
    }

    render() {
        const { demandList, hosList, searchList } = this.state;
        const options = searchList.length && searchList.map((d, index) => <Option key={index} style={{ borderBottomWidth: 1, borderBottomColor: '#e8e8e8', borderBottomStyle: 'solid', height: 60 }}><div className='selectListSty'><div><span style={{ fontSize: 16, color: '#222222' }}>{d.commonName}{d.productName ? `(${d.productName})` : ''}</span><span style={{ fontSize: 14, color: '#666666', marginLeft: 10 }}>{`${d.preparationUnit}*${d.packageSize}${d.minimumUnit}`}</span></div><p style={{ fontSize: 16, color: '#222222' }}>{d.producerName}</p></div></Option>);
        const hosOptions = hosList.length && hosList.map((i) => <Option key={i.id} value={i.id}>{i.name}</Option>)
        return (
            <div className="hasMenu newMedicineCredentials">
                <Title>购药凭证</Title>
                <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderWidth: 1, borderStyle: 'solid', borderColor: '#e8e8e8' }}>
                    <Select
                        showSearch
                        value={this.state.value}
                        style={{ width: '100%' }}
                        placeholder='搜索药品'
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        filterOption={false}
                        onSearch={this.handleSearch.bind(this)}
                        onChange={this.handleChange.bind(this)}
                        onBlur={this.handleBlur.bind(this)}
                        notFoundContent={null}
                        className="drugSearchSty"
                        dropdownStyle={{ maxHeight: 240, overflow: 'hidden' }}
                        allowClear
                    >
                        {options}
                    </Select>
                    <i className="iconfont newMedIconSty">&#xe623;</i>
                </div>
                <div className="requirementList" style={{ marginTop: 16, marginBottom: 28 }}>
                    <p
                        style={{ color: '#333333', fontSize: 18, fontWeight: 'bold' }}
                    >
                        购药清单
                    </p>
                    {demandList.length > 0 ? demandList.map((drug) => {
                        return (
                            <Row key={drug.drugId}>
                                <Col span={8}>
                                    <div className='unUseImage' style={{ height: 120 }}>
                                        {
                                            drug.outerPackagePicUrl ? <img src={drug.outerPackagePicUrl} /> :
                                                <DrugIcon type="iconzhanweifu_tupian" style={{ fontSize: '83px', marginTop: 20 }} className="drugIcon" />
                                        }
                                    </div>

                                </Col>
                                <Col span={16}>
                                    <div className="closeButton">
                                        <Icon type="close-circle" onClick={() => this.delDrug(drug.id)} style={{ fontSize: '20px', color: '#9A9A9A' }} />
                                    </div>
                                    <div className="drugTitle">{drug.commonName}{drug.productName ? `(${drug.productName})` : ''}</div>
                                    <div className="standards">{`${drug.preparationUnit}*${drug.packageSize}${drug.minimumUnit}/${drug.packageUnit}`}</div>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
                                        <span
                                            style={{ fontSize: 20, fontWeight: 'bold', padding: 2 }}
                                            onClick={() => this.changeAmount(drug.drugId, -1)}
                                        >
                                            －
                                        </span>
                                        <span style={{ color: '#333333', fontSize: 16, paddingLeft: 9, paddingRight: 9, paddingTop: 2, paddingBottom: 2, borderWidth: 1, borderColor: '#E8E8E8', borderStyle: 'solid', marginLeft: 10, marginRight: 10 }}>
                                            {drug.amount || 1}
                                        </span>
                                        <span
                                            style={{ fontSize: 20, fontWeight: 'bold', padding: 2 }}
                                            onClick={() => this.changeAmount(drug.drugId, 1)}
                                        >
                                            ＋
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        )
                    }) : (
                            <div style={{ textAlign: 'center' }}>
                                <MyIcon type="iconzhanweifu_wugouyaojilu" style={{ fontSize: '120px' }} />
                            </div>
                        )}
                </div>
                <div className='dateSelectSty pd16'>
                    <p
                        style={{ color: '#333333', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}
                    >
                        购药时间
                    </p>
                    <DatePicker
                        mode="date"
                        title="请选择时间"
                        extra="请选择时间"
                        format={val => `${this.formatDate(val)}`}
                        value={this.state.date}
                        onChange={date => this.setState({ date })}
                        style={{ borderRadius: 6 }}
                    >
                        <List.Item arrow="horizontal"> </List.Item>
                    </DatePicker>
                </div>
                <div className="pd16 hosSelectSty" style={{ marginTop: 28 }}>
                    <p
                        style={{ color: '#333333', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}
                    >
                        购药机构
                    </p>
                    <Select
                        showSearch
                        style={{ width: '100%', height: 40 }}
                        placeholder="请选择购药机构"
                        optionFilterProp="children"
                        onChange={this.onChange.bind(this)}
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {hosOptions}
                    </Select>
                </div>
                <div className="pd16" style={{ marginTop: 28, marginBottom: 29 }}>
                    <p
                        style={{ color: '#333333', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}
                    >
                        购买凭证照片
                        <span style={{ color: '#222222', fontSize: 16, fontWeight: 'normal' }}>（医院收据、药店购物小票）</span>
                    </p>
                    <ImagePicker
                        length="4"
                        files={this.fileList}
                        onChange={(files, operationType, index) => this.onFileChange(files, operationType, index)}
                        selectable={this.fileList && this.fileList.length < 5}
                        multiple
                    />
                </div>
                <div style={{ height: 50 }} />
                <div className='pd16' style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        className="subBtnSty"
                        onClick={() => this.subDrugOrder()}>
                        提交
                    </Button>
                </div>
            </div>
        )
    }
}

export default NewMedicineCredentials;
