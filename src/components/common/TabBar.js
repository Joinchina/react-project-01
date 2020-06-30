import React, { Component } from 'react';
import { Row, Col, Icon } from 'antd';
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1310653_ijnk904j1h.js', // 在 iconfont.cn 上生成
  });

const menuList = [
    {
        key: "newHealthHomePage",
        label: "首页",
        icon: "icon_jiankang",
        selected_icon: "icon_jiankang-mian",
        path: "/newHealthHomePage",
    },
    {
        key: "exchangeList",
        label: "健康",
        icon: "icon_fuli-xian",
        selected_icon: "icon_fuli-mian",
        path: "/health",
    },
    {
        key: "findDrugs",
        label: "找药",
        icon: "icontubiao_zhaoyao-xian",
        selected_icon: "icontubiao_zhaoyao-mian",
        path: "/medicineHomePage",
    },
    {
        key: "My",
        label: "我的",
        icon: "icontubiao_wode-xian",
        selected_icon: "icontubiao_wode-mian",
        path: "/user/info",
    },
];

class TabBarMenu extends Component {

    reditectPage(path){
        this.props.history.push(path)
    }
    render() {
        const {match} = this.props;
        const MenuList = menuList.map((item) => {
            const selected = match.path === item.path;
            return (
                <Col span={6} className={selected ? "selected" : ""} key={item.key}>
                    <a onClick={() => this.reditectPage(item.path)}  >
                        <MyIcon type={selected ? item.selected_icon : item.icon} />
                        <div>{item.label}</div>
                    </a>
                </Col>
            )
        });
        return (
            <Row className="menuTab">
                {MenuList}
            </Row>
        );
    }

}
export default TabBarMenu;
