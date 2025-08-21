import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Row, Col, message, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AlertForm from '../components/user/AlertForm';
import AlertList from '../components/user/AlertList';

const { Title } = Typography;

// 模拟货币数据
const MOCK_CURRENCIES = [
  { code: 'USD', name: '美元' },
  { code: 'GBP', name: '英镑' },
  { code: 'EUR', name: '欧元' },
  { code: 'AUD', name: '澳元' },
  { code: 'CAD', name: '加元' },
  { code: 'JPY', name: '日元' }
];

// 模拟提醒数据
const MOCK_ALERTS = [
  {
    id: '1',
    name: '美元低于6.8提醒',
    currencyCode: 'USD',
    currencyName: '美元',
    type: 'threshold',
    condition: 'less',
    value: 6.8,
    active: true,
    triggered: false,
    createdAt: '2023-04-15',
    lastTriggered: null
  },
  {
    id: '2',
    name: '英镑创30天新高提醒',
    currencyCode: 'GBP',
    currencyName: '英镑',
    type: 'trend',
    trendType: 'new_high_30d',
    active: true,
    triggered: true,
    createdAt: '2023-04-10',
    lastTriggered: '2023-04-28'
  },
  {
    id: '3',
    name: '欧元单日跌幅超1%提醒',
    currencyCode: 'EUR',
    currencyName: '欧元',
    type: 'trend',
    trendType: 'drop_1p',
    active: false,
    triggered: true,
    createdAt: '2023-03-25',
    lastTriggered: '2023-04-05'
  }
];

const AlertSettings = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 检查用户是否已登录
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    
    // 获取URL参数，如果有currency参数则自动打开表单
    const params = new URLSearchParams(location.search);
    const currencyCode = params.get('currency');
    
    if (currencyCode) {
      setShowForm(true);
      setEditingAlert({
        currencyCode,
        type: 'threshold',
        condition: 'less'
      });
    }
    
    // 模拟加载提醒数据
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 使用模拟数据
        setAlerts(MOCK_ALERTS);
      } catch (error) {
        console.error('获取提醒数据失败:', error);
        message.error('获取提醒数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, [navigate, location.search]);
  
  const handleAddAlert = () => {
    setEditingAlert(null);
    setShowForm(true);
  };
  
  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setShowForm(true);
  };
  
  const handleDeleteAlert = async (alertId) => {
    try {
      setLoading(true);
      
      // 这里将调用后端API删除提醒
      // await deleteAlert(alertId);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新本地状态
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      message.success('提醒已删除');
    } catch (error) {
      console.error('删除提醒失败:', error);
      message.error('删除提醒失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleActive = async (alertId, active) => {
    try {
      setLoading(true);
      
      // 这里将调用后端API更新提醒状态
      // await updateAlertStatus(alertId, active);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新本地状态
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, active } : alert
      ));
      
      message.success(`提醒已${active ? '启用' : '暂停'}`);
    } catch (error) {
      console.error('更新提醒状态失败:', error);
      message.error('更新提醒状态失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormSubmit = async (values) => {
    try {
      if (editingAlert?.id) {
        // 编辑现有提醒
        const updatedAlerts = alerts.map(alert => 
          alert.id === editingAlert.id ? { ...alert, ...values } : alert
        );
        setAlerts(updatedAlerts);
      } else {
        // 创建新提醒
        const newAlert = {
          id: String(Date.now()),
          ...values,
          currencyName: MOCK_CURRENCIES.find(c => c.code === values.currencyCode)?.name,
          active: true,
          triggered: false,
          createdAt: new Date().toISOString().split('T')[0],
          lastTriggered: null
        };
        setAlerts([...alerts, newAlert]);
      }
      
      setShowForm(false);
      setEditingAlert(null);
    } catch (error) {
      console.error('提交提醒失败:', error);
    }
  };

  return (
    <div>
      <Title level={2}>提醒设置</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <AlertList 
            alerts={alerts}
            loading={loading}
            onEdit={handleEditAlert}
            onDelete={handleDeleteAlert}
            onToggleActive={handleToggleActive}
          />
        </Col>
        
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddAlert}
              block
            >
              添加新提醒
            </Button>
          </div>
          
          {showForm && (
            <Modal
              title={editingAlert?.id ? "编辑提醒" : "添加新提醒"}
              open={showForm}
              onCancel={() => setShowForm(false)}
              footer={null}
              destroyOnClose
            >
              <AlertForm 
                currencies={MOCK_CURRENCIES}
                initialValues={editingAlert || {}}
                onSubmit={handleFormSubmit}
              />
            </Modal>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AlertSettings;
