import React, { Component } from 'react'
import { Form, Select , Button } from 'antd';
import {InputItem,Toast} from 'antd-mobile';
import api from '../../api';
import Title from '../common/Title'
import topimg from '../../assets/images/123.jpg'
import './index.less'
import ModalAlert from './modal'
const { Option } = Select;
//防抖函数
function debounce(fn,wait){
    var timeout = null;
    return function (e) {
        clearTimeout(timeout); 
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
        }, wait);
    };
}
//生成取药日期
function dateAll(){
    let arr=[];
    for (let i = 1; i < 29; i++) {
        let obj={}
        obj.name=`${i}号`
        obj.id=i
        arr.push(obj)        
    }
    return arr
}
//获取？号后面的参数
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}
class YSGC extends Component {
    constructor(props){
        super(props)
        this.timer=null;
        if(window.location.href==='https://ysgc.wanhuhealth.com'){
            this.cityList=[
                {'name':'芜湖','id':340200,'insurancePackageId':'44'},
                {'name':'太原','id':140100,'insurancePackageId':'44'},
                // {'name':'运城','id':140800,'insurancePackageId':44},
                {'name':'都匀','id':522700,'insurancePackageId':'44'},
            ];
        }else{
            this.cityList=[
                {'name':'芜湖','id':340200,'insurancePackageId':'63'},
                {'name':'太原','id':140100,'insurancePackageId':'63'},
                // {'name':'运城','id':140800,'insurancePackageId':97},
                {'name':'都匀','id':522700,'insurancePackageId':'63'},
            ];
        }
        
        this.dateAll=dateAll()
        this.zouqi=[
            {'id':1,'name':'每月一次'},
            {'id':2,'name':'每两个月一次'},
            {'id':3,'name':'每三个月一次'},
        ]
        this.state={
            city:null,//城市
            cityid:null,
            name:false,//是否实名认证
            phoneErr:false,//手机号是否错误,true表示错误
            timeCount:60,
            cid:null,//激活码
            insurancePackageId:null,//
            ismodal:false,
            doctorList:[],
            doctorId:null,
            text:null,
            click:null
        }
    }
    async componentDidMount(){
        //获取当前患者
        const cid= getQueryVariable('cid')
        if(cid){
            this.setState({
                cid:cid
            })
        }
        const { getFieldDecorator,setFieldsValue} = this.props.form;
        const patient = await api.get(`/currentPatient`);
        if(patient){
            //如果当前用户已登陆并且有手机号和名字则显示出来
            if(patient.name){
                setFieldsValue({'name':patient.name})
            };
            if(patient.phone){
                setFieldsValue({'phone':patient.phone});
                //校验是否实名认证，实名则姓名不可修改
                // try {
                //     const nameTrue= await api.post(`/patients/${patient.id}/patientCertification`, {
                //                         idCard: patient.idCard,
                //                         name: patient.name,
                //                     });
                //     if(nameTrue===null){
                //         this.setState({
                //             name:true
                //         })
                //     }                
                // } catch (err) {
                //     Toast.fail(err.message, 2);                    
                //     return;
                // }
            }
        };
    }
    //表单提交
    async handleSubmit(){
       
        this.props.form.validateFields(async(err, values) => {
            console.log(err,values)
            if (!err) {
                //禁用重复点击
                this.setState({
                    click:'none'
                })
                const patients = await await api.get('/patients/signCheck', {
                    phone: values.phone
                })
                if (patients) {
                    //该用户已经注册过
                    this.oldUser(values,patients.patientId)
                } else {
                    //未注册过
                    this.createUser(values)
                }
                
            }else{
               
            }
        });
    };
    //创建用户
    async createUser(values){
        const weixinUser = await api.get('/currentUser');
        console.log(weixinUser)
        const openList = await api.get('/openInfo');
        console.log(openList)
        let ishave
        if (weixinUser.address && weixinUser.address.cityId) {
            ishave = openList.find((i) => i.cityId == weixinUser.address.cityId)
        }
        const bjId = openList.find((i) => i.cityId == '110100')
        const hosId = ishave ? ishave.hospitalId : bjId.hospitalId        
        const obj = {
            memberType: 2,
            phone: values.phone.replace(/\s+/g, ""),
            name: values.name,
            hospitalId:hosId,
            estimatedHospitalId:values.hospital,//社区医院id
            estimatedDoctorId:values.doctor=='-1'?null:values.doctor,
            estimatedPickupDay:values.date,
            estimatedPickupPeriod:values.cycle
        }
        
        try {
            //微信签约
            const patientId = await api.post(`/patients`, obj);
            //绑定微信信息
            await api.post(`/bind/patient/${patientId}`);
            this.getCodeActive(values,patientId)
            
        } catch (e) {
            Toast.fail(e.message, 2);
            console.log('出错了',e)
        }
    }
    //处理老用户的关系
    async oldUser(values,patients){
        // 更新三定信息
        try {
            await api.get(`/edituserInfo`,{
                id:patients, 
                estimatedPickupPeriod:values.cycle,
                estimatedPickupDay:values.date,
                estimatedDoctorId:values.doctor=='-1'?null:values.doctor,
                estimatedHospitalId:values.hospital})
        } catch (error) {
            Toast.fail('更改三定信息错误', 2);
            return
        }
        //判断当前的老用户是否参加过活动
        const isData = {
            phone: values.phone.replace(/\s+/g, "")
        }
        const getActive = await api.get(`/getActive`,isData)
        if(getActive&&getActive.length>0){
            //参加过了
            // const code = await api.get(`/insurance_packages/activationCode`,{userId:patients,id:this.state.insurancePackageId})
            let text=`<p>您已参加过本项目，请勿重复提交！</p><p>如果您尚未激活项目权益请立即激活</p>`
            this.setState({
                ismodal:true,
                click:null,
                text:text
            })
        }else{
            //没有参加过
            this.getCodeActive(values,patients)
        };
    }
    //获取code，并且激活权益
    async getCodeActive(values,patients){
        //获取code激活码
        // const code = await api.get(`/insurance_packages/activationCode`,{userId:patients,id:this.state.insurancePackageId})
        // if(code){
            // this.setState({
            //     code:code
            // })
            const isData = {
                phone: values.phone.replace(/\s+/g, ""),
                name: values.name,
                // code: code
            }
            const isActive = await api.get(`/isActive`,isData)
            if(isActive){
                //读秒的loading
                Toast.loading('提交成功! 系统审核中请稍后......', 3, () => {
                    let text=`<p>恭喜您，审核通过！</p><p>请立即激活项目权益</p>`
                    this.setState({
                        ismodal:true,
                        text:text,
                        click:null
                    })
                });
            }
        // }
    }
    //手机号校验
    phone=()=>{
        this.props.form.validateFields(['phone'], async (errors, values) => {
            const mobilePhone = values.phone ? values.phone.replace(/\s+/g, "") : '';
            if (!(/^1[3456789]\d{9}$/.test(mobilePhone))) {
                Toast.fail('请输入正确的手机号', 2);                
                return;
            } 
        });
    }
    //获取验证码
    async getCapchar(){
        this.phone();
        const { getFieldValue} = this.props.form;
        const phone =getFieldValue('phone')
        try {
            await api.post(`/patient-sms-send`, {
                mobilePhone:phone
            })
            //开始倒计时，
            clearInterval(this.timer)
            this.timer=setInterval(()=>{
                if(this.state.timeCount==0){
                    clearInterval(this.timer)
                    this.setState({
                        timeCount:60
                    })
                    return
                }
                this.setState({
                    timeCount:this.state.timeCount-1
                })
            },1000)
        } catch (err) {
            Toast.fail(err.message, 2);
        }
    }
    //验证验证码
    phoneCode = async ()=>{
        const { getFieldValue,setFieldsValue} = this.props.form;
        const code =getFieldValue('code')
        const phone =getFieldValue('phone')
        console.log(code)
        if(code){
            try {
                const patientId = await api.post(`/verify-patient`, {
                    mobilePhone: phone.replace(/\s+/g, ""),
                    code: code,
                });
            } catch (error) {
                Toast.fail(error.message, 2);
                setFieldsValue({'code':''})
                return 
            }
        }else{
            // Toast.fail('验证码不能为空', 2);
        }            
    }
    //城市选择
    chooseCity(city){
        console.log(city)
        const { getFieldValue,setFieldsValue} = this.props.form;
        this.setState({
            city:city.name,
            cityid:city.id
        })
        setFieldsValue({'city':city.id});
        this.setState({
            insurancePackageId:city.insurancePackageId,
            doctorList:[],
            hospitalList:[]
        })
        //清空社区医院，医生
        // setFieldsValue({'hospital':''});
        setFieldsValue({'hospital':''});
        setFieldsValue({'doctor':''});
        //利用js强制清空
        let demo=document.getElementsByClassName('ant-select-selection-selected-value')
        for (let index = 0; index < demo.length; index++) {
            const html=demo[index];
            html.innerText=''
        }
    }
    //社区医院搜索
    handleSearch = debounce( async value => {
        //校验城市是否选择，没选择提示，不往下执行
        this.props.form.validateFields(['city'], async (errors, values) => {
            if(errors){
                Toast.fail('城市选择不能为空', 2);
                return
            }else{
                if (value) {
                    // 创建防抖函数，要不然会卡死,判断下是否有英文，有直接返回，
                    let patrn=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi; 
                    if(!patrn.exec(value)){ 
                        //没有中文
                        return false; 
                    }else{
                        // 有 
                        this.search(value)
                    } 
                                        
                } else {
                    return
                }
            }
        });
    },500);
    //搜索功能
    async search(value){
        // let reg = /.+?(县|区|镇)/g;
        // let Arr=value.match(reg);
        // console.log(Arr)
        // if(!Arr||Arr.length==0){
        //     return
        // }
        // let sheng,shi,xian;
        // Arr.forEach(item=>{
        //     if(item.indexOf('省')>=0){
        //         sheng=item
        //     }else if(item.indexOf('市')>=0){
        //         shi=item
        //     }else if(item.indexOf('县')>=0 || item.indexOf('区')>=0){
        //         xian=item
        //     }
        // })
        //搜索获取社区医院
        const hospitalList = await api.get('/hospital', {
            where: {
                cityId:this.state.cityid,
                hospitalSignage:1,        
            },
        });
        console.log('hospitalList',hospitalList)
        //异步取出符合得数据
        const hospital = await hospitalList.filter(item=> item.name.indexOf(value)>=0)
        console.log('hospitalList',hospital)
        if(hospital.length==0){
            Toast.fail('没有搜索到相关医院', 2);
            return
        }
        //设置查询出的机构
        this.setState({
            hospitalList:hospital
        })
    }
    //社区医院改变
    chooseHospital = (value) =>{
        let data=this.state.hospitalList[value]
        console.log(data)
        this.props.form.setFieldsValue({'hospital':data.id})
        this.setState({
            doctorId:data.id,
            // hospitaVal:data.name
        })
    }
    //获取医生
    async getDoctorList(){        
        const doctorList= await api.get(`/${this.state.doctorId}/doctors`)
        if(doctorList){
            doctorList.unshift({name:'尚未确定',id:'-1'})
            this.setState({
                doctorList:doctorList,
            })
        }
    }
    //选择签约医生
    chooseDoctor = (value) =>{
        console.log(value)
        this.props.form.setFieldsValue({'doctor':value})
    }
    render() {
        const { getFieldDecorator,setFieldsValue} = this.props.form;
        const {city,name,phone,timeCount,hospitalList,doctorList}=this.state;
        const { Option } = Select;
        return (
            <div className="ysgc_box">
                <ModalAlert visible={this.state.ismodal} Close={(val)=>{this.setState({ismodal:val})}} insurancePackageId={this.state.insurancePackageId} cid={this.state.cid} text={this.state.text}></ModalAlert>            
                <Title>移山工程</Title>
                <img src={topimg} alt=""/>
                <div className="form_box">
                    <Form>
                        <Form.Item>
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入姓名' }],
                            })(
                                <InputItem
                                    placeholder="请输入姓名"
                                    editable={!name}
                                    maxLength={10}
                                >
                                    姓名
                                </InputItem>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('phone', {
                                rules: [{ required: true, message: '请输入手机号' }],
                            })(
                                <InputItem
                                    placeholder="请输入手机号"
                                    onBlur={this.phone}
                                    maxLength={11}
                                    extra={
                                        <Button
                                            className="addonAfterButton"
                                            disabled={timeCount!=60 ? true : false}
                                            onClick={() => this.getCapchar()}>
                                                {timeCount!=60 ? `${timeCount}s重新获取` : '获取验证码'}
                                        </Button>
                                    }
                                >
                                    手机号
                                </InputItem>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('code', {
                                rules: [{ required: true, message: '请输入验证码' }],

                            })(
                                <InputItem
                                    placeholder="请输入验证码"
                                    onBlur={this.phoneCode}
                                    type="digit"
                                    clear
                                    maxLength={4}
                                >
                                    验证码
                                </InputItem>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('city', {
                                rules: [{ required: true, message: '请选择城市' }],
                            })(
                                <div className="city_box">
                                    <h1>城市</h1>
                                    <div className="city_btn">
                                        {this.cityList.map((item,index)=>{
                                            return (
                                            <Button className={city===item.name?'selectbtn':'noselectbtn'} key={index} onClick={this.chooseCity.bind(this,item)}>{item.name}</Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('hospital', {
                                rules: [{ required: true, message: '请选择社区医院' }],
                            })(
                                <div className="hospital_box">
                                    <h1>社区医院</h1>
                                    <div>
                                        <Select
                                            showSearch
                                            placeholder={'请选择社区医院'}
                                            defaultActiveFirstOption={true}
                                            showArrow={true}
                                            filterOption={false}
                                            onSearch={this.handleSearch}
                                            onSelect={this.chooseHospital}
                                            notFoundContent={null}
                                            allowClear={true}
                                            // value={this.state.hospitalVal}
                                        >
                                            {
                                                hospitalList&&hospitalList.length>0?hospitalList.map((item,index)=>{
                                                    return (
                                                        <Option key={index}>{item.name}</Option>
                                                    )
                                                }):null                                                
                                            }
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('doctor', {
                                rules: [{ required: true, message: '请选择签约医生' }],
                            })(
                                <div>
                                <div className="doctor_box">
                                    <h1>签约医生</h1>
                                    <div>
                                        <Select 
                                        placeholder="请选择签约医生" 
                                        onFocus={()=>this.getDoctorList()}
                                        showSearch
                                        defaultActiveFirstOption={true}
                                        showArrow={true}
                                        filterOption={false}
                                        onSelect={this.chooseDoctor}
                                        notFoundContent={null}
                                        allowClear={true}
                                        // value={this.state.doctorVal}
                                        >
                                            {
                                                doctorList&&doctorList.length>0?doctorList.map((item,index)=>{
                                                    {
                                                        return (
                                                        <Option value={item.id} key={item.id}>{item.name}</Option>
                                                        )
                                                    }
                                                }):null
                                            }
                                        </Select>
                                    </div>
                                   
                                </div>
                                <p>如您首次签约社区医院，医生可选择“尚未确定”</p>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('cycle', {
                                rules: [{ required: true, message: '请选择取药周期' }],
                            })(
                                <div className="cycle_box">
                                    <h1>取药周期</h1>
                                    <div>
                                    <Select placeholder="请选择周期" >
                                        {
                                            this.zouqi.map((item,index)=>{
                                                return (
                                                    <Option value={item.id} onClick={
                                                        ()=>setFieldsValue({'cycle':item.id})
                                                    } key={index}>{item.name}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                    </div>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('date', {
                                rules: [{ required: true, message: '请选择取药日期' }],
                            })(
                                <div className="date_box">
                                    <h1>取药日期</h1>
                                    <div>
                                        <Select placeholder="请选择日期" >
                                            {
                                                this.dateAll&&this.dateAll.length>0?this.dateAll.map((item,index)=>{
                                                    {
                                                        return (
                                                            <Option value={item.id} key={index} onClick={
                                                                ()=>setFieldsValue({'date':item.id})
                                                            }>{item.name}</Option>
                                                        )
                                                    }
                                                }):null
                                            }                                                                                
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </Form.Item>
                    </Form>
                    <div onClick={()=>this.handleSubmit()} className="submit_btn" style={{pointerEvents:this.state.click}}>申请加入</div>
                </div>
            </div>
        )
    }
}
YSGC = Form.create()(YSGC);
export default YSGC