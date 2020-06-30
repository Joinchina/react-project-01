import React, { Component } from 'react';
import { Drawer, Icon, Row, Col } from 'antd';
import './index.less'

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1311458_tku1v1sg9vl.js',
});

class PointsListDrawer extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        const { onFlowBoxClose, flowListVisible, onClose, pointList } = this.props;
        const pointList_list = pointList && pointList.length > 0 ? pointList.map((item, index) => {
            return (
                <Row className="pointRow" key={index}>
                    <Col span={19}>
                        <div className="pointRemark">
                            {item.rewardDetail}
                        </div>
                        <div className="pointDate">
                            {item.createDate}
                        </div>
                    </Col>
                    <Col span={5} className="point" style={item.points > 0 ? { color: '#C8161D' } : { color: '#44B82A' }}>
                        {item.points > 0 ? `+${item.points}` : item.points}
                    </Col>
                </Row>
            )
        }) : null
        return (
            <Drawer
                title=""
                placement="bottom"
                closable={false}
                onClose={() => onFlowBoxClose()}
                visible={flowListVisible}
                className="checkViewBox"
                height={480}
            >
                <div className="addressList orderFlow">
                    <div>
                        <div className="title mainFont">积分明细</div>
                        <Icon type="close-circle" onClick={() => onClose()} className="closeBtn" />
                    </div>
                    {pointList_list ? pointList_list : <div
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        <MyIcon type="iconzhanweifu_wuxinxi" style={{ fontSize: '80px', color: '#D6A642' }} />
                        <div>暂无记录</div>
                    </div>}
                </div>
            </Drawer>
        )
    }
}

export default PointsListDrawer
