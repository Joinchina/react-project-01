import React, { Component } from 'react';
import {
     Button,
} from 'antd';
import propTypes from 'prop-types';
// import './select.less'
class AddDisease extends Component {
    static propTypes = {
        patientDisease: propTypes.arrayOf(propTypes.string).isRequired,
        callbackParent: propTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            diseaseList: null,
        };
    }
    async componentDidMount() {
        const diseaseList = this.props.diseaseList;
        this.setState({ diseaseList });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.diseaseList !== nextProps.diseaseList && nextProps.diseaseList) {
            this.setState({ diseaseList: nextProps.diseaseList });
        }
    }

    handleClose = (removedDisease, isSelected) => {
        let { patientDisease } = this.props;
        const { callbackParent } = this.props;

        if (isSelected) {
            patientDisease = patientDisease.filter(tag => tag !== removedDisease.diseaseCode);
        } else {
            patientDisease = [...patientDisease, removedDisease.diseaseCode];
        }
        if(!isSelected && removedDisease.diseaseCode === 'NONE'){
            patientDisease = ['NONE']
        }
        if(!isSelected && removedDisease.diseaseCode !== 'NONE'){
            patientDisease = patientDisease.filter(item => item !== 'NONE');
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
        const { patientDisease } = this.props;


        return (
            <div id="insuranceDisease" className="insuranceDisease">
                {!diseaseList ? null : diseaseList.map((item, index) => {
                    const tag = patientDisease
                        ? patientDisease.filter(tag => item.diseaseCode === tag) : null;

                    const isSelected = tag.length > 0 ? 'buttonStyle' : 'unSelectedButton';
                    const tagElem = (
                        <Button
                            className={isSelected}
                            key={item.diseaseCode}
                            onClick={() => this.handleClose(item, tag.length > 0)}
                        >
                            {item.diseaseName}
                        </Button>
                    );
                    return tagElem;

                })}
            </div>
        );
    }
}

export default AddDisease;
