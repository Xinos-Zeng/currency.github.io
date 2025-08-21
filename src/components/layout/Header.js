import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserOutlined, 
  LogoutOutlined, 
  BellOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 模拟检查用户登录状态
  useEffect(() => {
    // 这里应该是从localStorage或后端API获取用户信息
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    // 清除用户信息并退出登录
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>
        <Link to="/user-center">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="2" icon={<BellOutlined />}>
        <Link to="/alert-settings">提醒设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="header">
      <div className="header-logo">
        <DollarOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
        <span>汇率监控平台</span>
      </div>
      <Menu 
        theme="dark" 
        mode="horizontal" 
        className="header-menu"
        selectedKeys={[location.pathname]}
      >
        <Menu.Item key="/">
          <Link to="/">汇率看板</Link>
        </Menu.Item>
        <Menu.Item key="/trend-analysis">
          <Link to="/trend-analysis">趋势分析</Link>
        </Menu.Item>
        {!isLoggedIn ? (
          <>
            <Menu.Item key="/login">
              <Link to="/login">登录</Link>
            </Menu.Item>
            <Menu.Item key="/register">
              <Link to="/register">注册</Link>
            </Menu.Item>
          </>
        ) : (
          <Menu.Item key="user">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="text" style={{ color: '#fff' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                {user?.username || '用户'}
              </Button>
            </Dropdown>
          </Menu.Item>
        )}
      </Menu>
    </Header>
  );
};

export default AppHeader;
