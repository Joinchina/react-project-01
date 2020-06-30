import React, { Component } from 'react'
import mount, { prop } from '@wanhu/react-redux-mount';
import Title from '../common/Title';
import './index.less'

@mount('newCoupon')
export default class NewCoupon extends Component {

    @prop()
    userInfo;

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {

    }

    renderBanner() {
        return (
            <div className="bannerStyle" />
        )
    }

    renderHeader() {
        return (
            <div className="headerBoxSty">
                <div className="headerListSty jifenBac">
                    <div>
                        <span style={{ color: '#A4750D', fontSize: 48, fontWeight: 'bold'}}>1000</span>
                        <span style={{ color: '#A4750D', fontSize: 24 }}>积分</span>
                    </div>
                    <span style={{ paddingLeft:12, paddingRight:12, paddingTop:5, paddingBottom: 5, background: '#F48E18', color: '#fff', fontSize: 14, borderRadius: 15, lineHeight: '20px'}}>点击领取</span>
                </div>
                <div className="headerListSty jingyanBac">
                    <div>
                        <span style={{ color: '#A4750D', fontSize: 48, fontWeight: 'bold'}}>1000</span>
                        <span style={{ color: '#A4750D', fontSize: 24 }}>经验</span>
                    </div>
                    <span style={{ paddingLeft:12, paddingRight:12, paddingTop:5, paddingBottom: 5, background: '#F48E18', color: '#fff', fontSize: 14, borderRadius: 15, lineHeight: '20px'}}>点击领取</span>
                </div>
            </div>
        )
    }

    renderJifen() {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <div className='couponListjifenLeft'>
                    <span style={{ color: '#DF4026', fontSize: 24, marginBottom: 5 }}>
                        订药
                    </span>
                    <span style={{ color: '#DF4026', fontSize: 24 }}>
                        送积分
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', flex: 1, height: 128, marginRight: 16, borderTopRightRadius: 6, borderBottomRightRadius: 6, paddingLeft: 12, paddingTop: 12, paddingRight:15, position: 'relative'}}>
                    <span style={{ color: '#666666', fontSize: 18, fontWeight: 'bold', marginBottom: 4}}>绿A会员注册活动有礼</span>
                    <span style={{ color: '#666666', fontSize: 14, marginBottom: 20 }}>2019.06.12-2019.06有效</span>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{ color: '#666666', fontSize: 14 }}>限部分药品可用</span>
                        <span style={{ color: '#ffffff', paddingRight: 4, paddingLeft: 4, paddingTop: 2, paddingBottom: 2, backgroundColor: '#C8161D', borderRadius: 4, lineHeight: '20px', width: 64, textAlign: 'center'}}>点击领取</span>
                    </div>
                    <i className="iconfont" style={{ position: 'absolute', fontSize: 50, right: 4, top: 4, lineHeight: 1, color: '#9A9A9A'}}>&#xe685;</i>
                </div>
            </div>
        )
    }

    renderZhekou() {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <div className='couponListzhekouLeft' style={{ display: 'flex', flexDirection: 'row'}}>
                    <span style={{ color: '#DF4026', fontSize: 40, marginBottom: 5, fontWeight: 'bold'}}>
                        8.5
                    </span>
                    <span style={{ color: '#DF4026', fontSize: 18, marginTop: 12 }}>
                        折
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', flex: 1, height: 128, marginRight: 16, borderTopRightRadius: 6, borderBottomRightRadius: 6, paddingLeft: 12, paddingTop: 12, paddingRight:15}}>
                    <span style={{ color: '#666666', fontSize: 18, fontWeight: 'bold', marginBottom: 4}}>绿A会员注册活动有礼</span>
                    <span style={{ color: '#666666', fontSize: 14, marginBottom: 20 }}>2019.06.12-2019.06有效</span>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{ color: '#666666', fontSize: 14 }}>限部分药品可用</span>
                        <span style={{ color: '#ffffff', paddingRight: 4, paddingLeft: 4, paddingTop: 2, paddingBottom: 2, backgroundColor: '#B2B2B2', borderRadius: 4, lineHeight: '20px', width: 64, textAlign: 'center'}}>已抢光</span>
                    </div>
                </div>
            </div>
        )
    }

    renderJijian() {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <div className='couponListjijianLeft'>
                    <p>
                        <span style={{ fontSize: 18, color: '#DF4026' }}>￥</span>
                        <span style={{ fontSize: 40, color: '#DF4026', fontWeight: 'bold'}}>30</span>
                    </p>
                    <span style={{ color: '#222222', fontSize: 14 }}>
                        每满300即减
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', flex: 1, height: 128, marginRight: 16, borderTopRightRadius: 6, borderBottomRightRadius: 6, paddingLeft: 12, paddingTop: 12, paddingRight:15}}>
                    <span style={{ color: '#666666', fontSize: 18, fontWeight: 'bold', marginBottom: 4}}>绿A会员注册活动有礼</span>
                    <span style={{ color: '#666666', fontSize: 14, marginBottom: 20 }}>2019.06.12-2019.06有效</span>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{ color: '#666666', fontSize: 14 }}>限部分药品可用</span>
                        <span style={{ color: '#ffffff', paddingRight: 4, paddingLeft: 4, paddingTop: 2, paddingBottom: 2, backgroundColor: '#C8161D', borderRadius: 4, lineHeight: '20px', width: 64, textAlign: 'center'}}>点击领取</span>
                    </div>
                </div>
            </div>
        )
    }

    renderKeyong() {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <div className='couponListkeyongLeft'>
                    <p>
                        <span style={{ fontSize: 18, color: '#DF4026' }}>￥</span>
                        <span style={{ fontSize: 40, color: '#DF4026', fontWeight: 'bold'}}>30</span>
                    </p>
                    <span style={{ color: '#222222', fontSize: 14 }}>
                        每满300可用
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', flex: 1, height: 128, marginRight: 16, borderTopRightRadius: 6, borderBottomRightRadius: 6, paddingLeft: 12, paddingTop: 12, paddingRight:15}}>
                    <span style={{ color: '#666666', fontSize: 18, fontWeight: 'bold', marginBottom: 4}}>绿A会员注册活动有礼</span>
                    <span style={{ color: '#666666', fontSize: 14, marginBottom: 20 }}>2019.06.12-2019.06有效</span>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{ color: '#666666', fontSize: 14 }}>限部分药品可用</span>
                        <span style={{ color: '#ffffff', paddingRight: 4, paddingLeft: 4, paddingTop: 2, paddingBottom: 2, backgroundColor: '#222222', borderRadius: 4, lineHeight: '20px', width: 64, textAlign: 'center'}}>去使用</span>
                    </div>
                </div>
            </div>
        )
    }

    renderCouponList() {
        const a = [1,2]
        const a1 = [1,2]
        const a2 = [1,2]
        const a3 = [1,2]
        return (
            <div className='couponListBox'>
                {a.map((i) => {
                    return (
                        this.renderJifen(i)
                    )
                })}
                {a1.map((i) => {
                    return (
                        this.renderZhekou(i)
                    )
                })}
                {a2.map((i) => {
                    return (
                        this.renderJijian(i)
                    )
                })}
                {a3.map((i) => {
                    return (
                        this.renderKeyong(i)
                    )
                })}
            </div>
        )
    }

    renderExplain() {
        return (
            <div style={{ paddingRight: 16, paddingLeft: 16, marginTop: 20 }}>
                <span style={{ fontSize: 18, color: '#222222', fontWeight: 'bold'}}>活动说明</span>
                <ul style={{ marginLeft: 16, marginTop: 18 }}>
                    <li style={{ color: '#666666', fontSize: 14 }}>活动时间：2019年12月12日至2020年1月31日</li>
                    <li style={{ color: '#666666', fontSize: 14 }}>本活动限江苏省南京市地区，限绿A会员，保障会员新会员参与。</li>
                    <li style={{ color: '#666666', fontSize: 14 }}>部分优惠券数量有限，领完即止；</li>
                    <li style={{ color: '#666666', fontSize: 14 }}>为满足上述条件的会员，视为放弃本活动；</li>
                    <li style={{ color: '#666666', fontSize: 14 }}>本活动最终解释权归万户良方所有。</li>
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div className="hasMenu newCoupon">
                <Title>优惠券活动</Title>
                {this.renderBanner()}
                {this.renderHeader()}
                {this.renderCouponList()}
                {this.renderExplain()}
            </div>
        );
    }
}
