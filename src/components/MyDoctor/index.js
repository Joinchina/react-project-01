import React, { Component } from 'react';
import { Spin, message } from 'antd';
import api from '../../api'
import Title from '../common/Title';
import pic_1 from './pic_1.png';
import pic_up from '../../assets/images/jianto.png'
import './index.less'
export default class MyDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    async componentDidMount() {
        try{
            const patient = await api.get(`/currentPatient`);
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            const code_img = await api.get('/getCodeImg', {patientId: patient.id})
            this.setState({
                loading: false,
                code_img,
            })
        }catch(err){
            message.error(err.message)
            this.setState({
                loading: false,
            })
        }
    }

    render() {
        const { loading, code_img } = this.state;
        return (
            <div style={{ backgroundColor: '#ffffff', height: '100vh'}} className="ban">
                <Title>我的医生</Title>
                <Spin spinning={loading}>
                    <img src={pic_1} width='100%' style={{
                        pointerEvents: 'none',
                        '-webkit-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-webkit-user-select':'none',
                        '-o-user-select':'none',
                        userSelect:'none',
                    }}/>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <div style={{ width: '91%', textAlign: 'center', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '46px 71px 16px 72px', backgroundColor: '#ffffff', marginTop: '-40px'}}>
                        <img src={code_img} style={{ maxWidth: '100%',border:'1px solid rgba(232,232,232,1)'}} />
                        </div>
                    </div>
                    <img src={pic_up} alt="" className="img_up" style={{
                        pointerEvents: 'none',
                        '-webkit-user-select':' none',
                        '-moz-user-select': 'none',
                        '-webkit-user-select':'none',
                        '-o-user-select':'none',
                        userSelect:'none',
                    }}/>
                    <p style={{ color: '#222222', fontSize: '20px', textAlign: 'center'}}>长按小程序码</p>
                    <p style={{ color: '#222222', fontSize: '20px', textAlign: 'center'}}>开始呼叫医生</p>
                </Spin>
            </div>
        )
    }
}
