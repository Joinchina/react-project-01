import React, { Component } from 'react';
import api from '../../api';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Icon, Row, Col } from 'antd';
import Title from '../common/Title';
import { Button, WingBlank, Toast } from 'antd-mobile';

import successImage from './images/insurance_success.png';
@mount('paySuccess')
class PaySuccess extends Component {

    @prop()
    orderId;

    @prop()
    orderNo;

    @prop()
    insuranceInfo = {};

    @prop()
    insuranceId;

    @action()
    async componentDidMount() {
        Toast.loading();
        const { insuranceId } = this.props.match.params;
        this.insuranceId = insuranceId;
        const insuranceInfo = await api.get(`/patients/insurance_order/${insuranceId}`);
        this.insuranceInfo = insuranceInfo;
        Toast.hide();
    }

    render() {
        const packageName = this.insuranceInfo ? this.insuranceInfo.packageName : '';
        const relationWithInsurer =  this.insuranceInfo ? this.insuranceInfo.relationWithInsurer : null;
        const needMedicationData = this.insuranceInfo ? this.insuranceInfo.needMedicationData : undefined;
        return (
            <div className="successPage">
                <Title>购买成功</Title>
                <div style={{ paddingTop: '80px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#e8e8e8', borderTopStyle: 'solid', marginRight: 16, marginLeft: 16 }}>
                    <img src={successImage} style={{width: '120px'}}/>
                </div>
                <WingBlank size="lg">
                    {needMedicationData ?
                        <div className="detail"><strong>{packageName}购买成功</strong><br />请先上传药品清单，以激活{packageName}服务。</div> :
                        <div className="detail"><strong>恭喜，{packageName}购买成功。
                        {relationWithInsurer && relationWithInsurer == 1 ? '您的健康信息已收到。我们将尽快完成投保手续，并及时反馈保险公司的核保结果。谢谢' : ''}
                        {relationWithInsurer && relationWithInsurer != 1 ? '被保险人的健康信息已收到。我们将短信通知被保险人投保信息，获得被保险人同意或默认后完成投保手续，并及时反馈保险公司的核保结果，谢谢！' : ''}</strong>

                        </div>}
                </WingBlank>
                {
                    needMedicationData
                        ?
                        <Row>
                            <Col span={24}>
                                <Button className="button" onClick={() => this.props.history.push('/newMedicineCredentials')}>确认</Button>
                            </Col>
                        </Row> :
                        <div>
                            <Row>
                                <Col span={24}>
                                    <Button className="button" onClick={() => this.props.history.push(`/serviceInfo/${this.insuranceId}`)}>查看详情</Button>
                                </Col>
                            </Row>
                            <div>
                                <Button className="button" onClick={() => this.props.history.push('/newHealthHomePage')} style={{ marginTop: '15px' }}>回首页</Button>
                            </div>
                        </div>
                }

            </div>
        );
    }
}

export default PaySuccess;
