import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import './App.css';

// 导入布局组件
import AppHeader from './components/layout/Header';
import AppFooter from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// 导入页面组件
import Dashboard from './pages/Dashboard';
import TrendAnalysis from './pages/TrendAnalysis';
import Login from './pages/Login';
import Register from './pages/Register';
import UserCenter from './pages/UserCenter';
import AlertSettings from './pages/AlertSettings';
import AlertHistory from './pages/AlertHistory';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <Sidebar />
          <Layout className="site-layout">
            <Content className="site-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trend-analysis" element={<TrendAnalysis />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user-center" element={<UserCenter />} />
                <Route path="/alert-settings" element={<AlertSettings />} />
                <Route path="/alert-history" element={<AlertHistory />} />
              </Routes>
            </Content>
            <AppFooter />
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
