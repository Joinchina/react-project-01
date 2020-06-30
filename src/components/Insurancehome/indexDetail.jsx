import React, { Component } from 'react'
import Listbox from './list'
import api from '../../api';
import Title from '../common/Title'
import Comlon from '../common/Comlon';
import { Row, Col, Button, Spin, Icon } from 'antd';
import './index.less'
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});
export default class indexDetail extends Component {
    
    constructor(props){
        super(props)
        this.state={
            page:0,
            isInit:true,
            homeList:[],
        }
    }
    async componentDidMount(){
        const now_patient = await api.get(`/currentPatient`);
        const weixinUser = await api.get('/currentUser');
        const wxcode = await api.get(`/sharePage`);
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
        //进入详情页面获取20个数据,此处埋个坑,由于数据太少，先不做滚动加载
        const code = await api.get(`/insurance_packages`,{skip:this.state.page,limit:2000,positions:'2'});
        if(code && code.length){
            this.setState({
                homeList:code.filter(i => (!i.views || !i.views.length) || (i.views && i.views.length && i.views.find(item => item.code == wxcode))).filter(i => (!i.areas) || (i.areas && !i.areas.length) || (i.areas && i.areas.length && i.areas.find(item => item.cityId ? item.cityId === cityId : item.provincesId ? item.provincesId == provinceId : null))),
                isInit:false
            })
        }else{
            this.setState({
                isInit:false
            })
        }
    }
    renderWait() {
        if (this.state.homeList.length===0) {
            return (
                <div style={{ height: '100vh',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center' }}>
                    <Spin spinning={this.state.isInit}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                            <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                            <span
                                style={{
                                    opacity: 1,
                                    fontSize: 16,
                                    fontFamily: 'Hiragino Sans GB',
                                    letterSpacing: 0,
                                }}
                            >暂无信息</span>
                        </div>
                    </Spin>
                </div>
            )
        };
    }
    render() {
        return (
            <div className="InsuranceList">
                <Title>服务列表</Title>
                <Comlon {...this.props} />
                {this.renderWait()}
                <Listbox dataList={this.state.homeList}/>
            </div>
        )
    }
}
