import React, { Component } from 'react';
import querystring from 'query-string';
import { Spin } from 'antd';
import Title from '../common/Title';
import api from '../../api';
import AdsBanner from '../common/AdsBanner';
import play_icon from './images/play_icon.png';
import StartImg from './images/start.png'
import test_pic from './images/test_pic.png';
import './index.less';

const tys = {
    overflow: 'hidden',
    display: '-webkit-box',
    'WebkitBoxOrient': 'vertical',
    'WebkitLineClamp': 2,
    'msTextOverflow': 'ellipsis',
    'textOverflow': 'ellipsis',
    'fontSize': '16px',
    color: '#222222',
}

class HealthClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: '',
            width1: '',
            height: '',
            height1: '',
            startPlayVisible: true,
            loading: true
        }
    }

    componentDidMount() {
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        this.init(queryData.id);
        const { width, height, width1, height1 } = this.state;
        if(this.box2_list){
            const { clientWidth, clientHeight } = this.box2_list;
            if (!width) {
                const width = clientWidth / 2.27;
                const height = width * 68 / 100;
                this.setState({
                    width: `${width}px`,
                    height: `${height + 24}px`,
                    adsBoxHeight: `${height + 34}px`
                });
            }
        }
    }

    async init(id) {
        const { articleInfo } = this.state;
        if (articleInfo && articleInfo.id == id) return;
        try{
            const articleInfo = await api.get('/getArticleDetail', { articleId: id });
            const where = {
                "articleCategory": articleInfo.articleCategoryName, //如存在，分类范围不能为空
                "articleCategoryRange": 1, //分类范围 1=当前分类 2=当前和子分类
                "articleType": 1 //文章类型 1=视频 2=文本
            }
            const self_list = await api.get('/getArticles', { where, skip: 0, nearBy: true }) // 选集
            const other_where = {
                "articleCategory":  { "$neq": articleInfo.articleCategoryName }, //如存在，分类范围不能为空
                "articleParentCategory": articleInfo.articleParentCategoryName,
                "articleType": 1, //文章类型 1=视频 2=文本
                createddate: { "$lt": articleInfo.createddate },
            }
            const other_self_list = await api.get('/getArticles', { where: other_where, skip: 0, limit: 5, nearBy: true }) // 选集
            const nowimg = articleInfo.imgs ? articleInfo.imgs.split(',')[0] : ''
            this.setState({
                articleInfo,
                self_list,
                other_self_list,
                videoItem: `<video \n    id=\"my_video\" width=\"100%\" poster=${nowimg} src=${articleInfo.videoAddress} \n    webkit-playsinline=\"true\" \n      playsinline=\"true\" \n  controls      x-webkit-airplay=\"allow\" \n         x5-video-orientation=\"landscape\">\n    </video>`,
                loading: false,
                startPlayVisible: true
            })
            setTimeout(() => {
                this.init_play_video()
            })
        }catch(err){
            console.log(err.message)
        }
    }

    init_play_video() {
        var ua = navigator.userAgent.toLocaleLowerCase();
        // x5内核
        if (ua.match(/tencenttraveler/) != null || ua.match(/qqbrowse/) != null) {	
            document.querySelector('video').setAttribute('x-webkit-airplay', true);
            document.querySelector('video').setAttribute('x5-playsinline', true);
            document.querySelector('video').setAttribute('webkit-playsinline', true);
            document.querySelector('video').setAttribute('playsinline', true);
            // x5内核 启用同层H5播放器（会有黑屏缓冲问题）
            document.querySelector('video').setAttribute('x5-video-player-type', 'h5');
            document.querySelector('video').setAttribute('x5-video-player-fullscreen', true);
        } else {
            // ios端
            document.querySelector('video').setAttribute('webkit-playsinline', true);
            document.querySelector('video').setAttribute('playsinline', true);
        }
    }

    o_play() {
        var video = document.getElementById("my_video");
        const that = this;
        if (window.WeixinJSBridge) {
            window.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                video.paused ? video.play() : video.pause();
                that.setState({
                    startPlayVisible: video.paused ? true: false
                })
            }, false);
        } else {
            document.addEventListener("WeixinJSBridgeReady", function () {
                window.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                    video.paused ? video.play() : video.pause();
                    that.setState({
                        startPlayVisible: video.paused ? true: false
                    })
                });
            }, false);
        }
    }

    play_video_1() {
        const videoObj = document.getElementById('my_video');
        if(videoObj.paused){
            // 如果视频处于播放状态
            videoObj.play()
            this.setState({
                startPlayVisible: false
            })
        }else{
            videoObj.pause()
            this.setState({
                startPlayVisible: true
            })
        }
    }

    setPromise(data) {
        const that = this
        return new Promise((resolve, reject) => {
            that.setState(data, resolve)
        })
    }

    renderBox1() {
        const { articleInfo, startPlayVisible } = this.state;
        return (
            <div className="box_1">
                <div style={{ position: 'relative' }}>
                    <div dangerouslySetInnerHTML={{ __html: this.state.videoItem }}/>
                    {/* <div dangerouslySetInnerHTML={{ __html: this.state.videoItem }} onClick={() => this.o_play()} /> */}
                    {/* <div className={`startSty ${startPlayVisible ? '' : 'videoBoxHidden'}`} onClick={() => this.play_video_1()}>
                        <img src={StartImg} style={{ height: '50px', width: '50px' }} />
                    </div> */}
                </div>
                <p className='box_1_text_sty'>{articleInfo && articleInfo.title}</p>
            </div>
        )
    }

    renderBox2() {
        const { self_list, articleInfo } = this.state;
        return (
            <div className="box_2">
                <p className='box2_title'>选集</p>
                <div className='box2_list' ref={el => this.box2_list = el}>
                    {self_list && self_list.length ? self_list.map((i) => {
                        return (
                            <div className={i.id == articleInfo.id ? 'box2_list_item_selected' : 'box2_list_item'} style={{ width: this.state.width }} onClick={() => this.init(i.id)}>
                                <span className={i.id == articleInfo.id ? 'box2_list_item_textSty_palyed' : 'box2_list_item_textSty'} style={tys}>{i.title}</span>
                                {i.id == articleInfo.id ? <p style={{ color: '#C8161D', fontSize: 12, display: 'flex', alignItems: 'center', marginTop: 10 }}>当前播放<img src={play_icon} /></p> : null}
                            </div>
                        )
                    }) : null}
                    <div style={{ width: 12 }} />
                </div>
            </div>
        )
    }

    renderBox3() {
        return (
            <AdsBanner positionName='公众号健康课堂详情Banner广告' />
        )
    }

    renderBox4() {
        const { other_self_list, width1 } = this.state;
        return (
            <div className='box_4'>
                <p className='box4_title'>相关课程</p>
                <div className='box4_listBox' ref={el => this.box4_listBox = el}>
                    {other_self_list && other_self_list.length ? other_self_list.map((i) => {
                        return (
                            <div className='box4_list_item' style={{ width: this.state.width}} onClick={() => this.init(i.id)}>
                                <div className='box4_1' style={{ position: 'relative' }}><img src={i.imgs ? i.imgs.split(',')[0] : ''} className='box4_img'/>{i.videoNum > 1 ? <p style={{ position: 'absolute', bottom: 4, right: 4, padding: '1px 8px', backgroundColor: '#222222', color: '#ffffff', fontSize: 12, opacity: 0.6, borderRadius: 10 }}>全{i.videoNum}课</p> : null}</div>
                                <span className='box4_text' style={tys}>{i.title || ''}</span>
                            </div>
                        )
                    }) : null}
                </div>
            </div>
        )
    }

    render() {
        const { other_self_list } = this.state;
        return (
            <div className='health_box'>
                <Title>健康课堂详情</Title>
                <Spin spinning={this.state.loading}>
                    {this.renderBox1()}
                    <div style={{ height: 10, backgroundColor: '#F9F9F9'}} />
                    {this.renderBox2()}
                    {this.renderBox3()}
                    {other_self_list && other_self_list.length ? this.renderBox4() : null}
                </Spin>
            </div>
        )
    }
}

export default HealthClass;