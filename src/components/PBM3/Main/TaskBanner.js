import React, { Component } from 'react';
import { message } from 'antd';
import { Modal, Button, Icon } from 'antd-mobile';

import api from '../../../api';
import toInsuranceByAds from '../../common/ToInsuranceByAds';

import ctz from '../../../states/images/ctz.png'
import CCVDCheck from '../../../states/images/CCVDCheck.png'
import d_eva from '../../../states/images/d_eva.png'
import iconInsurance from '../../../states/images/icon-insurance.png'
import iconCheck from '../../../states/images/icon-check.png'
import iconDoctor from '../../../states/images/icon-doctor.png'
import iconDrug from '../../../states/images/icon-drug.png'
import noService from '../../../states/images/no_service.png';
const aty = [
    { name: '查保障', id: 'insuranceList', path: '', pic: iconInsurance, done: true },
    { name: '找医生', id: 'doctorService', path: '', pic: iconDoctor, done: true },
    { name: '做体检', id: 'checkService', path: '', pic: iconCheck, done: true },
    { name: '我的药品', id: 'myDrugs', path: '', pic: iconDrug, done: true },
    { name: '心脑风险评估', id: 'CCVDCheck', path: '', pic: CCVDCheck, done: true },
    { name: '用药评估', id: 'drugCheck', path: '', pic: d_eva, done: true },
    // { name: '体重评估', id: 'weightCheck', path: '', pic: ctz, done: true },
]

export default class TaskBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMemberVisible: false,
        }
    }

    toInsurance() {
        if (!this.props.patientId) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/newHealthHomePage`)}`
        }
        toInsuranceByAds()
    }

    async goHref(data) {
        const insuranceList = this.props.patientId ? await api.get(`/patient/insurance_order/inservice`, { patientId: this.props.patientId }) : null;
        const new_insuranceList = this.props.patientId ? await api.get(`/get_insurance_team_order`, { patientId: this.props.patientId}) : null;
        const isCheckService = insuranceList && insuranceList.length ? insuranceList.find(i => i.products && i.products.length ? i.products.find(j => j.insuranceProductType === 2) : false) : null;
        const isHealthService = insuranceList && insuranceList.length ? insuranceList.find(i => i.products && i.products.length ? i.products.find(j => j.insuranceProductType === 3) : false) : null;
        const isVideoService = insuranceList && insuranceList.length ? insuranceList.find(i => i.products && i.products.length ? i.products.find(j => j.insuranceProductType === 4) : false) : null;
        let res;
        if(this.props.patientId){
            res = await api.get(`/getCodeStatus`, {patientId: this.props.patientId});
        }
        switch (data.id) {
            case 'insuranceList':
                /* 之前新添加的保障列表页面 */
                /* if(!this.props.patientId){
                    window.location.href = `/user/bind?r=${encodeURIComponent(`/newHealthHomePage`)}`
                }else if (new_insuranceList && new_insuranceList.length > 0) {
                    this.props.history.push('/insuranceListVision2');
                } else { */
                    /* this.setState({ isMemberVisible: true }); */
                    /* message.warning('您当前尚无保障服务') */
               /*  } */
                if (insuranceList && insuranceList.length > 0) {
                    //进入保障列表
                    this.props.history.push('/insuranceList');
                } else {
                    this.setState({ isMemberVisible: true });
                }
                break;
            case 'doctorService':
                if(isVideoService){
                    if (res && (res.status == 3 || res.status == 4)) {
                        this.props.history.push(`/myDoctor`)
                    } else {
                        Modal.alert(null, '您所访问的页面将跳转到由北京和缓医疗科技有限公司提供服务的和缓视频医生系统，您是否同意授权该系统获取并使用您的个人信息以提供相关服务。', [
                            { text: '拒绝', onPress: () => {} },
                            { text: '同意', onPress: () => this.props.history.push(`/myDoctor`) },
                        ])
                    }
                }else{
                    this.setState({ isMemberVisible: true });
                }
                break;
            case 'checkService':
                if (isCheckService) {
                    this.props.history.push(`/myMedicalReport`)
                } else {
                    this.setState({ isMemberVisible: true });
                }
                break;
            case 'myDrugs':
                this.props.history.push(`/medicineHomePage`)
                break;
            case 'CCVDCheck':
                if (isHealthService) {
                    this.props.history.push(`/redirect/miniProgram`)
                } else {
                    this.setState({ isMemberVisible: true });
                }
                break;
            case 'drugCheck':
                if (isHealthService) {
                    this.props.history.push(`/drugEvaluation`)
                } else {
                    this.setState({ isMemberVisible: true });
                }
                break;
            case 'weightCheck':
                if (!this.props.patientId) {
                    window.location.href = `/user/bind?r=${encodeURIComponent(`/newBMI`)}`
                } else {
                    this.props.history.push(`/newBMI`)
                }
                break;
            default:
                message.warning('功能尚未开放');
        }
    }

    render() {
        return <div className="task">
            <Modal
                visible={this.state.isMemberVisible}
                transparent
                maskClosable={false}
                onClose={() => { this.setState({ isMemberVisible: false }) }}
                className="IsNotMemberModal"
            >
                <div
                    className="colseIcon"
                    onClick={() => { this.setState({ isMemberVisible: false }) }}
                >
                    <Icon type="cross-circle" />
                    <div className="_close_bottom"></div>
                </div>
                <div className="_modal_body">
                    <div className="_modal_title">
                        您还不是万户健康会员
                    <br />
                    无法享受该服务
                </div>
                    <img src={noService} className="_modal_img" />
                    <Button className="_modal_btn" onClick={() => this.toInsurance()}>立即购买</Button>
                </div>
            </Modal>
            <div className="title" style={{ marginTop: '8px', paddingLeft: '11px', paddingTop: '16px' }}>会员服务</div>
            <div className="taskBox">
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 10 }}>
                    {aty.map((i, index) => {
                        return (
                            <div
                                style={{
                                    width: '33.3%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: i.done ? 14 : 0,
                                }}
                                onClick={() => this.goHref(i)}
                                key={index}
                            >
                                <div className="imgBox" style={{ width: '52%', marginBottom: '12px' }}>
                                    <div
                                        className="_tempImg"
                                        style={{
                                            background: `url(${i.pic})  no-repeat`,
                                            backgroundSize: 'cover',
                                            width: '100%',
                                            paddingTop: '100%'
                                        }}
                                    >
                                    </div>
                                </div>
                                <p style={{ marginBottom: 0, textAlign: 'center', color: i.done ? '#222222' : '#b2b2b2', fontSize: 14, lineHeight: '16px' }}>{i.name}</p>
                                {i.done ? '' : <p style={{ marginBottom: 0, textAlign: 'center', color: '#b2b2b2', fontSize: 14, lineHeight: '16px' }}>尚未开放</p>}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    }
}
