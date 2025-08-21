import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Table, 
  Tag, 
  Card, 
  Button,
  Space,
  DatePicker,
  Select,
  Form,
  message
} from 'antd';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟提醒历史数据
const MOCK_ALERT_HISTORY = [
  {
    id: '1',
    alertId: '2',
    alertName: '英镑创30天新高提醒',
    currencyCode: 'GBP',
    currencyName: '英镑',
    type: 'trend',
    trendType: 'new_high_30d',
    value: 9.1253,
    triggeredAt: '2023-04-28 10:15:32',
    message: '英镑兑人民币汇率创30天新高，达到9.1253'
  },
  {
    id: '2',
    alertId: '3',
    alertName: '欧元单日跌幅超1%提醒',
    currencyCode: 'EUR',
    currencyName: '欧元',
    type: 'trend',
    trendType: 'drop_1p',
    value: 7.6521,
    triggeredAt: '2023-04-05 15:30:21',
    message: '欧元兑人民币汇率单日下跌1.25%，当前价格7.6521'
  },
  {
    id: '3',
    alertId: '1',
    alertName: '美元低于6.8提醒',
    currencyCode: 'USD',
    currencyName: '美元',
    type: 'threshold',
    condition: 'less',
    value: 6.7985,
    triggeredAt: '2023-03-20 09:45:11',
    message: '美元兑人民币汇率低于6.8，当前价格6.7985'
  },
  {
    id: '4',
    alertId: '2',
    alertName: '英镑创30天新高提醒',
    currencyCode: 'GBP',
    currencyName: '英镑',
    type: 'trend',
    trendType: 'new_high_30d',
    value: 9.0856,
    triggeredAt: '2023-03-15 11:20:45',
    message: '英镑兑人民币汇率创30天新高，达到9.0856'
  }
];

// 模拟货币数据
const MOCK_CURRENCIES = [
  { code: 'USD', name: '美元' },
  { code: 'GBP', name: '英镑' },
  { code: 'EUR', name: '欧元' },
  { code: 'AUD', name: '澳元' },
  { code: 'CAD', name: '加元' },
  { code: 'JPY', name: '日元' }
];

const AlertHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: [moment().subtract(30, 'days'), moment()],
    currencyCode: null,
    alertType: null
  });
  const navigate = useNavigate();
  
  // 检查用户是否已登录
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    
    // 模拟加载提醒历史数据
    fetchAlertHistory();
  }, [navigate]);
  
  const fetchAlertHistory = async () => {
    try {
      setLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 使用模拟数据
      setHistory(MOCK_ALERT_HISTORY);
    } catch (error) {
      console.error('获取提醒历史数据失败:', error);
      message.error('获取提醒历史数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (values) => {
    setFilters({
      dateRange: values.dateRange,
      currencyCode: values.currencyCode,
      alertType: values.alertType
    });
    
    // 这里应该调用API获取过滤后的数据
    // 但现在我们只是模拟过滤本地数据
    setLoading(true);
    setTimeout(() => {
      let filteredData = [...MOCK_ALERT_HISTORY];
      
      if (values.currencyCode) {
        filteredData = filteredData.filter(item => item.currencyCode === values.currencyCode);
      }
      
      if (values.alertType) {
        filteredData = filteredData.filter(item => item.type === values.alertType);
      }
      
      if (values.dateRange && values.dateRange.length === 2) {
        const startDate = values.dateRange[0].startOf('day');
        const endDate = values.dateRange[1].endOf('day');
        
        filteredData = filteredData.filter(item => {
          const itemDate = moment(item.triggeredAt);
          return itemDate.isBetween(startDate, endDate, null, '[]');
        });
      }
      
      setHistory(filteredData);
      setLoading(false);
    }, 500);
  };
  
  const columns = [
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      sorter: (a, b) => moment(a.triggeredAt).unix() - moment(b.triggeredAt).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: '提醒名称',
      dataIndex: 'alertName',
      key: 'alertName',
      render: (text) => <span>{text}</span>
    },
    {
      title: '货币',
      dataIndex: 'currencyName',
      key: 'currencyName',
      render: (text, record) => (
        <span>{text} ({record.currencyCode})</span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Tag color={text === 'threshold' ? 'blue' : 'green'}>
          {text === 'threshold' ? '阈值提醒' : '趋势提醒'}
        </Tag>
      )
    },
    {
      title: '触发值',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: '提醒内容',
      dataIndex: 'message',
      key: 'message',
      responsive: ['md']
    }
  ];

  return (
    <div>
      <Title level={2}>提醒历史</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Form 
          layout="horizontal" 
          initialValues={filters}
          onFinish={handleSearch}
        >
          <Space wrap>
            <Form.Item 
              name="dateRange" 
              label="日期范围"
              style={{ marginBottom: 0 }}
            >
              <RangePicker />
            </Form.Item>
            
            <Form.Item 
              name="currencyCode" 
              label="货币类型"
              style={{ marginBottom: 0 }}
            >
              <Select 
                placeholder="选择货币" 
                allowClear
                style={{ width: 120 }}
              >
                {MOCK_CURRENCIES.map(currency => (
                  <Option key={currency.code} value={currency.code}>
                    {currency.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item 
              name="alertType" 
              label="提醒类型"
              style={{ marginBottom: 0 }}
            >
              <Select 
                placeholder="选择类型" 
                allowClear
                style={{ width: 120 }}
              >
                <Option value="threshold">阈值提醒</Option>
                <Option value="trend">趋势提醒</Option>
              </Select>
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={history} 
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '20px 0' }}>
              <BellOutlined style={{ fontSize: 24, marginBottom: 8 }} />
              <p>暂无提醒历史记录</p>
            </div>
          )
        }}
      />
    </div>
  );
};

export default AlertHistory;
