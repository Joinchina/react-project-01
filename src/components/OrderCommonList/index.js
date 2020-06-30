import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Row, Col, Icon, Button, Spin, message } from 'antd';
import { Stepper, Modal } from 'antd-mobile';
import Comlon from '../common/Comlon';

import Title from '../common/Title';
import api from '../../api';
import querystring from 'query-string';
import './index.less'
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});
const DrugIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_hcr150rk9zu.css',
});
const DRUGSTATUS = {
    0: '正常',
    1: '缺货',
    2: '目录外',
    3: '停售'
}
const alert = Modal.alert;
const FREQUENCY = {
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [4, 1],
    5: [1, 1],
    6: [1, 7],
};

@mount('orderCommonList')
export default class OrderCommonList extends Component {

    @prop()
    patientId;

    @prop()
    demandList;

    @prop()
    loading = true;

    @prop()
    userInfo;

    @prop()
    page = 1;

    @prop()
    list;

    @prop()
    currentList;

    @prop()
    canAdd = true;

    constructor() {
        super();
        this.state = {
            canSub: true,
        }
    }

    async componentDidMount() {
        await this.init();
    }

    @action()
    async init() {
        try {
            const userInfo = await api.get(`/currentPatient`);
            if (!userInfo) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            this.patientId = userInfo.id;
            const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            const queryData = querystring.parse(qs);
            const { page, list, currentList } = queryData || {};
            this.page = page;
            this.list = list;
            this.currentList = currentList;
            let demandList = []
            if(this.page == 1){
                demandList = await api.get(`/queryOrderCommonList`, { patientId: this.patientId });
            }else{
                demandList = JSON.parse(this.list);
            }
            if(this.currentList){
                demandList = JSON.parse(this.currentList);
            }
            this.userInfo = userInfo;
            this.demandList = demandList;
        } catch (e) {
            console.error(e);
            if (e.message) {
                message.error(e.message)
            } else {
                message.error("系统内部错误")
            }
        }
        this.loading = false;
    }

    @action()
    async updateDrug(formId, val) {
        if (val > 0 && val < 1000) {
            const drugList = [... this.demandList];
            const drugIndex = drugList.findIndex(item => item.drugId === formId);
            let drug = { ...drugList[drugIndex] };
            drug.amount = val;
            drugList[drugIndex] = drug;
            this.demandList = drugList;
        }
    }

    async showAlert() {
        await this.setStatePromise({canSub: false})
        const that = this;
        alert('常用药已加入需求单', `下一步您希望是`, [
          { text: '查看需求单', onPress: () => {that.setState({canSub: true}); this.props.history.push('/requirementList')} },
          { text: '找其他药', onPress: () => {that.setState({canSub: true}); that.toSearchDrug()} },
        ]);
    };

    setStatePromise(data) {
        return new Promise((fulfill, reject) => {
            this.setState(data, fulfill);
        })
    }

    // 添加药品至需求单
    @action()
    async addDrug() {
        try {
            const result = await api.get(`/checkPatient`)
            if (!result) {
                window.location.href = '/user/bind'
                this.canAdd = false;
            } else {
                this.canAdd = true;
            }
        } catch (e) {
            this.canAdd = false;
            message.error(e.message)
        }
        if (!this.canAdd) return;
        this.canAdd = false;
        const isSuc = [];
        this.demandList.map(async (item, index) => {
            try {
                await api.post(`/addDrugToDemand`, {
                    drugId: item.drugId,
                    frequency: item.frequency,
                    useAmount: item.useAmount,
                    amount: item.amount,
                    patientId: this.patientId,
                })
                isSuc[index] = 1
            } catch (e) {
                isSuc[index] = 2
                message.error(e.message);
                this.canAdd = true;
            }
            isSuc.filter(d=>d);
            if (isSuc.length === this.demandList.length && this.state.canSub && isSuc.indexOf(2) < 0) {
                this.showAlert()
            }
        })
    }

    toUpdateUseNum() {
        this.props.history.push(`/requirementListUseNum?list=${JSON.stringify(this.demandList)}`);
        this.init();
    }

    toSearchDrug() {
        this.props.history.push("/medicineHomePage");
    }

    check() {
        this.props.history.push(`/check?page=2&list=${JSON.stringify(this.demandList)}`);
    }

    setVipDay() {
        window.location.href = "/vipDay"
    }

    renderSubBtn() {
        return (
            <div className="subBtnBox" style={{ zIndex: 333 }}>
                <div className="subBtn-left" style={{ backgroundColor: '#F48E18' }} onClick={() => this.addDrug()}>
                    <i className='iconfont'>&#xe629;</i>
                    <span className="btn-text-left">加入需求单</span>
                </div>
                <div className="subBtn-right" style={{ backgroundColor: '#C8161D' }} onClick={() => this.check()}>
                    <i className='iconfont'>&#xe684;</i>
                    <span className="btn-text-right">一键结算</span>
                </div>
            </div>
        )
    }

    @action()
    async delDrug(formId) {
        this.demandList = this.demandList.filter(item => item.drugId !== formId);
        this.props.history.push(`/orderCommonList?currentList=${JSON.stringify(this.demandList)}&page=1`);
    }

    render() {
        let drugPrice = 0;
        const requirementList = this.demandList && this.demandList.length > 0 ? this.demandList.map((drug) => {
            let takeTime;
            const drugStatus = drug.status;
            drugPrice += drug.amount * drug.priceCent;
            drugPrice = (drugPrice / 100).toFixed(2);
            if (drug.useAmount && drug.frequency) {
                takeTime = isNaN(drug.packageSize / (drug.useAmount * drug.frequency) * drug.amount)
                    ? ''
                    : Math.ceil(drug.amount * drug.packageSize / (drug.useAmount * FREQUENCY[drug.frequency][0]))
                    * FREQUENCY[drug.frequency][1];
            }
            return (
                <Row key={drug.drugId}>
                    <Col span={8}>
                        <div className={drugStatus === 0 ? '' : 'unUseImage'}>
                            {
                                drug.outerPackagePicUrl ? <img src={drug.outerPackagePicUrl} /> :
                                    <DrugIcon type="iconzhanweifu_tupian" style={{ fontSize: '83px', paddingTop: '12px' }} className="drugIcon" />
                            }
                            {
                                drugStatus === 0 ? null : (
                                    <div className="disabledDrug">
                                        {DRUGSTATUS[drug.status]}
                                    </div>
                                )
                            }
                        </div>
                    </Col>
                    <Col span={16}>
                        <div className="closeButton">
                            <Icon type="close-circle" onClick={() => this.delDrug(drug.drugId)} style={{ fontSize: '20px', color: '#9A9A9A' }} />
                        </div>
                        <div className={drugStatus === 0 ? "drugTitle" : "drugTitle disabledDrugItem"}>{drug.commonName}{drug.productName ? `(${drug.productName})` : ''}</div>
                        <div className={drugStatus === 0 ? "standards" : "standards disabledDrugItem"}>{`${drug.preparationUnit}*${drug.packageSize}/${drug.packageUnit}`}</div>
                        <div className={drugStatus === 0 ? "amount" : "amount disabledDrugItem"}>
                            ￥{(drug.priceCent / 100).toFixed(2)}
                        </div>
                        {drugStatus == 0 ? <div className="stepper">
                            <Stepper
                                showNumber
                                max={999}
                                min={1}
                                defaultValue={drug.amount || 1}
                                onChange={(val) => this.updateDrug(drug.drugId, val)}
                            />
                        </div> : null}
                        {drugStatus == 0 ? <div className="useDay">预计可用{takeTime}天</div> : null}
                    </Col>
                </Row>
            );
        }) : null;
        return (
            <div className="hasMenu">
                <Spin spinning={this.loading} style={{ height: '100%' }}>
                    <Title>续订</Title>
                    <Comlon {...this.props} />
                    {/* {this.userInfo ? <div className='orderCommonBanner'>
                        <div style={{ display: 'flex', flexDirection: 'column'}}>
                            <span style={{ fontSize: 18, color: '#DF4026', lineHeight: '26px' }}>设置会员日</span>
                            <span style={{ fontSize: 22, color: '#DF4026', fontWeight: 'bold', lineHeight: '26px'}}>领取额外福利</span>
                        </div>
                        <div style={{ width: 80, height: 30, fontSize: 16, color: '#FFFFFF', backgroundColor: '#F48E18', borderRadius: 15, lineHeight: '30px', textAlign: 'center'}} onClick={() =>this.setVipDay()}>去设置</div>
                    </div> : null} */}
                    <div className="body" style={{ marginBottom: 0 }}>
                        <div className="requirementList" style={{ marginTop: 0 }}>
                            {requirementList}
                            {requirementList ? (
                                <div>
                                    <div style={{ textAlign: 'right' }}>
                                        您可以<a onClick={() => this.toUpdateUseNum()} >点此调整用法用量</a>，重新估算可用天数
                                    </div>
                                </div>
                            ) : (
                                    <div className="defaultPage">
                                        <div>
                                            <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                                            <br />
                                            <span className="tip">没有您最近的用药数据</span>
                                            <br />
                                            <Button type="primary" style={{ width: 100 ,height: 36, borderRadius: 18 }} onClick={() => this.toSearchDrug()}>去找药</Button>
                                        </div>
                                    </div>
                                )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', paddingRight: 16, backgroundColor: '#f8f8f8', paddingLeft: 16, marginTop: 30, marginBottom: requirementList ? 80 : 0 }}>
                            <i className="iconfont" style={{ fontSize: 14, marginRight: 7 }}>&#xe64a;</i>
                            <p style={{ textAlign: 'left', fontSize: 14, color: '#666666' }}>万户健康倡导慢病患者定期、定量购买和使用药品，并根据您近期用药记录，在“常用药”内自动生成常用药清单，建议您按照60天用量购买，方便您使用。</p>
                        </div>
                        <div style={{ height: 120 }} />
                        {requirementList ? this.renderSubBtn() : null}
                    </div>
                </Spin>
            </div>
        );
    }

}
