import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  Avatar, 
  Descriptions, 
  Button, 
  Form,
  Input,
  message,
  Tabs
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

const UserCenter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // 检查用户是否已登录
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userInfo));
    setLoading(false);
  }, [navigate]);
  
  // 初始化表单值
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        nickname: user.nickname || '',
        phone: user.phone || ''
      });
    }
  }, [user, form]);
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleSave = async (values) => {
    try {
      setLoading(true);
      
      // 这里将调用后端API更新用户信息
      // const response = await updateUserProfile(values);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新本地存储的用户信息
      const updatedUser = { ...user, ...values };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      message.success('个人信息更新成功');
      setEditing(false);
    } catch (error) {
      message.error('更新失败，请重试');
      console.error('更新用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return null;
  }

  return (
    <div>
      <Title level={2}>个人中心</Title>
      
      <Tabs defaultActiveKey="profile">
        <TabPane tab="个人资料" key="profile">
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} />
              <div style={{ marginLeft: 24 }}>
                <Title level={4}>{user?.username}</Title>
                <p>{user?.email}</p>
              </div>
            </div>
            
            {!editing ? (
              <>
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
                  <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
                  <Descriptions.Item label="昵称">{user?.nickname || '未设置'}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{user?.phone || '未设置'}</Descriptions.Item>
                  <Descriptions.Item label="注册时间">{user?.registerTime || '2023-04-01'}</Descriptions.Item>
                  <Descriptions.Item label="上次登录">{user?.lastLogin || '2023-05-01'}</Descriptions.Item>
                </Descriptions>
                
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                  style={{ marginTop: 16 }}
                >
                  编辑资料
                </Button>
              </>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  username: user?.username,
                  email: user?.email,
                  nickname: user?.nickname || '',
                  phone: user?.phone || ''
                }}
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input disabled />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="nickname"
                  label="昵称"
                >
                  <Input placeholder="请输入昵称" />
                </Form.Item>
                
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', validateTrigger: 'onBlur' }
                  ]}
                >
                  <Input placeholder="请输入手机号" />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ marginRight: 16 }}
                  >
                    保存
                  </Button>
                  <Button onClick={() => setEditing(false)}>
                    取消
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="修改密码" key="password">
          <Card>
            <Form layout="vertical">
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password placeholder="请输入当前密码" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请确认新密码" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary">
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserCenter;
