import React, { useState, useEffect } from 'react';
import { Card, Select, Typography, Button, Spin, Divider, Row, Col, Image } from 'antd';
import { ArrowRightOutlined, SafetyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { currencyApi, thirdPartyApi } from '../services/api';
import qrCodeImage from '../assets/PandaQRCode.jpg';

const { Title, Text } = Typography;
const { Option } = Select;

const ExchangeServicePage = () => {
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [bankRate, setBankRate] = useState(null);
  const [ourRate, setOurRate] = useState(null);
  
  // 获取货币列表
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await currencyApi.getAllCurrencies();
        setCurrencies(response);
        setLoading(false);
      } catch (error) {
        console.error('获取货币列表失败:', error);
        setLoading(false);
      }
    };
    
    fetchCurrencies();
  }, []);
  
  // 获取汇率数据
  useEffect(() => {
    const fetchRates = async () => {
      if (!selectedCurrency) return;
      
      setLoading(true);
      try {
        // 获取银行汇率
        const bankRatesResponse = await currencyApi.getRealTimeRates();
        const selectedCurrencyData = bankRatesResponse.find(rate => rate.code === selectedCurrency);
        if (selectedCurrencyData) {
          // 计算100 CNY能换多少外币
          const bankRateValue = selectedCurrencyData.spot_sell;
          if (bankRateValue > 0) {
            // 转换为100人民币可以换多少外币
            setBankRate(((100 / bankRateValue * 100) - 0.1).toFixed(2));
          }
        }
        
        // 获取我们的汇率（通过第三方API）
        const ourRateResponse = await thirdPartyApi.getPandaRate(
          '1',
          'CNY',
          selectedCurrency
        );
        console.log(ourRateResponse);
        
        if (ourRateResponse && ourRateResponse.suc) {
          // 计算100 CNY能换多少外币
          const promotionalRate = ourRateResponse.model.promotionalRate;
          if (promotionalRate > 0) {
            setOurRate((promotionalRate * 100).toFixed(2));
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取汇率数据失败:', error);
        setLoading(false);
      }
    };
    
    fetchRates();
  }, [selectedCurrency]);
  
  // 处理货币选择变化
  const handleCurrencyChange = (value) => {
    setSelectedCurrency(value);
  };
  
  // 处理立即换汇按钮点击
  const handleExchangeClick = () => {
    // 这里可以添加跳转逻辑，例如打开新窗口或导航到指定URL
    window.open('https://p.pandaremit.com/h5ditui/launchIndex?invtCode=11860809&area=AUS&type=ditui', '_blank');
  };
  
  return (
    <div className="exchange-service-container">
      <Card
        title={<Title level={4}>换汇服务</Title>}
        bordered={false}
        style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}
      >
        <Spin spinning={loading}>
          <div style={{ marginBottom: 24 }}>
            <Text strong>选择币种：</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              placeholder="选择币种"
            >
              {currencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </Option>
              ))}
            </Select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text>银行汇率：100 CNY = {bankRate || '-'} {selectedCurrency}</Text>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ color: '#1890ff' }}>
              Panda汇率：100 CNY = {ourRate || '-'} {selectedCurrency}
            </Text>
          </div>
          
          <Divider />
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Image
              src={qrCodeImage}
              alt="换汇二维码"
              preview={false}
              style={{ maxWidth: '50%', height: 'auto' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">扫码立即换汇</Text>
            </div>
          </div>
          
          <Button
            type="primary"
            size="large"
            block
            icon={<ArrowRightOutlined />}
            onClick={handleExchangeClick}
          >
            立即换汇
          </Button>
          
          <Row justify="center" style={{ marginTop: 16 }}>
            <Col span={12} style={{ textAlign: 'center' }}>
              <SafetyOutlined style={{ marginRight: 4 }} />
              <Text type="secondary">持牌合规</Text>
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              <Text type="secondary">实时到账</Text>
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

export default ExchangeServicePage;
