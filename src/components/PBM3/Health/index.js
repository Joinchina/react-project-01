import React, { Component } from 'react';
import { Tabs } from 'antd-mobile'
import Title from '../../common/Title';
import HealthItem from './HealthItem';
import ClassItem from './ClassItem';
import querystring from 'query-string';
import TabBar from '../../common/TabBar';
import './index.less';
import api from '../../../api';

const tabs = [
    { title: <div className="tabTitle">健康课堂</div>, sub: '1' },
    { title: <div className="tabTitle">健康报</div>, sub: '2' },
];

export default class Health extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classList: null,
            pageList: null,
            classCategorise: [],
            pageCategorise: [],
            articleCategory: 0,
            tabIndex: 0,
            limit: 10,
            classSkip: 0,
            classLoadMore: true,
            pageSkip: 0,
            pageLoadMore: true,
            loading: false
        }
    }

    async componentDidMount() {
        let tabIndex = 0
        let articleCategory = 0;
        if (this.props.history.location.search) {
            const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
            const q = querystring.parse(qs);
            tabIndex = parseInt(q.tabIndex || 0);
            articleCategory = parseInt(q.articleCategory || 0);
            this.setState({ tabIndex, articleCategory });
            console.log('[componentDidMount]articleCategory', articleCategory)
        }
        try {
            await this.tabChange(tabIndex, articleCategory, true)
        } catch (error) {

        }
    }

    gotoDetail(item) {
        this.props.history.push(`/healthNewsPage?id=${item.id}`)
    }

    renderClass() {
        const { classList } = this.state;
        return <div className="tabContent" >
            {classList && classList.length > 0 ? classList.map((item, index) => {
                return <ClassItem key={`class${index}`} item={item} {...this.props} />
            }) : null}
        </div>
    }
    renderNews() {
        const { pageList } = this.state;
        return <div className="tabContent" >
            {pageList && pageList.length > 0 ? pageList.map((item, index) => {
                return <HealthItem key={`key${index}`} item={item} gotoDetail={() => this.gotoDetail(item)} />
            }) : null}
        </div>
    }

    categoriseChange(tab, index) {
        this.setState({ articleCategory: index })
        const { tabIndex } = this.state;
        this.tabChange(tabIndex, index);
    }
    async tabChange(index, articleCategory, isInit) {
        if (!isInit) {
            this.props.history.push(`/health?tabIndex=${index}&articleCategory=${articleCategory || 0}`);
        }
        this.setState({ tabIndex: index, articleCategory: articleCategory || 0 })
        const { limit } = this.state;
        let { classCategorise, pageCategorise } = this.state;
        const query = {
            where: {
                articleType: 1,
                articleCategoryRange: 2,
            },
            limit,
            skip: 0,
            nearBy: 'desc',
        }
        if (index === 0) {
            if (!classCategorise || classCategorise.length <= 0) {
                classCategorise = await api.get('/wcm/articleCategorise', { parentCategory: '健康课堂' });
                classCategorise = classCategorise || [];
                classCategorise.unshift({ id: 999999, name: '全部' })
                classCategorise = classCategorise.map(item => ({
                    title: item.name,
                    sub: `class${item.id}`,
                    key: `class${item.id}`,
                }));
            }
            query.where.articleCategory = articleCategory ? classCategorise[articleCategory].title : '健康课堂';
            const classList = await api.get('/wcm/articles', query);
            this.setState({ classList, classCategorise, classSkip: classList.length, classLoadMore: classList.length >= limit });
        } else {
            query.where.articleType = 2;
            if (!pageCategorise || pageCategorise.length <= 0) {
                pageCategorise = await api.get('/wcm/articleCategorise', { parentCategory: '健康报' });
                pageCategorise = pageCategorise || [];
                pageCategorise.unshift({ id: 999999, name: '全部' })
                pageCategorise = pageCategorise.map(item => ({
                    title: item.name,
                    sub: `page${item.id}`,
                    key: `page${item.id}`,
                }));
                this.setState({ pageCategorise });
            }
            query.where.articleCategory = articleCategory ? pageCategorise[articleCategory].title : '健康报'

            const pageList = await api.get('/wcm/articles', query);
            this.setState({ pageList, pageSkip: pageList.length, pageLoadMore: pageList.length >= limit });
        }
    }
    async nextPage() {
        const { tabIndex, limit,
            classLoadMore, classSkip, classList,
            pageLoadMore, pageSkip, pageList, articleCategory, classCategorise, pageCategorise } = this.state;
        const query = {
            where: {
                articleType: 1,
                articleCategory: articleCategory ? classCategorise[articleCategory].title : '健康课堂',
                articleCategoryRange: 2,
            },
            limit,
            skip: classSkip,
            nearBy: 'desc',
        }
        this.setState({ loading: true });
        if (tabIndex === 0) {
            if (classLoadMore) {
                const _classList = await api.get('/wcm/articles', query);
                this.setState({
                    classList: [...classList, ..._classList],
                    classSkip: classSkip + _classList.length,
                    classLoadMore: _classList.length >= limit
                });
            }

        } else {
            if (pageLoadMore) {
                query.where.articleType = 2;
                query.where.articleCategory = articleCategory ? pageCategorise[articleCategory].title : '健康报'
                query.skip = pageSkip;
                const _pageList = await api.get('/wcm/articles', query);
                this.setState({
                    pageList: [...pageList, ..._pageList],
                    pageSkip: pageSkip + _pageList.length,
                    pageLoadMore: _pageList.length >= limit
                });
            }
        }
        this.setState({ refreshing: false, loading: false });
    }


    render() {
        const { tabIndex, classCategorise, pageCategorise, articleCategory, classLoadMore, pageLoadMore, loading } = this.state;
        return <div className="pbmMain pbmHealth">
            <Title>健康</Title>
            <div className="menu">
                <TabBar {...this.props} />
            </div>
            <Tabs
                page={tabIndex}
                tabs={tabs}
                ref={ref => this.tabRef = ref}
                onChange={(tab, index) => this.tabChange(index)}
            />
            {tabIndex === 0 ? <div >
                <div className="articleCategorise">
                    {classCategorise && classCategorise.length > 0 ? <Tabs
                        key="classCategorise"
                        tabs={classCategorise}
                        page={articleCategory}
                        ref={ref => this.pageRef = ref}
                        renderTabBar={props => <Tabs.DefaultTabBar {...props} />}
                        onChange={(tab, index) => this.categoriseChange(tab, index)} className="articleCategorise"
                        tabBarBackgroundColor="#ffffff"
                        tabBarActiveTextColor="#222222"
                        tabBarInactiveTextColor="#222222"
                        tabBarTextStyle={{
                            height: '44px',
                            backgroundColor: '#ffffff',
                            fontSize: '16px',
                            width: 'unset !important',
                        }}
                    /> : null}
                </div>
                <div className="tabContent">
                    {this.renderClass()}
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '10px',
                            color: '#888888'
                        }}
                        onClick={() => this.nextPage()}
                    >
                        {loading ? '加载中...' : (classLoadMore ? '点击加载更多' : '')}
                    </div>
                </div>
            </div> : null}

            {tabIndex === 1 ? <div>
                <div className="articleCategorise">
                    {pageCategorise && pageCategorise.length > 0 ? <Tabs
                        key="pageCategorise"
                        tabs={pageCategorise}
                        page={articleCategory}
                        ref={ref => this.pageRef = ref}
                        renderTabBar={props => <Tabs.DefaultTabBar {...props} />}
                        onChange={(tab, index) => this.categoriseChange(tab, index)} className="articleCategorise"
                        tabBarBackgroundColor="#ffffff"
                        tabBarActiveTextColor="#222222"
                        tabBarInactiveTextColor="#222222"
                        tabBarTextStyle={{
                            height: '44px',
                            backgroundColor: '#ffffff',
                            fontSize: '16px',
                            width: 'unset !important',
                        }}
                    /> : null}
                </div>
                <div className="tabContent">
                    {this.renderNews()}
                    {pageLoadMore ? <div
                        style={{
                            textAlign: 'center',
                            padding: '10px',
                            color: '#888888',
                            background: '#F8F8F8'
                        }}
                        onClick={() => this.nextPage()}
                    >
                        {loading ? '加载中...' : (pageLoadMore ? '点击加载更多' : null)}
                    </div> : null}
                </div>
            </div> : null}
            <div style={{ height: '60px', width: '100vw', backgroundColor: '#FFFFFF' }}>
            </div>
        </div>
    }
}
