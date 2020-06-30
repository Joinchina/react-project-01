import React, { Component } from 'react';
import api from '../../api';
import AddressList from './AddressList';
import {Modal} from 'antd';
import './index.less';
import Title from '../common/Title';

class UserAddressList extends Component {
    constructor(props) {
        super(props);
        this.state = { patientId: null }
    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        this.setState({ patientId: patient.id, patient });
    }


    render() {
        const { patientId, patient } = this.state;
        if (!patientId) {
            return <div style={{width: '100%', textAlign:'center'}}>加载中…</div>
        }
        // if(patient && patient.memberType !== 2){
        //     Modal.error({
        //         title: `您的会员类型不支持配送到家，您可联系客服咨询配送事宜`,
        //         okText: "确定",
        //         onOk: () => { window.WeixinJSBridge.invoke('closeWindow'); },
        //     });
        // }
        return (
            <div style={{background: '#F9F9F9', padding: '15px', height: '100%'}}>
                <Title>地址管理</Title>
                <AddressList
                    isSelected={false}
                    patientId={patientId}
                />
            </div>
        );
    }
}
export default UserAddressList;
