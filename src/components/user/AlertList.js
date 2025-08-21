import React from 'react';
import { 
  List, 
  Card, 
  Tag, 
  Button, 
  Popconfirm, 
  Space, 
  Typography,
  Badge
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const AlertList = ({ alerts, onEdit, onDelete, onToggleActive }) => {
  // 格式化提醒条件
  const formatAlertCondition = (alert) => {
    if (alert.type === 'threshold') {
      const condition = alert.condition === 'greater' ? '大于等于' : '小于等于';
      return `${alert.currencyName} ${condition} ${alert.value} CNY`;
    } else if (alert.type === 'trend') {
      const trendTypes = {
        'new_low_30d': '创30天新低',
        'new_high_30d': '创30天新高',
        'drop_1p': '单日跌幅超1%',
        'rise_1p': '单日涨幅超1%',
        'drop_3d': '连续下跌3天',
        'rise_3d': '连续上涨3天'
      };
      return `${alert.currencyName} ${trendTypes[alert.trendType] || ''}`;
    }
    return '';
  };

  return (
    <Card title="我的提醒" className="alert-list-card">
      <List
        itemLayout="horizontal"
        dataSource={alerts}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                icon={<EditOutlined />} 
                size="small" 
                onClick={() => onEdit(item)}
              >
                编辑
              </Button>,
              <Popconfirm
                title="确定要删除这个提醒吗？"
                onConfirm={() => onDelete(item.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small"
                  danger
                >
                  删除
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge 
                  status={item.active ? "success" : "default"} 
                  offset={[0, 24]}
                >
                  <BellOutlined style={{ fontSize: 24 }} />
                </Badge>
              }
              title={
                <Space>
                  <Text strong>{item.name}</Text>
                  <Tag color={item.type === 'threshold' ? 'blue' : 'green'}>
                    {item.type === 'threshold' ? '阈值提醒' : '趋势提醒'}
                  </Tag>
                  {item.triggered && (
                    <Tag color="red" icon={<BellOutlined />}>已触发</Tag>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text>{formatAlertCondition(item)}</Text>
                  <Space size="small">
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => onToggleActive(item.id, !item.active)}
                      icon={item.active ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                      style={{ padding: 0 }}
                    >
                      {item.active ? '暂停提醒' : '启用提醒'}
                    </Button>
                    {item.lastTriggered && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        上次触发: {item.lastTriggered}
                      </Text>
                    )}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default AlertList;
