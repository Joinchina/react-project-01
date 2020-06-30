import React, { Component } from 'react';
import { WhiteSpace, List, InputItem, Button } from 'antd-mobile'
import SuccessModal from './success';
import PointImg from './images/point.png';
import './AdsInsuranceForm.less';

const data = [{ "label": "北京市", "value": "11", "children": [{ "label": "市辖区", "value": "1101", "children": [{ "label": "东城区", "value": "110101" }, { "label": "西城区", "value": "110102" }, { "label": "朝阳区", "value": "110105" }, { "label": "丰台区", "value": "110106" }, { "label": "石景山区", "value": "110107" }, { "label": "海淀区", "value": "110108" }, { "label": "门头沟区", "value": "110109" }, { "label": "房山区", "value": "110111" }, { "label": "通州区", "value": "110112" }, { "label": "顺义区", "value": "110113" }, { "label": "昌平区", "value": "110114" }, { "label": "大兴区", "value": "110115" }, { "label": "怀柔区", "value": "110116" }, { "label": "平谷区", "value": "110117" }, { "label": "密云区", "value": "110118" }, { "label": "延庆区", "value": "110119" }] }] }, { "label": "天津市", "value": "12", "children": [{ "label": "市辖区", "value": "1201", "children": [{ "label": "和平区", "value": "120101" }, { "label": "河东区", "value": "120102" }, { "label": "河西区", "value": "120103" }, { "label": "南开区", "value": "120104" }, { "label": "河北区", "value": "120105" }, { "label": "红桥区", "value": "120106" }, { "label": "东丽区", "value": "120110" }, { "label": "西青区", "value": "120111" }, { "label": "津南区", "value": "120112" }, { "label": "北辰区", "value": "120113" }, { "label": "武清区", "value": "120114" }, { "label": "宝坻区", "value": "120115" }, { "label": "滨海新区", "value": "120116" }, { "label": "宁河区", "value": "120117" }, { "label": "静海区", "value": "120118" }, { "label": "蓟州区", "value": "120119" }] }] }]
class AdsInsuranceForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pickerValue: null,
            success: false,
        }
    }

    submitForm() {
        this.setState({ success: true });
    }

    render() {
        const { success } = this.state;
        return (
            <div className="adsInsuranceForm">
                <SuccessModal success={success} {...this.props} title="登记完成&nbsp;&nbsp;获得奖励" point={500} nextTask="/ads/cardForm" />
                <div className="pointImg">
                    <img src={PointImg} />登记完成可领取500积分
                </div>
                <div>
                    <img
                        style={{ width: 'calc( 100% - 30px)', margin: '0px 15px' }}
                        src="https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/ads/vedio-wanhu/ads_insurance_header.png"
                    />
                </div>
                <div className="bankMessage">
                    <List className="formList">
                        <WhiteSpace size="md" />
                        <List.Item>
                            <WhiteSpace size="md" />
                            <InputItem placeholder="请输入姓名" maxLength={10}> 姓名</InputItem>
                        </List.Item>
                        <List.Item>
                            <WhiteSpace size="md" />
                            <InputItem type="phone" placeholder="请输入手机号码" > 手机</InputItem>
                        </List.Item>
                        <List.Item>
                            <WhiteSpace size="lg" />
                            <WhiteSpace size="lg" />
                            <Button className="submitButton" onClick={() => this.submitForm()}>申请预定</Button>
                            <WhiteSpace size="lg" />
                        </List.Item>
                    </List>

                </div>
            </div>
        )
    }
}

export default AdsInsuranceForm;
