import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Empty } from 'antd';
import CurrencySelector from '../components/exchange/CurrencySelector';
import CurrencyCard from '../components/exchange/CurrencyCard';
import CurrencyTrendChart from '../components/exchange/CurrencyTrendChart';

const { Title } = Typography;

// 模拟货币数据
const MOCK_CURRENCIES = [
  { 
    code: 'USD', 
    name: '美元', 
    rate: 7.1235, 
    change24h: -0.0245, 
    changePercentage: -0.34,
    highPoint: 7.2513,
    highPointDate: '2023-04-15',
    lowPoint: 7.0982,
    lowPointDate: '2023-04-28',
    thresholdBreak: true,
    thresholdValue: 7.15
  },
  { 
    code: 'GBP', 
    name: '英镑', 
    rate: 8.9856, 
    change24h: 0.0356, 
    changePercentage: 0.40,
    highPoint: 9.1253,
    highPointDate: '2023-04-10',
    lowPoint: 8.9125,
    lowPointDate: '2023-04-22',
    thresholdBreak: false
  },
  { 
    code: 'EUR', 
    name: '欧元', 
    rate: 7.7523, 
    change24h: 0.0125, 
    changePercentage: 0.16,
    highPoint: 7.8956,
    highPointDate: '2023-04-05',
    lowPoint: 7.7123,
    lowPointDate: '2023-04-18',
    thresholdBreak: false
  },
  { 
    code: 'AUD', 
    name: '澳元', 
    rate: 4.7856, 
    change24h: -0.0189, 
    changePercentage: -0.39,
    highPoint: 4.8523,
    highPointDate: '2023-04-12',
    lowPoint: 4.7125,
    lowPointDate: '2023-04-25',
    thresholdBreak: false
  },
  { 
    code: 'CAD', 
    name: '加元', 
    rate: 5.2345, 
    change24h: -0.0078, 
    changePercentage: -0.15,
    highPoint: 5.3125,
    highPointDate: '2023-04-08',
    lowPoint: 5.1982,
    lowPointDate: '2023-04-20',
    thresholdBreak: false
  },
  { 
    code: 'JPY', 
    name: '日元', 
    rate: 0.0478, 
    change24h: 0.0002, 
    changePercentage: 0.42,
    highPoint: 0.0485,
    highPointDate: '2023-04-18',
    lowPoint: 0.0472,
    lowPointDate: '2023-04-02',
    thresholdBreak: false
  }
];

// 生成模拟的30天趋势数据
const generateMockTrendData = (currency, days = 30) => {
  const data = [];
  const today = new Date();
  const baseValue = currency.rate;
  const volatility = 0.005; // 波动率
  
  // 添加关键点
  const keyPoints = [];
  
  // 生成每天的数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // 生成随机波动
    const randomChange = (Math.random() - 0.5) * volatility * baseValue;
    // 添加一些趋势性变化
    const trendChange = Math.sin(i / 5) * 0.002 * baseValue;
    
    const value = baseValue + randomChange + trendChange + (i * 0.0001 * baseValue);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(4))
    });
  }
  
  return {
    data,
    keyPoints
  };
};

const Dashboard = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 检查登录状态
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    setIsLoggedIn(!!userInfo);
  }, []);
  
  // 模拟加载货币数据
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 使用模拟数据
        setCurrencies(MOCK_CURRENCIES);
      } catch (error) {
        console.error('获取货币数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrencies();
  }, []);
  
  // 当选择的货币变化时，获取趋势数据
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currency = currencies.find(c => c.code === selectedCurrency);
        if (currency) {
          const { data } = generateMockTrendData(currency);
          setTrendData(data);
        }
      } catch (error) {
        console.error('获取趋势数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currencies.length > 0) {
      fetchTrendData();
    }
  }, [selectedCurrency, currencies]);
  
  // 获取当前选中的货币对象
  const currentCurrency = currencies.find(c => c.code === selectedCurrency) || {};

  return (
    <div>
      <Title level={2}>实时汇率看板</Title>
      
      <CurrencySelector 
        selectedCurrency={selectedCurrency} 
        onChange={setSelectedCurrency} 
      />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* 汇率卡片展示区 */}
          <Row gutter={[16, 16]}>
            {currencies.map(currency => (
              <Col xs={24} sm={12} md={8} lg={8} xl={4} key={currency.code}>
                <CurrencyCard 
                  currency={currency}
                  isLoggedIn={isLoggedIn}
                />
              </Col>
            ))}
          </Row>
          
          {/* 趋势图展示区 */}
          <div style={{ marginTop: 24 }}>
            {trendData.length > 0 ? (
              <CurrencyTrendChart 
                data={trendData}
                loading={loading}
                currency={currentCurrency}
              />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
