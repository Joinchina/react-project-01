import React from 'react';
import mount, { prop } from '@wanhu/react-redux-mount';
import { Icon, message } from 'antd';
import Title from '../common/Title';
import './index.less';
import api from '../../api';
import { centToYuan, refundRountCentPercentToCent } from '../../helper/money';
import nopic from './nopic.png'

function getDefaultTarget() {
    return window;
}

@mount('newDrugDetail')
class NewDrugDetail extends React.Component {

    @prop()
    drugId

    @prop()
    isSale

    @prop()
    hospitalId

    @prop()
    patientId

    constructor() {
        super();
        this.state = {
            loaded: true,
            addedNum: 0,
            info: null,
            aa: 0,
        }
    }

    async componentDidMount() {
        window.sessionStorage.setItem('page', '2')
        this.queryDetail(this.drugId)
        if (this.patientId && this.patientId !== '不存在') {
            this.getQueryListNum()
        }
    }

    // 选择替换药品
    async choseBetter(i) {
        await this.setState({
            loaded: true,
        })
        this.queryDetail(i.drugId || i.baseDrugId)
        if (this.patientId && this.patientId !== '不存在') {
            this.getQueryListNum()
        }
    }

    // 获取药品详情
    async queryDetail(id) {
        if (this.isSale == 1) {
            try {
                const result = await api.get(`/getHosDrugDetail`, { drugId: id, hospitalId: this.hospitalId })
                this.setState({
                    loaded: false,
                    info: result,
                })
            } catch (e) {
                console.error('getDetailError', e)
                message.error(e.message)
            }
        } else if (this.isSale == 2) {
            try {
                const result = await api.get(`/getBasisDrugDetail`, { baseDrugId: id })
                this.setState({
                    loaded: false,
                    info: result,
                })
            } catch (e) {
                console.error('getDetailError', e)
                message.error(e.message)
            }
        }
    }

    // 添加药品至需求单
    async addDrug() {
        const { info } = this.state;
        let canAdd = true;
        try {
            const result = await api.get(`/checkPatient`)
            if (!result) {
                window.location.href = '/user/bind'
                canAdd = false;
            } else {
                canAdd = true;
            }
        } catch (e) {
            canAdd = false;
            message.error(e.message)
        }
        if (!canAdd) return;
        if (info.status !== 0) return;
        try {
            await api.post(`/addDrugToDemand`, {
                drugId: this.drugId,
                frequency: info.frequency,
                useAmount: info.useAmount,
                amount: 1,
                patientId: this.patientId,
            })
            message.success('添加成功，在需求单等您')
            this.getQueryListNum()
        } catch (e) {
            message.error(e.message)
        }
    }

    // 获取需求单药品数量
    async getQueryListNum() {
        try {
            const result = await api.get(`/queryDemandList`, { patientId: this.patientId })
            this.setState({
                addedNum: result.length,
            })
        } catch (e) {
            message.error(e.message)
        }
    }

    setScrollTop(value) {
        var getTarget = this.props.target || getDefaultTarget;
        var targetNode = getTarget();

        if (targetNode === window) {
            document.body.scrollTop = value;
            document.documentElement.scrollTop = value;
        } else {
            targetNode.scrollTop = value;
        }
    }

    renderHeader() {
        const { info } = this.state;
        let name = '';
        if (info.commonName && info.productName) {
            name = `${info.commonName}(${info.productName})`;
        } else if (info.commonName && !info.productName) {
            name = info.commonName;
        } else if (!info.commonName && info.productName) {
            name = info.productName;
        }
        let statusName = '';
        if (info.status === 0) {
            statusName = `￥${centToYuan(info.priceCent, 2)}`
        } else if (info.status === 1) {
            statusName = '缺货'
        } else if (info.status === 3) {
            statusName = '停售'
        }
        return (
            <div className="headerBox">
                <div className="headerImgBox">
                    <img src={info.outerPackagePicUrl || nopic} className="headerImgSty" alt="" />
                </div>
                <div className="headerTextBox">
                    {info.drugId ? <div className="headerPriceSty" style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseLine'}}><span>{statusName}</span>{info.status == 0 ? <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 10}}>
                                        <span style={{ color: '#C8161D', fontSize: 10, paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1, borderWidth: 1, borderColor: '#C8161D', borderStyle: 'solid', borderRadius: 5, lineHeight: 1, }}>积分</span><span style={{ fontSize: 10, color: '#222222', marginLeft: 3 }}>{Math.ceil((info.priceCent * info.whScale)/100)}</span></div> : null}</div> : <p className="headerPriceSty-1">暂无供应</p>}
                    <p className="headerNameTextSty">{name}</p>
                    {/* <div className="headerLabelBox">
                        {info.label && info.label.length ? info.label.map((i) => {
                            return (
                                <span className="header-label-sty">{i}</span>
                            )
                        }) : null}
                    </div> */}
                    <p className="headerStandardTextSty">{`${info.preparationUnit}×${info.packageSize}${info.minimumUnit}/${info.packageUnit}`}</p>
                    <p className="headerFacTextSty">{info.producerName}</p>
                    <p className="headerDesTextSty">本品为处方药，请仔细阅读说明书并取得处方后，在医师指导下使用，本网站只做信息展示，不提供在线交易。</p>
                </div>
            </div>
        )
    }

    renderRecommend() {
        const { info } = this.state;
        return (
            <div className="recommendBox">
                <p className="recommendTextSty">同类推荐</p>
                <div className="recommendDrugBox">
                    {info.replaceDrugs && info.replaceDrugs.length ? info.replaceDrugs.map((i, index) =>
                        <div className="recommendDrugSty" onClick={() => this.choseBetter(i)} key={index}>
                            <div className="recommendImgBoxSty">
                                <img src={i.outerPackagePicUrl || nopic} className="recommendDrugImgSty" alt="" />
                            </div>
                            <span className="recommendPriceSty">￥{centToYuan(i.priceCent, 2)}</span>
                            {/* <span className="recommendSaveSty">月省￥{centToYuan(i.costSavingCeil, 2)}</span> */}
                        </div>
                    ) : null}
                </div>
            </div>
        )
    }

    renderSynopsis() {
        const { info } = this.state;
        return (
            <div className="synopsisBox">
                <p className="synopsisTitleSty">药品说明书</p>
                {info.commonName ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        通用名称
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.commonName}
                    </p>
                </div> : null}
                {info.productName ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        商品名称
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.productName}
                    </p>
                </div> : null}
                {info.mainIngredients ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        主要成分
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.mainIngredients}
                    </p>
                </div> : null}
                {info.medicineCharacter ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        性状
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.medicineCharacter}
                    </p>
                </div> : null}
                {info.indication ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        功能主治
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.indication}
                    </p>
                </div> : null}
                {info.usageDosage ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        用法用量
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.usageDosage}
                    </p>
                </div> : null}

                {info.adverseReactions ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        不良反应
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.adverseReactions}
                    </p>
                </div> : null}
                {info.taboo ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        用药禁忌
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.taboo}
                    </p>
                </div> : null}
                {info.note ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        注意事项
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.note}
                    </p>
                </div> : null}
                {info.fdaPregnancyDrugClass ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        FDA妊娠药物分级
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.fdaPregnancyDrugClass}
                    </p>
                </div> : null}
                {info.pregnantDrug ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        孕妇及哺乳期妇女用药
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.pregnantDrug}
                    </p>
                </div> : null}
                {info.youngDrug ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        儿童用药
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.youngDrug}
                    </p>
                </div> : null}
                {info.elderDrug ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        老年用药
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.elderDrug}
                    </p>
                </div> : null}
                {info.drugInteractions ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        药物相互作用
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.drugInteractions}
                    </p>
                </div> : null}
                {info.drugOverdose ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        药物过量
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.drugOverdose}
                    </p>
                </div> : null}
                {info.toxicologicalStudy ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        毒理研究
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.toxicologicalStudy}
                    </p>
                </div> : null}
                {info.drugEffects ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        药理作用
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.drugEffects}
                    </p>
                </div> : null}

                {info.drugPharmacokinetics ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        药代动力学
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.drugPharmacokinetics}
                    </p>
                </div> : null}

                {info.medicineStorage ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        贮藏
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.medicineStorage}
                    </p>
                </div> : null}
                {info.storageCondition ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        储存条件
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.storageCondition}
                    </p>
                </div> : null}
                {info.medicineValidate ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        有效期
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.medicineValidate}
                    </p>
                </div> : null}
                {info.approvalNumber ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        批准文号
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.approvalNumber}
                    </p>
                </div> : null}
                {info.producerName ? <div className="synopsisMainSty">
                    <p className="synopsisMainFirstSty">
                        生产企业
                    </p>
                    <p className="synopsisMainTwiceSty">
                        {info.producerName}
                    </p>
                </div> : null}
            </div>
        )
    }


    async toRequirementList() {
        const { info } = this.state;
        try {
            const result = await api.get(`/checkPatient`)
            if (!result) {
                window.location.href = '/user/bind'
            } else {
                window.location.href = '/requirementList';
            }
        } catch (e) {
            message.error(e.message)
        }
    }

    renderSubBtn() {
        const { addedNum, info } = this.state;
        return (
            <div className="subBtnBox">
                <div className="subBtn-left" onClick={() => this.toRequirementList()}
                    style={{
                        backgroundColor:  '#F48E18',
                        width: info.status === 0 ? '48.5%' : '100%',
                    }}
                >
                    <i className='iconfont'>&#xe61b;</i>
                    <span className="btn-text-left">查看需求单{addedNum ? `(${addedNum})` : null}</span>
                </div>
                {info.status === 0 ?
                <div className="subBtn-right" onClick={() => this.addDrug()} style={{ backgroundColor: info.status === 1 || info.status === 3 ? '#ddd' : '#C8161D' }}>
                    <i className='iconfont'>&#xe629;</i>
                    <span className="btn-text-right">加入需求单</span>
                </div> : null}
            </div>
        )
    }

    render() {
        const { info } = this.state;
        if (this.state.loaded) {
            return (
                <div className="loadSty">
                    <span>加载中。。。</span>
                    <Icon type="loading" style={{ fontSize: 24 }} spin />
                </div>
            )
        }
        return (
            <div className="new-drug-detail">
                <Title>药品详情</Title>
                {this.renderHeader()}
                <div className="smaInterval" />
                {info.drugId ? this.renderRecommend() : null}
                {info.drugId ? <div className="smaInterval" /> : null}
                {this.renderSynopsis()}
                {this.renderSubBtn()}
            </div>
        )
    }
}

export default NewDrugDetail;
