import React, { Component } from 'react';
import { Input, message } from 'antd';
import './selectNumber.css';

class SelectNumber extends Component {

    constructor(props) {
        super(props)
        this.state = { value: this.props.value }
    }

    componentWillReceiveProps(props) {
        if(props.value !== undefined) {
            this.setState({ value: props.value });
        }
    }

    subNumber = (e) => {
        e.stopPropagation();
        const val = this.state.value;
        if(val >= 2) {
            this.props.onChange && this.props.onChange(val-1);
        }
    }

    addNumber = (e) => {
        e.stopPropagation();
        const val = Number(this.state.value);
        if(val < 99) {
            this.props.onChange && this.props.onChange(val + 1);
        }
    }

    onchange = (e) => {
        const value = e.target.value;
        this.setState({ value });
    }

    onBlur = () => {
        const val = this.state.value;
        if(!val) {
            this.props.onChange && this.props.onChange(1);
            return;
        }
        if(!(/^[0-9]*$/).test(val)) {
            this.props.onChange && this.props.onChange(1);
            return;
        }
        if(val === '0' || val === '00') {
            this.props.onChange && this.props.onChange(1);
            return;
        }
        let value;
        if(!(/^[1-9][0-9]*$/).test(val)) {
            value = Number(val[1]);
        } else {
            value = Number(val);
        }
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        return (
            <div style={this.props.style} className="selectNumber">
                <div style={sty.sub} onClick={this.subNumber}>-</div>
                <input style={sty.input}
                    maxLength='2'
                    value={this.state.value}
                    onChange={this.onchange}
                    onBlur={this.onBlur}
                    />
                <div style={sty.add} onClick={this.addNumber}>+</div>
            </div>
        )
    }
}

const sty = {
    sub: {
        width: 30,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        textAlign: 'center',
        fontSize: 22,
        lineHeight: '27px',
    },
    add: {
        textAlign: 'center',
        fontSize: 22,
        lineHeight: '27px',
        width: 30,
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
    },
    input: {
        height: '100%',
        width: '100%',
        textAlign: 'center',
        border: 'none',
        backgroundColor: 'inherit',
    }

}

export default SelectNumber;
