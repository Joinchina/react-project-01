import React, { Component } from 'react';

import SuccessImg from './images/success.png';
import { Button } from 'antd';
import querystring from 'querystring';

class SuccessModal extends Component {

    goBack = () => {
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const q = querystring.parse(qs);
        const { r } = q;
        this.props.history.push(`${r}${this.props.location.search}`);
    }

    nextTask = () => {
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const q = querystring.parse(qs);
        const { r } = q;
        this.props.history.push(`${this.props.nextTask}?r=${encodeURIComponent(r)}`);
    }

    render() {
        return <div className={`pointSuccessBox ${this.props.success ? '' : 'videoBoxHidden'}`}>
            <div className="msgBox">
                <img src={SuccessImg} />
                <div className="textBox">
                    <div className="titleTxt">
                        {this.props.title}
                    </div>
                    <div className="pointTxt">
                        <span className="addTxt">+</span>
                        <span className="numTxt">{this.props.point}</span>
                        <span className="jifenTxt">积分</span>
                    </div>
                    <div className="btnBox">
                        <Button className="back" onClick={() => this.goBack()}>返回</Button>
                        <Button className="nextTask" onClick={() => this.nextTask()}>下一个任务</Button>
                    </div>
                </div>
            </div>
        </div>
    }
}
export default SuccessModal
