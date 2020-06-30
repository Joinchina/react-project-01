import React from 'react';
import './index.less'
export default function RedirectMiniProgram() {

    return (
        <div className="ban">
            <img src={`https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/mini-program/${window.WEIXIN_MINI_APP_ID}.png`}
                style={{ width: '100vw'}}
            />
        </div>
    )
}
