import React from 'react';
import { Row, Col, Icon } from 'antd'

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_h5q9fl0n33p.js',
});
export default function HealthItem(props) {
    let { item } = props;
    const images = item.contentImg && item.contentImg.split(',').length > 0 ? item.contentImg.split(',') : null;
    const imagesLength = images ? images.length : 0;
    const titleItem = <div
        className="healthTitle"
        style={{
            wordBreak: 'break-all',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            webkitBoxOrient: 'vertical',
            overflow: 'hidden',
        }}
    >
        {item.title}
    </div>
    const pointItem = <Row style={{ marginTop: '8px' }}>
        <Col span={18} className="footerTip">
            {item.createddate}
        </Col>
        {item.integral ? <Col span={6} className="_point">
            <MyIcon type="icon_jifen" style={{ fontSize: '17px', color: '#D6A642' }} />
            <span>{item.integral}</span>
        </Col> : null}
    </Row>
    let hItem;
    if (imagesLength >= 3) {
        hItem = <div>
            {titleItem}
            <div className="_tempImgList" >
                {
                    images.slice(0, 3).map((imgItem, index) => {
                        const isRight = (index + 1) % 3 === 0;
                        const marginRight = isRight ? '0px' : '6px';
                        return <div
                            className="_tempImg"
                            key={`_tempImg${index}`}
                            style={{
                                background: `url(${imgItem})  no-repeat`,
                                marginRight,
                                backgroundSize: 'cover',
                            }}
                        >
                        </div>
                    })
                }
            </div>
            {pointItem}
        </div>
    } else if (imagesLength <= 0) {
        hItem = <div>
            {titleItem}
            {pointItem}
        </div>
    } else {
        hItem = <Row>
            <Col span={16} style={{ paddingRight: '16px' }}>
                {titleItem}
                {pointItem}
            </Col>
            <Col span={8} style={{ paddingLeft: '4px' }}>
                <div
                    className="_tempImg"
                    style={{
                        background: `url(${images[0]}) no-repeat`,
                        backgroundSize: 'cover',
                        width: '100%',
                        paddingTop: '66.6%'
                    }}
                >
                </div>
            </Col>
        </Row>
    }
    return <div className="healthItem" onClick={() => props.gotoDetail()}>
        {hItem}
    </div>

}
