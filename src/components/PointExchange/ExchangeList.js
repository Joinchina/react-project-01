import React, { Component } from "react";

import Title from '../common/Title';
import Comlon from '../common/Comlon';

import api from '../../api';
import { Row, Col, Icon } from 'antd';
import { WingBlank, WhiteSpace } from 'antd-mobile';
import TabBar from '../common/TabBar';
import AdsBanner from '../Ads';

import './index.less';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_h5q9fl0n33p.js',
});
class ExchangeList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exchangeList: [],
        }
    }

    async componentDidMount() {
        const exchangeList = await api.get('/pointExchange');
        this.setState({ exchangeList });
    }

    renderItem(item) {
        return <Col span={12} key={item.exchangeId} onClick={() => this.props.history.push(`/exchange/${item.exchangeId}`)}>
            <WhiteSpace size="lg" />
            <WingBlank size="md">
                <div className="itemBox">
                    <div>
                        <img src={item.image} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                    </div>
                    <WhiteSpace size="sm" />
                    <WingBlank size="md">
                        <span className="acitvity">{item.acitvity}</span>
                    </WingBlank>
                    <WhiteSpace size="sm" />
                    <WingBlank size="md">
                        <MyIcon type="icon_jifen" style={{ fontSize: '17px', color: '#F8BB34' }} />
                        <span className="pointPrice">{item.pointPrice}</span>
                    </WingBlank>
                    <WingBlank size="md" className="title">
                        {item.title}
                    </WingBlank>
                    <WhiteSpace size="sm" />
                    <WingBlank size="md" className="count">
                        剩余{item.total - item.used}份
                </WingBlank>
                    <WhiteSpace size="md" />
                </div>
            </WingBlank>
        </Col>
    }

    render() {
        const { exchangeList } = this.state;
        const pointExchange = exchangeList ? exchangeList.map((item, index) => {
            if (index % 2 !== 0) {
                return null;
            }
            const nextItem = exchangeList[index + 1];
            return <Row>
                {this.renderItem(item)}
                {nextItem !== null ? this.renderItem(nextItem) : null}
            </Row>
        }) : null;
        return (
            <div className="hasMenu medHome exchangeList" style={{ width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                <Title>积分兑换</Title>
                {/* <AdsBanner {...this.props} isAdsOnly/> */}
                <Comlon {...this.props} />
                <WingBlank size="md">
                    {pointExchange}
                </WingBlank>
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />
                <WhiteSpace size="lg" />

                <div className="menu" id="menu">
                    <TabBar {...this.props} />
                </div>
            </div>
        );
    }
}

export default ExchangeList;
