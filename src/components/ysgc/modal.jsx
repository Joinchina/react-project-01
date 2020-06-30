import React, { Component } from 'react'
import { Modal, Button } from 'antd';
import './model.less'
import history from '../../history'
export default class modal extends Component {
    constructor(props){
        super(props)
        console.log('我是弹窗组件接收的值',this.props)
        this.state={

        }
    }
    goBuy(){
        history.push(`/insurance/${this.props.insurancePackageId}?cid=${this.props.cid}`)
    }
    render() {
        return (
            <div className="model_box">
                <Modal
                    visible={this.props.visible}
                    closable={false}
                    transparent
                    onCancel={null}
                    title={null}
                    footer={null}

                >
                    <div>
                        <div style={{ height: 100,textAlign:'center',fontSize:'17px'}} dangerouslySetInnerHTML={{__html:this.props.text}}>
                        </div>
                        <button style={{
                            background:'rgba(200,22,29,1)',
                            borderRadius:'4px',
                            width:'100%',
                            height:'44px',
                            textAlign: 'center',
                            lineHeight: '44px',
                            fontSize:'18px',
                            color: '#fff',
                            margin: '20px 0',
                            border:'none'
                        }} onClick={()=>this.goBuy()}>立即激活</button>
                    </div>
                </Modal>
            </div>
        )
    }
}
