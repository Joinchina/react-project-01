import React, { Component } from "react";

import Title from '../common/Title';
import api from '../../api';
import { Row, Col, Icon, Button } from 'antd';
import { WingBlank, WhiteSpace, Modal } from 'antd-mobile';

import './index.less';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_h5q9fl0n33p.js',
});
class ExchangeInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exchangeInfo: null,
            exchangeId: null,
        }
    }

    async componentDidMount() {
        const { exchangeId } = this.props.match.params;
        const exchangeInfo = await api.get(`/pointExchange/${exchangeId}`);
        this.setState({ exchangeInfo, exchangeId });
    }

    async exchange(){
        const patient = await api.get('/currentPatient');
        console.log('patient', patient);
        if(!patient){
            const { exchangeId } = this.state;
            Modal.alert(null, '您尚未登录，请登录后兑换。', [
                { text: '取消', onPress: () => {} },
                { text: '登录', onPress: () => window.location.href=`/user/bind?r=${encodeURIComponent(`/exchange/${exchangeId}`)}`,style: {color: '#C8161D'} },
              ])
        }else{
            Modal.alert(null, <div>您的积分不足，无法兑换该商品。</div>, [
                { text: '确定', onPress: () => {} },
            ])
        }
    }

    renderItem(item) {
        return <div>
            <Row key={item.exchangeId} className="itemBox">
                <WhiteSpace size="lg" />
                <WingBlank size="lg">
                    <div >
                        <div>
                            <img src={item.image} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                        </div>
                        <WhiteSpace size="sm" />

                        <Row style={{ borderBottom: '1px solid #E8E8E8' }}>
                            <Col span={12}>
                                <WhiteSpace size="sm" />
                                <MyIcon type="icon_jifen" style={{ fontSize: '30px', color: '#F8BB34' }} />
                                <span className="pointPrice" style={{ fontSize: '30px' }}>{item.pointPrice}</span>
                                <WhiteSpace size="sm" />
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }} className="exchangeTip">
                                <WhiteSpace size="sm" />
                                <WhiteSpace size="sm" />
                                <p >每位会员限兑1件</p>
                                <p>
                                    <span style={{ color: '#666666' }}>已兑：</span>
                                    <span style={{ color: '#222222' }}>{item.used}</span>
                                    <span style={{ color: '#666666' }}>/{item.total}</span>
                                </p>
                                <WhiteSpace size="sm" />
                            </Col>
                        </Row>
                        <Row className="title" style={{ fontSize: '18px', lineHeight: '22px' }}>
                            <WhiteSpace size="md" />
                            {item.name}
                        </Row>
                        <WhiteSpace size="lg" />
                        <Row>
                            <Col span={3}>已选   </Col>
                            <Col span={21}>{item.standards}</Col>
                        </Row>
                        <WhiteSpace size="lg" />
                        <Row>
                            <Col span={3}>活动</Col>
                            <Col span={21}><span className="acitvity">{item.acitvity}</span></Col>
                        </Row>
                        <WhiteSpace size="lg" />
                    </div>
                </WingBlank>
            </Row>
            <WhiteSpace size="md" />
            <div className="itemBox">
                {item.imageList ? item.imageList.map(item => {
                    return <img src={item} style={{ width: '100%' }} />
                }) : null}
            </div>
        </div>
    }

    render() {
        const { exchangeInfo } = this.state;
        return (
            <div className="exchangeList">
                <Title>礼品详情</Title>
                {exchangeInfo ? this.renderItem(exchangeInfo) : null}
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <div className="exchangeBtnBox">
                    <Button className="exchangeButton" onClick={() => this.exchange()}>立即兑换</Button>
                </div>
            </div>
        );
    }
}

export default ExchangeInfo;
