import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Spin } from 'antd';
import { Modal } from 'antd-mobile'
import api from '../../api';
import Title from '../common/Title';
import noPic from './images/noPic.png';
import pic_8 from './images/pic_8.png';
import pic_9 from './images/pic_9.png';
import './index.less';

const frequencyLst = [
    '每日一次',
    '每日两次',
    '每日三次',
    '每日四次',
    '每夜一次',
    '每周一次',
]

const explainText = [
    {
        name: '临床指南入选情况',
        text: '汇集了国内外最新临床指南及专家共识和推荐意见，这些材料是国内外权威专家共同编写，为广大临床医务工作者和患者提供某一特定临床问题的指导性建议，从而减少不恰当的临床决策行为，降低医疗成本，改善医疗服务质量和安全性。'
    },
    {
        name: '医保类型',
        text: <div style={{ display: 'flex', flexDirection: 'column'}}><span>国家医保《药品目录》将药品分为甲类目录和乙类目录。</span><span>“甲类目录”的药品是临床治疗必需，使用广泛，疗效好，同类药物中价格低的药品。</span><span>“乙类目录”的药品是可供临床治疗选择使用，疗效好，同类药品中比“甲类目录”价格略高的药品。</span><span>丙类也称自费药，是除开上述两类，非临床必需、价格较高的药品，需要全部自费。</span></div>
    },
    {
        name: '是否进口合资药',
        text: <div>原研药是指原创性新药，在我国通常指过了专利保护期或未在国内申请专利的药。我国原研制类药品主要集中在国外独资中外合资的制药企业中。这些药几乎都有其他厂家生产的相同成分仿制药，与仿制药相比，原研类药品的定价往往最高。</div>
    },
    {
        name: '是否为基药',
        text: <div style={{ display: 'flex', flexDirection: 'column'}}><span>基本药物是国家医疗主管部门组织权威专家筛选出来，要求临床首选、优先使用的一线药品。尤其能满足常见病、慢性病以及负担重、危害大的疾病的基本用药需求。对于指导合理用药、减轻用药负担有重要意义。</span><span>当前使用的是最新的2018年版国家基本药物目录。</span></div>
    },
    {
        name: '是否通过一致性评价',
        text: <div style={{ display: 'flex', flexDirection: 'column'}}><span>在剂量、安全性和效力、质量、作用以及适应证上相同与原研类药品相同的仿制药。它们均按照国家最新的技术指导要求进行技术审评，并与原研类药做了严格的药学对比和体内生物等效性研究，被国家药品主管部门认定，质量和疗效与原研类药品一致，临床上可以与原研进口药品相互替代。在保证相同疗效的情况下，能大幅节约患者和医保的药费支出。</span><span>当前国家一致性评价工作仍在进行中，本项数据将定期更新。</span></div>
    },
    {
        name: '万户评级',
        text: <div style={{ display: 'flex', flexDirection: 'column'}}><span>医药福利项目组专家，综合临床疗效、安全性、经济性、生产工艺、厂家声誉等等因素，将药品综合评价，分为3个等级。其中</span><span>绿色：专家遴选的优质优价“双优”好药，同类情况下，建议优先使用该等级药品。</span><span>黄色：无特别推荐，可根据医生、药师建议继续使用。</span><span>红色：临床疗效、经济性等方面存在瑕疵，建议谨慎使用的。</span></div>
    },
    {
        name: 'title',
        text: ''
    }
]

const medicalInsuranceDirectoryCategory = ['甲类','乙类','自费']

@mount('evaluationResult')
export default class EvaluationResult extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            resultInfo: null,
        }
    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        if (!patient) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
        }
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const resultInfo = await api.get('/medicationEvaluation', {patientId: patient.id, evaluationId: qs});
        this.setState({ resultInfo, loading: false })
    }

    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    showmodal(i){
        this.setState({ modal1: true, citem: i })
    }

    render() {
        const { resultInfo } = this.state;
        const diseasesList = resultInfo && resultInfo.diseaseList && resultInfo.diseaseList.length ? resultInfo.diseaseList.map(i => i.diseaseName) : [];
        return (
            <div className="hasMenu evaluationResult">
                <Title>
                    用药评估报告
                </Title>
                <Spin spinning={this.state.loading}>
                    <p className='res_title' onClick={() => this.showmodal(1)}>人员信息</p>
                    <div className='res_patient'>
                        <p style={{ marginBottom: 16, color: '#666666', fontSize: 18 }}>参评人员：<span style={{ color: '#222222', fontSize: 18 }}>{resultInfo ? resultInfo.patientName : ''}({resultInfo ? resultInfo.gender : ''} / {resultInfo ? resultInfo.age : ''}岁)</span></p>
                        <p style={{ color: '#666666', fontSize: 18 }}>治疗病症：{diseasesList && diseasesList .length ? <span style={{ color: '#222222', fontSize: 18 }}>{diseasesList.join('、')}</span> : ''}</p>
                    </div>
                    <p className='res_title'>参评药品分析</p>
                    {
                        resultInfo && resultInfo.drugList && resultInfo.drugList.length ? resultInfo.drugList.map((i) => {
                            return (
                                <div className='drug_box'>
                                    <div className='drug_box_1'>
                                        <div>
                                            <img src={i.outerPackagePicUrl || noPic} className='drug_pic_sty' />
                                        </div>
                                        <div className='drug_info'>
                                            <span className='drug_name_sty'>{`${i.commonName}(${i.productName})`}</span>
                                            <span className='drug_text_sty' style={{ marginBottom: 12, marginTop: 8 }}>{i.dosage||''}{`${i.preparationUnit}×${i.packageSize}${i.minimumUnit}/${i.packageUnit}`}</span>
                                            <span className='drug_text_sty'>{i.producerName}</span>
                                        </div>
                                    </div>
                                    <div className='drug_box_2'>
                                        <p className='drug_box_2_text' style={{ marginBottom: 8 }}>适用于：{i.indications && i.indications.length ? <span>{i.indications.join('、')}</span> : null}</p>
                                        <p className='drug_box_2_text'>用法用量：<span>单次{i.useAmount}片/{frequencyLst[i.frequency-1]}</span></p>
                                    </div>
                                    {!i.medicalInsuranceDirectoryCategory && !i.isBasicMedicine && !i.isJointStock && !i.consistency && !i.wanhuDrugRating !=3 ? null : <div className='drug_box_3'>
                                        <p className='drug_box_3_title'>药品分析</p>
                                        <div className='drug_box_3_list'>
                                            {i.medicalInsuranceDirectoryCategory ? <span onClick={() => this.showmodal(1)} className='drug_box_3_list_item'>医保报销{medicalInsuranceDirectoryCategory[i.medicalInsuranceDirectoryCategory-1]}</span> : null}
                                            {i.isBasicMedicine ? <span onClick={() => this.showmodal(3)} className='drug_box_3_list_item'>国家基本药物目录</span> : null}
                                            {i.isJointStock ? <span onClick={() => this.showmodal(2)} className='drug_box_3_list_item'>进口合资药</span> : null}
                                            {i.consistency ? <span onClick={() => this.showmodal(4)} className='drug_box_3_list_item'>通过一致性评价</span> : null}
                                            {i.wanhuDrugRating == 3 ? <span onClick={() => this.showmodal(5)} className='drug_box_3_list_item'>双优好药 万户推荐</span> : null}
                                        </div>
                                    </div>}
                                    {i.clinicalGuidelineElectedInfo ? <div className='drug_box_4'>
                                        <p className='drug_box_4_title'>该药品已入选下列疾病防治指南：</p>
                                        <pre className='drug_box_4_list'>{i.clinicalGuidelineElectedInfo}</pre>
                                    </div> : null}
                                    <span style={{ position: 'absolute', left: 0, top: 0, borderRadius: '0 9px 9px 0', lineHeight: 1, padding: '2px 8px', color: '#fff', background: i.isUse == 1 ? '#44B82A' : '#F48E18'}}>{i.isUse == 1 ? '服用中' : i.isUse == 2 ? '计划新增' : ''}</span>
                                </div>
                            )
                        }) : null
                    }
                    <div>
                        <p className='res_title'>综合用药评估</p>
                        {resultInfo && resultInfo.result && resultInfo.result.length ? <div className='check_result'>
                            <p className='check_result_title'>经评估发现您的用药存在如下风险：</p>
                            {resultInfo.result.map((i) => {
                                return (
                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                            <img src={pic_9} />
                                            <p style={{ marginLeft: 12, color: '#222222', fontSize: 16, fontWeight: 'bold' }}>{i.ruleName}</p>
                                        </div>
                                        {i.content && i.content.length ? i.content.map((item, index) => {
                                            if(i.content.length > 1){
                                                return (
                                                    <div style={{ marginLeft: 40}}>
                                                        <p style={{ color: '#666666', fontSize: 14 }}><span style={{ color: '#666666', fontSize: 14, display: 'inline-block', width: 14, height: 14, borderRadius: 7, border: '1px solid #666666', lineHeight: '14px', textAlign: 'center'}}>{ index + 1}</span>{item}</p>
                                                    </div>
                                                )
                                            } else {
                                                return (
                                                    <p style={{ color: '#666666', fontSize: 14, marginLeft: 40 }}>{item}</p>
                                                )
                                            }
                                        }) : null}
                                    </div>
                                )
                            })}
                        </div> : <div className='check_result'><span style={{ fontSize: 16 }}>恭喜您！暂未发现合并用药风险</span></div>}
                    </div>
                    <p className='res_title'>报告信息</p>
                    <div className='producer_sty'>
                        <p className='producer_text_sty'>{resultInfo ? resultInfo.evaluateTime : ''}</p>
                        <p className='producer_text_sty'>万户PBM健康管理中心</p>
                    </div>
                    <div className='btm_sty'>
                        <img src={pic_8} className='btm_img_sty' />
                        <p className='btm_text_sty'>温馨提示：本报告仅用于当前用药记录的初步评估，不能代替临床意见。具体问题请咨询专业医师/药师。</p>
                    </div>
                    <Modal
                        visible={this.state.modal1}
                        transparent
                        maskClosable={false}
                        onClose={this.onClose('modal1')}
                        title="帮助中心"
                        footer={[{ text: '确认', onPress: () => { this.onClose('modal1')(); } }]}
                    >
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: 18, color: '#222222' }}>{explainText[this.state.citem || 6].name}</p>
                            <div>{explainText[this.state.citem || 6].text}</div>
                        </div>
                    </Modal>
                </Spin>
            </div>
        )
    }
}
