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
  Divider
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
            <Select placeholder="选择货币" loading={currencies.length === 0}>
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
              label="阈值"
              rules={[{ required: true, message: '请输入阈值' }]}
            >
              <InputNumber 
                placeholder="请输入阈值" 
                step={0.01} 
                style={{ width: '100%' }}
                formatter={value => `${value}`}
                parser={value => value.replace(/[^\d.-]/g, '')}
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
