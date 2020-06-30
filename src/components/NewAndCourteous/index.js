import React from 'react';
import { Input, Button, message, Select, Modal } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import { centToYuan } from '../../helper/money';
import beijing from './images/beijing.png';
import buzhou from './images/buzhou.png';
import pho1 from './images/pho1.png';
import pho2 from './images/pho2.png';
import pho3 from './images/pho3.png';
import Weixin from '../../lib/weixin';

const Option = Select.Option;

@mount('newAndCourteous')
class NewAndCourteous extends React.Component {
    wx = new Weixin('onMenuShareAppMessage', 'onMenuShareTimeline');
    constructor(prop) {
        super(prop);
        this.state = {
            ready: false,
        }
    }

    @prop()
    patientId;

    @prop()
    name;

    @prop()
    patientInfo;

    @prop()
    loading;

    @prop()
    localHos;

    async componentDidMount() {
        this.webAllUrl = await api.get(`/getWebUrl`);
        this.getPatient();
        this.getPermission();
        this.getLocalHos();
    }

    getPermission = async () => {
        this.wx.ready();
        const shareParam = {
            title: `好友${this.name}邀请您参加【PBM福利计划】`, // 分享标题
            desc: '享慢病订药额外福利报销！', // 分享描述
            link: `${this.webAllUrl[3].url}/${this.patientId}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: '', // 分享图标
            success: function () {
            }
        };
        await this.wx.readyWithParam(shareParam);
        this.setState({
            ready: true
        });
    }

    @action()
    async getPatient() {
        try {
            this.loading = true;
            this.patientInfo = await api.get(`/newPatient`, this.patientId);
        } catch (e) {
            this.loading = false;
            console.error('getContactNo error ', e);
        }
    }

    @action()
    async getLocalHos() {
        try {
            this.loading = true;
            this.localHos = await api.get(`/getPatientHos`);
        } catch (e) {
            this.loading = false;
            console.error('getContactNo error ', e);
        }
    }

    render() {
        const styles = this.getStyles();
        if (!this.patientInfo) {
            return (
                <div className="registerBox">
                    <Title>拉新有礼</Title>
                </div>
            )
        }
        return (
            <div className="newAndCourteous">
                <div className="registerBox">
                    <Title>拉新有礼</Title>
                    <div style={styles.firstBox}>
                        <div>
                            <p style={{ fontSize: 17, color: '#333333', marginBottom: 24 }}>尊敬的{this.patientInfo.patientName}：</p>
                            <p style={{ fontSize: 17, color: '#333333', marginBottom: 6 }}>您已加入PBM<span style={{ fontSize: 24, color: '#ee6911', fontWeight: 'bold' }}>{this.patientInfo.days}</span>天，</p>
                            <p style={{ fontSize: 17, color: '#333333', marginBottom: 28 }}>节省药费<span style={{ fontSize: 24, color: '#ee6911', fontWeight: 'bold' }}>{centToYuan(this.patientInfo.refundMoney, 2)}</span>元。</p>
                            <p style={{ fontSize: 16, color: '#333333', marginBottom: 14 }}>为使更多人收益，现推出“拉新有礼”活动:</p>
                            <p style={{ fontSize: 17, color: '#ee6911', marginBottom: 10 }}>推荐家人朋友加入PBM计划，</p>
                            <p style={{ fontSize: 17, color: '#ee6911', marginBottom: 14 }}>推荐人可领<span style={{ fontSize: 24, fontWeight: 'bold' }}>{this.patientInfo.receivedMoney / 100}</span>元红包</p>
                            <p style={{ fontSize: 17, color: '#333333', marginBottom: 30 }}>快来参加吧！</p>
                            <p style={{ fontSize: 17, color: '#333333', marginBottom: 14 }}>您的PBM医务助理：<span style={{ fontWeight: 'bold' }}>{this.patientInfo.maName}</span></p>
                        </div>
                    </div>
                    <div style={styles.secondBox} />
                    <div style={styles.thirdBox}>
                        <div style={{ marginBottom: 36 }}>
                            <p style={styles.text1}><span style={styles.text2}>第1步</span>点击本页面右上角按钮，将活动分享给好友或朋友圈；</p>
                            <img src={pho1} width='100%' />
                        </div>
                        <div style={{ marginBottom: 36 }}>
                            <p style={styles.text1}><span style={styles.text2}>第2步</span>家人朋友用微信扫描或长按识别活动页二维码，关注PBM公众号，并完成签约登录（或持您的推广码到PBM定点机构签约）。</p>
                            <img src={pho2} width='100%' />
                        </div>
                        <div style={{ marginBottom: 36 }}>
                            <p style={styles.text1}><span style={styles.text2}>第3步</span>家人朋友签约成功后，您会收到短信或微信通知，找PBM医务助理领取红包即可。</p>
                            <img src={pho3} width='100%' />
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 30 }}><span style={{ marginRight: 2 }}>一</span>活动最终解释权归{this.localHos}所有<span style={{ marginLeft: 2 }}>一</span></p>
                </div>
            </div>

        )
    }

    getStyles() {
        return {
            firstBox: {
                paddingLeft: 30,
                paddingRight: 30,
                backgroundImage: `url(${beijing})`,
                backgroundSize: '375px 508px',
                backgroundRepeat: 'no-repeat',
                height: '508px',
                paddingTop: '70px',
                lineHeight: 1,
                marginBottom: 50,
            },
            secondBox: {
                backgroundImage: `url(${buzhou})`,
                backgroundSize: '202px 45px',
                backgroundRepeat: 'no-repeat',
                height: '45px',
                backgroundPosition: 'center',
                marginBottom: 36,
            },
            thirdBox: {
                paddingLeft: 15,
                paddingRight: 15,
            },
            text1: {
                fontSize: 16,
                color: '#333333',
                marginBottom: 15,
            },
            text2: {
                width: 60,
                height: 20,
                fontSize: 14,
                color: 'white',
                borderRadius: 10,
                backgroundColor: '#ee6911',
                display: 'inline-block',
                textAlign: 'center',
                marginRight: 10,
                lineHeight: 'initial',
            }
        }
    }
}

export default NewAndCourteous;
