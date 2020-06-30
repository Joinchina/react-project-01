import React, { Component } from 'react';
import { Tabs } from 'antd-mobile';
import { message } from 'antd';
import Insurance from './CreateInsurance';
import api from '../../api';
import Weixin from '../../lib/weixin';

const tabs = [
    // { title: '保障介绍', sub: 0 },
    // { title: '理赔说明', sub: 1 },
    { title: '加入保障', sub: 2 },
];

class CreateInsurancePage extends Component {
    wx = new Weixin('onMenuShareAppMessage', 'onMenuShareTimeline');
    constructor(props) {
        super(props);
        let { insurancePackageId } = this.props.match.params;
        if (!insurancePackageId) {
            insurancePackageId = this.props.insurancePackageId;
        }
        this.state = {
            insurancePackageId: insurancePackageId,
            scrollTop: false,
            tabPage: 0,
            tabList: [],
            insuranceConfig: null,
            tabCount: 1,
            insuranceImgList: null,
            nowTabList: []
        }
    }

    async componentDidMount() {
        try {
            const { insurancePackageId } = this.state;
            let insuranceConfig = await api.get(`/insurance/${insurancePackageId}/config`);
            const insurancePackages = await api.get(`/insurance_packages/${insurancePackageId}/products`);
            if (!insuranceConfig) {
                insuranceConfig = await api.get(`/insurance/${window.INSURANCE_PACKAGE_ID}/config`);
            }
            //首先删除cinfig中的老数据
            if(insuranceConfig.notification&&insuranceConfig.notification.length>=0){
                delete insuranceConfig.notification
            }
            //取出products接口中的协议type为7 102 103
            const agreement=[];
            insurancePackages[0].insurancePackageSpecs.map(item=>{
                if(item.type==7&&item.articleId){
                    item.relationWithInsurer=1
                    agreement.push(item)
                }else if(item.type==102&&item.articleId){
                    item.relationWithInsurer=2
                    agreement.push(item)
                }else if(item.type==103&&item.articleId){
                    item.relationWithInsurer=3
                    agreement.push(item)
                }
            });
            insuranceConfig.notification=agreement
            let nowTabList = [];
            if (insurancePackages && insurancePackages.length) {
                nowTabList[0] = {
                    title: insurancePackages[0].navOneDesc,
                    sub: 0,
                    imgList: insurancePackages[0].insurancePackageSpecs.length ? insurancePackages[0].insurancePackageSpecs.filter(i => i.type == 4) : []
                }
                nowTabList[1] = {
                    title: insurancePackages[0].navTwoDesc,
                    sub: 1,
                    imgList: insurancePackages[0].insurancePackageSpecs.length ? insurancePackages[0].insurancePackageSpecs.filter(i => i.type == 5) : []
                }
                nowTabList[2] = {
                    title: insurancePackages[0].navThreeDesc,
                    sub: 2,
                }
                document.title = insurancePackages[0].navTitle;
                this.props.setInsurance({packageName: insurancePackages[0].packageName})
            }
            this.setState({ insuranceConfig, tabCount:3 });
            const webAllUrl = await api.get(`/getWebUrl`);
            const patient = await api.get(`/currentPatient`);
            const shareCode = await api.get(`/patient/shareCode`)
            this.setState({
                webAllUrl,
                shareCode,
                patientId: patient && patient.id ? patient.id : '',
                insurancePackages,
                nowTabList
            })
            this.getPermission(webAllUrl)
            this.movieRef.addEventListener('scroll', this.handleScroll);
            if (this.props.insurance && this.props.insurance.payload) {
                const { position } = this.props.insurance.payload;
                if (position) {
                    this.movieRef.scrollBy({
                        top: position,
                        left: 0,
                    });
                }
            }
        } catch (e) {
            console.error('error', e);
            message.error(e.message);
        }

    }

    scroolInit() {
        if (this.props.insurance && this.props.insurance.payload) {
            const { position } = this.props.insurance.payload;
            if (position) {
                setTimeout(() => {
                    window.scrollTo(0, window.innerHeight);
                }, 100)
            }
        }
    }
    componentWillUnmount() {
        this.movieRef.removeEventListener('scroll', this.handleScroll);
    }


    handleScroll = (event) => {
        const { tabCount } = this.state;
        const pos = this.imgRef.getBoundingClientRect();
        if (pos.top <= 40) {
            this.setState({ scrollTop: true, tabPage: 0 });
        } else {
            this.setState({ scrollTop: false });
        }
        if (tabCount >= 2) {
            const thirdTab = this.thirdTab.getBoundingClientRect();
            if (thirdTab.top - 40 <= 10) {
                this.setState({ tabPage: tabCount - 1 });
            } else if (tabCount === 3) {
                const secondTab = this.secondTab.getBoundingClientRect();
                if (secondTab.top - 40 <= 10) {
                    this.setState({ tabPage: 1 });
                }
            }
        }

    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    onTabClick = async (tab, index) => {
        console.log(tab,index)
        await this.setPromise({ tabPage: index, scrollTop: true })
        if (tab.sub === 0) {
            let Y = this.firstTab.getBoundingClientRect().top + document.documentElement.scrollTop;
            this.movieRef.scrollBy({
                top: Y - 40,
                left: 0,
                behavior: 'smooth',
            });
        }
        if (tab.sub === 1) {
            let Y = this.secondTab.getBoundingClientRect().top + document.documentElement.scrollTop;
            this.movieRef.scrollBy({
                top: Y - 40,
                left: 0,
                behavior: 'smooth',
            });
        }
        if (tab.sub === 2) {
            let Y = this.thirdTab.getBoundingClientRect().top + document.documentElement.scrollTop;
            this.movieRef.scrollBy({
                top: Y - 40,
                left: 0,
                behavior: 'smooth',
            });
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
                    try {
                        await api.post(`/patient/shareNum`, { patientId: this.state.patientId || '', activityId: this.state.shareCode.id || '' })
                    } catch (e) {

                    }
                }
            }
        };
        await this.wx.readyWithParam(shareParam);
    }

    scroolPosition() {
        const position = this.movieRef.scrollTop;
        this.props.setInsurance({ position });
    }
    errorTab(){
        let Y = this.thirdTab.getBoundingClientRect().top + document.documentElement.scrollTop;
        this.movieRef.scrollBy({
            top: Y - 40,
            left: 0,
            behavior: 'smooth',
        });
    }
    render() {
        const { scrollTop, tabPage, insuranceConfig, insurancePackageId, insuranceImgList, insurancePackages, nowTabList } = this.state;
        const tabList = insuranceConfig && insuranceConfig.insuranceTags ? insuranceConfig.insuranceTags : tabs;

        let barBoxStyle = {};
        let ghostBoxStyle = {};
        if (scrollTop) {
            barBoxStyle = {
                position: 'absolute',
                top: '0px',
                width: '100%',
            }

            ghostBoxStyle = {
                height: '40px'
            }
        }
        const firstTab = nowTabList.find(item => item.sub === 0);
        let firstTabImgs;
        if (firstTab && firstTab.imgList) {
            firstTabImgs = firstTab.imgList.map((item, index) => {
                return (
                    <img src={item.url} style={{ width: '100%',pointerEvents: 'none' }} key={index} />
                )
            });
        }

        const secondTab = nowTabList.find(item => item.sub === 1);
        let secondTabImgs;
        if (secondTab && secondTab.imgList) {
            secondTabImgs = secondTab.imgList.map((item, index) => {
                return (
                    <img src={item.url} style={{ width: '100%',pointerEvents: 'none' }} key={index} />
                )
            });
        }
        const headImg = insurancePackages && insurancePackages.length && insurancePackages[0].insurancePackageSpecs.length ? insurancePackages[0].insurancePackageSpecs.filter(i => i.type == 3) : []
        return <div style={{ height: '100vh', overflowY: 'auto' }} ref={el => this.movieRef = el}>
            <div className="headerImg" >
                {headImg.length ? <img src={headImg[0].url} style={{ width: '100%' }} /> : null}
            </div>
            <div style={ghostBoxStyle} ></div>
            <div style={barBoxStyle}>
                <Tabs tabs={nowTabList}
                    initialPage={0}
                    onTabClick={this.onTabClick}
                    tabBarActiveTextColor="#F35D17"
                    tabBarTextStyle={{ fontSize: '18px' }}
                    tabBarUnderlineStyle={{ border: '1px #F35D17 solid' }}
                    ref={el => this.tabRef = el}
                    page={tabPage}
                />
            </div>
            <div ref={el => this.imgRef = el}>
                <div ref={ref => this.firstTab = ref}>
                    <div>
                        {firstTabImgs}
                    </div>
                </div>
                <div ref={ref => this.secondTab = ref} >
                    <div>
                        {secondTabImgs}
                    </div>
                </div>
                <div ref={ref => this.thirdTab = ref} >
                    <div>
                        <Insurance
                            {...this.props}
                            tabPage={tabPage}
                            toBuy={() => {
                                this.setState({ tabPage: 1 });
                                this.onTabClick({ title: '我要购买', sub: 3 }, 1);
                            }}
                            scroolPosition={() => this.scroolPosition()}
                            insurancePackageId={insurancePackageId}
                            insuranceConfig={insuranceConfig}
                            scroolInit={() => this.scroolInit()}
                            errorTab={()=>this.errorTab()}
                            nowTabList={nowTabList}
                        />
                    </div>
                </div>
            </div>

        </div>
    }
}

export default CreateInsurancePage;
