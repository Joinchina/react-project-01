import React, { Component } from 'react';
import copy from 'copy-to-clipboard';
import QRCode from 'qrcode'
import api from '../../api';
import Comlon from '../common/Comlon';
import Title from '../common/Title';
import { Row, Col, Button, Spin, Icon, message, Form, Input } from 'antd';
import { InputItem } from 'antd-mobile';
import './index.less';
import detail_bac from './detail_bac.png';

const arr = [
    {
        name: '服务包一号',
        ageRange: [10, 20],
        products: [
            {name: 'test1'},
            {name: 'test2'},
            {name: 'test3'},
            {name: 'test4'},
            {name: 'test5'},
        ],
        pic: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1591264539245&di=c7e17216f8b0deeace1fb9ade2b600c4&imgtype=0&src=http%3A%2F%2Fimg.pconline.com.cn%2Fimages%2Fupload%2Fupc%2Ftx%2Fitbbs%2F1507%2F13%2Fc38%2F9702970_1436774075010.jpg',
        copy_url: 'www.baidu.com/321',
        id: '1'
    },
    {
        name: '服务包二号',
        ageRange: [10, 20],
        products: [
            {name: 'test1'},
            {name: 'test2'},
            {name: 'test3'},
            {name: 'test4'},
            {name: 'test5'},
        ],
        pic: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1591264539245&di=c7e17216f8b0deeace1fb9ade2b600c4&imgtype=0&src=http%3A%2F%2Fimg.pconline.com.cn%2Fimages%2Fupload%2Fupc%2Ftx%2Fitbbs%2F1507%2F13%2Fc38%2F9702970_1436774075010.jpg',
        copy_url: 'www.baidu.com/123',
        id: '2'
    }
]

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}

export default class ShowDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            codeList: []
        }
    }

    async componentDidMount() {
        let il = []
        arr.map(async (i, index) => {
            if(i.pic){
                const iul = await QRCode.toDataURL(i.pic);
                if(iul){
                    il.push(iul)
                }
            }
        })
        await timeout(300)
        this.setState({
            codeList: il,
            loading: false
        })
    }

    copyThisUrl(data) {
        if(copy(data)){
            message.success('复制成功');
        }else{
            message.error('复制失败');
        }
    }

    async logOut() {
        try{
            await api.get('/del_bind')
        }catch(err){
            console.log(err)
        }
    }

    renderOrderList() {
        const { codeList } = this.state;
        return (
            <div className="insurance_list">
                {arr.map((i, index) => {
                    return (
                        <div className='insurance_box' key={i.id}>
                            <div className='box_item_1'>{i.name}</div>
                            <div className='box_item_2'>
                                <span className='text_1'>年龄范围：</span>
                                <span className='text_2'>{`${i.ageRange[0]}-${i.ageRange[1]}`}</span>
                            </div>
                            <div className='box_item_3'>
                                <span className='text_1'>服务产品：</span>
                                <div style={{ display: 'flex', flexDirection: 'column'}}>
                                    {i.products.map((item, index) => {
                                        return (
                                            <span key={index}>{item.name}</span>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className='box_item_4'>
                                <div style={{ padding: '10px', border: '1px solid #E8E8E8' }}>
                                    <img src={codeList.length && codeList[index] || ''} width='110px' height='110px' />
                                </div>
                                <span style={{ fontSize: '14px', color: '#666666', marginBottom: 24, marginTop: 12}}>长按二维码保存</span>
                                <a style={{ textDecoration: 'underline', color: '#418DC7', fontSize: 14 }} onClick={() => this.copyThisUrl(i.copy_url)}>复制下单链接</a>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    render() {
        const { loading } = this.state;
        return (
            <div className="hasMenu part_sold_detail">
                <Title>分销</Title>
                <Spin spinning={loading}>
                    <p className='first_text_sty'>如需切换账号,请点击<a onClick={() => this.logOut()}>退出登录</a></p>
                    {this.renderOrderList()}
                </Spin>
            </div>
        )
    }
}