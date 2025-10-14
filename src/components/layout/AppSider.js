import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  LineChartOutlined,
  UserOutlined,
  GlobalOutlined,
  BellOutlined,
  CommentOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const AppSider = ({ isMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const location = useLocation();

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/') {
      setSelectedKeys(['home']);
    } else if (pathname.startsWith('/rates')) {
      setSelectedKeys(['rates']);
    } else if (pathname.startsWith('/converter')) {
      setSelectedKeys(['converter']);
    } else if (pathname.startsWith('/feedback')) {
      setSelectedKeys(['feedback']);
    } else if (pathname.startsWith('/alerts')) {
      setSelectedKeys(['alerts']);
    } else if (pathname.startsWith('/user')) {
      setSelectedKeys(['user']);
    } else if (pathname.startsWith('/exchange-service')) {
      setSelectedKeys(['exchange-service']);
    } else if (pathname.startsWith('/settings')) {
      setSelectedKeys(['settings']);
    }
  }, [location]);

  // 判断用户是否已登录
  const isLoggedIn = () => {
    return localStorage.getItem('userInfo') !== null;
  };

  return (
    <Sider
      collapsible={!isMobile}
      collapsed={isMobile ? false : collapsed}
      onCollapse={isMobile ? undefined : setCollapsed}
      width={200}
      className="site-layout-background"
      style={{
        overflow: 'auto',
        height: isMobile ? '100%' : undefined,
        position: isMobile ? 'fixed' : undefined,
        left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 1000 : undefined,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        style={{ 
          height: '100%', 
          borderRight: 0,
          paddingBottom: isMobile ? '50px' : 0 // 移动端底部留出空间
        }}
        theme="dark"
      >
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">首页</Link>
        </Menu.Item>
        {isLoggedIn() && (
          <Menu.Item key="alerts" icon={<BellOutlined />}>
            <Link to="/alerts">汇率提醒</Link>
          </Menu.Item>
        )}
        <Menu.Item key="rates" icon={<LineChartOutlined />}>
          <Link to="/rates">汇率走势</Link>
        </Menu.Item>
        <Menu.Item key="converter" icon={<GlobalOutlined />}>
          <Link to="/converter">汇率转换</Link>
        </Menu.Item>
        <Menu.Item key="feedback" icon={<CommentOutlined />}>
          <Link to="/feedback">反馈建议</Link>
        </Menu.Item>
        <Menu.Item key="exchange-service" icon={<DollarOutlined />}>
          <Link to="/exchange-service">换汇服务</Link>
        </Menu.Item>
        {isLoggedIn() && (
          <Menu.Item key="user" icon={<UserOutlined />}>
            <Link to="/user">个人中心</Link>
          </Menu.Item>
        )}
{/* 系统设置暂时隐藏
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">系统设置</Link>
        </Menu.Item>
*/}
      </Menu>
    </Sider>
  );
};

export default AppSider;
