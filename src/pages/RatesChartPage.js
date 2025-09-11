import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Select, Radio, Spin, Alert, 
  Empty 
} from 'antd';
import moment from 'moment';
import { currencyApi } from '../services/api';
import CurrencyRateChart from '../components/charts/CurrencyRateChart';

const { Title } = Typography;
const { Option } = Select;

const RatesChartPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [timeRange, setTimeRange] = useState(7);
  const [chartData, setChartData] = useState([]);

  // 获取所有支持的货币
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await currencyApi.getAllCurrencies();
        if (Array.isArray(data)) {
          setCurrencies(data);
        }
      } catch (err) {
        console.error('获取货币列表失败:', err);
        setError('获取货币列表失败，请稍后重试');
      }
    };

    fetchCurrencies();
  }, []);

  // 获取历史汇率数据
  useEffect(() => {
    const fetchHistoricalRates = async () => {
      if (!selectedCurrency) return;

      try {
        setLoading(true);
        setError(null);
        let responseData = await currencyApi.getHistoricalRates(selectedCurrency, timeRange);
        
        // 提取数据数组
        let dataArray = responseData;
        
        // 检查是否是嵌套对象
        if (typeof responseData === 'object' && responseData !== null && !Array.isArray(responseData)) {
          // 特别处理data_points属性，这是后端API返回的格式
          if (responseData.data_points && Array.isArray(responseData.data_points)) {
            dataArray = responseData.data_points;
          }
          // 其他可能的数据结构
          else if (responseData.data && Array.isArray(responseData.data)) {
            dataArray = responseData.data;
          } else if (responseData.rates && Array.isArray(responseData.rates)) {
            dataArray = responseData.rates;
          } else if (responseData.result && Array.isArray(responseData.result)) {
            dataArray = responseData.result;
          } else {
            // 尝试找到对象中的第一个数组属性
            for (const key in responseData) {
              if (Array.isArray(responseData[key]) && responseData[key].length > 0) {
                dataArray = responseData[key];
                break;
              }
            }
          }
        }
        
        if (Array.isArray(dataArray)) {
          // 处理数据，确保日期格式化并按日期排序
          let processedData = [];
          
          
          // 处理数据
          processedData = dataArray.map(item => {
            // 检查数据结构
            if (!item || typeof item !== 'object') {
              return null;
            }
            
            // 尝试找到汇率值 - 针对data_points数组中的数据结构
            let rateValue = null;
            
            // 检查常见的汇率字段
            if (item.rate !== undefined && item.rate !== null) {
              rateValue = Number(item.rate);
            } else if (item.value !== undefined && item.value !== null) {
              rateValue = Number(item.value);
            } else if (item.spot_buy !== undefined && item.spot_buy !== null) {
              rateValue = Number(item.spot_buy);
            } 
            // 特别处理data_points中可能的结构
            else if (item.exchange_rate !== undefined && item.exchange_rate !== null) {
              rateValue = Number(item.exchange_rate);
            }
            // 如果没有找到明确的字段，尝试遍历所有属性
            else {
              for (const key in item) {
                // 排除明显不是汇率的字段
                if (key !== 'id' && key !== 'date' && key !== 'timestamp' && 
                    !key.includes('_id') && !key.includes('_at') && 
                    !key.includes('time') && !key.includes('name') && 
                    !key.includes('code')) {
                  
                  const value = item[key];
                  if (typeof value === 'number' || 
                     (typeof value === 'string' && !isNaN(Number(value)))) {
                    rateValue = Number(value);
                    break;
                  }
                }
              }
            }
            
            // 尝试找到日期值
            let dateValue = null;
            if (item.date) {
              dateValue = item.date;
            } else if (item.timestamp) {
              dateValue = new Date(item.timestamp).toISOString().split('T')[0];
            } else if (item.created_at) {
              dateValue = new Date(item.created_at).toISOString().split('T')[0];
            } else if (item.update_time) {
              dateValue = new Date(item.update_time).toISOString().split('T')[0];
            }
            
            if (!dateValue) {
              return null;
            }
            
            // 构建处理后的数据项
            return {
              ...item,
              date: moment(dateValue).format('YYYY-MM-DD'),
              rate: rateValue
            };
          })
          .filter(item => {
            // 过滤无效数据
            return item && item.date && item.rate !== null && item.rate !== undefined && !isNaN(item.rate);
          })
          .sort((a, b) => moment(a.date).diff(moment(b.date))); // 按日期排序
          
          setChartData(processedData);
        } else {
          setChartData([]);
        }
      } catch (err) {
        setError('获取历史汇率数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalRates();
  }, [selectedCurrency, timeRange]);

  // 这部分逻辑已移至CurrencyRateChart组件中

  return (
    <div>
      <Title level={2}>汇率走势图</Title>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 8 }}>选择货币:</div>
            <Select
              style={{ width: '100%' }}
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              placeholder="选择货币"
              loading={currencies.length === 0}
            >
              {currencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 8 }}>时间范围:</div>
            <Radio.Group value={timeRange} onChange={e => setTimeRange(e.target.value)}>
              <Radio.Button value={7}>7天</Radio.Button>
              <Radio.Button value={14}>14天</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>

        <div style={{ height: 400, position: 'relative' }}>
          {loading ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : chartData && chartData.length > 0 ? (
            <>
              <CurrencyRateChart data={chartData} currencyCode={selectedCurrency} />
            </>
          ) : (
            <Empty 
              description={
                <div>
                  <p>暂无数据</p>
                  <small style={{ color: '#999' }}>
                    数据数组长度: {chartData ? chartData.length : '未定义'}
                  </small>
                </div>
              } 
              style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            />
          )}
        </div>
        
        <div style={{ marginTop: 16, textAlign: 'center', color: '#999' }}>
          <small>注：图表显示100单位人民币兑换外币的汇率，数据来源于中国银行</small>
        </div>
      </Card>
    </div>
  );
};

export default RatesChartPage;
