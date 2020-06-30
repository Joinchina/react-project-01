import React, { Component } from 'react'
import { List } from 'antd-mobile';
import Listbox from './list'
import api from '../../api'; 
import history from '../../history'
import './index.less'
export default class index extends Component {
    constructor(props){
        super(props)
        this.state={
            homeList:[],
        }
    }
    async componentDidMount(){
        const weixinUser = await api.get('/currentUser');
        const now_patient = await api.get(`/currentPatient`);
        const wxcode = await api.get(`/sharePage`);
        //获取首页推荐列表
        const code = await api.get(`/insurance_packages`,{skip:0,limit:2000,positions:'1'});
        let cityId = null;
        let provinceId = null;
        if(now_patient){
            if(now_patient.memberType == 1){ //保障
                cityId = now_patient.hospital.cityId
                provinceId = now_patient.hospital.provinceId
            }else{ // 绿A
                cityId = weixinUser && weixinUser.address ? weixinUser.address.cityId : now_patient && now_patient.address && now_patient.address.cityId ? now_patient.address.cityId : null;
                provinceId = weixinUser && weixinUser.address ? weixinUser.address.provinceId : now_patient && now_patient.address && now_patient.address.provinceId ? now_patient.address.provinceId : null
            }
        }else{
            cityId = weixinUser && weixinUser.address && weixinUser.address.cityId;
            provinceId = weixinUser && weixinUser.address && weixinUser.address.provinceId
        }
        if(code && code.length){
            this.setState({
                homeList: code.filter(i => (!i.views || !i.views.length) || (i.views && i.views.length && i.views.find(item => item.code == wxcode))).filter(i => (!i.areas) || (i.areas && !i.areas.length) || (i.areas && i.areas.length && i.areas.find(item => item.cityId ? item.cityId === cityId : item.provincesId ? item.provincesId == provinceId : null)))
            })
        }
    }
    toHealth(){
        history.push(`/InsuranceBuy`)
        // window.location.href='/InsuranceBuy'
    }
    render() {
        return (
            <div className="InsuranceList">
                <div className="title">
                    <List.Item arrow="horizontal" extra={'更多'} onClick={() => this.toHealth()}>
                        <div style={{ display: 'flex' }} >
                            <span className="title">为您推荐</span>
                        </div>
                    </List.Item>
                </div>
                <Listbox dataList={this.state.homeList}/>
            </div>
        )
    }
}
