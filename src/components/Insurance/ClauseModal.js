import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import './index.less'
class clauseModal extends Component {
    constructor(props){
        super(props)
        this.state={
            seconds:5,
            timer:null
        }
    };
    componentDidUpdate(){
        clearInterval(this.state.timer)
        if(this.props.visible==true&&this.state.seconds!=0){
            this.state.timer = setInterval(() => {
                this.setState({
                    seconds:this.state.seconds-1
                })
            }, 1000);
        };
    };
    render() {
        return (
            <div className="mymodalbox">
                <Modal
                    height={'95%'}
                    visible={this.props.visible}
                    closable={true}
                    className="notificationModal"
                    onCancel={()=>{
                        clearInterval(this.state.timer)
                        this.setState({
                            seconds:5
                        })
                        this.props.closeModal(false)
                    }}
                    footer={null}
                    // footer={[
                    //     <Button
                    //         key="submit"
                    //         style={{ height: '39px',display:'block',margin:'auto auto', marginTop: '10px', marginBottom: '16px' }}
                    //         className={"primaryButton"}
                    //         disabled={this.state.seconds!==0}
                    //         onClick={()=>{
                    //             clearInterval(this.state.timer)
                    //             this.setState({
                    //                 seconds:10
                    //             })
                    //             this.props.closeModal(false)
                    //         }}
                    //     >
                    //         {this.state.seconds !== 0 ? `${this.state.seconds}秒后可点击` : '确认并同意'}
                    //     </Button>,
                    // ]}
                    title={Object.keys(this.props.data).length!=0?this.props.data.title:null}>
                    <div style={{height:'84vh',overflowY:'scroll'}}>
                        <div dangerouslySetInnerHTML={{__html: Object.keys(this.props.data).length!=0?this.props.data.content:null}} style={{width:'100%'}}>

                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default clauseModal;
