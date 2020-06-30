import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { message, Row, Col } from 'antd';
import Title from '../common/Title';
import TabBar from '../common/TabBar';
import pointImg from '../../states/images/point.png';
import './index.less';
import api from '../../api';

@mount('points')
class Points extends Component {

    @prop()
    patientId;

    @prop()
    pointCount;

    @prop()
    pointList;

    @prop()
    skip = 0;

    @prop()
    limit = 50;

    componentDidMount() {
        this.init();
    }

    @action()
    async init() {
        try {
            const pointCount = await api.get(`/patient/${this.patientId}/rewardpoints`);
            this.pointCount = pointCount;
            const pointList = await api.get(`/patient/${this.patientId}/rewardpoints/record`, { skip: this.skip, limit: this.limit });
            this.pointList = pointList;
            while (true) {
                if (pointList.length < this.limit) {
                    break;
                }
                this.skip = this.skip + this.limit;
                const list = await api.get(`/patient/${this.patientId}/rewardpoints/record`, { skip: this.skip, limit: this.limit });
                if(list.length === 0){
                    break;
                }
                this.pointList = [...this.pointList, ...list];
            }
        } catch (e) {
            message.error("获取积分信息失败。");
        }

    }


    render() {
        const pointList = this.pointList && this.pointList.length > 0 ? this.pointList.map(item => {
            return (
                <Row className="pointRow">
                    <Col span={20}>
                        <div className="pointRemark">
                            {item.rewardDetail}
                        </div>
                        <div className="pointDate">
                            {item.createDate}
                        </div>
                    </Col>
                    <Col span={4} className="point" style={item.points > 0 ? { color: '#C8161D' } : { color: '#44B82A' }}>
                        {item.points > 0 ? `+${item.points}` : item.points}
                    </Col>
                </Row>
            )
        }) : null
        return (
            <div style={{ height: '100%' }}>
                <Title>福利中心</Title>
                <div className="menu">
                    <TabBar {...this.props} />
                </div>
                <div className="pointTitle">
                    <div className="currentPoint" style={{ display: 'flex', paddingLeft: 'calc(50% - 75px)' }}>
                        <div>当前可用积分额度</div>
                        <div>
                            <img src={pointImg} style={{ height: '24px' }} />
                        </div>
                    </div>
                    <div className="currentPoint" style={{ paddingTop: '0px', textAlign: 'center', fontSize: '40px', width: '100%' }}>
                        {this.pointCount}
                    </div>
                </div>
                <div className="pointRecord">
                    <div className="pointTitle2">积分收支明细</div>
                    {pointList}
                </div>
            </div>
        );
    }
}

export default Points;
