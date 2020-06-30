import React, { Component } from 'react';
import { Spin } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../../api';
import Title from '../../common/Title';
import Comlon from '../../common/Comlon';
import AdsBanner from '../../common/AdsBanner';
import TaskBanner from './TaskBanner';
import PointBanner from './PointBanner';
import HealthClass from './HealthClass';
import DaySelected from './DaySelected';
import TabBar from '../../common/TabBar';
import Weixin from '../../../lib/weixin';
import InsuranceList from '../../Insurancehome/index'
import './index.less'

@mount('newHealthHomePage')
class NewHealthHomePage extends Component {

    @prop()
    weixinUser

    @prop()
    patientInfo

    wx = new Weixin('onMenuShareAppMessage', 'onMenuShareTimeline');
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            selectCity: null
        }
    }

    componentDidMount() {
        this.init();
    }

    @action()
    async init() {
        try {
            this.weixinUser = await api.get('/currentUser');
            const code = await api.get(`/insurance_packages`,{skip:0,limit:1,positions:'1'});
            this.setState({
                selectCity: this.weixinUser.address.city,
                insurance_list: code
            })
        } catch (err) {

        }
        try {
            this.patientInfo = await api.get(`/currentPatient`);
            this.setState({
                patientInfo: this.patientInfo
            })
        } catch (e) {

        }
    }


    addressSelect() {
        const pathName = this.props.history.location.pathname
        window.location.href = `/addressSelect?r=${encodeURIComponent(`${pathName}`)}`
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
                <a style={{ color: '#418DC7', fontSize: 14, width: 163, textAlign: 'right' }}>点此切换城市＞</a>
            </div>
        )
    }

    render() {
        const { insurance_list } = this.state;
        return (
            <div className="hasMenu firstNewPage pbmMain">
                <Title>会员专区</Title>
                <Comlon {...this.props} />

                {(this.state.patientInfo && this.state.patientInfo.memberType == 2)
                    || !this.state.patientInfo
                    ? this.renderAddress()
                    : null}
                <AdsBanner positionName='公众号首页Banner广告' />
                <TaskBanner patientId ={this.state.patientInfo ? this.state.patientInfo.id : null} {...this.props}/>

                {/* <PointBanner patientInfo={this.patientInfo} {...this.props} /> */}
                <HealthClass {...this.props} />
                {insurance_list && insurance_list.length ?<InsuranceList/> : null}
                <DaySelected hospital={this.state.patientInfo ? this.state.patientInfo.hospital : null} {...this.props} />
                <div style={{ height: 49 }} />
                <div className="menu">
                    <TabBar {...this.props} />
                </div>
            </div>
        )
    }
}

export default NewHealthHomePage;
