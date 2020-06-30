import React from 'react';
import { Row, Col, Icon } from 'antd';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_h5q9fl0n33p.js',
});
export default function HealthItem(props) {
    let { item } = props;
    const image = item.imgs && item.imgs.split(',').length > 0 ? item.imgs.split(',')[0] : null;
    return <div className="classItem" onClick={() => props.history.push(`/healthClass?id=${item.id}`)}>
        {image ? <div
            className="_tempImg"
            style={{
                background: `url(${image})  no-repeat`,
                backgroundSize: 'cover',
                width: '100%',
                paddingTop: '56.5%'
            }}
        >
        </div> : null}
        <div className="classTitle" >{item.title}</div>
        <Row>
            <Col span={18}>
            </Col>
            {item.integral ? <Col span={6} className="_point">
                <MyIcon type="icon_jifen" style={{ fontSize: '17px', color: '#D6A642' }} />
                <span>{item.integral}</span>
            </Col> : null}
        </Row>
    </div>

}
