import React from 'react';
import { Form, Icon } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../api';
import Title from '../common/Title';
import banner from './images/banner.png';
import './index.less'

@mount('newAndShare')
class NewShare extends React.Component {

    @prop()
    patientId;

    @prop()
    patientInfo;

    @prop()
    loading;

    @prop()
    webUrl;

    @prop()
    label;

    @prop()
    qrCode;

    @prop()
    webAllUrl;

    async componentDidMount() {
        await this.getPatient();
        await this.getWxLabel();
        this.getPbmRoute();
        this.getQrCode();
    }

    @action()
    async getWxLabel() {
        try{
            this.loading = true;
            this.label = await api.get(`/sharePage`);
        }catch (e) {
            this.loading = false;
            console.error('getContactNo error ',e);
        }
    }

    @action()
    async getPatient() {
        try{
            this.loading = true;
            this.patientInfo = await api.get(`/newPatient`, this.patientId);
        }catch (e) {
            this.loading = false;
            console.error('getContactNo error ',e);
        }
    }

    @action()
    async getQrCode() {
        if(this.loading){
            try{
                this.loading = true;
                this.qrCode = await api.get(`/qr-code`, {label: this.label, sceneId: this.patientInfo.businessCode});
            }catch (e) {
                this.loading = false;
                console.error('getContactNo error ',e);
            }
        }
    }

    @action()
    async getPbmRoute() {
        try{
            this.loading = true;
            this.webAllUrl = await api.get(`/getWebUrl`);
        }catch (e) {
            this.loading = false;
            console.error('getContactNo error ',e);
        }
    }

    goChoicePage(data) {
        if (data === 1) {
            window.location.href = this.webAllUrl[0].url;
        } else if (data === 2) {
            window.location.href = this.webAllUrl[2].url;
        } else {
            window.location.href = this.webAllUrl[1].url;
        }
    }

    render() {
        const styles = this.getStyles();
        if(!this.patientInfo || !this.label || !this.qrCode){
            return (
                <div className="registerBox">
                    <Title>PBM福利计划</Title>
                </div>
            )
        }
        return (
            <div className="registerBox">
                <Title>PBM福利计划</Title>
                <div style={{ lineHeight: 0 }}>
                    <img src={banner} width='100%' />
                </div>
                <div style={{ paddingLeft: 15, paddingRight: 15 }} className='sharePageStyle'>
                    <div style={{ marginTop: 28, marginBottom: 28, paddingLeft: 15, paddingRight: 15 }}>
                        <p style={{ fontSize: 17, color: '#803a20' }}>目前全国已有<span style={styles.textNum}>{this.patientInfo.beneficiaries}</span>位PBM受益人，我是<span style={styles.txtName}>{this.patientInfo.patientName}</span>，已参加PBM<span style={styles.textNum}>{this.patientInfo.days}</span>天，邀请您一起加入！</p>
                    </div>
                    <div style={styles.shareThirdBox}>
                        <div style={styles.shareThirdBoxOne} className='firstShareBox'>
                            <span style={styles.wayStyle} className='waylitleBox'>方法1</span>
                            <p style={styles.shareTextSty}>长按识别或微信扫描下方二维码，关注“万户健康PBM”公众号签约</p>
                            <div style={{ height: 106, textAlign: 'center' }}>
                                <img src={this.qrCode} width='106px' height='106px' />
                            </div>
                            <p style={{ fontSize: 16, color: '#333333', marginTop: 12, textAlign: 'center' }}>万户健康PBM二维码</p>
                        </div>
                        <div style={styles.shareThirdBoxTwo} className='firstShareBox'>
                            <span style={styles.wayStyle} className='waylitleBox'>方法2</span>
                            <p style={styles.shareTextSty}>直接前往附近的PBM定点机构，出示我的推广码现场签约</p>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <span className='shareNumBoxSty'>
                                    {this.patientInfo.businessCode}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: 30 }}>
                        <a className='textHover' onClick={() => this.goChoicePage(1)}>
                            <Icon type="search" /><span style={styles.btoSearchText}>点这里找离您最近的PBM定点机构</span>
                        </a>
                        <a className='textHover' onClick={() => this.goChoicePage(2)}>
                            <Icon type="search" /><span style={styles.btoSearchText}>点这里看您的药品在PBM额外报销多少</span>
                        </a>
                        <a className='textHover' onClick={() => this.goChoicePage(3)}>
                            <Icon type="search" /><span style={styles.btoSearchText}>点这里了解下PBM福利计划是啥</span>
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    getStyles() {
        return {
            shareThirdBox: {
                marginBottom: 30,
            },
            shareSecondBox: {
                borderBottomColor: '#ddd',
                borderBottomWidth: 1,
                borderBottomStyle: 'dashed'
            },
            shareThirdBoxOne: {
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#ee6911',
                borderStyle: 'solid',
                paddingLeft: 15,
                paddingRight: 15,
                borderRadius: 15,
                height: 270,
            },
            shareThirdBoxTwo: {
                borderWidth: 1,
                borderColor: '#ee6911',
                borderStyle: 'solid',
                paddingLeft: 15,
                paddingRight: 15,
                borderRadius: 15,
                height: 187,
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
                borderRadius: '10',
                backgroundColor: '#ee6911',
                display: 'inline-block',
                textAlign: 'center',
                marginRight: 10,
                lineHeight: 'initial',
            },
            textNum: {
                fontSize: 22,
                color: '#ee6911',
                fontWeight: 'bold',
            },
            txtName: {
                fontSize: 17,
                color: '#ee6911',
                fontWeight: 'bold',
            },
            wayStyle: {
                display: 'inline-block',
                width: 70,
                height: 32,
                color: 'white',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                textAlign: 'center',
                fontSize: 16,
                paddingTop: 2,
                marginBottom: 3,
            },
            shareTextSty: {
                fontSize: 16,
                color: '#333333',
                marginBottom: 24,
            },
            btoSearchText: {
                textDecoration: 'underline',
                marginLeft: 8,
                fontSize: 15,
            }
        }
    }
}
NewShare = Form.create()(NewShare);

export default NewShare;
