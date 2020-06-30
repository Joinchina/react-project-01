import React, { Component } from 'react';
import api from '../../api';
import { Cascader } from 'antd';

import './region.less';

class Region extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [],
            selectedValue: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedValue !== this.props.selectedValue) {
            this.init(nextProps.selectedValue);
        }
    }

    async init(selectedValue) {
        const provinceList = await api.get('/cfg/enum/regions');
        if(this.props.allowArea){
            let provices = provinceList.filter(item => item.id === this.props.allowArea[0]);
            const options = await Promise.all(provices.map(async item => {
                if (selectedValue && selectedValue[0] === item.id) {
                    let cityList = await api.get('/cfg/enum/regions', { provinceId: item.id });
                    cityList = cityList.filter(item => item.id === this.props.allowArea[1]);
                    const children = await Promise.all(cityList.map(async city => {
                        if (selectedValue && selectedValue[1] === city.id) {
                            const areaList = await api.get('/cfg/enum/regions', { provinceId: item.id, cityId: city.id });
                            const areas = await Promise.all(areaList.map(area => {
                                return { label: area.name, value: area.id }
                            }))
                            return { label: city.name, value: city.id, isLeaf: false, children: areas }
                        }
                        return { label: city.name, value: city.id, isLeaf: false }
                    }))

                    return { label: item.name, value: item.id, isLeaf: false, children }
                }
                return { label: item.name, value: item.id, isLeaf: false }
            }))
            this.setState({ options, selectedValue: this.props.selectedValue });
        }else{
            const options = await Promise.all(provinceList.map(async item => {
                if (selectedValue && selectedValue[0] === item.id) {
                    const cityList = await api.get('/cfg/enum/regions', { provinceId: item.id });
                    const children = await Promise.all(cityList.map(async city => {
                        if (selectedValue && selectedValue[1] === city.id) {
                            const areaList = await api.get('/cfg/enum/regions', { provinceId: item.id, cityId: city.id });
                            const areas = await Promise.all(areaList.map(area => {
                                return { label: area.name, value: area.id }
                            }))
                            return { label: city.name, value: city.id, isLeaf: false, children: areas }
                        }
                        return { label: city.name, value: city.id, isLeaf: false }
                    }))

                    return { label: item.name, value: item.id, isLeaf: false, children }
                }
                return { label: item.name, value: item.id, isLeaf: false }
            }))
            this.setState({ options, selectedValue: this.props.selectedValue });
        }

    }
    async componentDidMount() {
        const { selectedValue } = this.props;
        this.init(selectedValue);
    }

    async loadData(selectedOptions) {
        let children;
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        if (selectedOptions.length === 1) {
            const cityList = await api.get('/cfg/enum/regions', { provinceId: selectedOptions[0].value });
            children = await Promise.all(cityList.map(item => {
                return { label: item.name, value: item.id, isLeaf: false }
            }))
        }
        if (selectedOptions.length === 2) {
            const areaList = await api.get('/cfg/enum/regions', { provinceId: selectedOptions[0].value, cityId: selectedOptions[1].value });
            children = await Promise.all(areaList.map(item => {
                return { label: item.name, value: item.id, isLeaf: true }
            }))
        }
        targetOption.children = children
        this.setState({
            options: [...this.state.options],
        });
        targetOption.loading = false;
    };

    onChange = (value) => {
        const { onSelect } = this.props;
        onSelect(value);
        this.setState({ selectedValue: value });
    };
    render() {
        return (
            <Cascader
                value={this.state.selectedValue}
                options={this.state.options}
                loadData={(selectedOptions) => this.loadData(selectedOptions)}
                onChange={this.onChange}
                changeOnSelect={true}
                className="cascader-region"
                placeholder={this.props.placeholder || '请选择省/市/区'}
                allowClear={false}
            />
        );
    }
}

export default Region;
