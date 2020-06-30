import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import {Icon, Row, Col } from 'antd';
import { Button } from 'antd-mobile';
import querystring from 'query-string';

import AdsBanner from '../Ads';
/* const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
}); */

@mount('checkSuccess')
class SuccessPage extends Component{

    @prop()
    orderId;

    @prop()
    orderNo;

    @action()
    componentDidMount(){
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        const {orderNo, orderId} = queryData;
        this.orderId = orderId;
        this.orderNo = orderNo;
    }
    goHref(url){
        this.props.history.push(url);
    }

    render(){
        return (
            <div className="successPage">
                <div className="successIcon"><Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" style={{fontSize: '40px'}}/></div>
                <div className="title">预订成功</div>
                <div className="detail">需求登记{this.orderNo}处于审核中。</div>
                {/* <p style={{ fontSize: 14,color: '#f48e18', marginTop: 5, textAlign: 'center'}}>此项服务暂不支持医保支付</p> */}
                <Row>
                    <Col span={12}>
                        <Button className="button" onClick={() =>window.location.href=`/order/${this.orderId}`}>查看需求</Button>
                    </Col>
                    <Col  span={12}>
                        <Button className="button" onClick={() =>this.goHref(`/medicineHomePage`)}>继续找药</Button>
                    </Col>
                </Row>
                <div className="tip">
                    万户执业药师在审核用药您的用药需求登记有异常情况时会与您联系，请保持手机畅通！
                </div>
                {/* <AdsBanner {...this.props} isAdsOnly/> */}
                {/* <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#e8e8e8', borderTopStyle: 'solid', marginRight: 16, marginLeft: 16}}>
                    <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '80px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <span style={{ fontSize: 18, color: '#222222', lineHeight: 1, marginBottom: 10 }}>不行！您还没有设定会员日！</span>
                        <span style={{ fontSize: 18, color: '#222222', lineHeight: 1, }}>会丢失大量的额外福利！</span>
                    </div>
                </div>
                <div onClick={() => this.goHref(`/vipDay`)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <p style={{ height: 44, paddingLeft: 16, paddingRight: 16, backgroundColor: '#C8161D', textAlign: 'center', fontSize: 18, color: '#ffffff', lineHeight: '44px', borderRadius: 6, marginBottom: 0, width: 170 }}>设定我的会员日</p>
                </div> */}
            </div>
        );
    }
}

export default SuccessPage
