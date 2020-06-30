import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Tooltip, Icon, Button, Spin, message, Modal } from 'antd';
import { List, Stepper } from 'antd-mobile';
import TabBar from '../common/TabBar';
import Title from '../common/Title';
import api from '../../api';
import './index.less';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});
const DrugIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_hcr150rk9zu.css',
});

const FREQUENCY = {
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [4, 1],
    5: [1, 1],
    6: [1, 7],
};

const DRUGSTATUS = {
    0: '正常',
    1: '缺货',
    2: '目录外',
    3: '停售'
}

@mount('requirementList')
class RequirementList extends Component {

    @prop()
    patientId;

    @prop()
    demandList;

    @prop()
    loading = true;

    async componentDidMount() {
        await this.init();
    }

    @action()
    async init() {
        try {
            const patient = await api.get(`/currentPatient`);
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/requirementList`)}`
            }
            this.patientId = patient.id;
            const demandList = await api.get(`/queryDemandList`, { patientId: this.patientId });
            this.demandList = demandList;
            this.loading = false;
        } catch (e) {
            this.loading = false;
            if (e.message) {
                message.error(e.message)
            } else {
                message.error("系统内部错误")
            }
        }

    }

    @action()
    async updateDrug(formId, val) {
        if (val > 0 && val < 1000) {
            const drugList = [... this.demandList];
            const drugIndex = drugList.findIndex(item => item.id === formId);
            let drug = { ...drugList[drugIndex] };
            drug.amount = val;
            drugList[drugIndex] = drug;
            this.demandList = drugList;
            await api.put(`/patients/${this.patientId}/requisitionForm/${formId}`, { amount: val });
        }
    }

    @action()
    async delDrug(formId) {
        await api.put(`/patients/${this.patientId}/requisitionForm/${formId}`, { isDelete: 1 });
        const demandList = await api.get(`/queryDemandList`, { patientId: this.patientId });
        this.demandList = demandList;
    }

    toUpdateUseNum() {
        this.props.history.push("/requirementListUseNum");
        this.init();
    }

    @action()
    toCheckPage() {
        const unUseDrug = [...this.demandList].find(drug => drug.status !== 0);
        if (unUseDrug) {
            Modal.error({
                title: `部分药品库存不足或已停售\t 请删除后继续`,
                okText: "确定",
            });
        } else {
            this.props.history.push("/check?page=1");
        }
    }

    toSearchDrug() {
        this.props.history.push("/medicineHomePage");
    }
    render() {
        let drugPrice = 0;
        const requirementList = this.demandList && this.demandList.length > 0 ? this.demandList.map((drug) => {
            let takeTime;
            const drugStats = drug.status;
            drugPrice += drugStats === 0 ? drug.amount * drug.priceCent : 0;
            if (drug.useAmount && drug.frequency) {
                takeTime = isNaN(drug.packageSize/ (drug.useAmount * drug.frequency) * drug.amount)
                    ? ''
                    : Math.ceil(drug.amount * drug.packageSize / (drug.useAmount * FREQUENCY[drug.frequency][0]))
                    * FREQUENCY[drug.frequency][1];
            }
            return (
                <Row key={drug.drugId}>
                    <Col span={8}>
                        <div className={drugStats === 0 ? '' : 'unUseImage'}>
                            {
                                drug.outerPackagePicUrl ? <img src={drug.outerPackagePicUrl} /> :
                                    <DrugIcon type="iconzhanweifu_tupian" style={{ fontSize: '83px', paddingTop: '12px' }} className="drugIcon" />
                            }
                            {
                                drugStats === 0 ? null : (
                                    <div className="disabledDrug">
                                        {DRUGSTATUS[drug.status]}
                                    </div>
                                )
                            }
                        </div>

                    </Col>
                    <Col span={16}>
                        <div className="closeButton">
                            <Icon type="close-circle" onClick={() => this.delDrug(drug.id)} style={{ fontSize: '20px', color: '#9A9A9A' }} />
                        </div>
                        <div className={drugStats === 0 ? "drugTitle" : "drugTitle disabledDrugItem"}>{drug.commonName}{drug.productName ? `(${drug.productName})` : ''}</div>
                        <div className={drugStats === 0 ? "standards" : "standards disabledDrugItem"}>{`${drug.preparationUnit}*${drug.packageSize}/${drug.packageUnit}`}</div>
                        <div className={drugStats === 0 ? "amount" : "amount disabledDrugItem"}>
                            ￥{(drug.priceCent / 100).toFixed(2)}
                        </div>
                        {drugStats === 0 ? (
                            <div className="stepper">
                                <Stepper
                                    showNumber
                                    max={999}
                                    min={1}
                                    defaultValue={drug.amount || 1}
                                    onChange={(val) => this.updateDrug(drug.id, val)}
                                    value={drug.amount}
                                />
                            </div>
                        ) : null}
                        {drugStats === 0 ? (
                            <div className="useDay">预计可用{takeTime}天</div>
                        ) : null}
                    </Col>
                </Row>
            );
        }) : null;
        drugPrice = (drugPrice / 100).toFixed(2);
        return (
            <div className="hasMenu">
                <Spin spinning={this.loading} style={{ height: '100%' }}>
                    <Title>用药登记</Title>
                    <div className="body" style={{ height: 'calc(100% - 120px)' }}>
                        <div className="requirementList">
                            {requirementList}
                            {requirementList ? (
                                <div>
                                    <div style={{ textAlign: 'right' }}>
                                        您可以<a onClick={() => this.toUpdateUseNum()} >点此调整用法用量</a>，重新估算可用天数
                                    </div>
                                    <div style={{ marginBottom: '36px', paddingTop: '38px' }}>
                                        <Tooltip
                                            placement="right"
                                            title="建议您按照60天用量购买，方便您使用。"
                                            visible={true}
                                        >
                                            <div style={{height:'80px',width: '80px'}}>
                                                <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '80px' }} />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div style={{ height: '120px' }}>

                                    </div>
                                </div>
                            ) : (
                                    <div className="defaultPage">
                                        <div>
                                            <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                                            <br />
                                            <span className="tip">您的用药需求空空如也</span>
                                            <br />
                                            <Button type="primary" onClick={() => this.toSearchDrug()}>去找药</Button>
                                        </div>
                                    </div>
                                )}

                        </div>
                    </div>
                    <div className="menu">
                        <TabBar {...this.props} />
                    </div>
                    {
                        requirementList && requirementList.length > 0 ? (
                            <div className="checkBox">
                                <Row>
                                    <Col span={14} >
                                        <span className="title">合计：</span>
                                        <span className="count">¥{drugPrice}</span>
                                    </Col>
                                    <Col span={10} className="checkButton">
                                        <Button onClick={this.toCheckPage}>
                                            用药登记{requirementList ? `(${requirementList.length})` : ''}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ) : null
                    }

                </Spin>
            </div>
        );
    }

}
export default RequirementList;
