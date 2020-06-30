import React, { Component } from 'react';
import {Row, Col, Form, Input, Button, message, Spin, Affix, Modal, Icon } from 'antd';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { InputItem, List, Picker, WhiteSpace, TextareaItem, Toast } from 'antd-mobile';
import moment from 'moment';
import querystring from 'query-string';
import Title from '../common/Title';
import api from '../../api';

import './index.less'

const stFre = [
    {
        name: '否',
        id: 0
    },
    {
        name: '是',
        id: 1
    },
]
const stSex = [
    {
        name: '男',
        id: 1
    },
    {
        name: '女',
        id: 0
    },
]

const stTime = [
    {
        name: '几乎从不',
        id: 1
    },
    {
        name: '偶尔',
        id: 2
    },
    {
        name: '经常',
        id: 3
    }
]
const smokeTime = [
    {
        name: '从未',
        id: 1
    },
    {
        name: '已戒烟',
        id: 2
    },
    {
        name: '吸烟',
        id: 3
    }
]


export default class HealthPhysical extends Component {
    constructor(props) {
        super(props);
        this.state = {
            diseaseList: null,
            selectedButton: [],
            visible: false,
            isShow: true,
            selectedCancer_1: [],
            selectedCancer_2: [],
            step: 1,
            loading: false,
        }
    }

    componentDidMount() {
        this.init();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search !== this.props.location.search) {
            this.ref.scrollIntoView();
            const qs = nextProps.location.search.slice(nextProps.location.search.indexOf('?') + 1);
            /* const qsPre = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1); */
            const queryData = querystring.parse(qs);
            if (queryData && queryData.step) {
                /* if(queryData.step == '2'){
                    this.init()
                    this.setState({
                        nodisease: undefined,
                        noCancer_1: [],
                        noCancer_2: [],
                        isSub: false,
                        user_height: '',
                        user_weight: '',
                        user_waistline: '',
                        smoke_day_amount: '',
                        smoke_year: '',
                        stop_smoke_year: '',
                        smoke_case: undefined,
                        ccd_case: undefined,
                        fruit_case: undefined,
                        tea_case: undefined,
                        sport_case: undefined,
                        liquor_case: undefined,
                        son_cancer_case:undefined,
                        fm_cancer_case:undefined,
                        new_sex: undefined,
                        new_age: '',
                        isAgeBlur: false,
                        isUserHeightBlur: false,
                        isUserWeightBlur: false,
                        isUserWaistlineBlur: false,
                        isSmokeDayAmountBlur: false,
                        isStopSmokeYearBlur: false,
                        isSmokeYearBlur: false,
                    })
                } */
                this.setState({ step: queryData.step });
            } else {
                this.setState({ step: '1' });
            }
        }
    }

    async init() {
        const diseases = await api.get('/diseases')
        const showdiseses = diseases && diseases.anamnesis && diseases.anamnesis.length && diseases.anamnesis.filter(i => i.isShow == 1) || [];
        const showcancer1 = diseases && diseases.cancer && diseases.cancer.length && diseases.cancer.filter(i => i.isShow == 1) || [];
        const showcancer2 = diseases && diseases.cancer && diseases.cancer.length && diseases.cancer.filter(i => i.isShow == 1) || [];
        let ast = [];
        const insuranceList = await api.get(`/insurances/config`, {type : "recommend"});
        if (insuranceList && insuranceList.length) {
            insuranceList.map(async (i) => {
                const count_i = await api.get('/getOrderCount',{packageId: i.insuranceId});
                ast.push(count_i)
            })
        }
        this.setState({
            insuranceList,
            diseaseList: diseases,
            selectedButton: showdiseses,
            selectedCancer_1: JSON.parse(JSON.stringify(showcancer1)),
            selectedCancer_2: JSON.parse(JSON.stringify(showcancer2)),
            countList: ast
        })
    }

    showModal(data) {
        this.setState({
            visible: true,
            showItem: data
        })
    }

    setVisible() {
        this.setState({
            visible: false,
        })
    }

    setData(key, value) {
        if (key == 'smoke_case' && value != this.state.smoke_case) {
            this.setState({
                smoke_year: '',
                smoke_day_amount: '',
                stop_smoke_year: '',
            })
        }
        this.setState({
            [key]: value,
        })
    }

    addDisease(data) {
        const { selectedButton } = this.state;
        const ishave = selectedButton.findIndex(i => i.title == data.title)
        if (data == 'nodisease') {
            selectedButton.map(i => i.isSelected = false);
        } else if (ishave >= 0) {
            selectedButton[ishave].isSelected = !selectedButton[ishave].isSelected
        } else {
            data.isSelected = true
            selectedButton.push(data)
        }
        this.setState({
            selectedButton,
            visible: false,
            nodisease: data == 'nodisease' ? true : false,
        })
    }

    addCancer_1(data) {
        const { selectedCancer_1 } = this.state;
        const ishave = selectedCancer_1.findIndex(i => i.title == data.title)
        if (data == 'noCancer_1') {
            selectedCancer_1.map(i => i.isSelected = false);
        } else if (ishave >= 0) {
            selectedCancer_1[ishave].isSelected = !selectedCancer_1[ishave].isSelected
        } else {
            data.isSelected = true
            selectedCancer_1.push(data)
        }
        this.setState({
            selectedCancer_1,
            visible: false,
            noCancer_1: data == 'noCancer_1' ? true : false,
        })
    }

    addCancer_2(data) {
        const { selectedCancer_2 } = this.state;
        const ishave = selectedCancer_2.findIndex(i => i.title == data.title)
        if (data == 'noCancer_2') {
            selectedCancer_2.map(i => i.isSelected = false);
        } else if (ishave >= 0) {
            selectedCancer_2[ishave].isSelected = !selectedCancer_2[ishave].isSelected
        } else {
            data.isSelected = true
            selectedCancer_2.push(data)
        }
        this.setState({
            selectedCancer_2,
            visible: false,
            noCancer_2: data == 'noCancer_2' ? true : false,
        })
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    saveNewDate(name, data) {
        if (isNaN(Number(data))) {
            if (name == 'user_height') {
                this.setState({
                    user_height: data.replace(/[^\d]/g, "")
                })
                return;
            } else if (name == 'user_weight') {
                this.setState({
                    user_weight: data.replace(/[^\d]/g, "")
                })
                return;
            } else if (name == 'user_waistline') {
                this.setState({
                    user_waistline: data.replace(/[^\d]/g, "")
                })
                return;
            } else if (name == 'smoke_year') {
                this.setState({
                    smoke_year: data.replace(/[^\d]/g, "")
                })
                return;
            } else if (name == 'smoke_day_amount') {
                this.setState({
                    smoke_day_amount: data.replace(/[^\d]/g, "")
                })
                return;
            } else if (name == 'stop_smoke_year') {
                this.setState({
                    stop_smoke_year: data.replace(/[^\d]/g, "")
                })
                return;
            } else if (name == 'new_age') {
                this.setState({
                    new_age: data.replace(/[^\d]/g, "")
                })
                return;
            }
        }
        if ((name == 'user_height' || name == 'user_weight' || name == 'user_waistline' || name == 'smoke_year' || name == 'stop_smoke_year' || name == 'new_age') && data.indexOf('.') >= 0) {
            if (name == 'user_height') {
                this.setState({
                    user_height: data.replace(/\.{1,}/g, "")
                })
            } else if (name == 'user_weight') {
                this.setState({
                    user_weight: data.replace(/\.{1,}/g, "")
                })
            } else if (name == 'user_waistline') {
                this.setState({
                    user_waistline: data.replace(/\.{1,}/g, "")
                })
            } else if (name == 'smoke_year') {
                this.setState({
                    smoke_year: data.replace(/\.{1,}/g, "")
                })
            } else if (name == 'stop_smoke_year') {
                this.setState({
                    stop_smoke_year: data.replace(/\.{1,}/g, "")
                })
            } else if (name == 'new_age') {
                this.setState({
                    new_age: data.replace(/\.{1,}/g, "")
                })
            }
        } else if (name == 'smoke_day_amount' && data.indexOf('.') >= 0) {
            const newnum = data.replace(/\.{2,}/g, "")
            const i1 = `${newnum}`.split('.')
            let i2 = 0;
            if (i1.length > 1) {
                i2 = i1[0] + '.' + (i1[1].length > 1 ? i1[1].substr(0, 1) : i1[1]);
            }
            this.setState({
                smoke_day_amount: i2
            })
        } else {
            this.setState({
                [name]: data,
            })
        }
    }

    choseService(insuranceId) {
        const {relation_ship} = this.state;
        this.props.history.push(`insurance/${insuranceId}?relation_ship=${relation_ship}`)
    }

    async submit(data) {
        const {
            user_height,
            user_weight,
            user_waistline,
            selectedButton,
            selectedCancer_1,
            selectedCancer_2,
            ccd_case,
            son_cancer_case,
            fm_cancer_case,
            fruit_case,
            smoke_case,
            smoke_year,
            smoke_day_amount,
            stop_smoke_year,
            tea_case,
            liquor_case,
            sport_case,
            patientInfo,
            patientId,
            serviceData,
            new_age,
            new_sex,
            nodisease,
            true_age,
            true_user_height,
            true_user_weight,
            true_user_waistline,
            true_smoke_day_amount,
            true_smoke_year,
            true_stop_smoke_year,
        } = this.state;
        const isdiseas = selectedButton.find(i => i.isSelected == true)
        const that = this;
        if (smoke_day_amount && smoke_day_amount.indexOf('.') > 0 && smoke_day_amount.indexOf('.') == smoke_day_amount.length - 1) {
            Modal.warn({
                title: `请完善您的输入内容`,
                okText: "确定",
                onOk: () => { },
            });
            return;
        }
        if (data === 1) {
            await this.setPromise({ isSub: true })
            if(new_sex === undefined){
                this.sex_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(new_age === undefined || !true_age){
                this.age_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(!user_height || !true_user_height){
                this.user_height_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(!user_weight || !true_user_weight){
                this.user_weight_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(user_waistline && !true_user_waistline){
                this.user_waistline_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(!selectedButton.length){
                this.self_diseases_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(!isdiseas && !nodisease){
                this.self_diseases_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(ccd_case === undefined){
                this.ccd_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(son_cancer_case === undefined){
                this.son_cancer_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(son_cancer_case === 1 && !selectedCancer_1.filter(i => i.isSelected).length){
                this.son_cancer_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(fm_cancer_case === undefined){
                this.fm_cancer_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(fm_cancer_case === 1 && !selectedCancer_2.filter(i => i.isSelected).length){
                this.fm_cancer_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if(liquor_case === undefined){
                this.liquor_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if (smoke_case !== undefined && smoke_case == 2 && (!smoke_year || !stop_smoke_year || !smoke_day_amount || !true_smoke_day_amount || !true_smoke_year || !true_stop_smoke_year)) {
                this.smoke_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if (smoke_case !== undefined && smoke_case == 3 && (!smoke_year || !smoke_day_amount || !true_smoke_day_amount || !true_smoke_year)) {
                this.smoke_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if (fruit_case === undefined){
                this.fruit_case_ref.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            await this.setPromise({ loading: true })
            const st = {
                "isSave": 0, //是否保存 0=否 1=是
                "age": new_age, // 年龄
                "gender": new_sex == 0 ? '女' : '男' , // 性别 0-女 1-男
                "height": user_height, //身高
                "weight": user_weight, //体重
                "waistline": user_waistline, //腰围
                "anamnesisList": selectedButton.length ? selectedButton.filter(i => i.isSelected) : [], // 疾病
                "immediateFamilyCcvd": ccd_case, //直系亲属（父母、子女）心脑血管病史 0=否 1=是
                "fdrsCancer": son_cancer_case, //一级亲属（父母、子女、兄弟姐妹）癌症史 0=否 1=是
                "fdrsCancerList": selectedCancer_1.length ? selectedCancer_1.filter(i => i.isSelected) : [], // 一级亲属癌症
                "secondDegreeRelativeCancer": fm_cancer_case, //二级亲属（爷爷奶奶、外公外婆、叔叔姑姑、舅舅姨妈）癌症史 0=否 1=是
                "secondDegreeRelativeCancerList": selectedCancer_2.length ? selectedCancer_2.filter(i => i.isSelected) : [], // 二级亲属癌症
                "drinking": liquor_case, //饮酒情况 1=几乎从不 2=偶尔 3=经常
                "smoking": smoke_case, //吸烟情况 1=从未 2=已戒烟 3=吸烟(含二手烟)
                "dailySmoking": smoke_day_amount, //每日吸烟量(支)
                "yearsSmoking": smoke_year, //吸烟年数(年)
                "quitSmokingYears": stop_smoke_year, //戒烟年数(年)
                "vegetablesFruits": fruit_case, //经常食用蔬菜/水果 1=几乎从不 2=偶尔 3=经常
                "hotFoodTea": tea_case, //经常食用烫食或烫茶 0=否 1=是
                "physicalExercise": sport_case, //中等强度以上体育锻炼 1=几乎从不 2=偶尔 3=经常
            }
            try {
                const data = await api.post(`/environmentAssessment`, st)
                st.releation_ship = this.state.relation_ship;
                window.localStorage.setItem('sub-data', JSON.stringify(st))
                /*
                    这里去请求获取服务包
                    然后去获取各自的领取人数
                 */
                await this.setPromise({ subData: data, loading: false })
                this.props.history.push('/healthPhysical?step=3')
            } catch (err) {
                console.log(err.message);
            }
        }
    }

    renderError(data) {
        return (
            <div className='error_sty'>{data}</div>
        )
    }

    renderList() {
        const { diseaseList, selectedButton, visible, showItem, selectedCancer_1, selectedCancer_2, noCancer_1, noCancer_2 } = this.state;
        return (
            <Modal
                visible={visible}
                onCancel={() => this.setVisible(false)}
                cancelText="关闭"
                className="registerModal"
                footer={null}
            >
                <div>
                    <div
                        ref={node => { this.container = node; }}
                        style={{ height: '450px', overflowY: 'scroll' }}
                        className="scrollable-container"
                    >
                        {!diseaseList ? null : showItem == 'disease' ? diseaseList && diseaseList.anamnesis && diseaseList.anamnesis.filter(i => !i.isShow).length && diseaseList.anamnesis.filter(i => !i.isShow).map((item, index) => {
                            const disease = (
                                <div key={index} className="diseaseItem" style={item.isSelected ? { color: '#C8161D' } : {}} onClick={() => this.addDisease(item)}>
                                    <span>{item.title}</span>
                                    {item.isSelected ? <Icon type="check-circle" style={{ float: 'right', paddingRight: '11px' }} /> : ''}
                                </div>
                            )
                            return disease;
                        }) : showItem == 'cancer_1' || showItem == 'cancer_2' ? diseaseList && diseaseList.cancer && diseaseList.cancer.map((item, index) => {
                            const nowlist = showItem == 'cancer_1' ? selectedCancer_1 : showItem == 'cancer_2' ? selectedCancer_2 : [];
                            const cancer_1 = (
                                <div key={index} className="diseaseItem" style={item.isSelected ? { color: '#C8161D' } : {}} onClick={() => this.addCancer_1(item)}>
                                    {item.title}
                                    {item.isSelected ? <Icon type="check-circle" style={{ float: 'right', paddingRight: '11px' }} /> : ''}
                                </div>
                            )
                            const cancer_2 = (
                                <div key={index} className="diseaseItem" style={item.isSelected ? { color: '#C8161D' } : {}} onClick={() => this.addCancer_2(item)}>
                                    {item.title}
                                    {item.isSelected ? <Icon type="check-circle" style={{ float: 'right', paddingRight: '11px' }} /> : ''}
                                </div>
                            )
                            if (showItem == 'cancer_1') {
                                return cancer_1;
                            } else {
                                return cancer_2;
                            }
                        }) : null}
                    </div>
                    <Affix target={() => this.container} onClick={() => this.setVisible(false)}>
                        <Button className="submitButton">确定</Button>
                    </Affix>
                </div>
            </Modal>
        )
    }

    renderTableTitle(data, id) {
        if(id == 1){
            return (
                <p className='table_title_sty' ref={ref => this.self_diseases_ref = ref}>{data}</p>
            )
        }else if(id == 2){
            return (
                <p className='table_title_sty' ref={ref => this.ccd_case_ref = ref}>{data}</p>
            )
        }else if(id == 3){
            return (
                <p className='table_title_sty' ref={ref => this.son_cancer_case_ref = ref}>{data}</p>
            )
        }else if(id == 4){
            return (
                <p className='table_title_sty' ref={ref => this.fm_cancer_case_ref = ref}>{data}</p>
            )
        }else if(id == 5){
            return (
                <p className='table_title_sty' ref={ref => this.liquor_case_ref = ref}>{data}</p>
            )
        }else if(id == 6){
            return (
                <p className='table_title_sty' ref={ref => this.smoke_case_ref = ref}>{data}</p>
            )
        }else{
            return (
                <p className='table_title_sty'>{data}</p>
            ) 
        }
    }

    renderLitileTableTitle(data) {
        return (
            <p className='table_litile_title_sty'>{data}</p>
        )
    }

    renderTableBox(item, list, select) {
        if (list.length) {
            return (
                <div className='tableBoxlist'>
                    {list.map((i) => {
                        return (
                            <span className={select == i.id ? "tableBoxItem_1" : 'tableBoxItem_2'} onClick={() => this.setData(item, i.id)}>
                                {i.name}
                            </span>
                        )
                    })}
                </div>
            )
        }
    }

    ChoseRelation(data) {
        this.setState({
            relation_ship: data
        })
    }

    gotoInput() {
        if (!this.state.relation_ship) {
            message.warn('请选择您与参评人的关系');
            return;
        }
        this.props.history.push('healthPhysical?step=2');
    }

    check_ipt(e, name, minVal, maxVal, blur_flag, num_flag) {
        const c_val = e.target.value;
        if(e.target.id === name && (c_val || Number(c_val) === 0) && (c_val - minVal < 0 || c_val - maxVal > 0)) {
            this.setState({
                [num_flag]: false,
                [blur_flag]: true,
            })
        }else if(e.target.id === name && (c_val || Number(c_val) === 0) && (c_val - minVal >= 0 && c_val - maxVal <= 0)) {
            this.setState({
                [num_flag]: true,
                [blur_flag]: true,
            })
        }
    }

    render() {
        const {
            isShow,
            nodisease,
            noCancer_1,
            noCancer_2,
            isSub,
            selectedButton,
            selectedCancer_1,
            selectedCancer_2,
            user_height,
            user_weight,
            user_waistline,
            smoke_day_amount,
            smoke_year,
            stop_smoke_year,
            smoke_case,
            patientInfo,
            ccd_case,
            fruit_case,
            tea_case,
            sport_case,
            liquor_case,
            subData,
            step,
            new_sex,
            new_age,
            relation_ship,
            loading,
            insuranceList,
            countList,
            isAgeBlur,
            isUserHeightBlur,
            isUserWeightBlur,
            isUserWaistlineBlur,
            isSmokeDayAmountBlur,
            isStopSmokeYearBlur,
            isSmokeYearBlur
        } = this.state;
        const isdiseas = selectedButton.find(i => i.isSelected == true)
        let is_smoke = false;
        if (smoke_case === undefined) {
            is_smoke = true;
        }
        let relName = '您';
        if (relation_ship == 1) {
            relName = '您'
        } else if (relation_ship == 3) {
            relName = '您的父母'
        } else if (relation_ship == 2) {
            relName = '您的配偶'
        }
        return (
            <div ref={ref => this.ref = ref} className='out_box'>
                <Title>大病风险测评</Title>
                {
                    step == '1' ? <div className='first_page'>
                        <p className='f_title'>非常感谢您参与本次评估问卷，本次评估是根据您的身体基本情况做出大病风险测评,请您据实填写。</p>
                        <div className='s_box'>
                            <p className='s_title'>请选择您与参评人的关系：</p>
                            <div className='s_list'>
                                <p className={relation_ship == 1 ? 's_list_item_selected' : 's_list_item'} onClick={() => this.ChoseRelation(1)}>您本人</p>
                                <p className={relation_ship == 3 ? 's_list_item_selected mgn_12' : 's_list_item mgn_12'} onClick={() => this.ChoseRelation(3)}>您的父母</p>
                                <p className={relation_ship == 2 ? 's_list_item_selected' : 's_list_item'} onClick={() => this.ChoseRelation(2)}>您的配偶</p>
                            </div>
                        </div>
                        <div className='ss_btn' onClick={() => this.gotoInput()}>开始评估</div>
                    </div> : null
                }
                {
                    step == '2' ? <Spin spinning={loading}><div className="medical_table_input">
                        <div style={{ padding: '16px 0 0' }} ref={ref => this.sex_ref = ref}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                                <div style={{ marginRight: 30, marginBottom: 10, minWidth: 32 }}>
                                    <span className="text_sty" >性别</span>
                                </div>
                                {this.renderTableBox('new_sex', stSex, this.state.new_sex)}
                            </div>
                            {isSub && this.state.new_sex === undefined ? this.renderError('请选择性别') : null}
                        </div>
                        <div style={{ borderBottom: '1px solid #eeeeee', padding: '16px 0' }} ref={ref => this.age_ref = ref}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                                <div style={{ marginRight: 30, minWidth: 32 }}>
                                    <span className="text_sty" >年龄</span>
                                </div>
                                <input type="text" placeholder="请填写年龄" style={{ border: 0, fontSize: 16, width: '70%' }} onChange={(e) => this.saveNewDate('new_age', e.target.value)} value={new_age} onBlur={(e) => this.check_ipt(e, 'new_age', 18, 100, 'isAgeBlur', 'true_age')} id='new_age' />
                                <span className="text_sty">岁</span>
                            </div>
                            {isSub && (this.state.new_age === undefined || this.state.new_age === '') ? this.renderError('请填写您的年龄') : null}
                            {isAgeBlur && this.state.new_age && !this.state.true_age ? this.renderError('评估范围仅限18-100，请重新输入') : null}
                        </div>
                        <div style={{ borderBottom: '1px solid #eeeeee', padding: '16px 0' }} ref={ref => this.user_height_ref = ref}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                                <div style={{ marginRight: 30, minWidth: 32 }}>
                                    <p className="text_sty" >身高</p>
                                </div>
                                <input type="text" placeholder="请填写身高" style={{ border: 0, fontSize: 16, width: '70%' }} onChange={(e) => this.saveNewDate('user_height', e.target.value)} value={user_height} onBlur={(e) => this.check_ipt(e, 'user_height', 60, 220, 'isUserHeightBlur', 'true_user_height')} id='user_height' />
                                <p className="text_sty" style={{ minWidth: 32 }}>厘米</p>
                            </div>
                            {isSub && (user_height === undefined || user_height === '') ? this.renderError('请填写身高') : null}
                            {isUserHeightBlur && user_height && !this.state.true_user_height ? this.renderError('评估范围仅限60-220，请重新输入') : null}
                        </div>
                        <div style={{ borderBottom: '1px solid #eeeeee', padding: '16px 0' }} ref={ref => this.user_weight_ref = ref}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                                <div style={{ marginRight: 30, minWidth: 32 }}>
                                    <span className="text_sty" >体重</span>
                                </div>
                                <input type="text" placeholder="请填写体重" style={{ border: 0, fontSize: 16, width: '70%' }} onChange={(e) => this.saveNewDate('user_weight', e.target.value)} value={this.state.user_weight} onBlur={(e) => this.check_ipt(e, 'user_weight', 10, 200, 'isUserWeightBlur', 'true_user_weight')} id='user_weight' />
                                <p className="text_sty" style={{ minWidth: 32 }}>公斤</p>
                            </div>
                            {isSub && (this.state.user_weight === undefined || this.state.user_weight === '') ? this.renderError('请填写体重') : null}
                            {isUserWeightBlur && this.state.user_weight && !this.state.true_user_weight ? this.renderError('评估范围仅限10-200，请重新输入') : null}
                        </div>
                        <div style={{ borderBottom: '1px solid #eeeeee', padding: '16px 0' }} ref={ref => this.user_waistline_ref = ref}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', maxWidth: '75%' }}>
                                    <div style={{ marginRight: 30, minWidth: 32 }}>
                                        <p className="text_sty" >腰围</p>
                                    </div>
                                    <input type="text" placeholder="请填写腰围" style={{ border: 0, fontSize: 16, flex: 1 }} onChange={(e) => this.saveNewDate('user_waistline', e.target.value)} value={this.state.user_waistline} onBlur={(e) => this.check_ipt(e, 'user_waistline', 50, 130, 'isUserWaistlineBlur', 'true_user_waistline')} id='user_waistline' />
                                </div>
                                <p className="text_sty" style={{ minWidth: 74 }}>厘米(选填)</p>
                            </div>
                            {isUserWaistlineBlur && this.state.user_waistline && !this.state.true_user_waistline ? this.renderError('评估范围仅限50-130，请重新输入') : null}
                        </div>
                        {this.renderTableTitle('是否患有下列疾病：', 1)}
                        <div className='tableBoxlist'>
                            {selectedButton && selectedButton.length ? selectedButton.map((i, index) => {
                                return (
                                    <span className={i.isSelected ? 'tableBoxItem_1' : "tableBoxItem_2"} key={index} onClick={() => this.addDisease(i)}>
                                        {i.title}
                                    </span>
                                )
                            }) : null}
                            <span className='tableBoxItem_2' onClick={() => this.showModal('disease')}>
                                其他疾病
                            </span>
                            <span className={nodisease ? 'tableBoxItem_1' : 'tableBoxItem_2'} onClick={() => this.addDisease('nodisease')}>
                                以上皆无
                            </span>
                        </div>
                        {isSub && (!isdiseas && !nodisease) ? this.renderError('请填写疾病') : null}
                        {this.renderTableTitle('父母、子女是否患过心脑血管病？', 2)}
                        {this.renderTableBox('ccd_case', stFre, this.state.ccd_case)}
                        {isSub && this.state.ccd_case === undefined ? this.renderError('请填写父母、子女是否患过心脑血管病') : null}
                        {this.renderTableTitle('父母、子女、兄弟姐妹是否患过癌症？', 3)}
                        {this.renderTableBox('son_cancer_case', stFre, this.state.son_cancer_case)}
                        {this.state.son_cancer_case ? this.renderLitileTableTitle('选择"是"，请确认是否为以下癌症（可多选，必填)') : null}
                        {this.state.son_cancer_case ? <div className='tableBoxlist'>
                            {selectedCancer_1 && selectedCancer_1.length ? selectedCancer_1.map((i, index) => {
                                return (
                                    <span className={i.isSelected ? 'tableBoxItem_1' : "tableBoxItem_2"} key={index} onClick={() => this.addCancer_1(i)}>
                                        {i.title}
                                    </span>
                                )
                            }) : null}
                        </div> : null}
                        {isSub && this.state.son_cancer_case === undefined ? this.renderError('请填写父母、子女、兄弟姐妹是否患过癌症') : null}
                        {isSub && (this.state.son_cancer_case === 1 && !selectedCancer_1.filter(i => i.isSelected).length) ? this.renderError('请填写父母、子女、兄弟姐妹患过何种癌症') : null}
                        {this.renderTableTitle('爷爷奶奶、外公外婆、叔叔姑姑、舅舅姨妈是否患过癌症？', 4)}
                        {this.renderTableBox('fm_cancer_case', stFre, this.state.fm_cancer_case)}
                        {this.state.fm_cancer_case ? this.renderLitileTableTitle('选择"是"，请确认是否为以下癌症（可多选，必填)') : null}
                        {this.state.fm_cancer_case ? <div className='tableBoxlist'>
                            {selectedCancer_2 && selectedCancer_2.length ? selectedCancer_2.map((i, index) => {
                                return (
                                    <span className={i.isSelected ? 'tableBoxItem_1' : "tableBoxItem_2"} key={index} onClick={() => this.addCancer_2(i)}>
                                        {i.title}
                                    </span>
                                )
                            }) : null}
                        </div> : null}
                        {isSub && this.state.fm_cancer_case === undefined ? this.renderError('请填写爷爷奶奶、外公外婆、叔叔姑姑、舅舅姨妈是否患过癌症') : null}
                        {isSub && (this.state.fm_cancer_case === 1 && !selectedCancer_2.filter(i => i.isSelected).length) ? this.renderError('请填写爷爷奶奶、外公外婆、叔叔姑姑、舅舅姨妈患过何种癌症') : null}
                        {this.renderTableTitle('饮酒情况：', 5)}
                        {this.renderTableBox('liquor_case', stTime, this.state.liquor_case)}
                        {isSub && this.state.liquor_case === undefined ? this.renderError('请填写饮酒情况') : null}
                        {this.renderTableTitle('吸烟情况：', 6)}
                        {this.renderTableBox('smoke_case', smokeTime, this.state.smoke_case)}
                        {this.state.smoke_case === 2 || this.state.smoke_case === 3 ? <div style={{ marginTop: 12 }}>
                            <div style={{ borderBottom: '1px solid #eeeeee', padding: '16px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <div style={{ marginRight: 30, minWidth: 80 }}>
                                        <span className="text_sty" >日均吸烟量</span>
                                    </div>
                                    <input type="text" placeholder="请填写日均吸烟量" style={{ border: 0, fontSize: 16, width: '60%' }} onChange={(e) => this.saveNewDate('smoke_day_amount', e.target.value)} value={this.state.smoke_day_amount} onBlur={(e) => this.check_ipt(e, 'smoke_day_amount', 0, 999, 'isSmokeDayAmountBlur', 'true_smoke_day_amount')} id='smoke_day_amount' />
                                    <p className="text_sty" >支</p>
                                </div>
                                {isSub && (smoke_day_amount === undefined || smoke_day_amount === '')? this.renderError('请填写日均吸烟量') : null}
                                {smoke_day_amount === '0' ? this.renderError('评估范围限大于0，请重新输入') : null}
                                {smoke_day_amount > 100 ? <div style={{ fontSize: 14, color: '#666666' }}>此吸烟量为日均值</div> : null}
                            </div>
                            <div style={{ borderBottom: '1px solid #eeeeee', padding: '16px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <div style={{ marginRight: 30, minWidth: 80 }}>
                                        <span className="text_sty" >吸烟年数</span>
                                    </div>
                                    <input type="text" placeholder="请填写吸烟年数" style={{ border: 0, fontSize: 16, width: '60%' }} onChange={(e) => this.saveNewDate('smoke_year', e.target.value)} value={this.state.smoke_year} onBlur={(e) => this.check_ipt(e, 'smoke_year', 0.5, new_age || 999, 'isSmokeYearBlur', 'true_smoke_year')} id='smoke_year' />
                                    <p className="text_sty" >年</p>
                                </div>
                                {isSub && (smoke_year === undefined || smoke_year === '') ? this.renderError('请填写吸烟年数') : null}
                                {smoke_year === '0' ? this.renderError('评估范围限大于0，请重新输入') : null}
                                {new_age && smoke_year && smoke_year - new_age > 0 ? this.renderError('吸烟年数超过实际年龄，请重新输入') : null}
                            </div>
                            {smoke_case === 2 ? <div style={{ alignItems: 'center', borderBottom: '1px solid #eeeeee', padding: '16px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                                    <div style={{ marginRight: 30, minWidth: 80 }}>
                                        <span className="text_sty" >戒烟年数</span>
                                    </div>
                                    <input type="text" placeholder="请填写戒烟年数" style={{ border: 0, fontSize: 16, width: '60%' }} onChange={(e) => this.saveNewDate('stop_smoke_year', e.target.value)} value={this.state.stop_smoke_year} onBlur={(e) => this.check_ipt(e, 'stop_smoke_year', 0, new_age || 999, 'isStopSmokeYearBlur', 'true_stop_smoke_year')} id='stop_smoke_year' />
                                    <p className="text_sty" >年</p>
                                </div>
                                {isSub && (stop_smoke_year === undefined || stop_smoke_year === '') ? this.renderError('请填写戒烟年数') : null}
                                {stop_smoke_year === '0' ? this.renderError('评估范围限大于0，请重新输入') : null}
                                {new_age && stop_smoke_year && (stop_smoke_year - new_age > 0 || (Number(stop_smoke_year) + Number(smoke_year) - new_age > 0))? this.renderError('戒烟年数超出合理值，请重新输入') : null}
                            </div> : null}
                        </div> : null}
                        {isSub && is_smoke ? this.renderError('请填写吸烟情况') : null}
                        {this.renderTableTitle('是否经常食用新鲜蔬菜/水果：')}
                        {this.renderTableBox('fruit_case', stTime, this.state.fruit_case)}
                        {isSub && (this.state.fruit_case !== 1 && this.state.fruit_case !== 2 && this.state.fruit_case !== 3) ? this.renderError('请填写是否经常食用新鲜蔬菜/水果') : null}
                        {this.renderTableTitle('是否喜欢食用烫食/烫茶？')}
                        {this.renderTableBox('tea_case', stFre, this.state.tea_case)}
                        {isSub && (this.state.tea_case !== 0 && this.state.tea_case !== 1) ? this.renderError('请填写是否喜欢食用烫食/烫茶') : null}
                        {this.renderTableTitle('是否经常参加中等强度以上的运动，如：持续20分钟以上的慢跑、快走、骑车、游泳、跳舞等：')}
                        {this.renderTableBox('sport_case', stTime, this.state.sport_case)}
                        {isSub && (this.state.sport_case !== 1 && this.state.sport_case !== 2 && this.state.sport_case !== 3) ? this.renderError('请填写是否经常参加中等强度以上的运动') : null}
                        {this.renderList()}
                        <div className='sub_btn' onClick={() => this.submit(1)}>提交</div>
                        <div style={{ height: 40 }} />
                    </div></Spin> : null}
                {
                    step == '3' ? <div className='health_res_page'>
                        <div className='box_1'>
                            <p className='box_1_text1'>根据测评信息，<span style={{ color: '#C8161D' }}>{relName}</span>的大病风险情况如下：</p>
                            <div className='box_1_text2' dangerouslySetInnerHTML={{ __html: subData && subData.detail || '暂无相关信息' }}/>
                        </div>
                        <p className='box_2'>建议为<span style={{ color: '#C8161D' }}>{relName}</span>选择有针对性的大病保障计划并关注日常慢性病管理。 万户健康会员计划为慢病管理和大病保障提供综合解决方案，“老有所保，儿女无忧”。</p>
                        <Row className='box_3'>
                            {insuranceList ? insuranceList.map((item, index) => {
                                return <Col span={12}>
                                    <div style={{ flex: 1, borderRadius: 6, marginRight: 11, marginBottom: 20 }}>
                                        <div className='box_3_1' onClick={() => this.choseService(item.insuranceId)}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <p className='text_1'>{item.price}<span style={{ fontSize: 16, fontWeight: 'normal', marginLeft: 5 }}>元</span></p>
                                                <div  className='text_2'>
                                                {item.title ? <p  >{item.title}</p> : null}
                                                {item.name ? <p>{item.name}</p> : null}
                                                </div>
                                                {item.insure ? item.insure.map(i =>  {
                                                    return <p className='text_3'>{i}</p>
                                                }) : null}
                                            </div>
                                            <span className='box3_btn'>领取</span>
                                        </div>
                                    </div>
                                </Col>
                            }) : null}
                        </Row>
                    </div> : null
                }
            </div>
        )
    }
}
