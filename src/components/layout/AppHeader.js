import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 从localStorage获取用户信息
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem('userInfo');
      }
    }
  }, [location]);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    message.success('已成功退出登录');
    navigate('/');
  };

  // 用户下拉菜单
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/user">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="alerts" icon={<UserOutlined />}>
        <Link to="/alerts">汇率提醒</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="logo" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          汇率查询系统
        </Link>
      </div>
      <div>
        {user ? (
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button type="text" style={{ color: 'white', padding: '0', height: 'auto' }}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                {user.username}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        ) : (
          <Space>
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button icon={<UserAddOutlined />} onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
