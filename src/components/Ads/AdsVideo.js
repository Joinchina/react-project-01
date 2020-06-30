import React, { Component } from 'react';
import './index.less';
import SuccessModal from './success';
import { Icon, Button } from 'antd';
import Title from '../common/Title';

import StartImg from './images/start.png'
import PointImg from './images/point.png';

const videoItem = "<video \n poster=\"https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/vedio-wanhu/poster.png\" style=\"width: 100%; height: 100%; display: block; position: absolute; top: 0\"\n        id=\"vido_one\" width=\"100%\" height=\"100%\"  src=\"https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/vedio-wanhu/AlipayYouTube.mp4\" \n    webkit-playsinline=\"true\" \n        playsinline=\"true\" \n        x-webkit-airplay=\"allow\" \n        webkit-playsinline\n        playsinline\n        x5-video-player-type=\"h5\"\n        x5-video-player-fullscreen=\"false\" \n        x5-video-orientation=\"portraint\">\n    </video>"

class AdsVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowView: false,
            startPlayVisible: true,
            videoTime: 15,
            second: 15,
            visible: true,
            success: false,
        }
    }

    tick() {
        const { second } = this.state;
        if (second <= 0) {
            this.setState({ success: true })
            clearInterval(this.interval);
        }
        this.setState({ second: second - 1 });
    }

    onClose = () => {
        this.setState({ visible: false });
    }

    componentWillUnmount() {
        if (this.player) {
            this.player.dispose();
        }
        clearInterval(this.interval);
    }

    playVideo() {
        var video = document.getElementById("vido_one");
        if (window.WeixinJSBridge) {
            window.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                video.play();
            }, false);
        } else {
            document.addEventListener("WeixinJSBridgeReady", function () {
                window.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                    video.play();
                });
            }, false);
        }
        video ? video.play() : '';
        this.setState({ startPlayVisible: false });
        this.interval = setInterval(() => this.tick(), 1000)
    }

    downloadApp() {
        window.location.href = "https://a.app.qq.com/o/simple.jsp?pkgname=com.eg.android.AlipayGphone&fromcase=40002"
    }

    render() {
        const { success, visible, second, startPlayVisible, videoTime } = this.state;
        return (
            <div className="adsVideo" style={{ width: '100vw', height: '100%', background: '#000', }}>
                <Title>广告</Title>
                <div className="adsVideo" style={{ width: '100vw' }}>
                    <div className="IOSVideo">
                        <div dangerouslySetInnerHTML={{ __html: videoItem }}>
                    </div>
                    </div>
                    <SuccessModal success={success} {...this.props} title="播放完毕 获得奖励" point={50} nextTask="/ads/insuranceForm"/>
                    <div className={`startBox ${startPlayVisible ? '' : 'videoBoxHidden'}`}>
                        <div onClick={() => { this.playVideo() }}>
                            <img src={StartImg} style={{ height: '120px' }} />
                        </div>
                    </div>
                    <div className={`videoBox ${visible ? '' : 'videoBoxHidden'}`}>
                        <div className="close" onClick={() => this.onClose()}><Icon type="close" width="17px" /></div>
                        <div className="imgBox">
                            <img src="https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/vedio-wanhu/WechatIMG137.png" />
                        </div>
                        <div className="buttom">
                            <Button className="downloadBtn" onClick={() => this.downloadApp()}><Icon type="download" />立即下载</Button>
                        </div>
                    </div>
                    {second > 0 ? <div className="toastBox">
                        <img src={PointImg} />{second === videoTime ? `点击播放，领取积分` : `${second}秒后可领50积分`}
                    </div> : null}

                </div>
            </div>
        )
    }
}

export default AdsVideo;
