import React, { Component } from 'react';
import { message, Spin, Carousel } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import Comlon from '../common/Comlon';
import TabBar from '../common/TabBar';
import PointsListDrawer from './points_list'
import AdsBanner from '../Ads';
import Weixin from '../../lib/weixin';
import ctz from '../../states/images/ctz.png'
import cxt from '../../states/images/cxt.png'
import cxy from '../../states/images/cxy.png'
import fxwhb from '../../states/images/fxwhb.png'
import gypz from '../../states/images/gwpz.png'
import hyr from '../../states/images/hyr.png'
import yj from '../../states/images/yj.png'
import CCVDCheck from '../../states/images/CCVDCheck.png'
import d_eva from '../../states/images/d_eva.png'

const aty = [
    { name: '分享万户宝', id: 2, pic: fxwhb, done: true },
    { name: '心脑血管风险评估', id: 9, pic: CCVDCheck, done: true },
    { name: '用药评估', id: 10, pic: d_eva, done: true },
    { name: '体重评估', id: 5, pic: ctz, done: true },
    { name: '上传药单', id: 1, pic: gypz, done: true },
    { name: '测血压', id: 4, pic: cxy, done: true },
    { name: '测血糖', id: 3, pic: cxt, done: true },
    { name: '控烟酒', id: 6, pic: yj, done: true },
]

@mount('newHealthHomePage')
class NewHealthHomePage extends Component {

    @prop()
    pointList = [];

    @prop()
    skip = 0;

    @prop()
    limit = 50;

    @prop()
    loading = false;

    @prop()
    weixinUser

    @prop()
    patientInfo

    wx = new Weixin('onMenuShareAppMessage', 'onMenuShareTimeline');
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            flowListVisible: false,
            insuranceBanner: [],
            patientInfo: null,
            pointCount: 0,
        }
    }

    componentDidMount() {
        this.init();
    }

    async goHref(data) {
        const res = await api.get(`/patient/insurance_order/inservice`, {patientId: this.state.patientId})
        const patient = await api.get(`/currentPatient`);
        const isjianguan = res && res.length ? res.find(i => i.products.length ? i.products.find(j => j.insuranceProductType == 3) : null) : false;
        const ispinggu = res && res.length ? res.find(i => i.products.length ? i.products.find(j => j.insuranceProductType == 3) : null) : false;
        if (data.id === 1) {
            if (!this.state.patientId) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/newHealthHomePage`)}`
            } else {
                this.props.history.push(`/newMedicineCredentials`)
            }
        } else if (data.id === 2) {
            window.location.href = '/sharePage'
        } else if (data.id === 8) {
            this.props.history.push(`/pointRule`)
        } else if (data.id === 7) {
            this.props.history.push(`/howToUsePoint`)
        } else if (data.id === 5) {
            if (!this.state.patientId) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/newHealthHomePage`)}`
            } else {
                this.props.history.push(`/newBMI`)
            }
        } else if (data.id === 9) {
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            if(isjianguan){
                this.props.history.push(`/redirect/miniProgram`)
            }else{
                message.warning('您尚未领取或购买包含该服务的会员权益')
            }
        } else if (data.id === 10) {
            if (!patient) {
                window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
            }
            if(ispinggu){
                this.props.history.push(`/drugEvaluation`)
            }else{
                message.warning('您尚未领取或购买包含该服务的会员权益')
            }
        }else{
            message.warning('功能尚未开放')
        }
    }

    showList() {
        if (!this.state.patientInfo) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/newHealthHomePage`)}`
            return;
        }
        this.setState({
            flowListVisible: true
        })
    }

    onFlowBoxClose() {
        this.setState({ flowListVisible: false });
    }

    onClose() {
        this.setState({ flowListVisible: false });
    }

    @action()
    async init() {
        try {
            this.weixinUser = await api.get('/currentUser');
            this.setState({
                selectCity: this.weixinUser.address.city,
            })
        } catch (err) {

        }
        try {
            this.loading = true;
            const patient = await api.get(`/currentPatient`);
            const insuranceList = await api.get(`/ads`);
            this.setState({ insuranceBanner: insuranceList });
            const patient_id = patient.id;
            let pointCount = 0
            if (patient_id) {
                pointCount = await api.get(`/patient/${patient_id}/rewardpoints`);
                const pointList = await api.get(`/patient/${patient_id}/rewardpoints/record`, { skip: this.skip, limit: this.limit });
                this.pointList = pointList;
                while (true) {
                    if (pointList.length < this.limit) {
                        break;
                    }
                    this.skip = this.skip + this.limit;
                    const list = await api.get(`/patient/${patient_id}/rewardpoints/record`, { skip: this.skip, limit: this.limit });
                    if (list.length === 0) {
                        break;
                    }
                    this.pointList = [...this.pointList, ...list];
                }
            } else {

            }
            this.loading = false;
            this.setState({
                pointCount,
                patientId: patient.id,
                patientInfo: patient
            })
        } catch (e) {
            this.loading = false
        }

    }

    toInsurance(url) {
        window.location.href = url
    }

    addressSelect() {
        const pathName = this.props.history.location.pathname
        window.location.href = `/addressSelect?r=${encodeURIComponent(`${pathName}`)}`
    }

    renderBanner() {
        return (
            <Carousel
                autoplay
                infinite
                dotStyle={{ background: '#ffffff', opacity: '0.5' }}
                dotActiveStyle={{ background: '#ffffff' }}
            >
                {this.state.insuranceBanner.map(val => (
                    <a
                        key={val}
                        onClick={() => this.toInsurance(val.url)}
                        style={{ display: 'inline-block', width: '100%', }}
                    >
                        <img
                            src={val.bannerImg}
                            alt=""
                            style={{ width: '100%', verticalAlign: 'top' }}
                            onLoad={() => {
                                window.dispatchEvent(new Event('resize'));
                                this.setState({ imgHeight: 'auto' });
                            }}
                        />
                    </a>
                ))}
            </Carousel>
        )
    }

    renderPoints() {
        return (
            <div style={{ marginBottom: 24, marginTop: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 16, paddingLeft: 16, marginBottom: 12, lineHeight: 1 }}>
                    <p
                        style={{ color: '#333333', fontSize: 18, fontWeight: 'bold' }}
                    >
                        万户健康积分
                    </p>
                    {/* <p style={{ color: '#666666', fontSize: 14}} onClick={() => this.goHref({id: 7})}>积分怎么用？</p> */}
                </div>
                <div>
                    <div className="pointDetail" >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <img src={hyr} style={{ marginRight: 16, maxWidth: 79, maxHeight: 63 }} />
                            <p style={{ fontSize: 30, color: '#333333', fontFamily: 'DIN', fontWeight: 'bold' }}>
                                {this.state.pointCount}
                                <span style={{ fontSize: 14 }}>分</span>
                            </p>
                        </div>
                        <div
                            style={{ width: 72, height: 28, borderWidth: 1, borderColor: '#418DC7', borderRadius: 14, color: '#418DC7', borderStyle: 'solid', textAlign: 'center', lineHeight: '26px' }}
                            onClick={() => this.showList()}
                        >
                            积分明细
                        </div>
                    </div>
                    <AdsBanner {...this.props}/>
                </div>
                <PointsListDrawer
                    flowListVisible={this.state.flowListVisible}
                    onFlowBoxClose={this.onFlowBoxClose.bind(this)}
                    onClose={this.onClose.bind(this)}
                    pointList={this.pointList}
                />
            </div>
        )
    }

    renderList() {
        return (
            <div style={{ lineHeight: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 16, paddingLeft: 16 }}>
                    <p
                        style={{ color: '#333333', fontSize: 18, fontWeight: 'bold' }}
                    >
                        保健康赚积分
                    </p>
                    {/* <p style={{ color: '#666666', fontSize: 14}} onClick={() => this.goHref({id: 8})}>积分规则</p> */}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 10 }}>
                    {aty.map((i, index) => {
                        return (
                            <div
                                style={{
                                    width: '33.3%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: i.done ? 14 : 0, height: 120
                                }}
                                onClick={() => this.goHref(i)}
                                key={index}
                            >
                                <img src={i.pic} style={{ width: 60, height: 60, marginBottom: 12, opacity: i.done ? 1 : 0.5 }} />
                                <p style={{ marginBottom: 0, textAlign: 'center', color: i.done ? '#222222' : '#b2b2b2', fontSize: 14, lineHeight: '16px' }}>{i.name}</p>
                                {i.done ? '' : <p style={{ marginBottom: 0, textAlign: 'center', color: '#b2b2b2', fontSize: 14, lineHeight: '16px' }}>尚未开放</p>}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    renderAddress() {
        return (
            <div
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 18, marginBottom: 16, marginTop: 19 }}
                 onClick={() => this.addressSelect()}
            >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', maxWidth: '50%' }}>
                    <i
                        className="address_icon"
                        style={{ lineHeight: 1, marginRight: 3 }}
                    >
                        &#xe643;
                    </i>
                    <span style={{ fontSize: 16, color: '#F48E18' }}>{this.state.selectCity || ''}</span>
                </div>
                <a style={{ color: '#418DC7', fontSize: 14, width: 163, textAlign: 'right'}}>点此切换城市＞</a>
            </div>
        )
    }

    render() {
        return (
            <div className="hasMenu firstNewPage">
                <Title>首页</Title>
                <Comlon {...this.props} />
                <Spin spinning={this.loading}>
                    {(this.state.patientInfo && this.state.patientInfo.memberType == 2) || !this.state.patientInfo ? this.renderAddress() : null}
                    {this.renderBanner()}
                    {this.renderPoints()}
                    {this.renderList()}
                    <div style={{ height: 49 }} />
                </Spin>
                <div className="menu">
                    <TabBar {...this.props} />
                </div>
            </div>
        )
    }
}

export default NewHealthHomePage;
