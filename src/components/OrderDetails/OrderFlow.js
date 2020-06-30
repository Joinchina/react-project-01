import React, { Component } from 'react';
import { Icon, Timeline } from 'antd';
import moment from 'moment'

class OrderFlow extends Component {

    orderStatus(num) {
        num = isNaN(parseInt(num, 10)) ? num : parseInt(num, 10)
        switch (num) {
            // case 10: return '初始订单';
            case 20: return '用户已确认，药师审核中';
            // case 30: return '医生已确认';
            case 35: return '药师审核通过';
            case 40: return '中心药房备药中';
            case 45: return '配送中';
            // case 50: return '待取药';
            // case 60: return '已取药';
            case 70: return '完成';
            // case 97: return '药师已驳回';
            case 98: return '已撤销';
            case 99: return '完成';
            default: return null
        }
    }

    onClose() {
        const { onClose } = this.props;
        onClose();
    }

    render() {
        let list = [];
        for (const flowItem of this.props.flowList) {
            let defaultText = this.orderStatus(flowItem.status);
            defaultText = flowItem.status === 1
                ? `订单已支付`
                : defaultText;
            if (!defaultText) {
                continue;
            }
            list.push(flowItem);
            if (flowItem.status === 45 && this.props.expressFlowList && this.props.expressFlowList.length > 0) {
                list = [...list, ...this.props.expressFlowList];
            }
        }
        const nowList = list.filter((item) => item.status === 20 || item.status === 70 || item.status === 98 || item.status === 99 )
        const timeLineList = nowList && nowList.length > 0 ? nowList.map((item, index) => {
            if (item.acceptTime) {
                const timeItem = <div>
                    <p className="flowContent">{item.remark} </p>
                    <p className="flowDate">{moment(item.acceptTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                </div>
                return (
                    <Timeline.Item color='blue' key={index}>
                        {timeItem}
                    </Timeline.Item>
                )
            } else if (item.status !== undefined) {
                let defaultText = this.orderStatus(item.status);
                defaultText = item.status === 1
                    ? `订单已支付`
                    : defaultText;
                if (!defaultText) {
                    return;
                }
                const timeItem = <div>
                    <p className="flowContent">{defaultText}
                        {item.status === 97 ?
                            <span style={{ backgroundColor: 'unset', fontSize: '14px', paddingLeft: '0px' }}
                                dangerouslySetInnerHTML={{ __html: item.content }}>
                            </span> : null}</p>
                    <p className="flowDate">{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</p>
                </div>
                return (
                    <Timeline.Item className="dot" color={index === 0 ? 'red' : 'gray'} >
                        {timeItem}
                    </Timeline.Item>
                )
            }
            return;
        }) : null;
        return (
            <div className="addressList orderFlow">
                <div>
                    <div className="title mainFont">订单跟踪</div>
                    <Icon type="close-circle" onClick={() => this.onClose()} className="closeBtn" />
                </div>
                <div className="flowBox">
                    <Timeline>
                        {timeLineList}
                    </Timeline>
                </div>

            </div>
        );
    }
}

export default OrderFlow;
