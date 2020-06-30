import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Form, Input, Button, message, Spin, Affix, Modal, Icon } from 'antd';
import api from '../../api';
import Title from '../common/Title';
import './index.less';
import pic_1 from './images/pic_1.png';
import pic_4 from './images/pic_4.png';
import pic_5 from './images/pic_5.png';

@mount('evaluationPatient')
class EvaluationPatient extends Component {

    @prop()
    diseaseList = [];

    constructor(props){
        super(props);
        this.state = {
            diseaseList: null,
            selectedButton: [],
            visible: false,
            loading: true
        }
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    @action()
    async componentDidMount() {
        await this.setPromise({ loading: true })
        const patient = await api.get(`/currentPatient`);
        const weixinUser = await api.get('/currentUser');
        if (!patient) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
        }
        const diseaseList = await api.get('/cfg/enum/diseases');
        const diseases = window.localStorage.getItem('diseases') || "[]";
        const isUseOld = window.localStorage.getItem('isUseOld');
        this.setState({
            diseaseList,
            patient,
            loading: false,
            selectedButton: isUseOld == 1 ? JSON.parse(diseases) : [],
            weixinUser,
        })
    }

    @action()
    setVisible(visible) {
        this.setState({
            visible,
        })
    }

    handleClose(item, bol) {
        const { selectedButton } = this.state;
        const ishave = selectedButton.filter(i => i.id == item.id)
        if (ishave.length) {
            this.setState({
                visible: false,
            })
        } else {
            selectedButton.push(item)
            window.localStorage.setItem('diseases', JSON.stringify(this.state.selectedButton))
            this.setState({
                selectedButton,
                visible: false
            })
        }
    }

    deleteDise(item) {
        const { selectedButton } = this.state;
        const newlist = selectedButton.filter(i => i.id != item)
        this.setState({
            selectedButton: newlist,
        })
    }

    addDiseases() {
        this.setState({
            visible: true,
        })
    }

    goDrugPage() {
        if(!this.state.selectedButton.length){
            message.error('请选择疾病信息')
            return;
        }
        window.localStorage.setItem('diseases', JSON.stringify(this.state.selectedButton))
        this.props.history.push(`/evaluationDrugInfo`)
    }

    renderList() {
        const { diseaseList, selectedButton, visible } = this.state;
        return (
            <Modal
                visible={visible}
                onCancel={() => this.setVisible(false)}
                cancelText="关闭"
                className="registerModal"
                footer={null}
            >
                <div>
                    <div
                        ref={node => { this.container = node; }}
                        style={{ height: '450px', overflowY: 'scroll' }}
                        className="scrollable-container"
                    >
                        {!diseaseList ? null : diseaseList.map((item, index) => {
                            const tag = selectedButton
                                ? selectedButton.filter(tag => item.id === tag.id) : [];
                            const isSelected = tag.length > 0 ? true : false;
                            const disease = (
                                <div key={item.id} className="diseaseItem" style={isSelected ? { color: '#C8161D' } : {}} onClick={() => this.handleClose(item, tag.length > 0)}>
                                    {item.name}
                                    {isSelected ? <Icon type="check-circle" style={{ float: 'right', paddingRight: '11px' }} /> : ''}
                                </div>
                            )
                            return disease;
                        })
                        }
                    </div>
                    <Affix target={() => this.container} onClick={() => this.setVisible(false)}>
                        <Button className="submitButton">确定</Button>
                    </Affix>
                </div>
            </Modal>
        )
    }

    render() {
        const { selectedButton, patient, loading, weixinUser } = this.state;
        let new_age = 0;
        if (patient) {
            new_age = (new Date().getFullYear()) - (new Date(patient.birthday).getFullYear())
        }
        return(
            <div className="hasMenu evaluation_patient">
                <Title>参评人员</Title>
                <Spin spinning={loading}>
                    <div className='topbox'>
                        <div style={{ width: 72, height: 60 }}><img src={pic_1} className='top_box_pic' /></div>
                        <div className='top_box_1'>
                            <p className="top_explain_info">【参评人员】性别、年龄、治疗病症等因素，均影响参评药品的合理性与风险的评估，因此请先确认或填写参评人员信息。</p>
                        </div>
                    </div>
                    <div className="btmBox">
                        <div className='btm_list_box'>
                            <span className='btm_list_title'>参评人员：&nbsp;</span>
                            <span className='btm_list_info'>{patient && patient.name || ''}</span>
                        </div>
                        <div className='btm_list_box'>
                            <span className='btm_list_title'>性别/年龄：</span>
                            <span className='btm_list_info'>{patient && patient.sex ? '男' : '女'} / {new_age}岁</span>
                        </div>
                        <div className="disease_box">
                            <span className='btm_list_title disease_list_title'>治疗病症：&nbsp;</span>
                            <div className='disease_list_box'>
                                {selectedButton && selectedButton.length ? selectedButton.map((i) => {
                                    return (
                                        <div className="disease_info" key={i.id}>
                                            {i.name}
                                            <img src={pic_4} className="disease_pic" onClick={() => this.deleteDise(i.id)} />
                                        </div>
                                    )
                                }) : null}
                                {/* <div className="disease_info add_sty" onClick={() => this.addDiseases()} /> */}
                                <div className="disease_info" style={{ width: 78, height: 28, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}} onClick={() => this.addDiseases()}>
                                    <img src={pic_5} />
                                </div>
                                <span style={{ color: '#999999' }}>请点击"+"或"×"来增加或删除参评病症</span>
                            </div>
                        </div>
                        <div className='btom_neextStep_btn' onClick={() => this.goDrugPage()}>下一步</div>
                    </div>
                    {this.renderList()}
                </Spin>
            </div>
        )
    }
}

export default EvaluationPatient