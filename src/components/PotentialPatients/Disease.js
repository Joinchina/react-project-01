import React, { Component } from 'react';
import {
    Select, Button,
} from 'antd';
import './index.less'
import propTypes from 'prop-types';

class AddDisease extends Component {
    static propTypes = {
        patientDisease: propTypes.arrayOf(propTypes.string).isRequired,
        callbackParent: propTypes.func.isRequired,
        isShowDefault6Button: propTypes.bool,
    }

    static defaultProps = {
        isShowDefault6Button: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            diseaseList: null,
        };
    }
    async componentDidMount() {
        const diseaseList = [
            { id: '1c7b1f8d75994f3eb0d027884b3dbae4', name: '高血压' },
            { id: '1b88fcb160444d8883390b81a6ccc449', name: '糖尿病' },
            { id: '62b1d404eb2c48988c17e00094522fb4', name: '冠心病' },
            { id: '14c6258f17bf4458935dcbe03607a27a', name: '脑血管病' },
            { id: 'd1e98eba79d24617bec1072e639391ff', name: '高脂血症' },
            { id: '577c11e6d2b444f2aa00aab0b4cd6869', name: '前列腺增生' },
        ];
        this.setState({ diseaseList });
    }

    handleClose = (removedDisease, isSelected) => {
        let { patientDisease } = this.props;
        const { callbackParent } = this.props;

        if (isSelected) {
            patientDisease = patientDisease.filter(tag => tag !== removedDisease.id);
        } else {
            patientDisease = [...patientDisease, removedDisease.id];
        }
        callbackParent(patientDisease);
    }

    handleChange = (value) => {
        let { patientDisease } = this.props;
        if (value && patientDisease.indexOf(value) === -1) {
            patientDisease = [...patientDisease, value];
        }
        const { callbackParent } = this.props;
        callbackParent(patientDisease);
    }

    render() {
        const { diseaseList } = this.state;
        const { patientDisease, isShowDefault6Button } = this.props;
        const buttonStyle = {
            marginRight: '5px',
            marginBottom: '10px',
            maxWidth: '140px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '100% 100%',
            borderColor: '#079f8b',
            color: '#079f8b',
            fontWeight: 'unset',
        };
        const unSelectedButton = {
            ...buttonStyle,
            borderColor: '#e8e8e8',
            color: '#666666',
            backgroundColor: 'unset',
        };

        return (
            <div id="addDisease" className="addDisease">
                {!diseaseList ? null : diseaseList.map((item, index) => {
                    const tag = patientDisease
                        ? patientDisease.filter(tag => item.id === tag) : null;

                    const isSelected = tag.length > 0 ? buttonStyle : unSelectedButton;
                    const tagElem = (
                        <Button
                            style={isSelected}
                            key={item.id}
                            onClick={() => this.handleClose(item, tag.length > 0)}
                        >
                            {item.name}
                        </Button>
                    );
                    return tagElem;

                })}
            </div>
        );
    }
}

export default AddDisease;
