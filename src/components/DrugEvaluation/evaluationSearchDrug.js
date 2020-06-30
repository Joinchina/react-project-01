import React from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Button, Icon, Spin, message, Input } from 'antd';
import Title from '../common/Title';
import './search_drug.less';
import { centToYuan, refundRountCentPercentToCent } from '../../helper/money';
import api from '../../api';
import nopic from './images/noPic.png'
import querystring from 'query-string';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
});

@mount('newDrugSearch')
class NewDrugSearch extends React.Component {

    @prop()
    patientId

    @prop()
    disease

    constructor() {
        super();
        this.state = ({
            text: '',
            drugsList: [],
            isSearch: false,
            loading: false,
            hisList: [],
            nomore: false,
            issearching: false,
            patientInfo: null,
            weixinUser: null,
        })
    }

    @action()
    async componentDidMount() {
        this.inputRef.focus();
        const weixinUser = await api.get('/currentUser');
      /*   const patient = await api.get(`/currentPatient`);
        if(patient){
            this.patientId = patient.id;
        }
        if (this.patientId) {
            try{
                const patientInfo = await api.get(`/patient/${this.patientId}`);
                this.setState({ patientInfo });
            }catch(e){
                console.error(e.message)
            }
        } */
        try{
            const aUserInfo = await api.get(`/openInfo`);
            this.setState({ aUserInfo });
        }catch(e){
            console.error(e.message)
        }
        const that = this;
        const list = window.localStorage.getItem('histList') || "[]"
        const hisList = JSON.parse(list).slice(0, 5) || []
        this.setState({
            hisList: hisList,
            text: '',
            isSearch: this.disease && this.disease.id ? true : false,
            issearching: true,
            drugList: [],
            weixinUser,
        })
    }

    onKeyDown(e) {
        if (e.keyCode === 13) {
            this.searchDrug();
        }
    }

    inputChange(e) {
        this.setState({
            text: e.target.value
        })
    }

    clearInput() {
        this.setState({
            text: ''
        })
    }

    @action()
    async searchDrug() {
        const { text } = this.state;
        if (!text) {
            message.info('请输入药品名或疾病名');
            return;
        }
        try {
            const data = {
                skip: 0,
                limit: 10,
                search: text,
            }
            const drugsList = await api.get(`/getBaseDrug`, data);
            this.setState({
                drugsList,
                isSearch: true,
                nomore: drugsList.length === 10 ? false : true,
                loading: false,
                issearching: false,
            })
        } catch (e) {
            message.error(e.message)
        }
    }

    gotoDetail(data) {
        const stoageDrugs = window.localStorage.getItem('evaluationDrugs') || "[]";
        const item =JSON.parse(stoageDrugs);
        if(item && item.length){
            const ishave = item.find(i => i.baseDrugId == data.baseDrugId);
            if(ishave){
                message.warn('您已经添加过此药品');
                return;
            }
        }
        item.unshift(data)
        window.localStorage.setItem('evaluationDrugs', JSON.stringify(item))
        this.props.history.push(`/evaluationDrugInfo?select=${JSON.stringify(data)}`)
    }

    onScroll = e => {
        const { drugsList, loading, nomore } = this.state;
        const that = this;
        let scrollTop = document.body.scrollTop || window.scrollY;
        let clientHeight = document.body.clientHeight;
        let offsetHeight = document.body.scrollHeight;
        if (offsetHeight - clientHeight - scrollTop < 10 && !loading && drugsList.length > 9 && !nomore) {
            this.setState({
                loading: true,
            }, async () => {
                await new Promise(fulfill => setTimeout(fulfill, 1000)); /* debounce */
                that.getNextDrugList();
            })
        }
    }

    refDrugList = ele => {
        this.drugRef = ele;
        if (ele) {
            window.addEventListener('scroll', this.onScroll);
        } else {
            window.removeEventListener('scroll', this.onScroll);
        }
    }

    async getNextDrugList() {
        try {
            let data = {
                search: this.state.text,
                skip: this.state.drugsList.length || 0,
                limit: 10,
            }
            const result = await api.get('/getBaseDrug', data)
            if (result.length === 0) {
                message.info('没有更多药品')
                this.setState({
                    loading: false,
                    nomore: true,
                })
                return;
            }
            this.setState(prevStates => {
                return {
                    drugsList: [...prevStates.drugsList, ...result],
                    loading: false,
                }
            })
        } catch (e) {
            message.error(e.message);
            console.error('getMoreListError', e)
        }
    }

    renderSearchBtn() {
        return (
            <div className="newSearchDrugBox">
                <Input
                    type="search"
                    placeholder="搜索药品、疾病"
                    className="newDrugSearchInput"
                    ref={el => this.inputRef = el}
                    value={this.state.text}
                    onChange={(e) => this.inputChange(e)}
                    onKeyDown={(e) => this.onKeyDown(e)}
                    onFocus={() => this.setState({ isSearch: false })}
                    maxLength={20}
                />
                <i className="iconfont newSearchIconSty">&#xe623;</i>
                {this.state.text ? <div onClick={() => this.clearInput()} ><Icon type="close-circle" className="newCloseSty" /></div> : null}
                <Button
                    className="newSearchBtn"
                    onClick={() => this.searchDrug()}
                >
                    搜索
                </Button>
            </div>
        )
    }

    renderDrugList() {
        const { drugsList, issearching } = this.state;
        return (
            <div className="newDrugsListSty" ref={this.refDrugList}>
                {!issearching ? drugsList.length ? drugsList.map((i, index) => {
                    let name = '';
                    if (i.commonName && i.productName) {
                        name = `${i.commonName}(${i.productName})`
                    } else if (i.commonName && !i.productName) {
                        name = i.commonName;
                    } else if (!i.commonName && i.productName) {
                        name = i.productName
                    }
                    return (
                        <div
                            className="newDrugBox"
                            style={{ marginRight: index % 2 === 0 ? 11 : 0 }}
                            onClick={() => this.gotoDetail(i)}
                            key={index}
                        >
                            <div className="new-drug-list-imgbox">
                                <img src={i.outerPackagePicUrl || nopic} className="new-drug-list-img-sty" alt="" />
                            </div>
                            <div className="new-drug-list-liBox">
                                <div>
                                    <p className="new-drug-list-name-sty">{name}</p>
                                    <p style={{ marginBottom:0, lineHeight: 1.2, marginTop: 6, fontSize: 12, height: 14, overflow: 'hidden' }}>{`${i.preparationUnit}*${i.packageSize}${i.minimumUnit}/${i.packageUnit}`}</p>
                                    <p style={{ color: '#666666', fontSize: 14, marginTop: 5 }}>{i.producerName}</p>
                                </div>
                            </div>
                        </div>
                    )
                }) : <div className="newNoDrugsList">
                        <div className="new-no-drug-imgbox">
                            <MyIcon type="iconzhanweifu_wuciyaopin" style={{ fontSize: '120px', marginBottom: '9px' }} />
                            <p className="noSearchListText">对不起，没有找到相关的药品</p>
                        </div>
                    </div> : null}
                {this.state.loading && (
                    <div className="newDrugListSpin">
                        <Spin />
                    </div>
                )}
            </div>
        )
    }

    render() {
        const { isSearch, drugsList } = this.state;
        return (
            <div className="new-drug-search">
                <Title>找药</Title>
                {this.renderSearchBtn()}
                {isSearch ? this.renderDrugList() : null}
            </div>
        )
    }
}

export default NewDrugSearch;
