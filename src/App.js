import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
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
import NotFound from './pages/NotFound';
import UnderConstruction from './pages/UnderConstruction';

// 导入布局组件
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import AppSider from './components/layout/AppSider';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSider />
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: '16px 0',
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/user" element={<UserCenter />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/alerts/create" element={<CreateAlertPage />} />
              <Route path="/alerts/history" element={<AlertHistoryPage />} />
              <Route path="/alerts/:alertId/edit" element={<EditAlertPage />} />
              <Route path="/rates" element={<UnderConstruction />} />
              <Route path="/converter" element={<UnderConstruction />} />
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