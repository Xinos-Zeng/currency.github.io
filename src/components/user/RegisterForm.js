import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../../services/api';
import universities from '../../data/universities';
import analytics from '../../services/analytics';

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // 调用后端API进行注册
      const userData = {
        username: values.username,
        email: values.email,
        password: values.password,
        university: values.university || '' // 可选字段
      };
      
      await userApi.register(userData);
      
      // 记录用户注册埋点
      analytics.trackUserRegister(values.username);
      
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      // 处理不同类型的错误
      if (error.response) {
        // 服务器返回了错误状态码
        const errorMsg = error.response.data?.detail || '注册失败，请重试';
        message.error(errorMsg);
        
        // 处理特定错误
        if (error.response.status === 400) {
          if (errorMsg.includes('用户名已被注册')) {
            message.warning('该用户名已被注册，请更换用户名');
          } else if (errorMsg.includes('邮箱已被注册')) {
            message.warning('该邮箱已被注册，请更换邮箱');
          }
        }
      } else {
        message.error('注册失败，请检查网络连接');
      }
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="用户注册" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        name="register"
        onFinish={onFinish}
        size="large"
        scrollToFirstError
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名!' },
            { min: 4, message: '用户名至少4个字符' },
            { max: 20, message: '用户名最多20个字符' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="邮箱" 
          />
        </Form.Item>
        
        <Form.Item
          name="university"
          rules={[
            { max: 50, message: '学校名称过长' }
          ]}
        >
          <Select
            showSearch
            placeholder="选择你的学校（选填）"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={universities}
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码!' },
            { min: 6, message: '密码至少6个字符' }
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请确认密码!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="确认密码"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterForm;
