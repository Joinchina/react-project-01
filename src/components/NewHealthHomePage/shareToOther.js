import React, { Component } from 'react';
import Title from '../common/Title';
import mount from '@wanhu/react-redux-mount';
import './index.less'

@mount('shareToOther')
export default class ShareToOther extends Component {
    render() {
        return (
            <div className="hasMenu share_to_other" style={{ display: 'flex', flexDirection: 'column'}}>
                <Title>万户宝-老有所保儿女无忧</Title>
                <img src="https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/insurance/sharedToOthenPage.jpg" style={{ width: '100%' }}/>
                <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fad4aa'}}>
                    <a
                        style={{ display: 'block', width: 210, height: 44, textAlign: 'center', lineHeight: '44px', color: '#fff', fontSize: 18, borderRadius: 22}}
                        href='https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA3NDM0MDQ4MA==&scene=110#wechat_redirect'
                        className="share_btn"
                    >
                        立即领取
                    </a>
                    <p style={{ fontSize: 16, color: '#e95513' }}>(关注公众号-注册会员)</p>
                </div>
            </div>
        )
    }
}
