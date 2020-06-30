import React, { Component } from 'react';
import {
    Flex,
} from 'antd-mobile';
import './index.less'
import propTypes from 'prop-types';
import ClauseModal from '../ClauseModal';
import api from '../../../api';
import { Toast, Modal as MobileModal, WhiteSpace, } from 'antd-mobile';
class AddDisease extends Component {
    static propTypes = {
        patientDisease: propTypes.arrayOf(propTypes.string).isRequired,
        callbackParent: propTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            diseaseList: null,
            clauseModal: false,
            clauseData:{},
        };
    }
    async componentDidMount() {
        const diseaseList = this.props.diseaseList;
        this.setState({ diseaseList });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.diseaseList !== nextProps.diseaseList && nextProps.diseaseList) {
            this.setState({ diseaseList: nextProps.diseaseList });
        }
    }

    handleClose = (removedDisease, isSelected) => {
        let { patientDisease } = this.props;
        const { callbackParent, diseaseList } = this.props;
        const diseaseNone = diseaseList.find(item => item.value === 'NONE');
        if (isSelected) {
            patientDisease = patientDisease.filter(tag => tag !== removedDisease.name);
        } else {
            patientDisease = [...patientDisease, removedDisease.name];
        }
        if (!isSelected && removedDisease.value === 'NONE') {
            patientDisease = [diseaseNone.name]
        }
        if (!isSelected && removedDisease.value !== 'NONE') {
            patientDisease = patientDisease.filter(item => item !== diseaseNone.name);
        }
        callbackParent(patientDisease);
    }

    handleChange = (value) => {
        let { patientDisease } = this.props;
        if (value && patientDisease.indexOf(value) === -1) {
            patientDisease = [...patientDisease, value];
        }
        const { callbackParent } = this.props;
        callbackParent(patientDisease);
    }

    async openPdfPage(item) {
        let id=0;
         if(window.location.href.indexOf('wuhu')>=0){
            //线上
            id=394
        }else{
            //测试
            id=503
        }
        const articleInfo = await api.get('/getArticleDetail', { articleId: id});
        if(articleInfo){
            this.setState({
                clauseModal:true,
                clauseData:articleInfo
            })
        }else{
            Toast.fail('未发现', 5);
        }
        // this.props.history.push(`/anxinInsurance_notice?filePath=${encodeURIComponent('')}&fileName=${encodeURIComponent('特殊职业种类表')}`)
    }
    closeModal(val){
        this.setState({
            clauseModal:val,
            clauseData:{}
        })
    }
    render() {
        const { diseaseList } = this.state;
        const { patientDisease } = this.props;
        return (
            <div>
                <ClauseModal visible={this.state.clauseModal} data={this.state.clauseData}
                closeModal={(val)=>this.closeModal(val)}/>
                <Flex wrap="wrap" >
                    {!diseaseList ? null : diseaseList.map((item, index) => {
                        const tag = patientDisease
                            ? patientDisease.filter(tag => item.name === tag) : null;

                        const isSelected = tag.length > 0 ? 'buttonStyle' : 'unSelectedButton';
                        if(item.name == "（全职或兼职）从事高风险职业（见特殊职业种类表）"){
                            const tagElem = (
                                <div style={{ marginBottom: 10 }}>
                                    <div
                                        className={isSelected}
                                        key={item.name}
                                        onClick={() => this.handleClose(item, tag.length > 0)}
                                    >
                                        {item.name}
                                    </div>
                                    <p style={{ color: '#666666' }}>点此查看<a onClick={() => this.openPdfPage()}>《特殊职业种类表》</a></p>
                                </div>
                            );
                            return tagElem;
                        }else{
                            const tagElem = (
                                <div
                                    className={isSelected}
                                    key={item.name}
                                    onClick={() => this.handleClose(item, tag.length > 0)}
                                >
                                    {item.name}
                                </div>
                            );
                            return tagElem;
                        }
                    })}
                </Flex>
            </div>
        );
    }
}

export default AddDisease;
