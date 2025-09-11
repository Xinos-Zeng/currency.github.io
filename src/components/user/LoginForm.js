import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../../services/api';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // 调用后端API进行登录验证
      const response = await userApi.login(values.username, values.password);
      
      // 登录成功，获取用户信息
      const token = response.access_token;
      
      // 先保存token
      const userInfo = {
        username: values.username,
        token: token,
        remember: values.remember || false // 记录是否选择了"记住我"
      };
      
      // 根据"记住我"选项决定存储位置
      if (values.remember) {
        // 如果选择了"记住我"，存储在localStorage中（长期有效）
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        // 清除可能存在的sessionStorage中的数据
        sessionStorage.removeItem('userInfo');
      } else {
        // 如果没有选择"记住我"，存储在sessionStorage中（会话期间有效）
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        // 清除可能存在的localStorage中的数据
        localStorage.removeItem('userInfo');
      }
      
      try {
        // 获取用户详细信息
        const userProfile = await userApi.getUserInfo();
        
        // 更新用户信息
        const completeUserInfo = {
          ...userInfo,
          id: userProfile.id,
          email: userProfile.email,
          university: userProfile.university,
          preferred_currencies: userProfile.preferred_currencies
        };
        
        localStorage.setItem('userInfo', JSON.stringify(completeUserInfo));
      } catch (profileError) {
        console.error('获取用户信息失败:', profileError);
        // 即使获取用户信息失败，仍然允许用户登录，因为已经有了token
      }
      
      message.success('登录成功');
      
      // 检查是否有登录前的重定向路径
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectPath) {
        // 清除存储的路径
        sessionStorage.removeItem('redirectAfterLogin');
        // 重定向到之前的页面
        navigate(redirectPath);
      } else {
        // 默认重定向到首页
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          message.error('用户名或密码错误');
        } else {
          message.error('登录失败: ' + (error.response.data?.detail || '请稍后重试'));
        }
      } else {
        message.error('登录失败，请检查网络连接');
      }
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="用户登录" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名!' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Link to="/forgot-password" style={{ float: 'right' }}>
            忘记密码
          </Link>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            还没有账号？ <Link to="/register">立即注册</Link>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginForm;
