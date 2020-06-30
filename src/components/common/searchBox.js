import React from 'react';
import {Icon} from 'antd';

class SearchDrug extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            value: this.props.value,
            showBtn: false
        }
    }

    inputChange(e) {
        this.setState({
            value: e.target.value,
        });
        if(this.props.onChange) {
            this.props.onChange(e.target.value);
        }
    }

    searchDrug() {
        if(this.state.value) {
            this.props.searchDrug(this.state.value)
        }
    }
    onKeyDown(e){
        if(e.keyCode == 13){
            this.searchDrug();
            //this.refs.btn.focus();
        }
    }
    focus = () => {
        this.setState({
            showBtn:true
        })
    }
    blur = () => {
        this.setState({
            showBtn:false
        })
    }

    componentWillReceiveProps(props) {
        if(this.state.value && !props.value && this.props.value) {
            this.setState({
                value: ''
            })
        }
    }

    refInput = ele => {
        if(this.props.autoFocus && ele && !this.state.text) {
            ele.focus();
        }
    }

    render(){
        const btn = {
            width:70,
            top:5,
            right:20,
            position:'absolute',
            zIndex:1,
        }
        const searchInputStyle = {
            height:45,
            paddingLeft:36,
            boxShadow:'none',
            backgroundColor:'#efefef',
        }
        const searchIconStyle={
            fontSize: 15,
            color: '#c8161e',
            position:'absolute',
            left:30,
            top:15,
        }
        return(
            <div className="searchDrug" style={{paddingLeft:15,paddingRight:15,}}>
                <input placeholder="请输入药品名称" className="weixin-input" style={searchInputStyle}
                    ref={this.refInput}
                    type="text"
                    value={this.state.value}
                    disabled={this.props.disabled}
                    onChange={(e) => this.inputChange(e)}
                    onKeyDown={(e) => this.onKeyDown(e)}/>
                <Icon type="search" style={searchIconStyle} />
                <button style={btn} className={this.state.showBtn?'searchDrugBtn btnFocusStyle':'searchDrugBtn'} onClick={() => this.searchDrug()}
                    disabled={!this.state.value}
                    onFocus={this.focus}
                    onBlur={this.blur}
                    ref="btn"
                    >搜 索</button>
            </div>
        )
    }
}

export default SearchDrug;
