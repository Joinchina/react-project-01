import React from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import AddressList from './AddressList/AddressList';
import api from '../../../api';
import { message, Icon } from 'antd';

import './SearchInput.css'

@mount("SearchInput")
class SearchInput extends React.Component{
    @prop()
    addressProvinceListData;

    @action()
    async getAddressProvinceListData() {
        try {
            this.addressProvinceListData = await api.get('/cfg/enum/regions');
        } catch (e) {
            message.error('服务器响应失败');
        }
    }
    constructor(){
        super();
        this.state = {
            iconStyle:'right',
            block:false,
            dataSource:[]
        }
        this.value = '请选择';
    }
    //改变icon样式和列表展开
    handleShowListStyle = () =>{
        if(!this.state.block){
            window.scrollTo(0,900);
            this.setState({
                iconStyle:'down',
                block:true
            })
            this.getAddressProvinceListData();
        }else{
            this.setState({
                iconStyle:'up',
                block:false
            })
        }
    }
    //列表关闭
    handleCloseListStyle = () =>{
        this.setState({
            block:false,
            iconStyle:'right'
        })
        //此时的this.value还未经过ReceiveProps改变，仍是之前值
        this.props.handleCloseBack(this.value);
    }

    clearAddress = (e) => {
        e.stopPropagation();
        this.props.handleCloseBack();
    }
    componentWillReceiveProps(nextProps){
        //ReceiveProps在handleCloseBack之后执行，所以this.value存的是以前的值，要在关闭时提供最新值，需要在值改变以后存起来，假如判断nextProps.value != this.value防止死循环
        if(nextProps.value != '请选择' && nextProps.value != this.value){
            this.value = nextProps.value;
            this.props.handleCloseBack(this.value);
        }
    }
    render(){
        const opacity = !this.props.selectedValue ? 0.7:1;
        const address = this.props.selectedValue || null;
        return (
            <div style={this.props.style.searchBox}>
                <div style={this.props.style.address} onClick={this.handleShowListStyle} className="select-box">

                    {address
                    ? <div className="select-input" style={{opacity:opacity}}>
                        {address.provinceName || ''}&nbsp;{address.cityName || ''}&nbsp;{address.areaName || ''}
                        <Icon type="close"  style={{fontSize: '15px',color: '#B2B2B2',fontWeight: 'bolder'}} onClick={(e)=>this.clearAddress(e)}/></div>
                    : <div className="select-input" style={{opacity:opacity,color: '#B2B2B2'}}> 请选择</div>
                    }

                    {this.state.iconStyle == 'right'
                         ?
                         <Icon type="down" className="select-icon" style={{fontSize: '20px',color: '#B2B2B2',fontWeight: 'bolder'}}/>
                        :
                        <Icon type="up" className="select-icon" style={{fontSize: '20px',color: '#B2B2B2',fontWeight: 'bolder'}}/>}
                </div>
                <div className="position-box" style={this.props.style.positionBox}>
                    <AddressList handleCloseListStyle={this.handleCloseListStyle} block={this.state.block} handleInsertValue={(val)=>this.props.onChange(val)} dataSource={this.addressProvinceListData?this.addressProvinceListData:[]}/>
                </div>
            </div>
        )
    }
}

export default SearchInput;
