import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Select, Spin, message, Icon } from 'antd';
import { Stepper } from 'antd-mobile';
import Title from '../common/Title';
import api from '../../api';
import querystring from 'query-string';
import '../../index.less'
const DrugIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_hcr150rk9zu.css',
});

const { Option } = Select;
//1=qd 每日一次 2=bid 每日两次 3=tid 每日三次 4=qid 每日四次 5=qn 每夜一次 6=qw 每周一次
const frequencyLst = [
    { id: "1", label: '每日一次' },
    { id: "2", label: '每日两次' },
    { id: "3", label: '每日三次' },
    { id: "4", label: '每日四次' },
    { id: "5", label: '每夜一次' },
    { id: "6", label: '每周一次' },
]
@mount('requirementListUseNum')
class RequirementListUseNum extends Component {

    @prop()
    patientId;

    @prop()
    demandList;

    @prop()
    loading = true;

    @prop()
    list;

    async componentDidMount() {
        await this.initDrugs();
    }

    @action()
    async initDrugs() {
        const patient = await api.get(`/currentPatient`);
        this.patientId = patient.id;
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        if (queryData && queryData.list) {
            this.list = queryData.list;
            this.demandList = JSON.parse(this.list).map(item => ({...item, id: item.drugId}));
            this.loading = false;
        } else {
            try {
                const demandList = await api.get(`/queryDemandList`, { patientId: patient.id });
                this.demandList = demandList;
            } catch (e) {
                if (e.message) {
                    message.error(e.message)
                } else {
                    message.error("系统内部错误")
                }
            }
            this.loading = false;
        }
    }



    @action()
    async updateDrug(formId, param, val) {
        if (param === 'useAmount') {
            let data = val * 10;
            if (data % 5 !== 0) {
                data = (5 - data % 5) < 3 ? data + (5 - data % 5) : (data - data % 5);
                val = (data / 10).toFixed(1);
            }
        }
        const drugList = [... this.demandList];
        const drugIndex = drugList.findIndex(item => item.id === formId);
        let drug = { ...drugList[drugIndex] };
        drug[param] = val;
        drugList[drugIndex] = drug;
        this.demandList = drugList;
    }

    @action()
    async saveUseNum() {
        if (this.list) {
            this.loading = true;
            this.props.history.push(`/orderCommonList?page=2&list=${JSON.stringify(this.demandList)}`);
        } else {
            this.loading = true;
            await Promise.all(this.demandList.map(async (element) => {
                await api.put(`/patients/${this.patientId}/requisitionForm/${element.id}`,
                    {
                        useAmount: element.useAmount || 1,
                        frequency: element.frequency
                    });
                return element;
            }))
            this.props.history.push("/requirementList");
        }
    }

    render() {
        const requirementList = this.demandList && this.demandList.length > 0 ? this.demandList.map((drug) => {

            return (
                <Row key={drug.drugId}>
                    <Col span={8}>
                        {drug.outerPackagePicUrl ? <img src={drug.outerPackagePicUrl} /> :
                            <DrugIcon type="iconzhanweifu_tupian" style={{ fontSize: '82px', paddingTop: '12px' }} className="drugIcon" />
                        }
                    </Col>
                    <Col span={16}>
                        <div className="drugTitle" style={{ marginRight: '16px' }}>{drug.commonName}{drug.productName ? `(${drug.productName})` : ''}</div>
                        <div className="standards">{`${drug.preparationUnit}*${drug.packageSize}/${drug.packageUnit}`}</div>
                        <div style={{ paddingTop: '15px', paddingLeft: '11px' }}>
                            <span className="useNumText">用法</span>
                            <Select defaultValue={`${drug.frequency}`} onChange={(val) => this.updateDrug(drug.id, 'frequency', val)}>
                                {frequencyLst.map(item => (
                                    <Option key={item.id} value={item.id}>{item.label}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="stepper useNum" style={{ position: 'unset', textAlign: 'left', paddingTop: '15px', paddingLeft: '11px' }}>
                            <span className="useNumText">每次吃</span>
                            <Stepper
                                showNumber
                                max={99}
                                min={0.5}
                                value={drug.useAmount || 1}
                                onChange={(val) => this.updateDrug(drug.id, 'useAmount', val)}
                                step={0.5}
                            />
                            <span className="useNumText">{drug.minimumUnit}</span>
                        </div>
                    </Col>
                </Row>
            );
        }) : null;
        return (
            <div className="hasMenu">
                <Spin spinning={this.loading}>
                    <Title>用法用量</Title>
                    <div className="body">
                        <div className="requirementList">
                            {requirementList}
                        </div>
                        <div style={{ height: '64px', width: '100%' }}>

                        </div>
                    </div>
                    <div className="menu" style={{ padding: '0px 16px 16px 16px', height: '64px' }}>
                        <Button type="primary" className="submitButton" onClick={() => this.saveUseNum()}>保存</Button>
                    </div>
                </Spin>
            </div>
        );
    }

}
export default RequirementListUseNum;
