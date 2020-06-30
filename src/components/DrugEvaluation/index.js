import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Spin, Modal } from 'antd'
import api from '../../api';
import Title from '../common/Title';
import SelectButton from '../Register/SelectButton';
import './index.less';
import pic_1 from './images/pic_1.png';
import pic_2 from './images/pic_2.png';

@mount('drugEvaluation')
export default class DrugEvaluation extends Component {
    constructor(props){
        super(props)
        this.state = {
            evaluationsList: [],
            loading: true,
        }
    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        if (!patient) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
        }
        const evaluationsList =  await api.get('/getMedicationEvaluationList', { patientId: patient.id})
        this.setState({ evaluationsList, loading: false})
    }

    startEvaluate() {
        const evaluationDrugs = window.localStorage.getItem('evaluationDrugs') || "[]";
        const diseases = window.localStorage.getItem('diseases') || "[]";
        if ((JSON.parse(evaluationDrugs) && JSON.parse(evaluationDrugs).length) || (JSON.parse(diseases) && JSON.parse(diseases).length)) {
            Modal.confirm({
                content: '你有未完成评估的信息记录，是否继续使用？',
                okText: '使用',
                okType: 'primary',
                cancelText: '放弃',
                onOk: async () => {
                    await window.localStorage.setItem('isUseOld', 1)
                    this.props.history.push('/evaluationPatient')
                },
                onCancel: async () => {
                    await window.localStorage.setItem('isUseOld', 2)
                    this.props.history.push('/evaluationPatient')
                },
            });
        }else{
            this.props.history.push('/evaluationPatient')
        }
        
    }

    checkEvaluation(id) {
        this.props.history.push(`/evaluationResult?${id}`)
    }

    render() {
        const { evaluationsList, loading } = this.state;
        return (
            <div className="hasMenu drug_evaluation">
                <Spin spinning={loading}>
                    <Title>用药评估</Title>
                    <div className='topbox'>
                        <div style={{ width: 72, height: 60 }}><img src={pic_1} className='top_box_pic' /></div>
                        <div className='top_box_1'>
                            <p className="top_explain_info">【用药评估】可根据不同参评人的不同病症、正在或计划服用的各种药品，给予药品品质、药物间作用风险的综合评估报告，帮助您避免服药带来的健康问题。</p>
                            <div className="top_btn" onClick={() => this.startEvaluate()}>开始评估</div>
                        </div>
                    </div>
                    {evaluationsList.length ? <div className="btomBox">
                        <p className="title_sty btom_title">往期报告</p>
                        {evaluationsList.map((i) => {
                            return (
                                <div className="btom_list_list" key={i.id}>
                                    <img src={pic_2} className="bto_pic_sty"/>
                                    <p className="bto_text_sty" >{i.title}</p>
                                    <div className="btom_btn_sty" onClick={() => this.checkEvaluation(i.id)}>查看报告</div>
                                </div>
                            )
                        })}
                    </div> : null}
                </Spin>
            </div>
        )
    }
}