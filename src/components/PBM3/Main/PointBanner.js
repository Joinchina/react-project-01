import React, { Component } from 'react';
import api from '../../../api';
import PointsListDrawer from '../../NewHealthHomePage/points_list' ;
import hyr from '../../../states/images/hyr.png'


export default class PointBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flowListVisible: false,
            pointList: [],
            pointCount: 0,
            skip: 0,
            limit: 10,
        }
    }

    async componentDidMount() {
        const patient_id = (this.props.patientInfo || {}).id;
        if (patient_id) {
            const pointCount = await api.get(`/patient/${patient_id}/rewardpoints`);
            const pointList = await api.get(`/patient/${patient_id}/rewardpoints/record`, { skip: this.state.skip, limit: this.state.limit });
            this.setState({ pointCount, pointList });
            while (true) {
                if (pointList.length < this.limit) {
                    break;
                }
                this.setState({ skip: this.state.skip + this.state.limit });
                const list = await api.get(`/patient/${patient_id}/rewardpoints/record`, { skip: this.state.skip, limit: this.state.limit });
                if (list.length < this.limit) {
                    break;
                }
                this.setState({  pointList: [...this.state.pointList, ...list] });
            }
        } else {

        }
    }
    showList() {
        console.log(this.props);
        if (!this.props.patientInfo) {
            window.location.href = `/user/bind?r=${encodeURIComponent(`/newHealthHomePage`)}`
            return;
        }
        this.setState({
            flowListVisible: true
        })
    }

    onFlowBoxClose() {
        this.setState({ flowListVisible: false });
    }

    onClose() {
        this.setState({ flowListVisible: false });
    }


    render() {
        return <div>
            <div className="pointDetail" >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={hyr} style={{ marginRight: 16, maxWidth: 79, maxHeight: 63 }} />
                    <p style={{ fontSize: 30, color: '#333333', fontFamily: 'DIN', fontWeight: 'bold' }}>
                        {this.state.pointCount}
                        <span style={{ fontSize: 14 }}>分</span>
                    </p>
                </div>
                <div
                    style={{ width: 72, height: 28, borderWidth: 1, borderColor: '#418DC7', borderRadius: 14, color: '#418DC7', borderStyle: 'solid', textAlign: 'center', lineHeight: '26px' }}
                    onClick={() => this.showList()}
                >
                    积分明细
                </div>
            </div>
            <PointsListDrawer
                flowListVisible={this.state.flowListVisible}
                onFlowBoxClose={this.onFlowBoxClose.bind(this)}
                onClose={this.onClose.bind(this)}
                pointList={this.state.pointList}
            />
        </div>
    }
}
