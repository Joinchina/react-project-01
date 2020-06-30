import React, { Component } from 'react';
import { Spin } from 'antd';
import querystring from 'query-string';
import api from '../../api';
import Title from '../common/Title';
import './index.less';

export default class MyMedicalReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        if (queryData.insuranceProductName && queryData.gradeName) {
            this.setState({
                serviceList: [
                    {
                        insuranceProductName: queryData.insuranceProductName,
                        gradeName: queryData.gradeName,
                        insuranceProductType: 2
                    }
                ],
                loading: false
            })
        }else{
            this.init()
        }
    }

    async init() {
        try{
            const patient = await api.get(`/currentPatient`);
            if(!patient){
                window.location.href = `/user/bind?r=${encodeURIComponent(`/myMedicalReport`)}`;
                return;
            }
            const res = await api.get(`/patient/insurance_order/inservice`, {patientId: patient.id});
            let res_list = [];
            let new_list= [];
            if (res && res.length) {
                res_list = res.map(i => i.products);
                new_list = [].concat.apply([], res_list)
            }
            this.setState({
                serviceList: new_list,
                loading: false
            })
        }catch(err){
            console.log(err.message)
        }
    }

    gotoDetail() {
        this.props.history.push('/myReportInfo')
    }

    render() {
        const { loading , serviceList} = this.state;
        return (
            <div className='my_medical_report_box'>
                <Title>我的体检</Title>
                <Spin spinning={loading}>
                    <div style={{ width: '100%', paddingBottom: 20 }}>
                        <p className='title'>为您定制下列体检套餐</p>
                        {serviceList && serviceList.length ? serviceList.map((i) => {
                            if (i.insuranceProductType == 2) {
                                return (
                                    <div className='box_1'>
                                        <p className='text_1'>{i.insuranceProductName}</p>
                                        <p className='text_2'>{i.gradeName}</p>
                                        <p className='sub_btn' onClick={() => this.gotoDetail()}>查看详情</p>
                                    </div>
                                )
                            }
                        }) : null}
                        <p className='text_3'>如需预约体检，请致电<a href="tel:400-010-1516">400-010-1516</a></p>
                    </div>
                </Spin>
            </div>
        )
    }
}