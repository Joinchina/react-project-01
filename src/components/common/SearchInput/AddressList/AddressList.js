import React from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import close from '../../../../assets/images/close.png';
import api from '../../../../api';
import { message } from 'antd';

import './AddressList.css'

@mount("AddressList")
class AddressList extends React.Component{
    @prop()
    addressListData;
    @prop()
    loading = false;

    @action()
    async getAddressListData(param) {
        try {
            this.loading = true;
            if(param){
               this.addressListData = await api.get('/cfg/enum/regions',param);
            }else{
               this.addressListData = await api.get('/cfg/enum/regions');
            }
            this.loading = false;
            // console.log(this.addressListData)
        } catch (e) {
            message.error('服务器响应失败');
            this.handleClose();
        }
    }

    constructor(){
        super();
        this.state = {
            //数据存储
            listData:[],
            //存每次点击的地区值
            provinceName:'省',
            cityName:'市',
            areaName:'区',
            provinceId:'',
            cityId:'',
            areaId:'',
            dataSource:[]
        }
        //记录城市等级
        this.level = 1;
        this.adressId = {
            provinceId:undefined,
            cityId:undefined,
            areaId:undefined
        }
    }
    //保存选择地区返回给父组件input框
    handleSaveName = (name,id) =>{
        //判断点击地区类别
        if(this.level == 1){
            this.setState({
                provinceName:name,
                provinceId:id,
            })
            this.adressId.provinceId = id;
            this.getAddressListData({provinceId:id})
        }
        if(this.level == 2){
            this.setState({
                cityName:name,
                cityId:id
            })
            this.adressId.cityId = id;
            this.getAddressListData({provinceId:this.adressId.provinceId,cityId:id})
        }
        //点击为区时
        if(this.level == 3){
            // console.log(this.state.provinceName,this.state.cityName)
            this.setState({
                areaName:name,
                areaId: id,
            },()=>{
                let params = {
                    provinceName :this.state.provinceName,
                    cityName:this.state.cityName,
                    areaName:name,
                    provinceId :this.state.provinceId,
                    cityId:this.state.cityId,
                    areaId:id
                };
                this.props.handleCloseListStyle();
                this.props.handleInsertValue(params);
                this.state.provinceName = '省';
                this.state.cityName = '市';
                this.state.areaName = '区';
                this.state.provinceId = '';
                this.state.cityId = '';
                this.state.areaId = '';
            })
            this.adressId.areaId = id;
            this.level = 0;
        }
        this.level ++;
    }
    //点击回退到省
    handleBackProvinceSelected = () => {
        this.adressId.provinceId = undefined;
        this.adressId.cityId = undefined;
        this.state.provinceName = '省';
        this.state.cityName = '市';
        this.getAddressListData();
        this.level = 1;
    }
    //点击回退到市
    handleBackCitySelected = () =>{
        if(this.state.provinceName != '省'){
            this.state.cityName = '市';
            this.adressId.cityId = undefined;
            this.getAddressListData({provinceId:this.adressId.provinceId});
            this.level = 2;
        }else{
            message.error('请选择省');
        }
    }
    //点击区提示
    handleBackAreaSelected = () => {
        if(this.state.provinceName == '省'){
            message.error('请选择省')
        }else{
            if(this.state.cityName == '市'){
                message.error('请选择市')
            }
        }
    }
    //解决地区改变，头部地区选择样式改变
    handleDealLevel = (level) => {
        if(this.level > level){
            return "selected"
        }
        if(this.level == level){
            return "selecting"
        }
        if(this.level < level){
            return "will-select"
        }
        return
    }
    //点击close按钮
    handleClose = () => {
        this.state.provinceName = '省';
        this.state.cityName = '市';
        this.state.areaName = '区';
        this.props.handleCloseListStyle();
        this.level = 1;
    }
    componentWillReceiveProps(nextprops){
        // console.log(this.level,nextprops);
        if(this.level == 1){
           this.setState({
                dataSource:nextprops.dataSource
            })
        }else{
            this.setState({
                dataSource:nextprops.addressListData
            })
        }
    }
    render(){
        const overflowText = {
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
            verticalAlign: "bottom",
        }
        return (
            <div style={{display:this.props.block ? 'block' : 'none'}} className="adress-list-box">
                <div className="scroll-box">
                    <div className="white">
                        <span className={this.handleDealLevel(1)} onClick={this.handleBackProvinceSelected} style={{...overflowText,maxWidth:'30%'}}>{this.state.provinceName}</span>
                        <span className={this.handleDealLevel(2)} onClick={this.handleBackCitySelected} style={{...overflowText,maxWidth:'33%'}}>--{this.state.cityName}</span>
                        <span className={this.handleDealLevel(3)} onClick={this.handleBackAreaSelected} >--{this.state.areaName}</span>
                    </div>
                    {
                        this.loading?
                        <div className="white">正在拼命加载...</div>
                        :
                        this.state.dataSource?
                        this.state.dataSource.map((item,index,o) => {
                            return <div className={index%2 == 1 ? "white" : "smoke"} onClick={()=>this.handleSaveName(item.name,item.id)} key={index}>{item.name}</div>
                        })
                        :
                        <div className="white">正在拼命加载...</div>
                    }
                </div>
                <div className="cancel-button" onClick={this.handleClose}>
                   <img src={close}/>
                </div>
            </div>
        )
    }
}

export default AddressList;
