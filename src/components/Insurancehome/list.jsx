import React, { Component } from 'react'
import { Icon } from 'antd-mobile';
import history from '../../history'
export default class list extends Component {
    constructor(props){
        super(props)
        this.state={
            dataList:[]
        }
    }
    componentDidUpdate(){    
        if(this.props.dataList.length>0&&this.state.dataList.length==0){
            this.setState({
                dataList:this.props.dataList
            })
        }
    }
    //跳转详情
    godetail(item){
        console.log(item)
        history.push(`/insurance/${item.packageId}`)
    }
    //价格显示00
    delete0(number){
        let num=number.split('.');
        if(num[1]=='00'){
            return num[0]
        }else{
            return number
        }
    }  
    render() {
        return (
            <div>
                {this.state.dataList.map((item,index)=>{
                    return <div className="insurance_box" onClick={()=>this.godetail(item)} key={index} style={index===(this.state.dataList.length-1)?{borderBottom:'none'}:null}>                   
                        <div className="hTitle">
                            <img src={item.shareImg}/>
                        </div>
                        <div className="hItem">
                            <h1>{item.title}</h1>
                            <h2>{
                                item.subTitle
                                }</h2>
                            <h3><span>{this.delete0(item.minSalePrice)}</span>元/年起&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>{Array.isArray(item.ageRange)===true?item.ageRange[0]+'-'+item.ageRange[1]:item.ageRange}岁</i></h3>
                        </div>
                        <div className="right">
                            <Icon type="right" size={'sm'} />
                        </div>
                    </div>
                })}
            </div>
        )
    }
}
