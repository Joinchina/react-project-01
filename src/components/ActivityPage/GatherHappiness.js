import React, { Component } from "react";
import Title from '../common/Title';
import mount, { prop } from '@wanhu/react-redux-mount';
import api from '../../api';

/**
 * 集福气主页面
 */
@mount('gatherHappiness')
class GatherHappiness extends Component {
    @prop()
    weixinUser;

    constructor(props) {
        super(props);
        this.state = {
            patient: null,
        }
    }

    async componentDidMount() {
        const patient = await api.get('/currentPatient');
        if(patient){
            this.setState({patient});
        }
    }


    render() {
        const {
            patient ,
        } = this.state;
        console.log(patient);
        return (
            <div>
                <Title>集福气分福金</Title>
                <div style={{ width: 40, height: 40, borderRadius: 20, borderColor: '#fff', borderStyle: 'solid', borderWidth: 2, overflow: 'hidden' }}>
                    <img src={this.weixinUser ? this.weixinUser.headimgurl : ''} style={{ width: 40, height: 40 }} />
                </div>
            </div>
        );
    }
}

export default GatherHappiness;
