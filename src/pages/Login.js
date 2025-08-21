import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import LoginForm from '../components/user/LoginForm';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  
  // 检查用户是否已登录，如果已登录则重定向到首页
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>用户登录</Title>
      <LoginForm />
    </div>
  );
};

export default Login;
