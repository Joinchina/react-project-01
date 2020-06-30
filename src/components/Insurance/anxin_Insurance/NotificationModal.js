import React, { Component } from 'react';
import { Modal } from 'antd';
import { Button } from 'antd-mobile';
import autoprefixer from 'autoprefixer';


class NotificationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            insuranceConfig: null,
            canClick: false,
            ids: 15
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props && nextProps && nextProps.visible !== this.props.visible && nextProps.visible === true) {
            const that = this;
            this.time1 = setInterval(() => {
                that.setState({
                    ids: that.state.ids == 0 ? 0 : that.state.ids - 1,
                    canClick: that.state.ids == 0 ? true : false,
                }, () => that.state.ids == 0 ? clearInterval(this.time1) : null)
            }, 1000);
            this.setState({
                visible: nextProps.visible,
            })
        }
    }


    handleOk = e => {
        if(this.state.ids !== 0){
            return;
        }
        clearInterval(this.time1)
        this.setState({
            visible: false,
            ids: 15
        });
        this.notificationRef.scrollTop = 0;
        this.props.readMe(true);
    };

    handleCancel = e => {
        clearInterval(this.time1)
        this.setState({
            visible: false,
            ids: 15
        });
        this.props.readMe(false);
        this.notificationRef.scrollTop = 0;
    };


    render() {
        const { currentNotification, canClick, ids } = this.state;
        return (
            <Modal
                height={'94%'}
                title={currentNotification ? currentNotification.title : null}
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                className="notificationModal"
                title={this.props.insuredType === 1 ? '授权告知书' : '个人委托声明'}
                footer={[
                    <Button
                        key="submit"
                        style={{ height: '39px',display:'block', margin:'auto' , marginTop: '10px', marginBottom: '16px' }}
                        className={ids !== 0 ? 'primaryButton_un' : "primaryButton"}
                        onClick={this.handleOk}
                    >
                        {ids !== 0 ? `${ids}秒后可点击` : this.props.insuredType === 1 ? '被保险人阅读并同意' : '被保险人确认委托'}
                    </Button>,
                ]}
            >
                {this.props.insuredType === 1
                    //授权告知书
                    ? <div className="notificationBox" ref={ref => this.notificationRef = ref}>
                        <div>本人声明及授权如下： </div>
                        <div>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            1、本人承诺自愿参加北京万户良方科技有限公司为会员制定的重大疾病补充保障计划。本人已阅读相关规定，知晓各项约定并同意遵守，并接受由此产生的法律效果。凡由本授权书委托引发的法律责任或一切纠纷由本人承担。
                    <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        2、本人承诺所填写的信息真实有效，因提供信息与实际情况不符而产生的一切后果由本人承担。
                    <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        3、本人授权北京万户良方科技有限公司及相关保险服务商在进行任何承保、理赔及其他相关保险业务事项时向任何医院、医生、诊所、保险公司或任何组织和机构查阅、调取与本人有关的资料，并可索取相关证明。
                    <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        4、本人确认如实告知个人情况，如未如实告知，将北京万户良方科技有限公司有权终止资助；
                    <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    5、本人确定<strong>按照要求如实上传或提供个人有关医疗、健康数据或数据</strong>，如
                        未达到要求，北京万户良方科技有限公司将有权终止资助责任；北京万户良方科技有限公司终止资助责任前将通知本人；
                    <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    6、本人进行<strong>恶性肿瘤治疗前</strong>，应联系北京万户良方科技有限公司，由北京万户良方科技有限公司首先确认<strong>目录内靶向治疗</strong>药物使用情况；否则北京万户良方科技有限公司可以终止资助责任。

                    </div>
                    </div>
                    :
                    //个人委托申明
                    <div className="notificationBox" ref={ref => this.notificationRef = ref}>
                        {/*
                {currentNotification ? <div dangerouslySetInnerHTML={{ __html: currentNotification.content }} /> : ''} */}
                        <div>本人声明及授权如下： </div>
                        <div>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            1、本人承诺自愿参加北京万户良方科技有限公司为会员制定的重大疾病补充保障计划。本人已阅读相关规定，知晓各项约定并同意遵守，并接受由此产生的法律效果。凡由本授权书委托引发的法律责任或一切纠纷由本人承担。
                <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    2、本人承诺所填写的信息真实有效，因提供信息与实际情况不符而产生的一切后果由本人承担。
                <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    3、本人授权北京万户良方科技有限公司及相关保险服务商在进行任何承保、理赔及其他相关保险业务事项时向任何医院、医生、诊所、保险公司或任何组织和机构查阅、调取与本人有关的资料，并可索取相关证明。
                <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    4、本人确认如实告知个人情况，如未如实告知，将北京万户良方科技有限公司有权终止资助；
                <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                5、本人确定<strong>按照要求如实上传或提供个人有关医疗、健康数据或数据</strong>，如
                    未达到要求，北京万户良方科技有限公司将有权终止资助责任；北京万户良方科技有限公司终止资助责任前将通知本人；
                <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                6、本人进行<strong>恶性肿瘤治疗前</strong>，应联系北京万户良方科技有限公司，由北京万户良方科技有限公司首先确认<strong>目录内靶向治疗</strong>药物使用情况；否则北京万户良方科技有限公司可以终止资助责任。

                </div>
                    </div>}

            </Modal>
        );
    }
}

export default NotificationModal;
