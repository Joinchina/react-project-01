import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Row, Col, Button, Select, Spin, message, Icon, Modal } from 'antd';
import { Stepper } from 'antd-mobile';
import api from '../../api';
import Title from '../common/Title';
import './index.less';
import pic_6 from './images/pic_6.png';
import pic_7 from './images/pic_7.png';
import noPic from './images/noPic.png';
import querystring from 'query-string';
const Option = Select.Option;

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});

const frequencyLst = [
    { id: "1", label: '每日一次' },
    { id: "2", label: '每日两次' },
    { id: "3", label: '每日三次' },
    { id: "4", label: '每日四次' },
    { id: "5", label: '每夜一次' },
    { id: "6", label: '每周一次' },
]

@mount('evaluationDrugInfo')
export default class EvaluationDrugInfo extends Component {

    @prop()
    diseases

    constructor(props){
        super(props)
        this.state = {
            drugList: [],
            loading: true,
        }
    }

    async componentDidMount() {
        const { drugList } = this.state;
        let defaultDrug = null;
        let serviceList = null;
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        const patient = await api.get(`/currentPatient`);
        const storageDrugs = window.localStorage.getItem('evaluationDrugs') || "[]";
        const isUseOld = window.localStorage.getItem('isUseOld')
        if (!patient) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
        }
        try{
            defaultDrug = await api.get('/getDefaultDrugList', { patientId: patient.id })
            serviceList = await api.get(`/patient/insurance_order/inservice`, {patientId: patient.id})
        }catch(err){
            console.log(err.message)
        }
        if (queryData.select) {
            this.setState({
                drugList: JSON.parse(storageDrugs),
            })
        } else {
            if(storageDrugs && JSON.parse(storageDrugs) && JSON.parse(storageDrugs).length && isUseOld == 1){
                window.localStorage.setItem('evaluationDrugs', storageDrugs)
                this.setState({
                    drugList: JSON.parse(storageDrugs),
                })
            }
        }
        this.setState({patientInfo: patient, loading: false, serviceList})
    }

    updateDrug(id, param, val) {
        const { drugList } = this.state;
        if (param == 'frequency') {
            const indexNow = drugList.findIndex(i => i.baseDrugId == id)
            drugList[indexNow].frequency = val
        } else if(param == 'useAmount'){
            const indexNow = drugList.findIndex(i => i.baseDrugId == id)
            drugList[indexNow].useAmount = val
        } else if(param == 'isUse') {
            const indexNow = drugList.findIndex(i => i.baseDrugId == id)
            drugList[indexNow].isUse = val
        } else if(param == 'isdelete') {
            const indexNow = drugList.findIndex(i => i.baseDrugId == id)
            drugList.splice(indexNow, 1)
        }
        window.localStorage.setItem('evaluationDrugs', JSON.stringify(drugList))
        this.setState({
            drugList,
        })
    }

    addDrug() {
        window.localStorage.setItem('evaluationDrugs', JSON.stringify(this.state.drugList))
        this.props.history.push('/evaluationDrugSearch')
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    async submit() {
        const { patientInfo, drugList, serviceList } = this.state;
        const ispinggu = serviceList && serviceList.length ? serviceList.find(i => i.products.length ? i.products.find(j => j.insuranceProductType == 3) : null) : false;
        const nowInsuranceId = ispinggu && ispinggu.products && ispinggu.products.length ? ispinggu.products.find(i => i.insuranceProductType == 3) : null;
        await this.setPromise({ loading: true })
        const nowdruglist = []
        if (!drugList.length) {
            message.error('待评估药品为空，无法评估，请先添加药品');
            await this.setPromise({ loading: false })
            return;
        }
        const iscomplete = drugList.length && drugList.find(i => i.isUse != 1 && i.isUse != 2);
        const diseases = window.localStorage.getItem('diseases') || "[]";
        const nowdiseases = JSON.parse(diseases)
        if(!nowdiseases.length){
            Modal.warn({
                content: '请您重新填写核对评估信息后，再获取报告',
                okText: '确定',
                onOk: async () => {
                    this.props.history.push('/evaluationPatient')
                },
            });
            return;
        }
        const newdiseasesList = [];
        if(nowdiseases && nowdiseases.length){
            nowdiseases.map(item => {
                const i = {}
                i.diseaseName = item.name
                i.diseaseId = item.id
                newdiseasesList.push(i)
            })
        }
        if (iscomplete) {
            message.error('请完善药品信息');
            await this.setPromise({ loading: false })
            return;
        }
        drugList.length && drugList.map(item =>{
            let iobj = {}
            iobj.baseDrugId = item.baseDrugId
            iobj.useAmount = item.useAmount
            iobj.frequency = item.frequency
            iobj.isUse = item.isUse
            nowdruglist.push(iobj);
        })
        const data = {
            patientName: patientInfo.name,
            age: (new Date().getFullYear()) - (new Date(patientInfo.birthday).getFullYear()),
            gender: patientInfo.sex ? '男' : '女',
            drugList: nowdruglist,
            diseaseList: newdiseasesList,
            insuranceOrderProductId: nowInsuranceId ? nowInsuranceId.insuranceProductId : null,
        }
        try{
            const res = await api.post(`/submitEvaluation/${patientInfo.id}`, data)
            window.localStorage.removeItem('isUseOld')
            window.localStorage.removeItem('diseases')
            window.localStorage.removeItem('evaluationDrugs')
            await this.setPromise({ loading: false })
            this.props.history.push(`/evaluationResult?${res}`)
        }catch(err){
            message.error(err.message)
            await this.setPromise({ loading: false })
        }
    }

    render() {
        const { drugList, loading } = this.state;
        return (
            <div className="hasMenu drug_evaluation evaluation_drug_info">
                <Spin spinning={loading}>
                    <Title>参评药品信息</Title>
                    <div className='topbox'>
                        <div style={{ width: 75, height: 66, marginRight: 12 }}><img src={pic_6} className='top_box_pic' /></div>
                        <div className='top_box_1'>
                            <p className="top_explain_info">【参评药品】既可以是您的在用药品，也可以是因病情变化而计划新增的药品，我们均可为之提供详细的综合用药风险评估</p>
                        </div>
                    </div>
                    {drugList && drugList.length ? drugList.map((i) => {
                        let name = '';
                        if (i.commonName && i.productName) {
                            name = `${i.commonName}(${i.productName})`
                        } else if (i.commonName && !i.productName) {
                            name = i.commonName;
                        } else if (!i.commonName && i.productName) {
                            name = i.productName
                        }
                        return (
                            <div className="drug_box" key={i.baseDrugId}>
                                <div className='drug_box_1'>
                                    <div>
                                        <img src={i.outerPackagePicUrl || noPic} className='drug_pic_sty' />
                                    </div>
                                    <div className='drug_info'>
                                        <span className='drug_name_sty'>{name}</span>
                                        <span className='drug_text_sty' style={{ marginBottom: 12, marginTop: 8 }}>{`${i.preparationUnit}*${i.packageSize}${i.minimumUnit}/${i.packageUnit}`}</span>
                                        <span className='drug_text_sty'>{i.producerName}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: 24, marginLeft: 30 }}>
                                    <span style={{ fontSize: 16, color: '#666666' }}>每日频次：</span>
                                    <Select defaultValue={`${i.frequency}`} onChange={(val) => this.updateDrug(i.drugId || i.baseDrugId, 'frequency', val)}>
                                        {frequencyLst.map(item => (
                                            <Option key={item.id} value={item.id}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </div>
                                <div style={{ marginTop: 12, marginBottom: 12, marginLeft: 30 }}>
                                    <span style={{ fontSize: 16, color: '#666666' }}>每次服用：</span>
                                    <Stepper
                                        showNumber
                                        max={99}
                                        min={0.5}
                                        value={i.useAmount}
                                        onChange={(val) => this.updateDrug(i.baseDrugId, 'useAmount', val)}
                                        step={0.5}
                                    />
                                </div>
                                <div style={{ marginLeft: 30, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                    <span style={{ fontSize: 16, color: '#666666' }}>是否在用：</span>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1}}>
                                        <span
                                            style={{ width: '48%', height: 30, fontSize: 16, textAlign: 'center', lineHeight: '30px', color: i.isUse == 1 ? '#C8161D' : '#222222', borderColor: i.isUse == 1 ? '#C8161D' : '#B2B2B2', borderWidth: 1, borderStyle: 'solid', borderRadius: 4, marginRight: 8}}
                                            onClick={() => this.updateDrug(i.baseDrugId, 'isUse', 1)}
                                        >
                                            服用中
                                        </span>
                                        <span
                                            style={{ width: '48%', height: 30, fontSize: 16, textAlign: 'center', lineHeight: '30px', borderWidth: 1, borderStyle: 'solid', borderColor: i.isUse == 2 ? '#C8161D' : '#B2B2B2', borderRadius: 4, color: i.isUse == 2 ? '#C8161D' : '#222222'}}
                                            onClick={() => this.updateDrug(i.baseDrugId, 'isUse', 2)}
                                        >
                                            计划新增
                                        </span>
                                    </div>
                                </div>
                                <div
                                    style={{ position: 'absolute', top: 2, right: 2 }}
                                    onClick={() => this.updateDrug(i.baseDrugId, 'isdelete')}
                                >
                                    <img src={pic_7} />
                                </div>
                            </div>
                        )
                    }) : <div className="newNoDrugsList">
                        <div className="new-no-drug-imgbox">
                            <MyIcon type="iconzhanweifu_wuciyaopin" style={{ fontSize: '120px', marginBottom: '9px' }} />
                            <p className="noSearchListText">您暂无药品信息，请点击"添加药品"</p>
                        </div>
                    </div>}
                    {!drugList || !drugList.length ? null : <p style={{ fontSize: 14, color: '#666666', marginLeft: 30, marginRight: 20 }}>每日服用的数量单位为包装所注最小单位，如：片、粒等</p>}
                    {!drugList || !drugList.length ? null : <div style={{ flex: 1, height: 70 }} />}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: '#f8f8f8', width: '100%', position: 'fixed', bottom: 0}}>
                        <span
                            style={{ backgroundColor: '#F48E18', fontSize: 18, color: '#ffffff', height: 44, lineHeight: '44px', textAlign: 'center', marginRight: 12, borderRadius: 6, paddingLeft: 16, paddingRight: 16}}
                            onClick={() => this.addDrug()}
                        >
                            添加药品
                        </span>
                        <span
                            style={{ backgroundColor: '#C8161D', color: '#ffffff', fontSize: 18, height: 44, lineHeight: '44px', textAlign: 'center', borderRadius: 6, flex: 1}}
                            onClick={() => this.submit()}
                        >
                            保存并获取评估报告
                        </span>
                    </div>
                </Spin>
            </div>
        )
    }
}
