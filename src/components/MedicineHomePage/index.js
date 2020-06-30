import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Icon, message, Spin, Badge } from 'antd';
import { Modal, List } from 'antd-mobile';
import Title from '../common/Title';
import TabBar from '../common/TabBar';
import Comlon from '../common/Comlon';
import api from '../../api';
import noPic from './noPic.png';
import './index.less'
import xqd from '../../states/images/xqd.png';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_ymh0fjwcfup.js',
});

const aty = [
    { name: '高血压', id: 1, pic: 'icontubiao_gaoxieya' },
    { name: '糖尿病', id: 2, pic: 'icontubiao_xieyaji' },
    { name: '高血脂', id: 3, pic: 'icontubiao_gaozhixie' },
    { name: '慢性肝炎', id: 4, pic: 'icontubiao_manxingganyan' },
    { name: '冠心病', id: 5, pic: 'icontubiao_guanxinbing' },
    { name: '脑血管病', id: 6, pic: 'icontubiao_xinnaoxieguan' },
    { name: '消化道溃疡', id: 7, pic: 'icontubiao_xiaohuadaokuiyang' },
    { name: '慢性肾病', id: 8, pic: 'icontubiao_manxingshenbing' },
    { name: '前列腺炎', id: 9, pic: 'icontubiao_qianliexianyan' },
    { name: '骨质疏松', id: 10, pic: 'icontubiao_guzhishusong' },
    { name: '神经系统疾病', id: 11, pic: 'icontubiao_shenjingxitongjibing' },
    { name: '慢性肺炎', id: 12, pic: 'icontubiao_manxingfeiyan' },
    { name: '痛风', id: 13, pic: 'icontubiao_tongfeng' },
    { name: '类风湿', id: 14, pic: 'icontubiao_leifengshi' },
]

@mount('medicineHomePage')
class MedicineHomePage extends Component {

    @prop()
    patientId

    @prop()
    patientInfo

    constructor(props) {
        super(props)
        this.state = {
            init: false,
            modal2: false,
            loading: true,
        }
    }

    @action()
    async componentDidMount() {
        window.sessionStorage.setItem('page', '1')
        const storageCity = window.localStorage.getItem('city')
        try {
            const patientInfo = await api.get(`/currentPatient`);
            this.patientId = patientInfo ? patientInfo.id : null;
            const result = await api.get('/openInfo');
            let demandList = [] // 续订清单
            let demandArray = []; //需求单
            if (this.patientId) {
                demandList = await api.get(`/queryOrderCommonList`, { patientId: this.patientId });
                demandArray = await api.get(`/queryDemandList`, { patientId: this.patientId });
            }
            await new Promise((fulfill, reject) => {
                this.setState({
                    cityList: result,
                    choiceCity: storageCity ? JSON.parse(storageCity) : null,
                    init: true,
                    demandList,
                    demandArray,
                    loading: false,
                }, fulfill)
            })
        } catch (e) {
            this.setState({ loading: false })
            message.error(e.message)
        }
    }

    gotoSearchPage() {
        this.props.history.push('/newDrugSearch');
    }

    gotoDrugList(index) {
        this.props.history.push(`/newDrugSearch?id=${index}`);
    }

    setCity(item) {
        window.localStorage.setItem('city', JSON.stringify(item))
        this.setState({
            choiceCity: item,
            modal2: false,
        })
    }

    showModal = key => async (e) => {
        let isPatient = false;
        try {
            const result = await api.get(`/checkPatient`)
            if (result) {
                isPatient = true;
            }
        } catch (e) {
        }
        if (isPatient) return;
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            [key]: true,
        });
    }

    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    gotoCommonList() {
        window.location.href = "/orderCommonList?page=1"
    }

    gotoRequireList() {
        this.props.history.push('/requirementList')
    }

    renderCommonList() {
        const { demandList } = this.state;
        return (
            <div
                style={{ paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E8E8E8', borderBottomStyle: 'solid', marginBottom: 24, paddingLeft: 16, paddingRight: 16 }}
                onClick={() => this.gotoCommonList()}
            >
                <p style={{ color: '#333333', fontSize: 18, marginBottom: 16, marginTop: 16, fontWeight: 'bold' }}>续订</p>
                <Spin style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', overflow: 'auto' }} spinning={this.state.loading}>
                    {demandList ? demandList.length ? demandList.map((i, index) => {
                        return (
                            <div style={{ width: 88, height: 88, backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 10, padding: 6, borderRadius: 6 }} key={index}>
                                <img src={i.outerPackagePicUrl || noPic} style={{ width: 70 }} />
                            </div>
                        )
                    }) : <p style={{ fontSize: 16, marginBottom: 0, color: '#F48E18', width: '100%', textAlign: 'center', lineHeight: 1 }}><i className="iconfont" style={{ fontSize: 18, color: '#F48E18', marginRight: 8 }}>&#xe64a;</i>没有您最近的用药数据</p> : <p style={{ fontSize: 16, marginBottom: 0, color: '#F48E18', width: '100%', textAlign: 'center', lineHeight: 1 }}><i className="iconfont" style={{ fontSize: 18, color: '#F48E18', marginRight: 8 }}>&#xe64a;</i>没有您最近的用药数据</p>}
                </Spin>
            </div>
        )
    }

    renderCitySearch() {
        const { cityList } = this.state;
        const data = {
            title: '城市选择',
            description: '以下城市已开通PBM服务，请正确选择您所在的城市',
            list: cityList || [],
            supplementary: '其他城市陆续开通中...'
        }
        return (
            <Modal
                popup
                visible={this.state.modal2}
                onClose={this.onClose('modal2')}
                animationType="slide-up"
                className="newChoiceCityBox"
            >
                <List renderHeader={() => <div>城市选择</div>} className="popup-list">
                    <p className="cityDescrition">{data.description}</p>
                    <div style={{ maxHeight: 240, overflow: 'auto' }}>
                        {data.list && data.list.length ? data.list.map((i, index) => (
                            <List.Item key={index} onClick={() => this.setCity(i)}>{i.cityName}</List.Item>
                        )) : null}
                    </div>
                    <p className="citySupplementary">{data.supplementary}</p>
                </List>
            </Modal>
        )
    }

    renderSearchBtn() {
        return (
            <div className="newSearchDrugBox" id="dbnc">
                <input
                    placeholder="搜索药品名、疾病"
                    className="newDrugSearchInput"
                    ref={this.refInput}
                    type="text"
                    onFocus={() => this.gotoSearchPage()}
                />
                <i className="iconfont newSearchIconSty">&#xe623;</i>
            </div>
        )
    }

    renderDiseasesList() {
        return (
            <div id='drglist' className='newSearchList'>
                <p style={{ color: '#333333', fontSize: 18, marginBottom: 6, marginTop: 30, marginLeft: 16, fontWeight: 'bold' }}>按病索药</p>
                <div className='drglistBox'>
                    {aty.map((i, index) => {
                        return (
                            <div
                                style={{
                                    width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 14, paddingBottom: 14,
                                }}
                                onClick={() => this.gotoDrugList(i.name)}
                                key={index}
                            >
                                <MyIcon type={i.pic} style={{ fontSize: '40px', marginBottom: 9 }} />
                                <p style={{ marginBottom: 0, textAlign: 'center', color: '#222222', fontSize: 14, lineHeight: '16px' }}>{i.name}</p>
                            </div>
                        )
                    })}
                </div>
                {/*<div onClick={this.showModal('modal2')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'fixed', bottom: 49, width: '100%', height: "56px", backgroundColor: '#f7f7f7' }}>
                    <MyIcon type="icontubiao_peisongdizhi" style={{ fontSize: '21px' }} />
                    <span style={{ color: '#666666', fontSize: 16 }}>当前城市：{this.patientInfo ? this.patientInfo.hospital.cityName : choiceCity ? choiceCity.cityName : ''}</span>
                </div>*/}
            </div>
        )
    }

    render() {
        const { demandArray } = this.state;
        return (
            <div className="hasMenu medHome" style={{ width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                <Title>找药</Title>
                <Comlon {...this.props} />
                {this.renderCommonList()}
                {this.renderSearchBtn()}
                {this.renderDiseasesList()}
                <div className="menu" id="menu">
                    <div style={{ position: 'absolute', bottom: 66, right: 16 }}>
                        <Badge count={demandArray ? demandArray.length : 0}>
                            <img src={xqd} style={{ width: 48, }} onClick={() => this.gotoRequireList()} />
                        </Badge>
                    </div>
                    <TabBar {...this.props} />

                </div>
            </div>
        );
    }

}
export default MedicineHomePage;
