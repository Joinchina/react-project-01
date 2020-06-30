import React, { Component } from 'react';
import { Spin } from 'antd';
import querystring from 'query-string';
import AdsBanner from '../common/AdsBanner';
import api from '../../api';
import Title from '../common/Title';
import test_pic from './images/test_pic.png';
import './index.less';

const tys = {
    overflow: 'hidden',
    display: '-webkit-box',
    'WebkitBoxOrient': 'vertical',
    'WebkitLineClamp': 2,
    'msTextOverflow': 'ellipsis',
    'textOverflow': 'ellipsis',
}

export default class HealthNewsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            articleInfo: {},
            isShow: false,
        }
    }

    componentDidMount() {
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        this.init(queryData.id)
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    async init(id) {
        try{
            await this.setPromise({loading: true})
            const articleInfo = await api.get('/getArticleDetail', { articleId: id || 252 });
            const where = {
                "articleCategory": articleInfo.articleCategoryName, //如存在，分类范围不能为空
                "articleCategoryRange": 1, //分类范围 1=当前分类 2=当前和子分类
                "articleType": 2, //文章类型 1=视频 2=文本
                "createddate": { "$lt": articleInfo.createddate }, //创建时间
            }
            const self_list = await api.get('/getArticles', { where, skip: 0, limit: 6, nearBy:'desc' }) // 选集
            let newList = [];
            if(self_list && self_list.length){
                newList = self_list.filter(i => i.id != articleInfo.id);
                if(newList.length > 5){
                    newList = newList.slice(0, 5)
                }
            }
            this.setState({
                articleInfo,
                self_list: newList,
                loading: false,
                isShow: true
            })
        }catch(err){
            console.log(err.message)
            this.setState({
                loading: false
            })
        }
    }

    render() {
        const { articleInfo, self_list, loading, isShow } = this.state;
        return (
            <div className="health_news_page">
                <Title>健康报详情</Title>
                <Spin spinning={loading}>
                    <div className="article_box">
                        <p className='head_title'>
                            {articleInfo.title || ''}
                        </p>
                        <p className='article_time'>{articleInfo.createddate ? articleInfo.createddate.split(' ')[0] : ''} {articleInfo.author ? `来源：${articleInfo.author}` : null}</p>
                        <div className='article_info' dangerouslySetInnerHTML={{ __html: articleInfo.content }} />
                    </div>
                    <div className='article_interval'/>
                    {isShow ? <AdsBanner positionName='公众号健康日报详情Banner广告' /> : null}
                    {self_list && self_list.length ? <div className='other_article'>
                        <p className='other_article_title'>相关文章</p>
                        <div className='other_article_list'>
                            {self_list.map((i) => {
                                const articlesList = i.imgs ? i.imgs.split(',') : [];
                                const time1 = new Date().getTime();
                                const time3 = i.createddate.replace(/-/g, '/')
                                const time2 = new Date(time3).getTime();
                                const days = parseInt((time1 - time2) / 1000 / 60 / 60 / 24) || null;
                                if(articlesList.length = 1){
                                    return (
                                        <div className='other_article_list_item_1' onClick={() => this.init(i.id)}>
                                            <div className='other_left_box'>
                                                <p className='other_left_box_1' style={tys}>{i.title}</p>
                                                {days ? <p className='other_left_box_2'>{days}天前</p> : null}
                                            </div>
                                            <div>
                                                <img src={articlesList[0]} width='112px' height='74px' style={{ borderRadius: 3 }} />
                                            </div>
                                        </div>
                                    )
                                }else{
                                    return (
                                        <div className='other_article_list_item_2' onClick={() => this.init(i.id)}>
                                            <p className='other_left_box_1' style={tys}>{i.title}</p>
                                            <div>
                                                {articlesList.length ? articlesList.map((j, index) => {
                                                    return (
                                                        <img src={test_pic} width='112px' height='74px' className={index == articlesList - 1 ? 'borRadius_3' : 'marRight_4 borRadius_3'} />
                                                    )
                                                }) : null}
                                            </div>
                                            {days ? <p className='other_left_box_2'>{days.toString()}天前</p> : null}
                                        </div>
                                    )
                                }
                            })}
                            <div style={{ height: 1, backgroundColor: '#E8E8E8' }} />
                        </div>
                    </div> : null}
                </Spin>
            </div>
        )
    }
}