import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  InputNumber, 
  Switch, 
  message,
  Space,
  Divider,
  Tooltip
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { alertApi, currencyApi } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const CreateAlertPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [alertType, setAlertType] = useState('threshold');
  const [currentRate, setCurrentRate] = useState(null);
  const [fetchingRate, setFetchingRate] = useState(false);
  const navigate = useNavigate();

  // 获取可用货币列表
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await currencyApi.getAllCurrencies();
        setCurrencies(data);
      } catch (error) {
        console.error('获取货币列表失败:', error);
        message.error('获取货币列表失败，请稍后重试');
      }
    };

    fetchCurrencies();
  }, []);
  
  // 获取当前货币的现汇卖出价
  const fetchCurrentRate = async (currencyCode) => {
    if (!currencyCode || alertType !== 'threshold') return;
    
    try {
      setFetchingRate(true);
      const ratesData = await currencyApi.getRealTimeRates();
      
      // 调试输出API返回的数据结构
      console.log('API返回的汇率数据:', JSON.stringify(ratesData, null, 2));
      
      // 查找选中货币的汇率数据
      let currencyRate;
      let cashSellingRate = null;
      
      // 检查返回的数据结构
      if (Array.isArray(ratesData)) {
        // 如果是数组，使用code字段查找货币
        currencyRate = ratesData.find(rate => rate.code === currencyCode);
        if (currencyRate) {
          cashSellingRate = currencyRate.cash_sell; // 使用cash_sell字段
        }
      } else if (typeof ratesData === 'object') {
        // 如果是对象，可能有不同的结构
        console.log('尝试从对象中获取汇率数据');
        
        // 可能的情况1：对象中有rates数组
        if (ratesData.rates && Array.isArray(ratesData.rates)) {
          currencyRate = ratesData.rates.find(rate => rate.code === currencyCode || rate.currency_code === currencyCode);
          if (currencyRate) {
            cashSellingRate = currencyRate.cash_sell || currencyRate.cash_selling_rate;
          }
        } 
        // 可能的情况2：对象中直接包含货币代码作为键
        else if (ratesData[currencyCode]) {
          currencyRate = ratesData[currencyCode];
          cashSellingRate = currencyRate.cash_sell || currencyRate.cash_selling_rate;
        }
        // 可能的情况3：对象中有data字段
        else if (ratesData.data) {
          if (Array.isArray(ratesData.data)) {
            currencyRate = ratesData.data.find(rate => rate.code === currencyCode || rate.currency_code === currencyCode);
            if (currencyRate) {
              cashSellingRate = currencyRate.cash_sell || currencyRate.cash_selling_rate;
            }
          } else if (ratesData.data[currencyCode]) {
            currencyRate = ratesData.data[currencyCode];
            cashSellingRate = currencyRate.cash_sell || currencyRate.cash_selling_rate;
          }
        }
      }
      
      console.log('找到的货币汇率数据:', currencyRate);
      console.log('现汇卖出价:', cashSellingRate);
      
      if (cashSellingRate !== null) {
        setCurrentRate(cashSellingRate);
        // 始终更新阈值为当前汇率
        form.setFieldsValue({ thresholdValue: cashSellingRate });
        // 显示成功消息
        message.success(`已获取${currencyCode}当前汇率`);
      } else {
        setCurrentRate(null);
        message.warning(`未找到${currencyCode}的现汇卖出价数据`);
      }
    } catch (error) {
      console.error('获取当前汇率失败:', error);
      message.error('获取当前汇率失败，请稍后重试');
      setCurrentRate(null);
    } finally {
      setFetchingRate(false);
    }
  };

  // 处理提交
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 构建提醒数据
      const alertData = {
        name: values.name,
        condition: {
          type: values.alertType,
          currency_code: values.currencyCode,
          threshold_value: values.alertType === 'threshold' ? values.thresholdValue : null,
          change_percentage: values.alertType === 'change' ? values.changePercentage : null,
          time_frequency: values.alertType === 'time' ? values.timeFrequency : null
        },
        notification_method: values.notificationMethod,
        active: values.active
      };
      
      await alertApi.createAlert(alertData);
      message.success('提醒创建成功');
      navigate('/alerts');
    } catch (error) {
      console.error('创建提醒失败:', error);
      if (error.response && error.response.data) {
        message.error(`创建提醒失败: ${error.response.data.detail || '请稍后重试'}`);
      } else {
        message.error('创建提醒失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理提醒类型变化
  const handleAlertTypeChange = (value) => {
    setAlertType(value);
    
    // 重置相关字段
    form.setFieldsValue({
      thresholdValue: undefined,
      changePercentage: undefined,
      timeFrequency: undefined
    });
    
    // 如果切换到阈值提醒，且已选择货币，则获取当前汇率
    if (value === 'threshold') {
      const currencyCode = form.getFieldValue('currencyCode');
      if (currencyCode) {
        fetchCurrentRate(currencyCode);
      }
    } else {
      // 如果不是阈值提醒，清除当前汇率
      setCurrentRate(null);
    }
  };
  
  // 处理货币选择变化
  const handleCurrencyChange = (value) => {
    // 如果是阈值提醒，则获取当前汇率
    if (alertType === 'threshold' && value) {
      // 清除当前阈值，以便切换货币时能够更新
      setCurrentRate(null);
      fetchCurrentRate(value);
    }
  };

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
          <BellOutlined style={{ marginRight: 8 }} />
          创建汇率提醒
        </Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            alertType: 'threshold',
            notificationMethod: 'email',
            active: true
          }}
        >
          <Form.Item
            name="name"
            label="提醒名称"
            rules={[{ required: true, message: '请输入提醒名称' }]}
          >
            <Input placeholder="请输入提醒名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="currencyCode"
            label="货币"
            rules={[{ required: true, message: '请选择货币' }]}
          >
            <Select 
              placeholder="选择货币" 
              loading={currencies.length === 0}
              onChange={handleCurrencyChange}
            >
              {currencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="alertType"
            label="提醒类型"
            rules={[{ required: true, message: '请选择提醒类型' }]}
          >
            <Select onChange={handleAlertTypeChange}>
              <Option value="threshold">阈值提醒</Option>
              <Option value="change">变化率提醒</Option>
              <Option value="time">定时提醒</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">提醒条件</Divider>

          {alertType === 'threshold' && (
            <Form.Item
              name="thresholdValue"
              label={
                <span>
                  阈值
                  {fetchingRate && <span style={{ marginLeft: 8, fontSize: 12, color: '#1890ff' }}>获取中...</span>}
                  {currentRate !== null && !fetchingRate && (
                    <Tooltip title="当前货币的现汇卖出价">
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#52c41a', fontWeight: 'bold' }}>
                        (当前汇率: {currentRate})
                      </span>
                    </Tooltip>
                  )}
                </span>
              }
              rules={[{ required: true, message: '请输入阈值' }]}
            >
              <InputNumber 
                placeholder={currentRate !== null ? `当前汇率为 ${currentRate}` : "请输入阈值"} 
                step={0.01} 
                style={{ width: '100%' }}
                formatter={value => `${value}`}
                parser={value => value.replace(/[^\d.-]/g, '')}
                addonAfter={currentRate !== null ? 
                  <Button type="link" size="small" onClick={() => form.setFieldsValue({ thresholdValue: currentRate })}>
                    使用当前汇率
                  </Button> : null
                }
              />
            </Form.Item>
          )}

          {alertType === 'change' && (
            <Form.Item
              name="changePercentage"
              label="变化百分比"
              rules={[{ required: true, message: '请输入变化百分比' }]}
            >
              <InputNumber 
                placeholder="请输入变化百分比" 
                step={0.1} 
                style={{ width: '100%' }}
                formatter={value => `${value}%`}
                parser={value => value.replace(/[^\d.-]/g, '')}
              />
            </Form.Item>
          )}

          {alertType === 'time' && (
            <Form.Item
              name="timeFrequency"
              label="时间频率"
              rules={[{ required: true, message: '请选择时间频率' }]}
            >
              <Select placeholder="请选择时间频率">
                <Option value="daily">每日</Option>
                <Option value="weekly">每周</Option>
                <Option value="monthly">每月</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="notificationMethod"
            label="通知方式"
            rules={[{ required: true, message: '请选择通知方式' }]}
          >
            <Select>
              <Option value="email">邮件</Option>
              <Option value="sms" disabled>短信（暂不支持）</Option>
              <Option value="push" disabled>应用推送（暂不支持）</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="active"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存
              </Button>
              <Button onClick={() => navigate('/alerts')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateAlertPage;
