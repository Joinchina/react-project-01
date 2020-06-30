import React, { Component } from 'react';
import { Icon, Col, Row } from 'antd'
import { List } from 'antd-mobile'
import api from '../../../api';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_h5q9fl0n33p.js',
});
export default class DaySelected extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drugData: null,
            hospitalId: null

        }
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.hospital !== this.props.hospital) {
            try {
                const drugData = await api.get(`/wcm/todayOptimization`, { hospitalId: nextProps.hospital.id });
                this.setState({ drugData, hospitalId: nextProps.hospital.id })
            } catch (error) {

            }
        }
    }
    gotoDetail(data) {
        window.location.href = `/newDrugDetail?id=${data.drugId}&page=1&hospitalId=${this.state.hospitalId}`
    }

    toMedicineHomePage() {
        this.props.history.push('/medicineHomePage');
    }

    renderDrugs(hypertension) {
        return hypertension.map((item, index) => {
            const itemIndex = (index + 1) % 3;
            return <Col span={8} style={{width: '33%'}} >
                <div className="classItem" onClick={() => this.gotoDetail(item)}
                    style={itemIndex === 1 ? { marginLeft: '0px', marginRight: '5px' } : itemIndex === 2 ? {
                        marginLeft: '2.5px', marginRight: '2.5px'
                    } : { marginLeft: '5px', marginRight: '0px' }}>
                    <div className="imgBox">
                        < div
                            className="_tempImg"
                            style={{
                                background: `url(${item.outerPackagePicUrl})  no-repeat`,
                                backgroundSize: 'cover',
                                width: '100%',
                                paddingTop: '100%'
                            }}
                        >
                        </div>
                    </div>
                    <div className="classTitle"
                        style={{
                            wordBreak: 'break-all',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            webkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                        {item.productName}{item.commonName ? `（${item.commonName}）` : ''}
                    </div>
                    <div className="classPrice">
                        <span>¥</span>
                        {(item.priceCent / 100).toFixed(2)}
                    </div>
                    <span className="classPoint">
                        <MyIcon type="icon_jifen" style={{ fontSize: '17px', color: '#D6A642' }} />
                        <span> {Math.ceil((item.priceCent * item.whScale) / 100)}</span>
                    </span>
                </div >
            </Col >
        });
    }

    render() {
        const { drugData } = this.state;
        let drugItem;
        if (!drugData || (!drugData.hypertension && !drugData.diabetes)) {
            drugItem = <div>
                暂无相关优选，努力增加中
            </div>
        } else {
            drugItem = <div>
                <Row className="classList" style={{ display: 'table-cell', width: 'calc(100vw - 32px)' }}>
                    {this.renderDrugs([...(drugData.hypertension || []), ...(drugData.diabetes || [])])}
                </Row>
            </div>
        }
        return <div className="daySelected">
            <div className="hTitle">
                <List.Item arrow="horizontal" extra={'更多'} onClick={() => { this.toMedicineHomePage() }}>
                    <span className="title" style={{ padding: 'unset', paddingRight: '8px' }}>今日优选</span>
                </List.Item>
            </div>
            {drugItem}
        </div>
    }
}
