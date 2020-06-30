import React, { Component } from 'react'
import mount, { prop } from '@wanhu/react-redux-mount';
import { List, DatePicker } from 'antd-mobile';
import Title from '../common/Title';
import './index.less'

@mount('newVipDay')
export default class NewVipDay extends Component {

    @prop()
    accountNo;

    @prop()
    userInfo;

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
    }

    onChange = value => {
    }

    formatDate(date) {
        /* eslint no-confusing-arrow: 0 */
        const pad = n => n < 10 ? `0${n}` : n;
        const dateStr = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        /* const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`; */
        return `${dateStr}`;
    }

    saveDay() {
    }

    renderUserInfo() {
        return (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160}}>
                <div style={{ marginLeft: 16, marginRight: 16, borderRadius: 12, width: 344, height: 160, marginTop: 19, marginBottom: 24, paddingLeft: 15, paddingRight: 15, paddingTop: 30 }} className='vipDayBox'>
                    <p style={{ fontSize: 22, color: '#A4750D', fontWeight: 'bold', textAlign: 'center', marginBottom: 20, lineHeight: 1, }}>万户健康会员日介绍</p>
                    <p style={{ fontSize: 16, color: '#A4750D', lineHeight: '22px'}}>万户健康会员独有的优惠活动日，每两个月一次。每个患者将在自己的会员日当天获得多种福利优惠券，购药更优惠！</p>
                </div>
            </div>
        )
    }

    renderTime() {
        return (
            <div className="vipSty">
                <p style={{ fontSize: 20, color: '#222222', marginBottom: 16, marginLeft: 30 }}>日期</p>
                <div style={{ marginLeft: 30 }} className='dateSelect'>
                    <DatePicker
                        mode="date"
                        title="请选择时间"
                        extra="请选择时间"
                        format={val => `${this.formatDate(val)}`}
                        value={this.state.date}
                        onChange={date => this.setState({ date })}
                    >
                        <List.Item arrow="horizontal">Date</List.Item>
                    </DatePicker>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="hasMenu" style={{ paddingTop: 20 }}>
                <Title>会员日</Title>
                {this.renderUserInfo()}
                <p style={{ fontSize: 18, color: '#C8161D', marginLeft: 30, marginTop: 40, marginBottom: 24 }}>请根据您的用药习惯指定下次会员日</p>
                {this.renderTime()}
                <p style={{ fontSize: 18, color: '#666666', paddingLeft: 30, marginBottom: 0, marginTop: 39 }}>会员日一个年度可修改四次，</p>
                <p style={{ fontSize: 18, color: '#666666', paddingLeft: 30, marginBottom: 0 }}>您今年还可修改一次。</p>
                <div onClick={this.saveDay}>
                    <p style={{ height: 44, paddingLeft: 16, paddingRight: 16, backgroundColor: '#C8161D', textAlign: 'center', fontSize: 18, color: '#ffffff', lineHeight: '44px', borderRadius: 6, marginBottom: 0, marginTop: 113, position:'absolute', bottom: 16, left: 16, right: 16}}>保存</p>
                </div>
            </div>
        );
    }
}
