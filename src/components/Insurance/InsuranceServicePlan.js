import React, { Component } from 'react';
import api from '../../api';
import Title from '../common/Title';
import { Form, Row, Col, Button } from 'antd';
import IDValidator from '../../helper/checkIdCard';
import querystring from 'query-string';

import './index.less';

const FormItem = Form.Item;

function getAgeByBirthday(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
}

class InsuranceServicePlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
            loading: false,
            patientInfo: null,
            checkPatientLoading: false,
            isPublicSecurityChecked: false,
        }
    }
    async componentDidMount() {
        let patient = await api.get(`/currentPatient`);
        const { insurancePackageId } = this.props.match.params;
        this.insurancePackageId = insurancePackageId;
        if (!patient) {
            patient = {};
        }
        this.setState({ patientInfo: patient })
        //返回页面 初始化
        let idCard = patient.idCard;
        let poverty;
        if (this.props.insurance && this.props.insurance.payload) {
            const insuranceForm = this.props.insurance.payload;
            if (insuranceForm.idCard) {
                idCard = insuranceForm.idCard;
            }
            if (insuranceForm.poverty !== undefined) {
                poverty = insuranceForm.poverty
            }
        }
        const insurancePackages = await api.get(`/insurance_packages/${this.insurancePackageId}/products`);
        const povertyList = [];
        const povertyPro = insurancePackages.find(item => item.poverty === 0)
        if (insurancePackages && povertyPro) {
            povertyList.push({ id: 0, value: '非贫困' });
        }
        if (insurancePackages && insurancePackages.find(item => item.poverty === 1)) {
            povertyList.push({ id: 1, value: '贫困' });
        }
        this.setState({ insurancePackages, povertyList });
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        if (queryData && queryData.prosId) {
            this.setState({ selectedPackageProId: queryData.prosId });
        }
        const initPackagePro = await this.getInitPackagePro(insurancePackages, idCard, poverty, queryData.prosId);
        this.setState({ selectedPackagePro: initPackagePro });

    }

    async getInitPackagePro(insurancePackages, idCard, poverty, selectedPackageProId) {
        const { patientInfo } = this.state;
        let insurancePackageList = [...insurancePackages];
        const ageList = [];
        insurancePackageList = await Promise.all(insurancePackageList.map(item => {
            let { insurancePackagePros } = item;
            const age = ageList.filter(ageItem => item.maxAge === ageItem.maxAge && item.minAge === ageItem.minAge);
            if (!age || age.length <= 0 && item.minAge !== null && item.maxAge !== null) {
                ageList.push({
                    minAge: item.minAge,
                    maxAge: item.maxAge,
                    ageRange: item.ageRange,
                });
            }
            insurancePackagePros = insurancePackagePros.sort((a, b) => {
                const aPrice = this.getPrice(patientInfo.membershipLevel, a);
                const bPrice = this.getPrice(patientInfo.membershipLevel, b);
                return aPrice - bPrice;
            });
            const minPrice = this.getPrice(patientInfo.membershipLevel, insurancePackagePros[0]);
            return {
                minPrice: minPrice,
                ...item,
            }
        }));
        this.setState({ ageList });
        insurancePackageList = insurancePackageList.sort((a, b) => {
            return a.minPrice - b.minPrice;
        });
        if (idCard && ageList.length > 0) {
            const validator = IDValidator;
            const idCardStr = String(idCard);
            const birthday = validator.getInfo(idCardStr).birth;
            const age = getAgeByBirthday(birthday);
            insurancePackageList = insurancePackageList.filter(item => (age >= item.minAge && age <= item.maxAge) || (item.minAge === null && item.maxAge === null));
        }
        if (poverty !== undefined && poverty !== null) {
            const pPro = insurancePackageList[0]
            insurancePackageList = insurancePackageList.filter(item => item.poverty === poverty);
            if (!insurancePackageList || insurancePackageList.length <= 0) {
                this.setState({ isPovertyForbidden: true });
                return pPro;
            }
        }
        if (selectedPackageProId) {
            for (const packageItem of insurancePackageList) {
                const selectedPackagePro = packageItem.insurancePackagePros.find(item => item.id == selectedPackageProId);
                if (selectedPackagePro) {
                    return packageItem;
                }
            }
        }
        return insurancePackageList[0];
    }

    getPrice(membershipLevel, insurancePackagePro) {
        //有可能是0
        return membershipLevel && insurancePackagePro && insurancePackagePro.memeberGradePrices && insurancePackagePro.memeberGradePrices[membershipLevel] !== null
            ? insurancePackagePro.memeberGradePrices[membershipLevel]
            : (insurancePackagePro ? insurancePackagePro.salesPrice : 0);
    }

    toInsuranceServicePlan = () => {
        const { history } = this.props;
        history.push(`/insuranceServicePlan/${this.insurancePackageId}`);
    }
    async povertyOnChange(value) {
        const { selectedPackagePro, insurancePackages } = this.state;
        const { maxAge, minAge } = selectedPackagePro;
        const insurancePackage = insurancePackages.find(
            item => item.poverty === value.id &&
                item.maxAge === maxAge &&
                item.minAge === minAge
        );
        this.setState({ selectedPackagePro: insurancePackage });
    }



    ageOnChange = (ageItem) => {
        const { selectedPackagePro, insurancePackages } = this.state;
        const { poverty } = selectedPackagePro;
        const insurancePackage = insurancePackages.find(
            item => item.poverty === poverty &&
                item.maxAge === ageItem.maxAge &&
                item.minAge === ageItem.minAge
        );
        this.setState({ selectedPackagePro: insurancePackage });
    }
    insuranceTypeOnChange = (item) => {
        const { form } = this.props;
        form.setFieldsValue({ insuranceType: item.id });
        this.props.setInsurance({ insuranceType: item.id });
    }

    render() {
        const {
            selectedPackagePro, ageList, povertyList, patientInfo
        } = this.state;
        const { getFieldDecorator } = this.props.form;
        const { insurancePackagePros } = selectedPackagePro || {};
        //年龄档次
        const ageItems = ageList ? ageList.map((item, index) => {
            const isSelected = selectedPackagePro ? selectedPackagePro.maxAge === item.maxAge && selectedPackagePro.minAge === item.minAge : false;
            const className = isSelected ? 'button12 selectedButton' : 'button12 selectButton';
            return <Col key={index} span={12} className="textAlign-1 marginBottom16">
                <Button className={className} onClick={() => this.ageOnChange(item)}>{item.ageRange}</Button>
            </Col>
        }) : null;
        const povertyItems = povertyList && povertyList.length > 0 ? povertyList.map(item => {
            const isSelected = selectedPackagePro ? selectedPackagePro.poverty === item.id : false;
            const className = isSelected ? 'button12 selectedButton' : 'button12 selectButton';
            return <Col span={12} className="textAlign-1 marginBottom16">
                <Button className={className} onClick={() => this.povertyOnChange(item)}>{item.value}</Button>
            </Col>
        }) : null;
        //保障档次
        const insurancePackageProList = insurancePackagePros ? insurancePackagePros.map(item => {
            //服务内容
            const { insuranceServices } = item;
            const serviceList = insuranceServices.map((item, index) => {
                const isLast = index === insuranceServices.length - 1;
                const style = isLast ? { borderBottom: 'unset' } : null;
                if (item.coverage && item.deductible) {
                    return (
                        <Row key={index} className="serviceItem" style={style}>
                            <Col span={10} className="textAlign-1">
                                <pre>{item.serviceName}</pre>
                            </Col>
                            <Col span={7} className="textAlign-2">
                                <pre>{item.coverage}</pre>
                            </Col>
                            <Col span={7} className="textAlign-2">
                                <pre> {item.deductible}</pre>
                            </Col>
                        </Row>
                    )
                }
            });
            let payPrice = this.getPrice(patientInfo ? patientInfo.membershipLevel : 'common', item);
            return (
                <div className="serviceBox marginBottom16"  >
                    <Row  >
                        <Col span={10} className="textAlign-1" style={{ color: 'red' }}>
                            {item.gradeName}
                        </Col>
                        <Col span={7} className="textAlign-2">
                            保额
                        </Col>
                        <Col span={7} className="textAlign-2">
                            免赔额
                        </Col>
                    </Row>
                    {serviceList}
                    <Row className="serviceItem" >
                        <Col span={12} className="textAlign-1" >
                            保费（年缴）
                        </Col>
                        <Col span={12} className="textAlign-2">
                            <strong>{((payPrice || 0) / 100).toFixed(2)}元/年</strong>
                        </Col>

                    </Row>
                    {/* <Row className="serviceItem">
                        <Col span={12} className="textAlign-1">
                            保费（月缴）
                        </Col>
                        <Col span={12} className="textAlign-2">
                            <strong>{(Math.ceil(payPrice || 0) / 100 / 12).toFixed(2)}元/月</strong>
                        </Col>

                    </Row> */}
                </div>

            )
        }) : null;

        return <div className="insurance">
            <Title>保障服务方案</Title>
            <Form>
                <div className="formItemBox">

                    <FormItem>
                        {getFieldDecorator('insuranceType', {
                            rules: [{ required: true, message: '不能为空' }],
                        })(
                            <Row>
                                {ageItems}
                            </Row>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('insuranceType', {
                            rules: [{ required: true, message: '不能为空' }],
                        })(
                            <Row>
                                {povertyItems}
                            </Row>
                        )}
                    </FormItem>

                    <div >
                        {insurancePackageProList}
                    </div>
                    {/* <Row className="stepTitle">
                        <div className="title">保障服务报销比率表</div>
                    </Row>
                    <div className="serviceBox">
                        <Row>
                            <Col span={8} className="textAlign-1">
                                等级
                            </Col>
                            <Col span={8} className="textAlign-2">
                                门诊报销比
                            </Col>
                            <Col span={8} className="textAlign-2">
                                住院报销比
                            </Col>
                        </Row>
                        <Row className="serviceItem" >
                            <Col span={8} className="textAlign-1">
                                甲级
                            </Col>
                            <Col span={8} className="textAlign-2">
                                100%
                            </Col>
                            <Col span={8} className="textAlign-2">
                                100%
                            </Col>
                        </Row>
                        <Row className="serviceItem" >
                            <Col span={8} className="textAlign-1">
                                乙级
                            </Col>
                            <Col span={8} className="textAlign-2">
                                80%
                            </Col>
                            <Col span={8} className="textAlign-2">
                                90%
                            </Col>
                        </Row>
                        <Row className="serviceItem" style={{ borderBottom: 'unset' }}>
                            <Col span={8} className="textAlign-1">
                                丙级
                            </Col>
                            <Col span={8} className="textAlign-2">
                            送福宝50%<br/>添福宝70%
                            </Col>
                            <Col span={8} className="textAlign-2">
                            送福宝50%<br/>
                            添福宝70%
                            </Col>
                        </Row>
                    </div> */}
                    <Row className="warningTip">
                        提示：<br />
                        ①保费金额为保障服务基础标准，以实际售价为准。<br />
                        ②被保险人发生保险责任范围内的治疗费用，按照《保障方案》所示报销比率进行报销<br />
                    </Row>
                </div>


            </Form>
        </div>
    }
}

InsuranceServicePlan = Form.create()(InsuranceServicePlan);

export default InsuranceServicePlan;
