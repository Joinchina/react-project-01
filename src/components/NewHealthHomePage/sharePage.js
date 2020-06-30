import React, { Component } from 'react';
import Title from '../common/Title';
import { message } from 'antd'
import mount from '@wanhu/react-redux-mount';
import Weixin from '../../lib/weixin';
import api from '../../api';

@mount('sharePage')
export default class SharePage extends Component {
    wx = new Weixin('onMenuShareAppMessage', 'onMenuShareTimeline');

    async componentDidMount() {
        try{
            const webAllUrl = await api.get(`/getWebUrl`);
            const patient = await api.get(`/currentPatient`);
            const shareCode = await api.get(`/patient/shareCode`)
            this.getPermission(webAllUrl);
            this.setState({
                webAllUrl,
                shareCode,
                patientId: patient && patient.id ? patient.id : ''
            })
        }catch(e){
            message.error(e.message);
        }
    }

    getPermission = async (webAllUrl) => {
        this.wx.ready();
        const shareParam = {
            title: `大病保障免费领，老有所保儿女无忧！`, // 分享标题
            desc: '限时领取，先到先得', // 分享描述
            link: `${webAllUrl[4].url}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: 'https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/sharedSmallImg.jpg', // 分享图标
            success: async () => {
                if (this.state.patientId) {
                    try{
                        await api.post(`/patient/shareNum`, { patientId: this.state.patientId || '', activityId: this.state.shareCode.id || '' })
                    }catch(e) {

                    }
                }
            }
        };
        await this.wx.readyWithParam(shareParam);
    }

    render() {
        return (
            <div className="hasMenu">
                <Title>万户宝-老有所保儿女无忧</Title>
                <img src="https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/insurance/sharePage.jpg" style={{ width: '100%'}} />
            </div>
        )
    }
}
