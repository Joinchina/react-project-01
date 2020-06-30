import React, { Component } from 'react';
import InsuranceServicePlan from './InsuranceServicePlan';
import CreateInsurance from './CreateInsurancePage';
import InsuranceDisease from './InsuranceDisease';
import InsuranceDiseaseVersion2 from './InsuranceDiseaseVersion2';
import AnxinInsurance from './anxin_Insurance/HealthInquiry';
import AnxinInsuranceNotice from './anxin_Insurance/Notice';
import ZhonghuiCancer from './zhonghui_Cancer/index';
import { connect } from '../../state/insuranceState';
import api from '../../api';
import { Toast } from 'antd-mobile';
import { Modal } from 'antd';
import Comlon from '../common/Comlon';

class InsuranceRender extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: null,
        }
    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        const weixinUser = await api.get('/currentUser');
        /**
         * 如果已绑定：
         * 保障会员：更新所在城市为签约机构所在城市
         * 绿A会员：更新签约机构为所在城市对应的绿A机构
         */
        if (patient && weixinUser) {
            const { hospital } = patient;
            const { address } = weixinUser;
            if (!address || hospital.provinceId !== address.provinceId || hospital.cityId !== address.cityId) {
                if (patient.memberType === 1) {
                    const user = {
                        address: {
                            provinceId: hospital.provinceId,
                            cityId: hospital.cityId,
                            province: hospital.provinceName,
                            city: hospital.cityName
                        }
                    }
                    api.get('/saveCityList', user);
                } else if (patient.memberType === 2 && weixinUser.address) {
                    await api.post(`/checkHospital`, {
                        id: patient.id,
                        provinceId: address.provinceId,
                        cityId: address.cityId,
                    })
                }
            }
        }
        if (this.props.location.pathname.indexOf('/insuranceRoute') >= 0) {
            Toast.loading('', 6000);
            const insurance = await api.get('/insurances', {
                showType: 'main'
            });
            if (insurance && insurance.length > 0) {
                this.setState({ insurance: insurance[0] })
            } else {
                Toast.hide();
                Modal.info({
                    title: '您所在的城市暂未开通该服务，去看看其它吧！',
                    onOk: () => {
                        this.props.history.push(`/newHealthHomePage`);
                    },
                    okText: '确定',
                });
            }
        }
    }

    renderInsurance() {
        const { userInfo, insurance } = this.state;
        if (this.props.location.pathname.indexOf('/insuranceServicePlan') >= 0) {
            return <InsuranceServicePlan {...this.props} />
        } else if (this.props.location.pathname.indexOf('/insuranceDiseaseV2') >= 0) {
            return <InsuranceDiseaseVersion2 {...this.props} />
        } else if (this.props.location.pathname.indexOf('/insuranceDisease') >= 0) {
            return <InsuranceDisease {...this.props} />
        } else if (this.props.location.pathname.indexOf('/anxinInsurance') >= 0) {
            return <AnxinInsurance {...this.props} />
        } else if (this.props.location.pathname.indexOf('/anxinInsurance_notice') >= 0){
            return <AnxinInsuranceNotice {...this.props} />
        } else if (this.props.location.pathname.indexOf('/zhonghuiCancer') >= 0){
            console.log('有没有执行这里',this.props)
            return <ZhonghuiCancer {...this.props} />
        } else if (this.props.location.pathname.indexOf('/insuranceRoute') >= 0) {
            if (insurance) {
                window.history.replaceState(null, null, `/insurance/${insurance.insuranceId}`);
                return (
                    <div>
                        <Comlon {...this.props} />
                        <CreateInsurance {...this.props} insurancePackageId={insurance.insuranceId} />
                    </div>
                )
            } else {
                return <Comlon {...this.props} />;
            }
        } else {
            return (
                <div>
                    <Comlon {...this.props} />
                    <CreateInsurance {...this.props} />
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                {this.renderInsurance()}
            </div>
        )
    }
}

export default connect(InsuranceRender);
