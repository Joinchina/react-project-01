import React, { Component } from 'react';
import { Spin, Row, Col } from 'antd';
import Title from '../common/Title';
import './index.less';

export default class MyReportInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }

    render() {
        const { loading } = this.state;
        return (
            <div className='my_report_info_box'>
                <Title>体检套餐详情</Title>
                <Spin spinning={loading}>
                    <div>
                        <div className="box_1">
                            <p className='text_1'>套餐名称</p>
                            <p className='text_2'>老年大病癌症早筛体检</p>
                        </div>
                        <div className='box_2'>
                            <p className='text_1'>套餐详情</p>
                            <div className='box_list_sty'>
                                <Row>
                                    <Col span={6} style={{ textAlign: 'center', backgroundColor: '#FBE6E8', minHeight: 44, lineHeight: '44px', borderRight: '1px solid #F2D1D8', color: '#222222' }}>项目</Col>
                                    <Col span={18} style={{ textAlign: 'center', backgroundColor: '#FBE6E8', minHeight: 44, lineHeight: '44px', color: '#222222' }}>明细</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">一般检查</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8', minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>身高、体重、体重指数、血压、脉搏</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderBottom: '', borderTop: ''}} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">外科</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8', minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>淋巴结、甲状腺、乳房、脊柱、四肢关节、外生殖器、前列腺、肛门指检、皮肤等</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">静态心电图</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>十二导联心电图</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderBottom: '', borderTop: '' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">血常规</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>检查白细胞、红细胞、血小板等</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">肝功能</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center' }}>
                                        <div style={{ padding: '14px 0', width: '100%' }}>
                                            <div style={{ padding: '0 10px 16px 10px', borderBottom: '1px solid #F2D1D8' }}>血清丙氨酸氨基转移酶测定</div>
                                            <div style={{ padding: '16px 10px 0 10px' }}>碱性磷酸酶</div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderBottom: '', borderTop: '' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">肝脏</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>甲胎蛋白检测定量</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">肾功能</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>血清尿素测定、血清肌酐测定、血清尿酸测定</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderBottom: '', borderTop: '' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">血脂</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center' }}>
                                        <div style={{ padding: '14px 0', width: '100%' }}>
                                            <div style={{ padding: '0 10px 16px 10px', borderBottom: '1px solid #F2D1D8' }}>血清总胆固醇测定</div>
                                            <div style={{ padding: '16px 10px 16px 10px', borderBottom: '1px solid #F2D1D8' }}>血清高密度脂蛋白胆固醇测定</div>
                                            <div style={{ padding: '16px 10px 0 10px' }}>血清低密度脂蛋白胆固醇测定</div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">糖尿病相关</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>空腹血糖、糖化血红蛋白</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderBottom: '', borderTop: '' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">肾脏</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>尿微量白蛋白</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">粪便隐血</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>粪便隐血试验定性</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderBottom: '', borderTop: '' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">彩色多普勒超声</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center' }}>
                                        <div style={{ padding: '14px 0', width: '100%' }}>
                                            <div style={{ padding: '0 10px 16px 10px', borderBottom: '1px solid #F2D1D8' }}>肝胆脾胰肾</div>
                                            <div style={{ padding: '16px 10px 0 10px' }}>乳腺</div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">幽门螺旋杆菌检测</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>胃幽门螺旋杆菌抗体（血液）</Col>
                                </Row>
                                <Row style={{ border: '1px solid #F2D1D8', borderTop: '' }} className='flex_sty'>
                                    <Col span={6} className="text_center fot_14 text_color_222">LDCT</Col>
                                    <Col span={18} style={{ color: '#666666', fontSize: 14, borderLeft: '1px solid #F2D1D8',  minHeight: 44, display: 'flex', alignItems: 'center', padding: '14px 10px'}}>低剂量胸部CT</Col>
                                </Row>
                            </div>
                        </div>
                        {/* <div className='box_3'>
                            <p className='text_1'>服务商</p>
                            <p className='text_2'>美年大健康股份有限公司</p>
                        </div> */}
                    </div>
                </Spin>
            </div>
        )
    }
}