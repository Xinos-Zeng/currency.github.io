import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Radio, 
  InputNumber,
  Card,
  message
} from 'antd';

const { Option } = Select;

const AlertForm = ({ currencies, onSubmit, initialValues = {} }) => {
  const [form] = Form.useForm();
  const [alertType, setAlertType] = useState(initialValues.type || 'threshold');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 这里将调用后端API创建提醒
      // const response = await createAlert(values);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('提醒设置成功');
      onSubmit(values);
      
      // 如果是新建表单，则重置
      if (!initialValues.id) {
        form.resetFields();
      }
    } catch (error) {
      message.error('设置提醒失败，请重试');
      console.error('设置提醒失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={initialValues.id ? "编辑提醒" : "新增提醒"}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="currencyCode"
          label="货币类型"
          rules={[{ required: true, message: '请选择货币类型' }]}
        >
          <Select placeholder="请选择货币类型">
            {currencies.map(currency => (
              <Option key={currency.code} value={currency.code}>
                {currency.name} ({currency.code})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="type"
          label="提醒类型"
          rules={[{ required: true, message: '请选择提醒类型' }]}
        >
          <Radio.Group onChange={e => setAlertType(e.target.value)}>
            <Radio value="threshold">阈值提醒</Radio>
            <Radio value="trend">趋势提醒</Radio>
          </Radio.Group>
        </Form.Item>
        
        {alertType === 'threshold' && (
          <>
            <Form.Item
              name="condition"
              label="条件"
              rules={[{ required: true, message: '请选择条件' }]}
            >
              <Radio.Group>
                <Radio value="greater">大于等于</Radio>
                <Radio value="less">小于等于</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="value"
              label="汇率值"
              rules={[{ required: true, message: '请输入汇率值' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                precision={4} 
                placeholder="请输入汇率值"
                min={0}
              />
            </Form.Item>
          </>
        )}
        
        {alertType === 'trend' && (
          <Form.Item
            name="trendType"
            label="趋势类型"
            rules={[{ required: true, message: '请选择趋势类型' }]}
          >
            <Select placeholder="请选择趋势类型">
              <Option value="new_low_30d">创30天新低</Option>
              <Option value="new_high_30d">创30天新高</Option>
              <Option value="drop_1p">单日跌幅超1%</Option>
              <Option value="rise_1p">单日涨幅超1%</Option>
              <Option value="drop_3d">连续下跌3天</Option>
              <Option value="rise_3d">连续上涨3天</Option>
            </Select>
          </Form.Item>
        )}
        
        <Form.Item
          name="name"
          label="提醒名称"
          rules={[{ required: true, message: '请输入提醒名称' }]}
        >
          <Input placeholder="请输入提醒名称" />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            {initialValues.id ? '更新提醒' : '创建提醒'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AlertForm;
