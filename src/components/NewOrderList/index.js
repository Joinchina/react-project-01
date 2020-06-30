import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Icon, message, Spin } from 'antd';
import { ListView, PullToRefresh } from 'antd-mobile'
import Title from '../common/Title';
import Comlon from '../common/Comlon';
import nopic from './noPic.png'
import api from '../../api';
import './index.less'
import { centToYuan } from '../../helper/money';
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});

const STATUS = {
    '10': '用户已确认',
    '20': '用户已确认',
    '30': '用户已确认',
    '35': '用户已确认',
    '40': '用户已确认',
    '45': '用户已确认',
    '50': '用户已确认',
    '60': '完成',
    '70': '完成',
    '97': '用户已确认',
    '98': '已撤销',
    '99': '完成'
}

@mount('newOrderList')
export default class NewOrderList extends Component {

    @prop()
    patientId;

    @prop()
    cantoast = true;

    constructor() {
        super();
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            loading: false,
            skip: 0,
            isInit: true,
            dataSource: ds,
            havemore: true,
        }
    }

    @action()
    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        if (!patient) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/user/info`)}`
        }
        this.patientId = patient.id;
        const data = {
            where: {
                patientId: this.patientId,
            },
            skip: 0,
            limit: 10,
            count: 0,
        }
        try {
            const result = await api.get(`/orders`, data)
            this.setState({
                list: result.list,
                loading: false,
                skip: this.state.skip + 10,
                isInit: false,
            })
        } catch (e) {
            message.error(e.message)
        }
    }

    @action()
    async getNextDrugList() {
        const data = {
            where: {
                patientId: this.patientId,
            },
            skip: this.state.skip,
            limit: 10,
            count: 0,
        }
        if (!this.state.havemore) {
            this.setState({
                loading: false,
            })
        } else {
            try {
                let havemore = true
                const result = await api.get(`/orders`, data)
                if (result.list.length < 10) {
                    if (this.cantoast) {
                        this.cantoast = false
                        message.warn('没有更多用药登记')
                    }
                    havemore = false
                }
                this.setState({
                    list: [...this.state.list, ...result.list],
                    loading: false,
                    skip: this.state.skip + 10,
                    havemore,
                })
            } catch (e) {
                message.error(e.message)
            }
        }
    }

    goHref(url) {
        window.location.href = url;
    }

    //上拉加载
    onEndReached = (page, lastPage) => {
        const that = this;
        this.setState({
            loading: true,
        }, async () => {
            that.getNextDrugList();
        })
    }
    //下拉刷新
    @action
    async onRefresh(){
        this.setState({ pullLoading: true })
        const data = {
            where: {
                patientId: this.patientId,
            },
            skip: 0,
            limit: 10,
            count: 0,
        }
        try {
            const result = await api.get(`/orders`, data)
            this.setState({
                list: result.list,
                loading: false,
                skip: 10,
                isInit: false,
                pullLoading: false,
                havemore: true,
            })
        } catch (e) {
            message.error(e.message)
        }
    }

    renderOrderList(item, index) {
        let am = 0;
        if (item.drugs && item.drugs.length) {
            item.drugs.map((i) => {
                am += i.amount
            })
        }
        return (
            <div className='newOrderListBox' style={{ paddingTop: 10 }} ref={this.refOrderList}>
                <div className='newOrderListItem' key={index} onClick={() => this.goHref(`/order/${item.id}`)}>
                    <div className='newOrderListItem_1'>
                        <span style={{ fontSize: 16, color: '#666666', fontWeight: 'bold' }}>
                            需求编号：{item.orderNo}
                        </span>
                        <span style={{ fontSize: 14, color: '#F48E18' }}>
                            {STATUS[item.status]}
                        </span>
                    </div>
                    <div className='newOrderListItem_2'>
                        {
                            item.drugs && item.drugs.length ? item.drugs.map((i) => {
                                return (
                                    <div className='newOrderDrugBox'>
                                        <div className='newOrderDrugBox_1'>
                                            <div className='newOrderDrugBox_1_1'>
                                                {i.outerPackagePicUrl ? <img src={i.outerPackagePicUrl} style={{ width: 60, height: 60 }} /> : <img src={nopic} style={{ width: 60, height: 60 }} />}
                                            </div>
                                            <div className='newOrderDrugBox_1_2'>
                                                <p style={{ fontSize: 16, color: '#222222' }}>
                                                    {i.commonName}({i.productName})
                                                        </p>
                                                <p style={{ fontSize: 14, color: '#9A9A9A' }} className='newOrderDrugBox_1_2_2'>
                                                    {i.preparationUnit}*{i.packageSize}{i.minimumUnit}/{i.packageUnit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='newOrderDrugBox_2'>
                                            <span>
                                                ￥{centToYuan(i.price, 2)}
                                            </span>
                                            <span>
                                                ×{i.amount}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                                : null}
                    </div>
                    <div className='newOrderListItem_3'>
                        共<span style={{ fontSize: 14, color: '#C8161D', fontWeight: 'bold' }}>{am}</span>盒药品 合计<span style={{ fontSize: 14, color: '#C8161D', fontWeight: 'bold' }}>￥{centToYuan(item.amount + item.freight, 2)}</span> (含运费{centToYuan(item.freight, 2)}元)
                            </div>
                </div>
            </div>
        )
    }

    renderWait() {
        if (this.state.isInit || this.state.list.length === 0) {
            return (
                <div style={{ height: '100vh',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center' }}>
                    <Spin spinning={this.state.isInit}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                            <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                            <span
                                style={{
                                    opacity: 1,
                                    fontSize: 16,
                                    fontFamily: 'Hiragino Sans GB',
                                    letterSpacing: 0,
                                }}
                            >暂无用药登记</span>
                        </div>
                    </Spin>
                </div>
                // <Spin spinning={this.state.isInit}>
                //     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                //         <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                //         <span
                //             style={{
                //                 opacity: 1,
                //                 fontSize: 16,
                //                 fontFamily: 'Hiragino Sans GB',
                //                 letterSpacing: 0,
                //             }}
                //         >暂无用药登记</span>
                //     </div>
                // </Spin>
            )
        };
    }



    render() {
        const { list, dataSource, pullLoading } = this.state;
        return (
            <div className="hasMenu orderList">
                <Title>我的用药登记</Title>
                <Comlon {...this.props}/>
                {this.renderWait()}
                {
                    list && list.length ?
                        <ListView
                            dataSource={dataSource.cloneWithRows(list)}
                            renderRow={(rowData, id1, i) => this.renderOrderList(rowData, i)}
                            initialListSize={10}
                            pageSize={10}
                            renderFooter={() => (<div style={{ textAlign: 'center' }}>
                                {this.state.loading ? <Icon type="loading" /> : null}
                            </div>)}
                            onEndReached={() => this.onEndReached()}
                            onEndReachedThreshold={20}
                            useBodyScroll={true}
                            pullToRefresh={<PullToRefresh // import { PullToRefresh } from 'antd-mobile'
                                refreshing={pullLoading}
                                onRefresh={() => this.onRefresh()}
                            />}
                        /> : null
                }
            </div>
        )
    }
}
