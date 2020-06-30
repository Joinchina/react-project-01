import React, { Component } from 'react';
import api from '../../api';
import Comlon from '../common/Comlon';
import Title from '../common/Title';
import { Row, Col, Button, Spin, Icon, message } from 'antd';
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});
const OrderStatusChoices = {
    0: '核保中',
    1: '已承保',
    5: '已撤单'
};

const color_list = {
    0: '#F48E18',
    1: '#C8161D',
    2: '#F48E18',
    3: '#44B82A',
    4: '#E65A32',
    5: '#418DC7',
    6: '#F8BB34',
    7: '#B2B2B2',
}

function getLabel(itemMap, itemValue) {
    const item = itemMap.find(i => i.value == itemValue);
    return item ? item.label : '';
}

export default class InsuranceListVision2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            insuranceList: []
        }
    }

    componentDidMount() {
        this.init()
    }

    async init() {
        try{
            const patientInfo = await api.get(`/currentPatient`);
            const insuranceList = await api.get(`/get_insurance_team_order`, { patientId: patientInfo.id });
            this.setState({
                insuranceList,
                loading: false,
            })
        }catch(err){
            message.error(err.message)
            this.setState({
                loading: false
            })
        }
    }

    gotoDetail(orderId) {
        this.props.history.push(`/serviceInfo/${orderId}`);
    }

    renderWait() {
        const { loading, insuranceList } = this.state;
        if (loading || insuranceList.length === 0) {
            return (
                <div style={{ height: '100vh',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center' }}>
                    <Spin spinning={loading}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                            <MyIcon type="iconzhanweifu_chucuole" style={{ fontSize: '120px' }} />
                            <span
                                style={{
                                    opacity: 1,
                                    fontSize: 16,
                                    fontFamily: 'Hiragino Sans GB',
                                    letterSpacing: 0,
                                }}
                            >暂无保障单信息</span>
                        </div>
                    </Spin>
                </div>
            )
        };
    }

    renderList() {
        const { insuranceList, loading } = this.state;
        if (insuranceList.length && !loading) {
            return (
                <div style={{ padding: '0px 16px' }}>
                    <div>
                        {insuranceList.map(i => {
                            if (i.status == 0) {
                                return (
                                    <div
                                        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', padding: '20px 0'}}
                                        onClick={() => this.gotoDetail(i.orderId)}
                                        key={i.orderId}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <p style={{ marginBottom: 0, fontSize: '18px', color: '#333333' }}>{i.productName || ''}</p>
                                                <p style={{ color: '#ffffff', backgroundColor: color_list[i.status || 0], fontSize: 12, padding: '3px 6px', marginLeft: 12, borderRadius: 2, marginBottom: 0 }}>{OrderStatusChoices[i.status || 0]}</p>
                                            </div>
                                            <p style={{ marginBottom: 16, marginTop: 8, fontSize: '14px', color: '#9A9A9A'}}>{i.companyName || ''}</p>
                                            {i.period ? <p style={{ marginBottom: 0, fontSize: '12px', color: '#222222' }}>{i.period}</p> : null}
                                        </div>
                                        <div>></div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div>
                        {insuranceList.map(i => {
                            if (i.status == 1) {
                                return (
                                    <div
                                        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', padding: '20px 0'}}
                                        onClick={() => this.gotoDetail(i.orderId)}
                                        key={i.orderId}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <p style={{ marginBottom: 0, fontSize: '18px', color: '#333333' }}>{i.productName || ''}</p>
                                                <p style={{ color: '#ffffff', backgroundColor: color_list[i.status || 0], fontSize: 12, padding: '3px 6px', marginLeft: 12, borderRadius: 2, marginBottom: 0 }}>{OrderStatusChoices[i.status || 0]}</p>
                                            </div>
                                            <p style={{ marginBottom: 16, marginTop: 8, fontSize: '14px', color: '#9A9A9A'}}>{i.companyName || ''}</p>
                                            {i.period ? <p style={{ marginBottom: 0, fontSize: '12px', color: '#222222' }}>{i.period}</p> : null}
                                        </div>
                                        <div>></div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div>
                        {insuranceList.map(i => {
                            if (i.status != 1 && i.status != 0) {
                                return (
                                    <div
                                        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', padding: '20px 0'}}
                                        onClick={() => this.gotoDetail(i.orderId)}
                                        key={i.orderId}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <p style={{ marginBottom: 0, fontSize: '18px', color: '#333333' }}>{i.productName || ''}</p>
                                                <p style={{ color: '#ffffff', backgroundColor: color_list[i.status || 0], fontSize: 12, padding: '3px 6px', marginLeft: 12, borderRadius: 2, marginBottom: 0 }}>{OrderStatusChoices[i.status || 0]}</p>
                                            </div>
                                            <p style={{ marginBottom: 16, marginTop: 8, fontSize: '14px', color: '#9A9A9A'}}>{i.companyName || ''}</p>
                                            {i.period ? <p style={{ marginBottom: 0, fontSize: '12px', color: '#222222' }}>{i.period}</p> : null}
                                        </div>
                                        <div>></div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            )
        }
    }

    render() {
        const { loading } = this.state;
        return (
            <div className="hasMenu new_insurance_list">
                <Title>保障列表</Title>
                {this.renderWait()}
                {this.renderList()}
            </div>
        )
    }
}