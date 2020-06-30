import React, { Component } from 'react'
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { message, Spin, Popover } from 'antd';
import Title from '../common/Title';
import api from '../../api';
import './index.less'

@mount('newBMI')
export default class NewBMI extends Component {

    @prop()
    loading = false;

    constructor(props) {
        super(props)
        this.state = {
            bodyMassList: [],
            showlist: []
        }
    }

    @action()
    async componentDidMount() {
        try{
            this.loading = true
            const patient = await api.get(`/currentPatient`);
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            const patient_id = patient.id;
            const bodyMassList = await api.get(`/patient/${patient_id}/bodyMass`, {skip: 0, limit: 999})
            const ast = new Array(bodyMassList.length)
            const arr = ast.fill(false, 0, bodyMassList.length)
            arr[0] = true
            this.loading = false
            this.setState({
                userInfo: patient,
                bodyMassList,
                patientId: patient_id,
                heightNum: patient.height || '',
                showlist: arr,
            })
        }catch(e){
            this.loading = false
            message.error(e.message)
        }
    }

    @action()
    async subBodyMass() {
        const {weightNum, heightNum, patientId} = this.state;
        if (!weightNum && heightNum) {
            message.warning('请输入体重值')
            return;
        } else if (!heightNum && weightNum) {
            message.warning('请输入身高值')
            return;
        } else if (!heightNum && !weightNum) {
            message.warning('请输入身高、体重')
            return;
        } else if (isNaN(Number(heightNum)) || isNaN(Number(weightNum))) {
            message.warning('请输入数字')
            return;
        }
        try{
            this.loading = true
            await api.post(`/patient/bodyMass`, { patientId, where: {weigth: weightNum, height: heightNum} })
            const bodyMassList = await api.get(`/patient/${patientId}/bodyMass`)
            this.loading = false
            this.setState({
                bodyMassList,
                weightNum: '',
            })
        }catch(e){
            this.loading = false
            message.error(e.message)
        }
    }

    handleChange(i) {
        const { showlist } = this.state;
        showlist[i] = !showlist[i]
        this.setState({
            showlist,
        })
    }

    render() {
        const { bodyMassList, userInfo } = this.state;
        let new_age = 0;
        if (userInfo) {
            new_age = (new Date().getFullYear()) - (new Date(userInfo.birthday).getFullYear())
        }
        return (
            <div className="hasMenu bmiSty" style={{ paddingTop: 19 }}>
                <Title>体重评估</Title>
                <Spin spinning={this.loading}>
                    <div className='topTextBox'>
                        <div className='topTextBox_L'>
                            <span className='topTxtSty'>年龄</span>
                            <span className='topNumSty'>{new_age}</span>
                        </div>
                        <div className='topTextBox_C'>
                            <span className='topTxtSty'>性别</span>
                            <span className='topNumSty'>{userInfo ? userInfo.sex === 0 ? '女' : userInfo.sex === 1 ? '男' : '' : ''}</span>
                        </div>
                        <div className='topTextBox_R'>
                            <div className='topIptBox'>
                                <span className='topTxtSty'>身高</span>
                                <input
                                    className='topIptSty'
                                    onInput={(event) => this.setState({heightNum: event.target.value})}
                                    value={this.state.heightNum || ''}
                                    type='number'
                                />
                            </div>
                            <span className='topIptTextSty'>厘米</span>
                        </div>
                    </div>
                    <div className='nowWeightSty'>
                        <span className='nowWeightSty_1'>本次体重</span>
                        <input className='nowWeightSty_2' type='number' onInput={(event) => this.setState({weightNum: event.target.value})} value={this.state.weightNum || ''}/>
                        <span className='nowWeightSty_3'>公斤</span>
                    </div>
                    <div className='subBox'>
                        <span className='subBtn' onClick={() => this.subBodyMass()}>评估</span>
                    </div>
                    <span className='text_1'>评估结果</span>
                    <div className='picBox'>
                        <div
                            style={{ width: '100%',display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', whiteSpace:'nowrap', overflowX: 'scroll'}}
                        >
                            {
                                bodyMassList.length ? bodyMassList.map((i, index) => {
                                    let now_num;
                                    if (i.bmi >= 30) {
                                        now_num = 29.6
                                    } else if(i.bmi <= 13) {
                                        now_num = 14
                                    } else {
                                        now_num = i.bmi;
                                    }
                                    let bto_position;
                                    if (now_num < 18.5) {
                                        bto_position = ((now_num - 14) / 5.5) * 44;
                                    } else if (now_num >= 18.5 && now_num < 24) {
                                        bto_position = 36 + (((now_num - 18.5) / 5.5) * 44)
                                    } else {
                                        bto_position = 80 + (((now_num - 24) / 6)  * 132)
                                    }
                                    const content = (
                                        <div>
                                            <p style={{ fontSize: 28, color: '#C8161D', fontWeight: 'bold', fontFamily: 'DIN', textAlign: 'center'}}>{i.weigth}<span style={{ color: '#C8161D', fontSize: 16, fontFamily: 'Hiragino Sans GB' }}>公斤</span></p>
                                            <p style={{ color: '#666666', fontSize: 14, fontFamily: 'Hiragino Sans GB', textAlign: 'center' }}>{i.testDate}</p>
                                        </div>
                                    )
                                    return (
                                        <div className="popoverSty"
                                            style={{ height: 220, width: 60, display: 'inline-block', position: 'relative', flexShrink: 0}}
                                            key={i.id}
                                        >
                                            <Popover content={content} title="" trigger="click" placement={index === 0 && i.bmi < 30 ? 'leftBottom' : "bottomRight"} onVisibleChange={()=> this.handleChange(index)} visible={this.state.showlist[index]} autoAdjustOverflow>
                                                <span style={{ position: 'absolute', display:'inline-block', width: 16, height: 16, borderRadius: 8, bottom: bto_position, left: 22, backgroundColor: '#fff'}} />
                                            </Popover>
                                        </div>
                                    )
                                }) : null
                            }
                        </div>
                    </div>
                    <div className="warnBoxSty">
                        <i className="iconfont" style={{ fontSize: 20, marginRight: 4, lineHeight: '20px' }}>&#xe690;</i>
                        <span className='warnTextSty'>如果您患有糖尿病、高血压等病症，建议每周测量一次体重。</span>
                    </div>
                </Spin>
            </div>
        );
    }
}
