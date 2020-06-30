import React, { Component } from 'react';

import { Icon, Row, Col, Switch, Spin } from 'antd';
import Region from '../common/region';
import api from '../../api';

class HospitalList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRegion: null,
            loading: true,
            hospitalList: [],
            selectedHospital: null,
            defaultHospital: null,
        }
    }

    async componentDidMount() {
        const { patientAddress, location, defaultHospital } = this.props;
        let selectedRegion;
        if (patientAddress.provinceId || patientAddress.cityId || patientAddress.areaId) {
            selectedRegion = [patientAddress.provinceId, patientAddress.cityId, patientAddress.areaId];
        }
        if (defaultHospital) {
            const selectedHospital = { hospitalId: defaultHospital.hospitalId }
            this.setState({ selectedHospital });
            selectedRegion = [defaultHospital.provincesId, defaultHospital.cityId, defaultHospital.areaId];
        }
        if (location && !selectedRegion) {
            const geocode = await api.get('/geocode', {
                latitude: location.latitude,
                longitude: location.longitude,
            });
            selectedRegion = [geocode.provinceId, geocode.cityId, geocode.areaId];
        }
        const hospitalList = await this.getHospitalList(selectedRegion, location);

        this.setState({ selectedRegion, loading: false, defaultHospital, hospitalList });
    }

    async getHospitalList(selectedRegion, location) {
        if (location) {
            const hospitalList = await api.get('/hospital', {
                where: {
                    provinceId: selectedRegion[0],
                    cityId: selectedRegion[1],
                    // areaId: selectedRegion[2],
                    status: 0,
                    fatchFlag: 1,
                    hospitalSignage: 4,
                },
                nearBy: [location.latitude, location.longitude],
            });
            return hospitalList;
        } else if (selectedRegion) {
            const hospitalList = await api.get('/hospital', {
                where: {
                    provinceId: selectedRegion[0],
                    cityId: selectedRegion[1],
                    // areaId: selectedRegion[2],
                    status: 0,
                    fatchFlag: 1,
                    hospitalSignage: 4,
                },
            });
            return hospitalList;
        }
    }

    onClose() {
        const { onClose } = this.props;
        onClose();
    }

    async addressChange(address) {
        const hospitalList = await this.getHospitalList(address, this.props.location);
        this.setState({ hospitalList });
    }

    async refund(hospitalId, checked) {
        if (!checked) {
            const { defaultHospital } = this.state;
            await api.del(`/patients/${this.props.patientId}/receiverAddress/${defaultHospital.id}`);
            this.setState({defaultHospital: null});
        } else {
            const { hospitalList } = this.state;
            const { patientInfo, patientId } = this.props
            let hospital = hospitalList.find(item => item.id === hospitalId);
            hospital = {
                ...hospital.address,
                provincesId: hospital.address.provinceId,
                hospitalId: hospital.id,
                name: patientInfo.name,
                machineNumber: patientInfo.phone || patientInfo.machineNumber,
            }
            const id = await api.post(`/patients/${patientId}/defaultStoreAddress`, hospital);
            hospital.id = id;
            this.setState({ defaultHospital: hospital });
        }
    }

    selectHospital(selectedHospital) {
        this.setState({ selectedHospital: {...selectedHospital, hospitalId: selectedHospital.id} });
        const { onSelect, onClose } = this.props;
        onSelect(selectedHospital);
        onClose();
    }

    render() {
        const { selectedRegion, hospitalList, selectedHospital, defaultHospital } = this.state;
        const hospitals = hospitalList ? hospitalList.map(item => {
            if (item.fatchFlag === 0) {
                return;
            }
            const selected = selectedHospital && selectedHospital.hospitalId === item.id;
            const checked = defaultHospital && defaultHospital.hospitalId == item.id;
            return <div className="selectHospital" style={selected ? {} : { border: '1px solid #E8E8E8' }} >
                <Row onClick={() => this.selectHospital(item)}>
                    <Col span={20} className="name">
                        {item.name}
                    </Col>
                    <Col span={4} className="free">
                        <span>免费</span>
                    </Col>
                </Row>
                <Row>
                    <Col span={14} className="distance" onClick={() => this.selectHospital(item)}>

                    </Col>
                    <Col span={10} className="isDefault">
                        设为默认
                        <Switch
                            checked={checked}
                            onChange={(checked) => this.refund(item.id, checked)}
                            color="#C8161D"
                        />
                    </Col>
                </Row>
            </div>
        }) : null;
        return (
            <Spin spinning={this.state.loading} >
                <div className="addressList" style={{ height: '100%' }}>
                    <div style={{ textAlign: 'right' }}>
                        <Icon type="close-circle" onClick={() => this.onClose()} style={{ fontSize: '24px', color: '#9A9A9A' }} />
                    </div>

                    <div style={{ height: '400px', overflow: 'auto' }} className="selectRegion">
                        <Region
                            selectedValue={selectedRegion}
                            onSelect={(value) => this.addressChange(value)}
                        />
                        {hospitals}
                    </div>
                </div>
            </Spin>
        );
    }
}
export default HospitalList;
