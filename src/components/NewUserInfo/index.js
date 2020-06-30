import React, { Component } from 'react'
import Jsbarcode from 'jsbarcode';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { message, Spin } from 'antd';
import { Modal } from 'antd-mobile'
import Title from '../common/Title';
import Comlon from '../common/Comlon';
import TabBar from '../common/TabBar';
import PointsListDrawer from '../NewHealthHomePage/points_list';
import head from './images/head.png'
import api from '../../api';
import toInsuranceByAds from '../common/ToInsuranceByAds';
import code from './images/code.png';
import './index.less'

@mount('newUserInfo')
export default class NewUserInfo extends Component {

    @prop()
    accountNo;

    @prop()
    headingUrl;

    @prop()
    loading = false;

    @prop()
    pointList=[];

    @prop()
    skip = 0;

    @prop()
    limit = 50;

    constructor(props) {
        super(props)
        this.state = {
            userInfo: {},
            showcode: false,
            flowListVisible: false,
            pointCount: 0
        }
    }

    @action()
    async componentDidMount() {
        try{
            this.loading = true
            const patient = await api.get(`/currentPatient`);
            const weixinUser = await api.get('/currentUser');
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            const pointList = await api.get(`/patient/${patient.id}/rewardpoints/record`, { skip: this.skip, limit: this.limit });
            const pointCount = await api.get(`/patient/${patient.id}/rewardpoints`);
            this.pointList = pointList;
            const res = await api.get(`/patient/insurance_order/inservice`, {patientId: patient.id});
            const end_list = res && res.length && res.map(i => i.serviceEndDate ? i.serviceEndDate : null);
            while (true) {
                if (pointList.length < this.limit) {
                    break;
                }
                this.skip = this.skip + this.limit;
                const list = await api.get(`/patient/${patient.id}/rewardpoints/record`, { skip: this.skip, limit: this.limit });
                if (list.length === 0) {
                    break;
                }
                this.pointList = [...this.pointList, ...list];
            }
            Jsbarcode(this.imgBox, patient.accountNo, { displayValue: false })
            this.loading = false
            this.setState({
                userInfo: patient,
                pointCount,
                serviceList: res,
                end_list:end_list ? end_list.sort((a, b) => b - a)  : [],
            })
            this.headingUrl = weixinUser.headimgurl;
        }catch(e){
            this.loading = false
            message.error(e.message)
        }
    }

    onFlowBoxClose() {
        this.setState({ flowListVisible: false });
    }

    onPointsClose() {
        this.setState({ flowListVisible: false });
    }

    gotoDetail(item) {
        switch (item) {
            case 1:
                this.props.history.push('/newUserMember');
                break;
            case 2:
                this.props.history.push('/newOrderList');
                break;
            case 3:
                this.props.history.push('/addressList');
                break;
            case 4:
                this.setState({modal1: true})
                break;
            case 5:
                this.props.history.push('/insuranceList');
                break;
        }
    }

    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    showCode() {
        this.setState({
            showcode: true
        })
    }

    showList() {
        this.setState({
            flowListVisible: true
        })
    }

    getInsurance() {
        toInsuranceByAds();
    }

    renderUserInfo() {
        const { userInfo, showcode, pointCount, serviceList, end_list } = this.state;
        const accountNo = userInfo && userInfo.accountNo && userInfo.accountNo.substring(0, 5) + ' ' + userInfo.accountNo.substring(5, 9) + ' ' + userInfo.accountNo.substring(9, 13);
        // const imgWidth = window.document.documentElement.clientWidth - 60;
        let nowTime = '';
        if (end_list && end_list.length > 0 && end_list[0]) {
            nowTime = end_list[0].split(' ')[0];
        }
        return (
            <div
                style={{ marginBottom: 20 }}
                className='mineInfoSty'
            >
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 16, paddingRight: 16, paddingTop: 30}}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 20, borderColor: '#fff', borderStyle: 'solid', borderWidth: 2, overflow: 'hidden', marginRight: 13 }}>
                            <img src={this.headingUrl || head} style={{ width: 40, height: 40 }} />
                        </div>
                        <span style={{ color: '#FFFFFF', fontSize: 22, lineHeight: 1, marginLeft: 5, marginRight: 6 }}>{userInfo.name}</span>
                        {serviceList && serviceList.length ? <span style={{ color: '#C8161D', fontSize: 14, padding: '2px 10px',backgroundColor: '#FAE7CB', borderRadius: 10}}>万户健康会员</span> : null}
                    </div>
                    <img src={code} onClick={() => this.showCode()} />
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                    <div style={{
                        width: '100%',
                        height: 88,
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginLeft: 16,
                        marginRight: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around'}}>
                            <span style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>我的会员</span>
                            {serviceList && serviceList.length ? <span style={{ fontSize: 18, color: '#C8161D', fontWeight: 'bold'}}>{nowTime}</span> : <span style={{ fontSize: 18, color: '#C8161D', fontWeight: 'bold'}} onClick={() => this.getInsurance()}>立即领取</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around'}} onClick={() => this.showList()}>
                            <span style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>我的积分</span>
                            <span style={{ fontSize: 18, color: '#222222'}}>{pointCount}分</span>
                        </div>
                        {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <span style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>我的学分</span>
                            <p style={{ fontSize: 14, color: '#666666'}}>本月<span style={{ fontSize: 18, color: '#222222', fontFamily: 'DIN' }}>0</span></p>
                            <p style={{ fontSize: 14, color: '#666666'}}>总<span style={{ fontSize: 18, color: '#222222', fontFamily: 'DIN' }}>0</span></p>
                        </div> */}
                    </div>
                </div>
                {serviceList && serviceList.length ? null : <div className='mineInfoSty_banner'>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <span style={{ fontSize: 18, color: '#C8161D', marginRight: 7 }}>万户健康会员</span>
                        <span style={{ fontSize: 18, color: '#C8161D' }}>大病无忧保障</span>
                    </div>
                    <span className='get_btn' onClick={() => this.getInsurance()}>立即开通</span>
                </div>}
                <div className={showcode ? 'code_box_show' : 'code_box'}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}} className='code_1'>
                        <img ref={imgBox => this.imgBox = imgBox} style={{ height: 60, width: 214 }} />
                        <span style={{ color: '#333333', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>{accountNo}</span>
                    </div>
                    <p className='code_2' style={{ fontSize: 18, color: '#222222' }} onClick={() => this.setState({ showcode: false })}>关闭</p>
                </div>
                <PointsListDrawer
                    flowListVisible={this.state.flowListVisible}
                    onFlowBoxClose={this.onFlowBoxClose.bind(this)}
                    onClose={this.onPointsClose.bind(this)}
                    pointList={this.pointList}
                />
                <Modal
                    visible={this.state.modal1}
                    transparent
                    maskClosable={false}
                    onClose={this.onClose('modal1')}
                    title=""
                    footer={[{ text: '确定', onPress: () => { this.onClose('modal1')(); } }]}
                >
                    <span>没有可使用的优惠券</span>
                </Modal>
            </div>
        )
    }

    renderUserList() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: 16, paddingRight: 16, marginTop: 12 }}>
                <div className='mineListSty ' onClick={() => this.gotoDetail(1)}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <i className="iconfont" style={{ fontSize: 24, color: '#C8161D' }}>&#xe67e;</i>
                        <span style={{ fontSize: 18, color: '#222222', marginLeft: 10, lineHeight: 1, }}>
                            基本信息
                        </span>
                    </div>
                    <i className="iconfont">&#xe62b;</i>
                </div>
                <div className='mineListSty ' onClick={() => this.gotoDetail(5)}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <i className="iconfont" style={{ fontSize: 24, color: '#C8161D' }}>&#xe67d;</i>
                        <span style={{ fontSize: 18, color: '#222222', marginLeft: 10, lineHeight: 1, }}>
                            服务订单
                        </span>
                    </div>
                    <i className="iconfont">&#xe62b;</i>
                </div>
                <div className='mineListSty ' onClick={() => this.gotoDetail(2)}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <i className="iconfont" style={{ fontSize: 24, color: '#C8161D' }}>&#xe68f;</i>
                        <span style={{ fontSize: 18, color: '#222222', marginLeft: 10, lineHeight: 1, }}>
                            我的用药登记
                        </span>
                    </div>
                    <i className="iconfont">&#xe62b;</i>
                </div>
                {/* {
                    this.state.userInfo && this.state.userInfo.memberType == 1 ? null : ( */}
                        <div className='mineListSty ' onClick={() => this.gotoDetail(3)}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <i className="iconfont" style={{ fontSize: 24, color: '#C8161D' }}>&#xe61e;</i>
                                <span style={{ fontSize: 18, color: '#222222', marginLeft: 10, lineHeight: 1, }}>
                                    地址管理
                                    </span>
                            </div>
                            <i className="iconfont">&#xe62b;</i>
                        </div>
                    {/* )
                } */}

                <div className='mineListSty ' onClick={() => this.gotoDetail(4)}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <i className="iconfont" style={{ fontSize: 24, color: '#C8161D' }}>&#xe67f;</i>
                        <span style={{ fontSize: 18, color: '#222222', marginLeft: 10, lineHeight: 1, }}>
                            优惠券
                        </span>
                    </div>
                    <i className="iconfont">&#xe62b;</i>
                </div>
                <div style={{ height: '120px' }} />
            </div>
        )
    }

    render() {
        return (
            <div className="hasMenu newOrderInfo">
                <Title>我的</Title>
                <Comlon {...this.props} />
                <Spin spinning={this.loading}>
                    {this.renderUserInfo()}
                    {/* <AdsBanner isAdsOnly {...this.props}/> */}
                    {this.renderUserList()}
                </Spin>
                <div className={this.state.showcode ? 'showBac_1' : ""} />
                <div className="menu">
                    <TabBar {...this.props} />
                </div>
            </div>
        );
    }
}
