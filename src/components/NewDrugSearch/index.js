import React from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Button, Icon, Spin, message, Input } from 'antd';
import Title from '../common/Title';
import './index.less';
import { centToYuan, refundRountCentPercentToCent } from '../../helper/money';
import api from '../../api';
import nopic from './noPic.png'
import querystring from 'query-string';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_t9xe5ukxbi.js',
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
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        if(queryData){
            this.disease = queryData;
        }
        if (!this.disease.id) {
            this.inputRef.focus();
        }
        const weixinUser = await api.get('/currentUser');
        const patient = await api.get(`/currentPatient`);
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
        }
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
            text: this.disease && this.disease.id ? this.disease.id : '',
            isSearch: this.disease && this.disease.id ? true : false,
            issearching: true,
            drugList: [],
            weixinUser,
        }, () => {
            if (this.state.text) {
                this.searchDrug()
            }
        })
        // this.inputRef.focus();
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
        const { text, hisList, aUserInfo } = this.state;
        if (!text) {
            message.info('请输入关键词');
            return;
        }
        this.props.history.push(`/newDrugSearch?id=${text}`)
        if ((hisList.length && hisList.indexOf(text) < 0) || hisList.length === 0) {
            window.localStorage.setItem('histList', JSON.stringify([text, ...hisList]))
            this.setState({
                hisList: [text, ...hisList].splice(0, 5),
            })
        } else {
            const i = hisList.indexOf(text);
            hisList.splice(i, 1);
            hisList.unshift(text)
            window.localStorage.setItem('histList', JSON.stringify(hisList))
            this.setState({
                hisList: hisList.splice(0, 5),
            })
        }
        try {
            let data = {};
            if (this.patientId) {
                const { patientInfo } = this.state;
                data = {
                    patientId: this.patientId,
                    hospitalId: patientInfo.hospital.id,
                    skip: 0,
                    limit: 10,
                    search: text,
                }
            } else {
                const ishave = this.state.aUserInfo && this.state.aUserInfo.find((i) => i.cityId == this.state.weixinUser.address.cityId)
                const bjId = this.state.aUserInfo && this.state.aUserInfo.find((i) => i.cityId == '110100')
                data = {
                    hospitalId: ishave ? ishave.hospitalId : bjId.hospitalId,
                    skip: 0,
                    limit: 10,
                    search: text,
                }
            }
            const drugsList = await api.get(`/drugsList`, data);
            this.setState({
                drugsList,
                isSearch: true,
                nomore: drugsList.length === 10 ? false : true,
                loading: false,
                issearching: false,
            })
        } catch (e) {
            console.error('getDrugList error ', e);
            message.error(e.message)
        }
    }

    clearOrder() {
        window.localStorage.setItem('histList', '')
        this.setState({
            hisList: [],
        })
    }

    choseHis(data) {
        this.setState({
            text: data,
        }, () => {
            this.searchDrug()
        })
    }

    gotoDetail(data) {
        const { patientInfo, aUserInfo } = this.state;
        this.setState({
            text: ''
        })
        const ishave = aUserInfo.find((i) => i.cityId == this.state.weixinUser.address.cityId)
        const bjId = aUserInfo.find((i) => i.cityId == '110100')
        const hosId = ishave ? ishave.hospitalId : bjId.hospitalId
        if (data.drugId) {
            window.location = `/newDrugDetail?id=${data.drugId}&page=1&hospitalId=${patientInfo ? patientInfo.hospital.id : hosId}`
        } else {
            window.location = `/newDrugDetail?id=${data.baseDrugId}&page=2&hospitalId=${patientInfo ? patientInfo.hospital.id : hosId}`
        }
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
        const { choiceCity,patientInfo, aUserInfo } = this.state;
        try {
            let data = {};
            if (this.patientId) {
                data = {
                    patientId: this.patientId,
                    search: this.state.text,
                    skip: this.state.drugsList.length || 0,
                    limit: 10,
                    hospitalId: patientInfo.hospital.id,
                }
            } else {
                const ishave = aUserInfo.find((i) => i.cityId == this.state.weixinUser.address.cityId)
                const bjId = aUserInfo.find((i) => i.cityId == '110100')
                const hosId = ishave ? ishave.hospitalId : bjId.hospitalId
                data = {
                    search: this.state.text,
                    skip: this.state.drugsList.length || 0,
                    limit: 10,
                    hospitalId: hosId,
                }
            }
            const result = await api.get('/drugsList', data)
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
                    /* autoFocus={this.disease && this.disease.id ? false : true} */
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

    renderSearchHistory() {
        const { hisList } = this.state;
        return (
            <div className="hisBox">
                <div className="hisTextBox-1">
                    <span className="hisText">搜索记录</span>
                    <i
                        className="histDelete"
                        onClick={() => { this.clearOrder() }}
                    >
                        &#xe628;
                    </i>
                </div>
                <div className="hisTextBox-2">
                    {
                        hisList && hisList.length ? hisList.map((i, index) => {
                            return (
                                <p className="hisSearchText" onClick={() => this.choseHis(i)} key={index}>{i}</p>
                            )
                        }) : null
                    }
                </div>
            </div>
        )
    }

    renderDrugList() {
        const { drugsList, issearching } = this.state;
        return (
            <div className="newDrugsListSty" ref={this.refDrugList}>
                <div><span style={{ color: '#C8161D', fontSize: 14, borderWidth: 1, borderColor: '#C8161D', borderStyle: 'solid',paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1, borderRadius: 2, marginRight: 2, lineHeight: 1}}>积分</span><span style={{ color: '#666666', fontSize: 14}}>表示药品销售提供会员积分,可用于积分商城或福利商品兑换。</span></div>
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
                                {/* <div className="new-drug-list-labelsBox">{i.label && i.label.length ? i.label.map((j) => <p className="new-drug-list-label-sty">{j}</p>) : null}</div> */}
                                <div>
                                    <p className="new-drug-list-name-sty">{name}</p>
                                    <p style={{ marginBottom:0, lineHeight: 1.2, marginTop: 6, fontSize: 12, height: 14, overflow: 'hidden' }}>{`${i.preparationUnit}*${i.packageSize}${i.minimumUnit}/${i.packageUnit}`}</p>
                                </div>
                                {i.drugId ? <div className="new-drug-list-price-sty" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseLine'}}>
                                    <span>{`￥${centToYuan(i.priceCent, 2)}`}</span>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                        <span style={{ color: '#C8161D', fontSize: 10, paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1, borderWidth: 1, borderColor: '#C8161D', borderStyle: 'solid', borderRadius: 5, lineHeight: 1, }}>积分</span><span style={{ fontSize: 10, color: '#222222', marginLeft: 3 }}>{Math.ceil((i.priceCent * i.whScale)/100)}</span></div>
                                    </div> : <p className="new-drug-list-price-sty-1">暂无供应</p>}
                            </div>
                        </div>
                    )
                }) : <div className="newNoDrugsList">
                        <div className="new-no-drug-imgbox">
                            <MyIcon type="iconzhanweifu_wuciyaopin" style={{ fontSize: '120px', marginBottom: '9px' }} />
                            <p className="noSearchListText">您暂无药品信息，请点击“添加药品”</p>
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
                {isSearch ? null : this.renderSearchHistory()}
                {isSearch ? this.renderDrugList() : null}
            </div>
        )
    }
}

export default NewDrugSearch;
