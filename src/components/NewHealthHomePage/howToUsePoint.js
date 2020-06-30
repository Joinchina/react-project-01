import React, { Component } from 'react';
import Title from '../common/Title';
import mount from '@wanhu/react-redux-mount';

@mount('howToUsePoint')
export default class HowToUsePoint extends Component {
    render() {
        return (
            <div className="hasMenu">
                <Title>怎么使用积分</Title>
            </div>
        )
    }
}