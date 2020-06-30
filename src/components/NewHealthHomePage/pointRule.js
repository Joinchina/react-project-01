import React, { Component } from 'react';
import Title from '../common/Title';
import mount from '@wanhu/react-redux-mount';

@mount('pointRule')
export default class Point extends Component {
    render() {
        return (
            <div className="hasMenu">
                <Title>积分规则</Title>
            </div>
        )
    }
}