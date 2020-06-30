import React from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Button } from 'antd';
import Title from '../common/Title';
import './index.less';

@mount('notBound')
class NotBound extends React.Component {

    @prop()
    redirectUrl;

    @prop()
    selfOrderPage;

    componentDidMount() {
        this.setPage();
    }

    @action()
    setPage() {
        if (this.redirectUrl && this.redirectUrl.indexOf('selforder') >= 0) {
            this.selfOrderPage = 'selforder';
        }
        if (this.redirectUrl && this.redirectUrl.indexOf('record') >= 0) {
            this.selfOrderPage = 'record';
        }
        if (this.redirectUrl && this.redirectUrl.indexOf('user/info') >= 0) {
            this.selfOrderPage = 'user/info';
        }
        if (this.redirectUrl && this.redirectUrl.indexOf('newAndCourteous') >= 0) {
            this.selfOrderPage = 'newAndCourteous';
        }
    }

    showLabel = () => {
        let title;
        switch (this.selfOrderPage) {
            case 'selforder':
                title = '续订';
                break;
            case 'record':
                title = '我的预订';
                break;
            case 'user/info':
                title = '会员信息';
                break;
            case 'newAndCourteous':
                title = '拉新有礼';
                break;
            default:
                title = '抱歉';
                break;
        }
        return { title };
    }


    gotoBind() {
        window.location = `/user/bind?r=${encodeURIComponent(this.redirectUrl)}`
    }

    gotoRegister() {
        window.location = `/user/register?r=${encodeURIComponent(this.redirectUrl)}`
    }

    render() {
        return (
            <div className="notBind">
                <Title>{this.showLabel().title}</Title>
                <div className="text1">
                    如果您：
                </div>
                <div className="text2">
                    <span style={{ color: '#C8161D' }}>尚未签约，</span>
                    请先进行微信快速签约。
                </div>
                <Button className="submitButton" onClick={() => this.gotoRegister()}>
                    微信签约
                </Button>
                <div className="text2">
                    <span style={{ color: '#EC7813' }}>已签约，</span>
                    但尚未开通PBM微信服务，请先登录开通。
                </div>
                <Button className="submitButton" style={{ backgroundColor: '#EC7813' }} onClick={() => this.gotoBind()}>
                    登录开通
                </Button>
            </div>
        )
    }
}

export default NotBound;
