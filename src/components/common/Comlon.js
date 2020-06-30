import React, { Component } from 'react';
import api from '../../api';
import { Modal as MobileModal, WhiteSpace, Toast } from 'antd-mobile'
import html2canvas from 'html2canvas';

export default class Comlon extends Component {

    constructor(props) {
        super(props);
        this.state = {
            weixinUser: null,
            patient: null,
            disabled: false,
        }
    }

    async getImg() {
        return html2canvas(document.body).then(function (canvas) {
            return canvas.toDataURL();
        });
    }

    async saveNotice(insurance) {
        //屏幕截图
        const { patient } = this.state;
        try {
            await api.post(`/patients/${patient.id}/insuranceOrders/${insurance.orderId}/notification`);
        } catch (e) {
            console.error(e);
            this.setState({ disabled: false });
            return;
        }
        this.setState({ disabled: false });

    }

    async componentDidMount() {
        const patient = await api.get(`/currentPatient`);
        const weixinUser = await api.get('/currentUser');
        /**
         * 如果已绑定：
         * 保障会员：更新所在城市为签约机构所在城市
         * 绿A会员：更新签约机构为所在城市对应的绿A机构
         */
        if (patient && weixinUser) {
            const { hospital } = patient;
            const { address } = weixinUser;
            if (!address || hospital.provinceId !== address.provinceId || hospital.cityId !== address.cityId) {
                if (patient.memberType === 1) {
                    const user = {
                        address: {
                            provinceId: hospital.provinceId,
                            cityId: hospital.cityId,
                            province: hospital.provinceName,
                            city: hospital.cityName
                        }
                    }
                    api.get('/saveCityList', user);
                } else if (patient.memberType === 2 && weixinUser.address) {
                    await api.post(`/checkHospital`, {
                        id: patient.id,
                        provinceId: address.provinceId,
                        cityId: address.cityId,
                    })
                }
            }
        }
        this.setState({
            weixinUser,
            patient
        })
        //如果已经登录判断是否有CRM中的保险单，如果有需要授权确认

        // if (weixinUser.address && patient && this.props.location.pathname.indexOf('/insurance') < 0) {
        //     const insuranceList = await api.get(`/patients/${patient.id}/insuranceOrder`, {});
        //     //展示会员协议  确认后截图保存。
        //     // this.setState({ insuranceList });
        //     if (insuranceList && insuranceList.length > 0) {
        //         insuranceList.map(item => {
        //             if (item.needRead !== 1 || item.status !== 3) {
        //                 return null;
        //             }
        //             const notice = <div style={{ maxHeight: '70vh', overflow: 'auto', textAlign: 'left' }}>
        //                 <div>
        //                     &nbsp;&nbsp;&nbsp;&nbsp;
        //                     您登记领取的{item.insurancePackageName}服务有如下内容需您知情，请阅读：
        //                 </div>
        //                 <WhiteSpace size="sm" />
        //                 <div>
        //                     {item.notification}
        //                 </div>
        //             </div>
        //             MobileModal.alert('告知书', notice, [{
        //                 text: '我已阅读',
        //                 onPress: () =>
        //                     new Promise((resolve) => {
        //                         const { disabled } = this.state;
        //                         if (!disabled) {
        //                             this.setState({ disabled: true });
        //                             resolve(this.saveNotice(item));
        //                         }
        //                     }),
        //                 disabled: this.state.disabled,
        //                 style: { color: '#DF4026' },
        //             }]);
        //             return item;
        //         })
        //     }
        // }
    }

    addressSelect() {
        const pathName = this.props.history.location.pathname
        window.location.href = `/addressSelect?r=${encodeURIComponent(`${pathName}`)}`
    }



    render() {
        const { patient, weixinUser } = this.state;
        if ((!patient || (patient && patient.memberType === 2)) && (weixinUser && !weixinUser.address)) {
            return (
                <MobileModal
                    visible={true}
                    transparent
                    maskClosable={false}
                    title=""
                    wrapProps={{ onTouchStart: this.onWrapTouchStart }}
                    className='address_modal'
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="https://wanhuhealth.oss-cn-beijing.aliyuncs.com/weixin-static/address_notice.png" width='250' height='300' />
                        <div
                            style={{ width: 120, height: 36, borderRadius: 18, backgroundColor: '#C8161D', color: '#fff', lineHeight: '36px', textAlign: 'center', position: 'absolute', bottom: 28 }}
                            onClick={() => this.addressSelect()}
                        >
                            确&nbsp;&nbsp;定
                            </div>
                    </div>
                </MobileModal>
            )
        } else {
            return null;
        }
    }
}
