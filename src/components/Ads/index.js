import React, { Component } from 'react';

import './index.less';
const adsList = [
    {
        imgUrl: 'https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/ads_video.png',
        type: 'video',
        adsUrl: '/ads/video',
    },
    {
        imgUrl: 'https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/ads_insurance.png',
        type: 'form',
        adsUrl: '/ads/insuranceForm',
    },
    {
        imgUrl: 'https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/ads_card.png',
        type: 'form',
        adsUrl: '/ads/cardForm',
    },
    {
        imgUrl: 'https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/ads_video.png',
        type: 'video',
        adsUrl: '/ads/video',
    },
];
class AdsBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: null,
            height: null,
        }
    }

    toAds(item) {
        this.props.history.push(`${item.adsUrl}${this.props.history.location.search}${this.props.history.location.search ? '&' : '?'}r=${encodeURIComponent(this.props.history.location.pathname)}`);
    }

    componentDidUpdate() {
        const { clientWidth, clientHeight } = this.adsBox;
        const { width, height } = this.state;
        if (!width) {
            const width = clientWidth / 3.43
            const height = width * 68 / 100;
            this.setState({
                width: `${width}px`,
                height: `${height + 24}px`,
                adsBoxHeight: `${height + 34}px`
            });
        }
    }
    render() {
        const { isAdsOnly } = this.props;
        const { width, height, adsBoxHeight } = this.state;
        return (
            <div
                className={`pointAds ${window.ADS_IS_SHOW ? '' : 'hiddenBox'} ${isAdsOnly ? 'pointAdsOnly' : ''}`}
                style={height ? { height } : {}}
            >
                <div
                    className="adsBox"
                    ref={el => this.adsBox = el}
                    style={adsBoxHeight ? { height: adsBoxHeight } : {}}
                >
                    {adsList.map(item => (
                        <div
                            className="adsImg"
                            onClick={() => this.toAds(item)}
                        >
                            <img src={item.imgUrl} style={width ? { width } : {}} />
                        </div>)
                    )}
                </div>
            </div>
        )
    }
}
export default AdsBanner;
