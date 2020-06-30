import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Spin } from 'antd';
import { Modal } from 'antd-mobile';

@mount('baiji')
export default class Baiji extends Component {

    @prop()
    formData;

    @action()
    componentDidMount() {
        Modal.alert(null, '您所访问的页面将跳转到由央企上海医药集团广州百济新特药业连锁有限公司提供服务的万户-上药百济商城，您是否同意授权该商城获取并使用您的个人信息以提供相关服务。', [
            { text: '拒绝', onPress: () => this.props.history.push(`/newHealthHomePage`) },
            { text: '同意', onPress: () => this.ref.submit() },
        ])
    }
    render() {
        return <Spin spinning={true}>
            <form action={window.PARTNER_BAIJI_URL} ref={ref => this.ref = ref}>
                <input type="password" hidden name="userid" value={this.formData.userid} />
                <br />
                <input type="password" hidden name="phone" value={this.formData.phone} />
                <br />
                <input type="password" hidden name="signinfo" value={this.formData.signinfo} />
                <br />
                <input type="password" hidden name="dt" value={this.formData.dt} />
                <br />
            </form>
        </Spin>
    }
}
