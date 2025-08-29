import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { currencyApi } from '../services/api';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [error, setError] = useState(null);

  // 获取最新汇率数据
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const data = await currencyApi.getRealTimeRates();
        // 确保返回的数据是数组
        setRates(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('获取汇率数据失败:', err);
        setError('获取汇率数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '货币代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '货币名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '现汇买入价',
      dataIndex: 'spot_buy',
      key: 'spot_buy',
      render: (text) => text || '-',
    },
    {
      title: '现钞买入价',
      dataIndex: 'cash_buy',
      key: 'cash_buy',
      render: (text) => text || '-',
    },
    {
      title: '现汇卖出价',
      dataIndex: 'spot_sell',
      key: 'spot_sell',
      render: (text) => text || '-',
    },
    {
      title: '现钞卖出价',
      dataIndex: 'cash_sell',
      key: 'cash_sell',
      render: (text) => text || '-',
    },
    {
      title: '中行折算价',
      dataIndex: 'boc_conversion',
      key: 'boc_conversion',
      render: (text) => text || '-',
    },
    {
      title: '涨跌',
      key: 'change',
      render: (_, record) => {
        if (!record.change) return '-';
        const isPositive = record.change > 0;
        return (
          <span style={{ color: isPositive ? '#3f8600' : '#cf1322' }}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(record.change).toFixed(4)}
          </span>
        );
      },
    },
  ];

  // 获取主要货币的汇率数据用于展示
  const getMainCurrencies = () => {
    if (!Array.isArray(rates) || !rates.length) return [];
    return ['USD', 'EUR', 'JPY', 'GBP']
      .map((code) => rates.find((rate) => rate && rate.code === code))
      .filter(Boolean);
  };

  const mainCurrencies = getMainCurrencies();

  return (
    <div>
      <Title level={2}>外汇汇率实时查询</Title>
      <Paragraph>
        提供人民币兑主要外币的实时汇率查询、历史走势分析和汇率提醒服务。
      </Paragraph>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {/* 主要货币汇率卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {loading ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '30px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          mainCurrencies.map((currency) => (
            <Col xs={24} sm={12} md={6} key={currency.code}>
              <Card>
                <Statistic
                  title={`${currency.name} (${currency.code})`}
                  value={currency.spot_buy}
                  precision={4}
                  valueStyle={{ color: '#3f8600' }}
                  suffix="CNY"
                />
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* 所有货币汇率表格 */}
      <Card 
        title="所有货币汇率"
        extra={
          Array.isArray(rates) && rates.length > 0 && rates[0].update_time ? 
          <span>更新时间: {new Date(rates[0].update_time).toLocaleString('zh-CN')}</span> : 
          null
        }
      >
        <Table
          columns={columns}
          dataSource={Array.isArray(rates) ? rates.map((rate) => ({ ...rate, key: rate.code })) : []}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default HomePage;
