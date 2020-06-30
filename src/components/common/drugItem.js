import React from 'react';
import drugImg from '../../assets/images/unusualpng.png';
import errorImg from '../../assets/images/close.png';
import drugStatusBgImg from '../../assets/images/label 2.png';
import goDrugDetailsBgImg from '../../assets/images/arrow_details.png'
import drugPicBg from '../../assets/images/no_image.png';


import { centToYuan, refundRountCentPercentToCent } from '../../helper/money';

class DrugItem extends React.Component{
    render(){
        const styles = this.getStyles();
        const data = this.props.data;
        const drugIds = this.props.drugIds;
        return (
            <div style={styles.drugItemBox} onClick={() => this.props.clickEvent(data.drugId)}>
                { drugIds && drugIds.indexOf(data.drugId) >= 0 ?
                    <div style={styles.drugStatusBox}>可购</div> : null
                }
                <div style={styles.drugImgBox}>
                </div>
                <div style={styles.orderDrug}>
                    <div style={styles.drugInfo} className="hidden-multi-line-text">
                        <span style={styles.drugName}>{data.productName ? `${data.commonName || ''}(${data.productName || ''})` : data.commonName || ''}</span>
                        <span>{`${data.preparationUnit || ''}*${data.packageSize || ''}${data.minimumUnit || ''}/${data.packageUnit || ''}`}</span>
                    </div>
                    <div style={styles.drugPriceAndAmount}>
                        <div style={styles.drugPrice}>
                        <span>{data.priceCent && `￥${centToYuan(data.priceCent, 2) || 0}`}</span>
                        <span style={styles.saveMoney}>可报销{data.whScale && data.priceCent && centToYuan(refundRountCentPercentToCent(data.priceCent*data.whScale), 1) || 0}元</span>
                        </div>
                        <div style={styles.goDrugDetailsBox}><img src={goDrugDetailsBgImg} style={styles.goDrugDetailsBgImg}/></div>
                        {// <div style={styles.operatingDrugNumbers} className="operatingDrugNumbers">
                        //     <span style={styles.drugReduce} className="drugReduce">-</span>
                        //     <span style={styles.drugNumbers} className="drugNumbers">44</span>
                        //     <span style={styles.drugAdd} className="drugAdd">+</span>
                        // </div>
                       }
                    </div>
                </div>
            </div>
        )
    }
    getStyles(){
        return {
            drugItemBox:{
                borderStyle:'solid',
                borderWidth:1,
                borderColor:"#efefef",
                padding:15,
                display:'flex',
                flexDirection:'row',
                position:'relative',
            },
            drugImgBox:{
                backgroundColor:'#fff',
                width:80,
                height:80,
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
                backgroundImage:`url(${this.props.data.outerPackagePicUrl || drugPicBg})`,
                backgroundSize:'contain',
                backgroundRepeat:'no-repeat',
                backgroundPosition:'50%',
            },
            errorBox:{
                position:'absolute',
                left:2.5,
                top:2.5,
                background:'#fff',
                borderRadius:25,
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
                width:25,
                height:25,
                boxShadow:'0 0 15px 0.5px rgba(255,91,12,.2)',
            },
            errorImg:{
                width:15,
                height:15,
            },
            drugStatusBox:{
                backgroundImage:`url(${drugStatusBgImg})`,
                backgroundRepeat:'no-repeat',
                backgroundSize:'55px 20px',
                position:'absolute',
                zIndex:1,
                top:23,
                left:15,
                width:55,
                height:20,
                color:'#fff',
                fontSize:13,
                letterSpacing:2,
                paddingLeft:8,
            },
            goDrugDetailsBox:{
                height:30,
                width:30,
                borderRadius:15,
                borderColor:'#4f4f4f',
                borderWidth:1,
                borderStyle:'solid',
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
            },
            goDrugDetailsBgImg:{
                width:30,
                height:30,
            },
            drugImg:{
                width:80,
                height:80,
            },
            orderDrug:{
                display:'flex',
                marginLeft:10,
                flexDirection:'column',
                width:'100%',
            },
            drugInfo:{
                flex:2,
                lineHeight:'24px',
                fontSize:16,
                letterSpacing:2,
                wordBreak:'break-all',
                paddingTop:5,
            },
            drugPriceAndAmount:{
                flex:1,
                display:'flex',
                justifyContent:'space-between'
            },
            drugName:{
                marginRight:10,

            },
            drugPrice:{
                lineHeight:'22px',
                fontSize:16,
                letterSpacing:2,
            },
            operatingDrugNumbers:{
                background:'#fff',
                width:100,
                height:30,
                borderRadius:20,
                display:'flex',
                lineHeight:'30px',
            },
            drugReduce:{
                paddingLeft:13,
                fontSize:7,
            },
            drugAdd:{
                paddingRight:13,
                fontSize:7,
            },
            drugNumbers:{
                fontWeight:'bold',
                fontSize:15,
                letterSpacing:2,
            },
            saveMoney:{
                color:'#c8161e',
                marginLeft:10,
            }
        }
    }
}

export default DrugItem;
