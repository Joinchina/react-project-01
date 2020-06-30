import React, { Component } from 'react';
import api from '../../api';
import Comlon from '../common/Comlon';
import Title from '../common/Title';
import { Row, Col, Button, Spin, Icon, message, Form, Input } from 'antd';
import { InputItem } from 'antd-mobile';
import './index.less';
import icon_pass from './icon_pass.png'
const FormItem = Form.Item;

export default class PartSold extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }

    componentDidMount() {

    }

    userNameChange(value) {
        this.setState({
            user_name: value,
        })
    }

    passwordChange(value) {
        this.setState({
            user_password: value,
        })
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    async bind() {
        const { user_name, user_password } = this.state;
        await this.setPromise({ loading: true})
        this.setState({
            isSub: true,
            loading: false,
        })
    }

    render() {
        const { loading, isSub, user_name, user_password } = this.state;
        return (
            <div className="hasMenu part_sold_login">
                <Title>分销</Title>
                <div style={{ padding: '36px 30px 0' }}>
                    <FormItem className="name_change">
                        <InputItem placeholder="请输入您的用户名"
                            onChange={(e) => this.userNameChange(e)}
                            style={{ height: '44px' }}
                            className="numberInput loginInput"
                            clear
                        ><i className="iconfont">&#xe627;</i></InputItem>
                    </FormItem>
                    {!user_name && isSub ? <span className="errorTip">请输入用户名</span> : null}
                    <FormItem style={{ marginTop: 36 }} className='pass_change'>
                        <InputItem placeholder="请输入您的密码"
                            onChange={(e) => this.passwordChange(e)}
                            style={{ height: '44px' }}
                            className="numberInput loginInput"
                            type="password"
                            clear
                        ><img src={icon_pass} /></InputItem>
                    </FormItem>
                    {!user_password && isSub ? <span className="errorTip">请输入密码</span> : null}
                    <FormItem style={{ paddingTop: '47px' }} >
                        <Button
                            onClick={() => this.bind()}
                            className="submitButton new_height"
                            loading={loading}
                            disabled={loading}
                        >登 录</Button>
                    </FormItem>
                </div>
            </div>
        )
    }
}