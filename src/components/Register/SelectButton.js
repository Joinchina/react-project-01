import React, { Component } from 'react';
import {
     Button, Modal, Icon, Affix,
} from 'antd';
import './index.less'
import propTypes from 'prop-types';
import mount, { prop, action } from '@wanhu/react-redux-mount';

@mount('disease')
class SelectButton extends Component {

    @prop()
    visible;

    static propTypes = {
        selectList: propTypes.array,
        selectedButton: propTypes.arrayOf(propTypes.string).isRequired,
        onSelect: propTypes.func.isRequired,
        isShowDefault6Button: propTypes.bool,
        isSingle: propTypes.bool,
    }

    static defaultProps = {
        selectList: [],
        isShowDefault6Button: true,
        isSingle: false
    };

    componentDidMount() {

    }


    handleClose = (removedButton, isSelected) => {
        let { selectedButton, isSingle } = this.props;
        const { onSelect } = this.props;
        if (isSelected) {
            selectedButton = selectedButton.filter(tag => tag !== removedButton.id);
        } else {
            selectedButton = [...selectedButton, removedButton.id];
        }
        if (isSingle) {
            selectedButton = [removedButton.id];
        }
        onSelect(selectedButton);
    }

    @action()
    setVisible(visible) {
        this.visible = visible;
    }

    render() {
        const { selectList, selectedButton, isShowDefault6Button } = this.props;
        const buttonStyle = {
            height: '36px',
            marginRight: '10px',
            marginBottom: '10px',
            maxWidth: '180px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '100% 100%',
            borderColor: '#C8161D',
            color: '#C8161D',
            backgroundColor: '#ffffff',
            fontWeight: '300',
            fontSize: '18px',
        };
        const unSelectedButton = {
            ...buttonStyle,
            borderColor: '#E8E8E8',
            color: '#222222',
            backgroundColor: '#ffffff',
        };
        const buttonStyle_more = {
            fontSize: '18px',
            marginRight: '10px',
            marginBottom: '10px',
            maxWidth: '140px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '100% 100%',
            borderColor: '#418DC7 !important',
            color: '#418DC7 !important',
            backgroundColor: '#ffffff',
            fontWeight: '300',
        };

        return (
            <div id="addDisease" className="addDisease" style={{padding: '10px 0px'}}>
                {!selectList ? null : selectList.map((item, index) => {
                    const tag = selectedButton
                        ? selectedButton.filter(tag => item.id === tag) : [];
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
                    if ((index <= 5 && isShowDefault6Button) || tag.length > 0 || !isShowDefault6Button) {
                        return tagElem;
                    }
                    return null;
                })}
                {isShowDefault6Button ?
                    <Button style={buttonStyle_more} className="moreBtn" onClick={() => this.setVisible(true)}>更多>></Button> : null}
                <Modal
                    visible={this.visible}
                    onCancel={() => this.setVisible(false)}
                    cancelText="关闭"
                    className="registerModal"
                    footer={null}
                >
                    <div>
                        <div
                            ref={node => { this.container = node; }}
                            style={{ height: '450px', overflowY: 'scroll' }}
                            className="scrollable-container"
                        >

                            {!selectList ? null : selectList.map((item, index) => {
                                const tag = selectedButton
                                    ? selectedButton.filter(tag => item.id === tag) : [];
                                const isSelected = tag.length > 0 ? true : false;

                                const disease = (
                                    <div key={item.id} className="diseaseItem" style={isSelected ? { color: '#C8161D' } : {}} onClick={() => this.handleClose(item, tag.length > 0)}>
                                        {item.name}
                                        {isSelected ? <Icon type="check-circle" style={{ float: 'right', paddingRight: '11px' }} /> : ''}
                                    </div>
                                )
                                return disease;
                            })
                            }
                        </div>
                        <Affix target={() => this.container} onClick={() => this.setVisible(false)}>
                            <Button className="submitButton">确定</Button>
                        </Affix>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default SelectButton;
