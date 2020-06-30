import React from 'react';
import mount from '@wanhu/react-redux-mount';
import { Modal } from 'antd';
import Weixin from '../../lib/weixin';

@mount('notBound')
class NotComplete extends React.Component {

    wx = new Weixin('closeWindow');

    handleOk = e => {
        window.location = `/improveInformation`
    };

    handleCancel = e => {
        this.wx.closeWindow()
    };

    render() {
        return (
            <div>
                <Modal
                    visible={true}
                    onOk={this.handleOk}
                    okType=""
                    onCancel={this.handleCancel}
                    closable={false}
                    okText="马上去补填"
                    cancelText="以后再说"
                >
                    <p style={{fontSize: '18px'}}>您缺少身份证信息，无法享受订药额外报销、激励红包等PBM福利。</p>
                </Modal>
            </div>
        )
    }
}

export default NotComplete;
