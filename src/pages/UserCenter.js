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
  Tabs,
  Select
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';
import universities from '../data/universities';

const { Title } = Typography;
const { TabPane } = Tabs;

const UserCenter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();
  
  // 检查用户是否已登录并获取最新用户信息
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    
    const parsedUserInfo = JSON.parse(userInfo);
    setLoading(true);
    
    // 从后端获取最新的用户信息
    userApi.getUserInfo()
      .then(userData => {
        // 更新用户信息，包括正确的created_at时间戳
        const updatedUserInfo = {
          ...parsedUserInfo,
          ...userData,
        };
        
        // 更新本地存储
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUser(updatedUserInfo);
      })
      .catch(error => {
        console.error('获取用户信息失败:', error);
        // 如果获取失败，仍然使用本地存储的信息
        setUser(parsedUserInfo);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);
  
  // 初始化表单值
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        university: user.university || ''
      });
    }
  }, [user, form]);
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleSave = async (values) => {
    try {
      setLoading(true);
      
      // 调用后端API更新用户信息
      await userApi.updateUserInfo({
        email: values.email,
        university: values.university
      });
      
      // 更新本地存储的用户信息
      const updatedUser = { ...user, ...values };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      message.success('个人信息更新成功');
      setEditing(false);
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`更新失败: ${error.response.data.detail || '请重试'}`);
      } else {
        message.error('更新失败，请检查网络连接');
      }
      console.error('更新用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (values) => {
    try {
      setPasswordLoading(true);
      
      // 调用后端API修改密码
      await userApi.changePassword(values.oldPassword, values.newPassword);
      
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`修改密码失败: ${error.response.data.detail || '请重试'}`);
        
        // 特殊处理旧密码错误的情况
        if (error.response.status === 400 && error.response.data.detail.includes('旧密码不正确')) {
          message.warning('旧密码不正确，请重新输入');
        }
      } else {
        message.error('修改密码失败，请检查网络连接');
      }
      console.error('修改密码失败:', error);
    } finally {
      setPasswordLoading(false);
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
                  <Descriptions.Item label="学校">{user?.university || '未设置'}</Descriptions.Item>
                  <Descriptions.Item label="注册时间">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </Descriptions.Item>
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
                  university: user?.university || ''
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
                  name="university"
                  label="学校"
                >
                  <Select
                    showSearch
                    placeholder="选择你的学校"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={universities}
                    allowClear
                  />
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
            <Form 
              layout="vertical" 
              onFinish={handleChangePassword}
              name="passwordForm"
            >
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
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<LockOutlined />}
                  loading={passwordLoading}
                >
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
