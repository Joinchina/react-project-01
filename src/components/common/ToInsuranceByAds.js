import React from 'react';
import { message } from 'antd';
import api from "../../api";


export default async function toInsuranceByAds() {
    try {
        const adsList = await api.get('/wcm/adpositions/ads', {positionName: '购买会员链接广告'});
        if (!adsList || adsList.length <= 0) {
            message.error('暂未提供服务，请稍后再试');
            return;
        } else {
            window.location.href = adsList[0].url;
        }
    } catch (error) {
        message.error('暂未提供服务，请稍后再试');
    }

}
