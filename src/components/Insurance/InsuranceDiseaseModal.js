import React, { Component } from 'react';
import { Modal, Button } from 'antd';


class InsuranceDiseaseModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            disabled: false,
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props && nextProps && nextProps.visible !== this.props.visible && nextProps.visible !== undefined) {
            this.setState({
                visible: nextProps.visible,
            });
        }
    }

    handleOk = e => {
        this.props.onClose();
    };

    handleCancel = e => {
        this.props.onClose();
    };

    render() {
        return (
            <Modal
                title="合同附录100种疾病"
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                className="notificationModal"
                footer={[
                    <Button
                        key="back"
                        className="button12 selectedButton"
                        onClick={this.handleCancel}
                        style={{ height: '36px' }}
                    >
                        关闭
                    </Button>,

                ]}
            >
                <div>
                    <strong>一、针对老人的73种重症：</strong>
                    <br />
                    <strong>器官与肿瘤类</strong><br />
                    1.恶性肿瘤 2.重大器官移植术或造血干细胞移植术  3.终末期肾病（或称慢性肾功能袁揭尿石症期）  4.慢性肝功能袁竭失代偿期 5.慢性呼吸功能衰竭 6.严重溃疡性结肠炎 7.严重哮喘  8.原发性硬化性胆管炎 9、严重的胰岛素依赖型糖尿病（I型糖尿病）10、急性或亚急性重症肝炎  11、急性出血坏死性胰腺炎 12、慢性复发性胰腺炎 13、胰腺移植 14、慢性肾上腺皮质功能衰竭 15、肾髓质囊性病 16、肺淋巴管肌瘤病 17、原发性骨髓纤维化  19、严重骨髓增生异常综合征（MDS) 20、嗜铬细胞瘤 21、严重自身免疫性肝炎 22、肝豆状核变性
                <br />
                    <br />
                    <strong>脑科神经类</strong>
                    <br />
                    1、脑中风后遗症
                <br />
                    2、良性脑肿瘤
                <br />
                    3、脑炎后遗症或脑膜炎后遗症
                <br />
                    4、深度昏迷
                <br />
                    5、严重帕金森病
                <br />
                    6、严重运动神经元病
                <br />
                    7、语言能力丧失
                <br />
                    8、多发性硬化
                <br />
                    9、颅脑手术
                <br />
                    10、严重脑损伤
                <br />
                    11、严重肌无力
                <br />
                    12、脊髓灰质炎
                <br />
                    13、植物人
                <br />
                    14、严重癫痫
                <br />
                    15、严重细菌性脑脊髓膜炎
                <br />
                    16、破裂脑动脉瘤夹闭手术
                <br />
                    17、成骨不全症
                <br />
                    18、进行性核上性麻痹
                <br />
                    19、严重瑞氏综合征
                <br />
                    20、肾上腺脑白质营养不良
                <br />
                    <br />
                    <strong>心脑血管类</strong>
                    <br />
                    1.急性心肌梗塞   2.冠状动脉搭桥术（或称冠状动脉旁路移植术）3.心脏瓣膜手术 4.主动脉手术 5.严重原发性肺动脉高压6.严重心肌病 7.系统性红斑狼疮-III型或以上狼疮性肾炎 8.严重类风湿性关节炎 9.严重冠心病 10、严重心肌炎  11、主动脉夹层血肿 12、III度房室传导阻滞 13、严重传染性心内膜炎 14、肺源性心脏病 15、严重川崎病
                    <br />
                    <br />
                    <strong>意外类</strong>
                    <br />
                    1.重型再生障碍性贫血  2.严重III度烧伤 3.双耳失聪 4.双目失明5.多个肢休缺失  6.严重阿尔茨海默症7.溶血性链球菌引起的坏疽8.坏死性筋膜炎9.非阿尔茨海默病所致严重痴呆  10、经输血导致的人类免疫缺陷病毒（HIV）感染
                    11、因职业关系导致的人类免疫缺陷病毒（HIV）感染  12、系统性硬皮病  13、埃博拉病毒感染  14、严重克隆病15、严重肠道疾病并发症 16小肠移植

                <br />
                    <br />
                    <strong>二、27种轻症</strong>
                    <br />
                    1、原位癌 2、单侧肺脏切除 3、慢性肾功能障碍 4、早期肝硬化 5、肝脏手术 6、双侧卵巢或双侧睾丸切除术 7、胆道重建手术 8、轻微脑中风  9、脑垂体瘤、脑囊肿、脑动脉瘤及脑血管瘤 10、轻度脑炎或脑膜炎后遗症 11、 深度昏迷72小时  12、中度帕金森氏病 13、早期运动神经性疾病 14、重度头部外伤 15、不典型心肌梗塞 16、冠状动脉介入手术（非开胸手术） 17、心脏瓣膜介入手术（非开胸手术） 18、主动脉内手术（非开胸手术） 19、继发性肺动脉高压 20、可逆性再生障碍性贫血 21、较小面积III度烧伤 22、中度听力受损 23、视力严重受损 24、一肢缺失  25、中度阿尔茨海默病 26、人工耳蜗植入术 27、 单眼失明

                </div>
            </Modal>
        );
    }
}

export default InsuranceDiseaseModal;
