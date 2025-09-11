import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { currencyApi } from '../services/api';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [error, setError] = useState(null);

  // 计算汇率变化率，与scanner.py中的逻辑保持一致
  const calculateRateChange = (currentRate, previousRate) => {
    if (!previousRate || !currentRate) return null;
    
    // 按照scanner.py中的计算逻辑: (current_rate - previous_day_rate) / previous_day_rate * 100 * 100
    // 由于汇率是100元人民币兑换的外币数量，所以变化率需要乘以100来调整比例
    return (currentRate - previousRate) / previousRate * 100;
  };

  // 获取最新汇率数据和前一天汇率数据
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        
        // 获取最新汇率数据
        const latestData = await currencyApi.getRealTimeRates();
        
        // 获取前一天汇率数据，使用新的API
        let prevRatesMap = {};
        
        try {
          // 使用新的API获取前一天的汇率数据
          const prevData = await currencyApi.getPreviousDayRates();
          
          if (Array.isArray(prevData)) {
            // 将前一天汇率数据转换为Map格式，方便查询
            prevData.forEach(rate => {
              if (rate.code && rate.spot_buy) {
                prevRatesMap[rate.code] = rate.spot_buy;
              }
            });
          }
        } catch (prevErr) {
          console.error('获取前一天汇率数据失败:', prevErr);
          // 如果获取前一天数据失败，继续处理最新数据
        }
        
        // 处理最新汇率数据，计算变化率
        if (Array.isArray(latestData)) {
          const processedRates = latestData.map(rate => {
            const prevRate = prevRatesMap[rate.code];
            const change = calculateRateChange(rate.spot_buy, prevRate);
            
            return {
              ...rate,
              change: change !== null ? change : null
            };
          });
          
          setRates(processedRates);
        } else {
          setRates([]);
        }
        
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
        if (record.change === null || record.change === undefined) return '-';
        
        const isPositive = record.change > 0;
        const isNegative = record.change < 0;
        
        // 涨用红色，跌用绿色
        return (
          <span style={{ color: isPositive ? '#cf1322' : isNegative ? '#3f8600' : '#000000' }}>
            {isPositive ? <ArrowUpOutlined /> : isNegative ? <ArrowDownOutlined /> : null}
            {isPositive || isNegative ? Math.abs(record.change).toFixed(2) + '%' : '-'}
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
      <Title level={2}>汇率实时查询</Title>
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
                  valueStyle={{ 
                    color: currency.change > 0 ? '#cf1322' : 
                           currency.change < 0 ? '#3f8600' : 
                           '#000000' 
                  }}
                  suffix={
                    <span>
                      CNY
                      {currency.change !== null && (
                        <span style={{ 
                          marginLeft: 8, 
                          fontSize: '14px',
                          color: currency.change > 0 ? '#cf1322' : 
                                 currency.change < 0 ? '#3f8600' : 
                                 '#000000'
                        }}>
                          {currency.change > 0 ? <ArrowUpOutlined /> : 
                           currency.change < 0 ? <ArrowDownOutlined /> : null}
                          {currency.change !== null ? Math.abs(currency.change).toFixed(2) + '%' : ''}
                        </span>
                      )}
                    </span>
                  }
                />
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* 所有货币汇率表格 */}
      <Card 
        title="所有货币汇率(以100单位外币/人民币)"
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
