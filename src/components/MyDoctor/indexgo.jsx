import React, { Component } from 'react'
import api from '../../api';
import { Toast,Modal } from 'antd-mobile';
import { Spin } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
@mount('DoctorGo')
export default class  extends Component {
    constructor(props){
        super(props);
        this.url=this.props.location.pathname
        this.state={
            isDoctor:false,
            spinning:true,
            isModuls:true,
        }   
    }
    async componentDidMount(){
        //获取用户信息，如果没有登陆跳转登陆后再回来
        try {
            const patient = await api.get(`/currentPatient`);
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/DoctorGo`)}`
            }
            const res = await api.get(`/getCodeStatus`, {patientId:patient.id});
            const insuranceList = await api.get(`/patient/insurance_order/inservice`, { patientId:patient.id });
            if(insuranceList&&insuranceList.length==0){
                Modal.alert(null, '您尚未获得视频医生服务,是否前往购买？', [
                    { text: '拒绝', onPress: () => {
                        this.props.history.push(`/newHealthHomePage`); 
                    } },
                    { text: '同意', onPress: () => {
                        this.props.history.push(`/InsuranceBuy`);
                    } },
                ])
                this.setState({
                    spinning:false
                })
                return
            }else{
                const isVideoService = insuranceList && insuranceList.length ? insuranceList.find(i => i.products && i.products.length ? i.products.find(j => j.insuranceProductType === 4) : false) : null;
                this.setState({
                    spinning:false
                })
                if(isVideoService){

                    if (res && (res.status == 3 || res.status == 4)) {
                        this.props.history.push(`/myDoctor`)
                    } else {
                        Modal.alert(null, '您所访问的页面将跳转到由北京和缓医疗科技有限公司提供服务的和缓视频医生系统，您是否同意授权该系统获取并使用您的个人信息以提供相关服务。', [
                            { text: '拒绝', onPress: () => {
                                    this.props.history.push(`/newHealthHomePage`);                       
                                } 
                            },
                            { text: '同意', onPress: () => {
                                    this.props.history.push(`/myDoctor`)                        
                            } },
                        ])
    
                    }
                }else{
                    Modal.alert(null, '您尚未获得视频医生服务,是否前往购买？', [
                        { text: '拒绝', onPress: () => {
                            this.props.history.push(`/newHealthHomePage`); 
                        } },
                        { text: '同意', onPress: () => {
                            this.props.history.push(`/InsuranceBuy`);
                        } },
                    ])
                    this.setState({
                        spinning:false
                    })
                    return
                }
            }
            
        } catch (e) {
            console.error(e);
        }
    }
    

    render() {
        return (
            <Spin spinning={this.state.spinning} tip={'数据获取中......'} style={{width:'100%',paddingTop:'50%'}}>
                
            </Spin>
        )
    }
}
