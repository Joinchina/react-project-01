import React, { Component } from 'react';
import './index.less'
import propTypes from 'prop-types';

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
        const { callbackParent, diseaseList } = this.props;
        const diseaseNone = diseaseList.find(item => item.value === 'NONE');
        if (isSelected) {
            patientDisease = patientDisease.filter(tag => tag !== removedDisease.name);
        } else {
            patientDisease = [...patientDisease, removedDisease.name];
        }
        if (!isSelected && removedDisease.value === 'NONE') {
            patientDisease = [diseaseNone.name]
        }
        if (!isSelected && removedDisease.value !== 'NONE') {
            patientDisease = patientDisease.filter(item => item !== diseaseNone.name);
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
                        ? patientDisease.filter(tag => item.name === tag) : null;
                    const isSelected = tag.length > 0 ? 'buttonStyle' : 'unSelectedButton';
                    const tagElem = (
                        <div
                            className={isSelected}
                            key={item.name}
                            onClick={() => this.handleClose(item, tag.length > 0)}
                        >
                            {item.name}
                        </div>
                    );
                    return tagElem;

                })}
            </div>
        );
    }
}

export default AddDisease;
