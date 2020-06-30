import React from 'react';
import { Form, Input, Button, message, Select, Icon, Spin } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import querystring from 'querystring';
import Title from '../Title';
import Weixin from '../../../lib/weixin';
import api from '../../../api';
import Region from '../region';
import './index.less'
const Option = Select.Option;

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1310653_h5q9fl0n33p.js', // 在 iconfont.cn 上生成
});

const addlist = [
    {
        area: null,
        id: "340200",
        name: "芜湖",
        pinyin: "wuhushi",
    },
    {
        area: null,
        id: "522700",
        name: "黔南州",
        pinyin: "qiannanbuyizumiaozuzizhizhou",
    },
    {
        area: null,
        id: "440100",
        name: "广州",
        pinyin: "guangzhoushi",
    },
    {
        area: null,
        id: "320100",
        name: "南京",
        pinyin: "nanjingshi",
    },
    {
        area: null,
        id: "140800",
        name: "运城",
        pinyin: "yunchengshi",
    },
    {
        area: null,
        id: "140100",
        name: "太原",
        pinyin: "taiyuanshi",
    }
]

@mount('addressSelect')
export default class AddressSelect extends React.Component {

    @prop()
    location;

    @prop()
    selectedRegion;

    @prop()
    latitude;

    @prop()
    longitude;

    @prop()
    loading = false;

    @prop()
    allCityList = [];

    @prop()
    cityList = [];

    @prop()
    sortCityList = [];

    @prop()
    isShow = true

    @prop()
    canshowDelete = false;

    @prop()
    pathName

    @prop()
    patient

    @prop()
    pyList

    constructor(props) {
        super(props);
        this.wx = new Weixin('getLocation');
        this.state = {
            isShowAddress: true,
        }
    }

    @action()
    componentDidMount() {
        this.init();
        const qs = this.props.history.location.search.slice(this.props.history.location.search.indexOf('?') + 1);
        const q = querystring.parse(qs);
        const { r } = q;
        this.pathName = r
    }

    @action()
    async init() {
        try{
            this.allCityList = await api.get('/cityList') // 省市列表
            const cityList = []
            this.allCityList.map((i) => { // 城市列表， 带id
                cityList.push(...i.city)
            })
            /*
                cityList - 城市列表
                sortCityList - 排序后的城市列表
             */
            const firPinyin = cityList.map((i) => i.pinyin[0]).sort((a,b) => a.charCodeAt(0)-b.charCodeAt(0));
            this.pyList = [...new Set(firPinyin)] // 城市列表拼音列表
            this.cityList = cityList.sort((a,b) => a.pinyin[0].charCodeAt(0)-b.pinyin[0].charCodeAt(0))
        }catch(err){

        }
        try{
            this.loading = true;
            await this.wx.ready();
            this.patient = await api.get(`/currentPatient`);
            const weixinUser = await api.get('/currentUser');
            if (!weixinUser.address) {
                this.setState({
                    isShowAddress: true
                })
            }
            await this.wx.getLocation({
                type: 'gcj02',
                success: (location) => {
                    this.location = location;
                    this.latitude = location.latitude,
                    this.longitude = location.longitude
                },
                fail: (error) => {
                    this.selectedRegion = []
                }
            })
            const geocode = await api.get('/geocode', {
                latitude: this.location.latitude,
                longitude: this.location.longitude,
            });
            if (geocode) {
                this.selectedRegion = [geocode.provinceId, geocode.cityId, geocode.areaId, geocode.cityName, geocode.provinceName]
            }
            this.loading = false;
        }catch(err){
            this.loading = false;
        }
    }

    @action()
    async onChange(value) {
        if (this.allCityList.length) {
            let choseProvince = null
            let choseCity = null
            this.cityList.map((i) => {
                if (i.id == value.id ) {
                    choseCity = i
                }
            })
            this.allCityList.map((i) => {
                if (i.city.find(c => c.id == value.id)) {
                    choseProvince = i
                }
            })
            const address = {
                address:{
                    provinceId: choseProvince.id,
                    cityId: choseCity.id,
                    province: choseProvince.name,
                    city: choseCity.name
                }
            }
            try{
                await api.get('/saveCityList', address)
                if (this.patient) {
                    await api.post(`/checkHospital`, {id: this.patient.id, provinceId: choseProvince.id, cityId: value})
                }
                window.location.href = this.pathName
            }catch(err){
                message.error(err.message)
            }
        }
    }

    @action()
    async onSearchChange(value) {
        if(value){
            let choseCity = null
            let choseProvince = null
            this.cityList.map((i) => {
                if (i.name+i.pinyin == value ) {
                    choseCity = i
                }
            })
            this.allCityList.map((i) => {
                if (i.city.find((j) => j.id == choseCity.id)) {
                    choseProvince = i
                }
            })
            const address = {
                address:{
                    provinceId: choseProvince.id,
                    cityId: choseCity.id,
                    province: choseProvince.name,
                    city: choseCity.name
                }
            }
            try{
                await api.get('/saveCityList', address)
                if (this.patient) {
                    const dat =  {id: this.patient.id, provinceId: choseProvince.id, cityId: choseCity.id}
                    await api.post(`/checkHospital`, dat)
                }
                window.location.href = this.pathName
            }catch(err){
                message.error(err.message)
            }
        }
    }

    @action()
    async checkAddress() {
        if (this.selectedRegion && this.selectedRegion.length) {
            const address = {
                address:{
                    provinceId: this.selectedRegion[0],
                    cityId: this.selectedRegion[1],
                    province: this.selectedRegion[4],
                    city: this.selectedRegion[3]
                }
            }
            try{
                await api.get('/saveCityList', address)
                if (this.patient) {
                    const dat =  {id: this.patient.id, provinceId: this.selectedRegion[0], cityId: this.selectedRegion[1]}
                    await api.post(`/checkHospital`, dat)
                }
                window.location.href = this.pathName
            }catch(err){
                message.error(err.message)
            }
        }
    }

    @action()
    canshow(i) {
        this.isShow = i > 0 ? false : true
    }

    render() {
        const cityOptions = this.cityList && this.cityList.length && this.cityList.map((i, index) => <Option key={index} value={i.name+i.pinyin} data={i}>{i.name}</Option>)
        return (
            <div className="hasMenu address_select">
                <Title>城市列表</Title>
                <Spin spinning={this.loading}>
                    <div style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop:9}}>
                        <Select
                            showSearch
                            style={{ flex: 1, height: 36 }}
                            placeholder="请输入城市名/拼音"
                            optionFilterProp="children"
                            onChange={this.onSearchChange.bind(this)}
                            filterOption={(input, option) => option.props.value.indexOf(input) >= 0}
                            onFocus={() => this.canshow(1)}
                            onBlur={() => this.canshow(-1)}
                            allowClear={true}
                            notFoundContent="暂时未找到相关城市"
                        >
                            {cityOptions}
                        </Select>
                        <MyIcon type='icon_sousuo-xian' style={{ fontSize: 26, position: 'absolute', top: 6, left: 29}} />
                        <span style={{ color: '#222222', fontSize: 16, marginLeft: 15 }} onClick={() => this.canshow(-1)}>取消</span>
                    </div>
                    {this.isShow ? <div style={{ paddingLeft: 16, paddingRight: 16 }}>
                        <p style={{ fontSize: 16, color: '#9A9A9A', marginBottom: 12 }}>定位显示您处于</p>
                        <span
                            style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, backgroundColor: '#fff' }}
                            onClick={() => this.checkAddress()}
                        >
                            {this.selectedRegion && this.selectedRegion.length ? <i
                                className="address_icon"
                                style={{ lineHeight: 1, marginRight: 1, lineHeight: '39px' }}
                            >
                                &#xe643;
                            </i> : null}
                            <span style={{ fontSize: 16, color: '#222222', lineHeight: '39px' }}>{this.selectedRegion ? this.selectedRegion.length ? this.selectedRegion[3] : '定位失败，请重试' : '定位失败，请重试'}</span>
                        </span>
                    </div> : null}
                    {this.isShow ? <div style={{ paddingLeft: 16, paddingRight: 16, marginTop: 24 }}>
                        <p style={{ fontSize: 16, color: '#9A9A9A', marginBottom: 12 }}>热门城市</p>
                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {addlist.map((i) => {
                                return (
                                    <span
                                        style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, backgroundColor: '#fff', marginRight: 8, marginBottom: 12, height: 36, minWidth: 104, fontSize: 16, color: '#222222', textAlign: 'center'}}
                                        onClick={() => this.onChange(i)}
                                    >
                                        {i.name}
                                    </span>
                                )
                            })}
                        </div>
                    </div> : null}
                    {this.isShow ? <div style={{ marginTop: 16 }}>
                        <div style={{ height: 42, backgroundColor: '#fff', fontSize: 16, color: '#9a9a9a', lineHeight: '42px', paddingLeft: 16 }}>
                            按字母查询城市
                        </div>
                        {this.pyList && this.pyList.length && this.cityList && this.cityList.length ? this.pyList.map((i) => {
                            return (
                                <div key={i}>
                                    <p style={{ paddingLeft: 16, fontSize: 16, color: '#9A9A9A', lineHeight: '26px' }}>{i.toUpperCase()}</p>
                                    <div style={{ backgroundColor: '#fff', paddingLeft: 16}}>
                                        {this.cityList.map((j) => {
                                            if (j.pinyin[0] == i) {
                                                return (
                                                    <p key ={j.id} style={{ fontSize: 16, color: '#222222', lineHeight: '42px' }} onClick={() => this.onChange(j)}>{j.name}</p>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                            )
                        }) : null}
                    </div> : null}
                </Spin>
            </div>
        )
    }
}
