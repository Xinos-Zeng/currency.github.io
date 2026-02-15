import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Drawer } from 'antd';
import './App.css';

// 导入页面组件
import HomePage from './pages/HomePage';
import LoginForm from './components/user/LoginForm';
import RegisterForm from './components/user/RegisterForm';
import UserCenter from './pages/UserCenter';
import AlertsPage from './pages/AlertsPage';
import CreateAlertPage from './pages/CreateAlertPage';
import EditAlertPage from './pages/EditAlertPage';
import AlertHistoryPage from './pages/AlertHistoryPage';
import RatesChartPage from './pages/RatesChartPage';
import CurrencyConverterPage from './pages/CurrencyConverterPage';
import FeedbackPage from './pages/FeedbackPage';
import ExchangeServicePage from './pages/ExchangeServicePage';
import NotFound from './pages/NotFound';

// 导入布局组件
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import AppSider from './components/layout/AppSider';

const { Content } = Layout;

// 创建一个需要登录才能访问的路由组件
const ProtectedRoute = ({ children }) => {
  // 先从localStorage获取（长期登录）
  let userInfo = localStorage.getItem('userInfo');
  
  // 如果localStorage中没有，再从sessionStorage获取（会话登录）
  if (!userInfo) {
    userInfo = sessionStorage.getItem('userInfo');
  }
  
  let isLoggedIn = false;
  
  if (userInfo) {
    try {
      const parsedInfo = JSON.parse(userInfo);
      isLoggedIn = !!parsedInfo.token;
    } catch (e) {
      // 清除无效的用户信息
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('userInfo');
    }
  }
  
  // 如果未登录，重定向到登录页面
  if (!isLoggedIn) {
    // 保存当前路径
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [siderVisible, setSiderVisible] = useState(false);
  
  // 检测设备类型
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 初始化埋点SDK
  useEffect(() => {
    // analytics SDK 会在导入时自动初始化
    console.log('埋点SDK已初始化');
  }, []);

  // 处理侧边栏显示/隐藏
  const toggleSider = () => {
    setSiderVisible(!siderVisible);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader isMobile={isMobile} toggleSider={toggleSider} />
      <Layout>
        {isMobile ? (
          <Drawer
            placement="left"
            closable={true}
            onClose={() => setSiderVisible(false)}
            open={siderVisible}
            bodyStyle={{ padding: 0 }}
            width={200}
          >
            <AppSider isMobile={isMobile} />
          </Drawer>
        ) : (
          <AppSider isMobile={isMobile} />
        )}
        <Layout style={{ 
          padding: isMobile ? '0 8px 8px' : '0 24px 24px',
          transition: 'padding 0.3s'
        }}>
          <Content
            className="site-layout-background"
            style={{
              padding: isMobile ? 16 : 24,
              margin: isMobile ? '8px 0' : '16px 0',
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/user" element={
                <ProtectedRoute>
                  <UserCenter />
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <AlertsPage />
                </ProtectedRoute>
              } />
              <Route path="/alerts/create" element={
                <ProtectedRoute>
                  <CreateAlertPage />
                </ProtectedRoute>
              } />
              <Route path="/alerts/history" element={
                <ProtectedRoute>
                  <AlertHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/alerts/:alertId/edit" element={
                <ProtectedRoute>
                  <EditAlertPage />
                </ProtectedRoute>
              } />
              <Route path="/rates" element={<RatesChartPage />} />
              <Route path="/converter" element={<CurrencyConverterPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/exchange-service" element={<ExchangeServicePage />} />
              <Route path="/settings" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Content>
          <AppFooter />
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;