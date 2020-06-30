import React, { Component } from 'react';
import { Icon, Carousel } from 'antd'
import { List } from 'antd-mobile'
import api from '../../../api';

const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: 'https://at.alicdn.com/t/font_1310653_h5q9fl0n33p.js',
});
export default class HealthClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pageList: null,
            classList: null,
            classList2: null,
        }
    }

    async componentDidMount() {
        try {
            const pageList = await api.get(`/wcm/articles`, {
                where: {
                    articleType: 2,
                    articleCategory: '健康报',
                    articleCategoryRange: 2,
                },
                skip: 0,
                limit: 10,
                nearBy: 'desc',
            });
            const classList = await api.get(`/wcm/articles`, {
                where: {
                    articleType: 1,
                    articleCategory: '高血压',
                    articleCategoryRange: 1,
                },
                skip: 0,
                limit: 10,
                nearBy: 'desc',

            });
            const classList2 = await api.get(`/wcm/articles`, {
                where: {
                    articleType: 1,
                    articleCategory: '糖尿病',
                    articleCategoryRange: 1,
                },
                skip: 0,
                limit: 10,
                nearBy: 'desc',
            });
            console.log('pageList', pageList, classList, classList2);
            this.setState({ pageList, classList, classList2, });
        } catch (error) {

        }
    }

    toHealth() {
        this.props.history.push('/health');
    }

    toPage() {
        this.props.history.push('/health?tabIndex=1');
    }

    gotoClassDetail(item) {
        this.props.history.push(`/healthClass?id=${item.id}`);
    }

    renderClass(classList) {
        return classList && classList.length > 0 ? classList.map(item => {
            const img = item.imgs ? item.imgs.split(',') : [];

            return <div className="classItem" style={{ marginRight: '12px' }} onClick={() => this.gotoClassDetail(item)}>
                <div className="imgBox">
                    <div
                        className="_tempImg"
                        style={{
                            background: `url(${img[0]})  no-repeat`,
                            backgroundSize: 'cover',
                            width: '100%',
                            paddingTop: '60%'

                        }}
                    >
                    </div>
                </div>
                <div className="classTitle" style={{
                    wordBreak: 'break-all',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    webkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {item.title}
                </div>
                {item.integral ? <div className="classPoint">
                    <MyIcon type="icon_jifen" style={{ fontSize: '17px', color: '#D6A642' }} />
                    <span> {item.integral}</span>
                </div> : null}
            </div>
        }) : null;
    }
    toPageDetail(event, page) {
        event.stopPropagation();
        this.props.history.push(`/healthNewsPage?id=${page.id}`)
    }

    render() {
        const { pageList, classList, classList2 } = this.state;

        return <div>
            {pageList && pageList.length > 0 ?
                <div className="healthListItem">
                    <List.Item
                        arrow="horizontal"
                        extra={'更多'}
                        onClick={() => this.toPage()}
                    >
                        <div className="hTitle">
                            <div>健康</div>
                            <div>日报</div>
                        </div>
                        <div className="hItem">
                            <Carousel autoplay dotPosition="left" dots={false}>
                                {pageList.map(item => (<div key={item.id}>
                                    <div
                                        onClick={(e) => this.toPageDetail(e, item)}
                                        className="carouselItem"
                                        style={{
                                            wordBreak: 'break-all',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            webkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            whiteSpace: 'initial',
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                </div>))}
                            </Carousel>
                        </div>
                    </List.Item>
                </div> : null
            }
            {(classList && classList.length > 0) || (classList2 && classList2.length > 0) ? <div className="healthClass">
                <div className="hTitle">
                    <List.Item arrow="horizontal" extra={'更多'} onClick={() => this.toHealth()}>
                        <div style={{ display: 'flex' }} >
                            <span className="title" style={{ padding: 'unset', paddingRight: '8px' }}>精选健康课</span>
                        </div>
                    </List.Item>
                </div>
                <div>
                    {classList && classList.length > 0 ? <div>
                        <div className="title2">
                            高血压课程
                    </div>
                        <div className="classBox">
                            <div className="classList">
                                {this.renderClass(classList)}
                            </div>
                        </div>
                    </div> : null}
                    {classList2 && classList2.length > 0 ? <div>
                        <div className="title2">
                            糖尿病课程
                </div>
                        <div className="classBox">
                            <div className="classList">
                                {this.renderClass(classList2)}
                            </div>
                        </div>
                    </div> : null}
                </div>
            </div> : null}

        </div>
    }
}
