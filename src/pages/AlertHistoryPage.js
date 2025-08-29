import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Card, 
  DatePicker, 
  Form, 
  Select, 
  message
} from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { alertApi } from '../services/api';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AlertHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取用户的提醒列表（用于筛选）
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertApi.getUserAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('获取提醒列表失败:', error);
      }
    };

    fetchAlerts();
  }, []);

  // 获取提醒历史记录
  const fetchHistory = async (values = {}) => {
    try {
      setLoading(true);
      
      const params = {};
      
      if (values.alertId) {
        params.alert_id = values.alertId;
      }
      
      if (values.dateRange && values.dateRange.length === 2) {
        params.start_date = values.dateRange[0].toISOString();
        params.end_date = values.dateRange[1].toISOString();
      }
      
      const data = await alertApi.getAlertHistory(params);
      setHistory(data);
    } catch (error) {
      console.error('获取提醒历史记录失败:', error);
      message.error('获取提醒历史记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 处理筛选表单提交
  const handleSearch = (values) => {
    fetchHistory(values);
  };

  // 获取提醒名称
  const getAlertName = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    return alert ? alert.name : `提醒 #${alertId}`;
  };

  const columns = [
    {
      title: '提醒名称',
      key: 'alert_name',
      render: (_, record) => getAlertName(record.alert_id),
    },
    {
      title: '触发时间',
      dataIndex: 'triggered_at',
      key: 'triggered_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.triggered_at) - new Date(b.triggered_at),
    },
    {
      title: '触发时汇率',
      dataIndex: 'rate_at_trigger',
      key: 'rate_at_trigger',
      render: (text) => text.toFixed(4),
    },
    {
      title: '通知状态',
      dataIndex: 'notification_sent',
      key: 'notification_sent',
      render: (sent) => (
        <span style={{ color: sent ? 'green' : 'red' }}>
          {sent ? '已发送' : '未发送'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/alerts')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          <HistoryOutlined style={{ marginRight: 8 }} />
          提醒历史记录
        </Title>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="alertId" label="提醒">
            <Select 
              placeholder="选择提醒" 
              style={{ width: 200 }}
              allowClear
            >
              {alerts.map(alert => (
                <Option key={alert.id} value={alert.id}>
                  {alert.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="dateRange" label="日期范围">
            <RangePicker />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SearchOutlined />}
            >
              查询
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={history.map(item => ({ ...item, key: item.id }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无历史记录' }}
        />
      </Card>
    </div>
  );
};

export default AlertHistoryPage;
