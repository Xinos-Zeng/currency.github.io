import React, { useState, useEffect } from 'react';
import { Card, Radio, Input, Typography, Row, Col, Divider, Spin } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import CurrencySelector from './CurrencySelector';
import { currencyApi } from '../../services/api';

const { Title, Text } = Typography;

const CurrencyConverter = () => {
  // 状态管理
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [mode, setMode] = useState('buy'); // 'buy' 或 'sell'
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // 获取汇率数据
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await currencyApi.getRealTimeRates();
        
        // 处理API返回的数据结构
        if (Array.isArray(response)) {
          // 将数组转换为以货币代码为键的对象
          const ratesMap = {};
          response.forEach(item => {
            if (item.code) {
              ratesMap[item.code] = {
                buy: item.spot_buy,
                sell: item.spot_sell
              };
            }
          });
          setRates(ratesMap);
        } else if (response && response.rates) {
          // 如果API返回的是带rates属性的对象
          setRates(response.rates);
        } else {
          console.error('汇率数据格式不正确:', response);
        }
      } catch (error) {
        console.error('获取汇率数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // 当输入金额、选择币种或模式变化时，重新计算转换结果
  useEffect(() => {
    if (!rates || !amount) {
      setConvertedAmount('');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      setConvertedAmount('');
      return;
    }

    const currentRate = rates[selectedCurrency];
    if (!currentRate) {
      setConvertedAmount('');
      return;
    }

    // 买入：用户用人民币购买外币，使用现汇卖出价
    // 卖出：用户将外币卖给银行，使用现汇买入价
    if (mode === 'buy') {
      // 人民币转外币，使用现汇卖出价
      const sellRate = currentRate.sell;
      const result = numericAmount / sellRate * 100;
      setConvertedAmount(result.toFixed(2));
    } else {
      // 外币转人民币，使用现汇买入价
      const buyRate = currentRate.buy;
      const result = numericAmount * buyRate / 100;
      setConvertedAmount(result.toFixed(2));
    }
  }, [amount, selectedCurrency, mode, rates]);

  // 处理模式切换
  const handleModeChange = (e) => {
    setMode(e.target.value);
    setAmount('');
    setConvertedAmount('');
  };

  // 处理金额输入
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // 只允许输入数字和小数点
    if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
      setAmount(value);
    }
  };

  // 获取当前使用的汇率
  const getCurrentRate = () => {
    if (!rates || !rates[selectedCurrency]) return null;
    
    return mode === 'buy' 
      ? rates[selectedCurrency].sell  // 买入外币时使用现汇卖出价
      : rates[selectedCurrency].buy;  // 卖出外币时使用现汇买入价
  };

  // 获取汇率说明文本
  const getRateDescription = () => {
    if (!rates || !rates[selectedCurrency]) return '';
    
    return mode === 'buy' 
      ? `现汇卖出价: ${rates[selectedCurrency].sell}` 
      : `现汇买入价: ${rates[selectedCurrency].buy}`;
  };

  return (
    <Card title="汇率转换" bordered={false}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载汇率数据中..." />
        </div>
      ) : (
        <>
          {/* 币种选择 */}
          <CurrencySelector 
            selectedCurrency={selectedCurrency}
            onChange={setSelectedCurrency}
          />
          
          <Divider />
          
          {/* 转换模式选择 */}
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Radio.Group 
              value={mode}
              onChange={handleModeChange}
              buttonStyle="solid"
            >
              <Radio.Button value="buy">买入外币</Radio.Button>
              <Radio.Button value="sell">卖出外币</Radio.Button>
            </Radio.Group>
          </div>
          
          {/* 金额输入和转换结果 */}
          <Row gutter={16} align="middle" justify="center">
            <Col xs={24} sm={10}>
              <Input
                placeholder={mode === 'buy' ? "输入人民币金额" : `输入${selectedCurrency}金额`}
                value={amount}
                onChange={handleAmountChange}
                prefix={mode === 'buy' ? "¥" : selectedCurrency}
                suffix={mode === 'buy' ? "CNY" : ""}
                style={{ width: '100%' }}
                size="large"
              />
            </Col>
            
            <Col xs={24} sm={4} style={{ textAlign: 'center', margin: '8px 0' }}>
              <SwapOutlined style={{ fontSize: 24 }} />
            </Col>
            
            <Col xs={24} sm={10}>
              <Input
                value={convertedAmount}
                disabled
                prefix={mode === 'buy' ? selectedCurrency : "¥"}
                suffix={mode === 'buy' ? "" : "CNY"}
                style={{ width: '100%' }}
                size="large"
              />
            </Col>
          </Row>
          
          {/* 显示当前使用的汇率 */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="secondary">{getRateDescription()}</Text>
          </div>
        </>
      )}
    </Card>
  );
};

export default CurrencyConverter;
