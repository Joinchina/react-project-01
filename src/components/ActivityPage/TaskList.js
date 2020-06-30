import React, { Component } from "react";

import api from '../../api';

/**
 * 集福气任务列表
 */
class TaskList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weixinUser: null,
        }
    }

    async componentDidMount() {
        const weixinUser = await api.get('/currentUser');
        this.setState({ weixinUser });
    }

    render() {
        const {
            weixinUser,
        } = this.state;
        return (
            <div>
                <div style={{ width: 40, height: 40, borderRadius: 20, borderColor: '#fff', borderStyle: 'solid', borderWidth: 2, overflow: 'hidden' }}>
                    <img src={weixinUser ? weixinUser.headimgurl : ''} style={{ width: 40, height: 40 }} />
                </div>
            </div>
        );
    }
}

export default TaskList;
