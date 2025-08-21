import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  LineChartOutlined,
  BellOutlined,
  HistoryOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  
  // 响应式处理
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // 检查登录状态
    const userInfo = localStorage.getItem('userInfo');
    setIsLoggedIn(!!userInfo);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 如果是移动设备，默认收起侧边栏
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      className={isMobile ? 'mobile-sidebar' : ''}
    >
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="/" icon={<DashboardOutlined />}>
          <Link to="/">汇率看板</Link>
        </Menu.Item>
        <Menu.Item key="/trend-analysis" icon={<LineChartOutlined />}>
          <Link to="/trend-analysis">趋势分析</Link>
        </Menu.Item>
        
        {isLoggedIn && (
          <>
            <Menu.Divider />
            <Menu.Item key="/user-center" icon={<UserOutlined />}>
              <Link to="/user-center">个人中心</Link>
            </Menu.Item>
            <Menu.Item key="/alert-settings" icon={<BellOutlined />}>
              <Link to="/alert-settings">提醒设置</Link>
            </Menu.Item>
            <Menu.Item key="/alert-history" icon={<HistoryOutlined />}>
              <Link to="/alert-history">提醒历史</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
