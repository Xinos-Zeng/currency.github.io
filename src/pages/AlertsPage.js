import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Popconfirm, 
  Switch, 
  message, 
  Card,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HistoryOutlined,
  BellFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { alertApi } from '../services/api';

const { Title } = Typography;

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 获取用户的所有提醒
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertApi.getUserAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('获取提醒列表失败:', error);
      message.error('获取提醒列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // 删除提醒
  const handleDelete = async (alertId) => {
    try {
      await alertApi.deleteAlert(alertId);
      message.success('提醒已删除');
      fetchAlerts(); // 刷新列表
    } catch (error) {
      console.error('删除提醒失败:', error);
      message.error('删除提醒失败，请稍后重试');
    }
  };

  // 更新提醒状态（启用/禁用）
  const handleStatusChange = async (alertId, active) => {
    try {
      await alertApi.updateAlertStatus(alertId, active);
      message.success(`提醒已${active ? '启用' : '禁用'}`);
      fetchAlerts(); // 刷新列表
    } catch (error) {
      console.error('更新提醒状态失败:', error);
      message.error('更新提醒状态失败，请稍后重试');
    }
  };

  // 渲染提醒类型标签
  const renderAlertTypeTag = (type) => {
    switch (type) {
      case 'threshold':
        return <Tag color="blue">阈值提醒</Tag>;
      case 'change':
        return <Tag color="green">变化率提醒</Tag>;
      case 'time':
        return <Tag color="orange">定时提醒</Tag>;
      default:
        return <Tag>未知类型</Tag>;
    }
  };

  // 渲染提醒条件
  const renderCondition = (record) => {
    const { condition } = record;
    const { type, currency_code, threshold_value, change_percentage, time_frequency } = condition;
    
    switch (type) {
      case 'threshold':
        return `人民币兑${currency_code}汇率${threshold_value > 0 ? '高于' : '低于'} ${Math.abs(threshold_value)}`;
      case 'change':
        return `人民币兑${currency_code}汇率变化${change_percentage > 0 ? '上涨' : '下跌'}超过 ${Math.abs(change_percentage)}%`;
      case 'time':
        return `${time_frequency}提醒人民币兑${currency_code}汇率`;
      default:
        return '未知条件';
    }
  };

  const columns = [
    {
      title: '提醒名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '货币',
      dataIndex: ['condition', 'currency_code'],
      key: 'currency',
      render: (text) => text,
    },
    {
      title: '类型',
      dataIndex: ['condition', 'type'],
      key: 'type',
      render: renderAlertTypeTag,
    },
    {
      title: '提醒条件',
      key: 'condition',
      render: renderCondition,
    },
    {
      title: '通知方式',
      dataIndex: 'notification_method',
      key: 'notification_method',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={active}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/alerts/${record.id}/edit`)} 
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此提醒吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>
          <BellFilled style={{ marginRight: 8 }} />
          汇率提醒
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<HistoryOutlined />}
            onClick={() => navigate('/alerts/history')}
          >
            提醒历史
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/alerts/create')}
          >
            创建提醒
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={alerts.map(alert => ({ ...alert, key: alert.id }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无提醒，点击"创建提醒"按钮添加' }}
        />
      </Card>
    </div>
  );
};

export default AlertsPage;
