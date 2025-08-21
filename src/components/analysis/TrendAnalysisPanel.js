import React, { useState } from 'react';
import { Card, Radio, Space, Typography, Tag, Alert } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  FlagOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const TrendAnalysisPanel = ({ 
  currency, 
  trendData, 
  loading,
  onPeriodChange 
}) => {
  const [period, setPeriod] = useState(30);
  
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // 趋势判断逻辑
  const getTrendAnalysis = () => {
    if (!trendData || trendData.length === 0) {
      return [];
    }

    const analysis = [];
    
    // 连续上涨/下跌天数
    let consecutiveDays = 1;
    let currentTrend = null;
    
    for (let i = 1; i < trendData.length; i++) {
      const prevValue = trendData[i-1].value;
      const currValue = trendData[i].value;
      
      if (currValue > prevValue) {
        if (currentTrend === 'up') {
          consecutiveDays++;
        } else {
          currentTrend = 'up';
          consecutiveDays = 1;
        }
      } else if (currValue < prevValue) {
        if (currentTrend === 'down') {
          consecutiveDays++;
        } else {
          currentTrend = 'down';
          consecutiveDays = 1;
        }
      } else {
        // 值相等，重置计数
        currentTrend = null;
        consecutiveDays = 0;
      }
    }
    
    if (consecutiveDays >= 3 && currentTrend) {
      analysis.push({
        type: currentTrend === 'up' ? 'positive' : 'negative',
        icon: currentTrend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
        text: `连续${consecutiveDays}天${currentTrend === 'up' ? '上涨' : '下跌'}`
      });
    }
    
    // 计算距离高点/低点的百分比
    const currentValue = trendData[trendData.length - 1].value;
    const values = trendData.map(item => item.value);
    const highestValue = Math.max(...values);
    const lowestValue = Math.min(...values);
    
    const fromHighestPercent = ((highestValue - currentValue) / highestValue * 100).toFixed(2);
    const fromLowestPercent = ((currentValue - lowestValue) / lowestValue * 100).toFixed(2);
    
    if (fromHighestPercent > 3) {
      analysis.push({
        type: 'warning',
        icon: <WarningOutlined />,
        text: `较${period}天内高点下跌${fromHighestPercent}%`
      });
    }
    
    if (fromLowestPercent > 3) {
      analysis.push({
        type: 'positive',
        icon: <FlagOutlined />,
        text: `较${period}天内低点上涨${fromLowestPercent}%`
      });
    }
    
    return analysis;
  };
  
  const trendAnalysis = getTrendAnalysis();

  return (
    <Card 
      title="智能趋势分析" 
      loading={loading}
      extra={
        <Radio.Group value={period} onChange={handlePeriodChange}>
          <Radio.Button value={7}>7天</Radio.Button>
          <Radio.Button value={30}>30天</Radio.Button>
          <Radio.Button value={90}>90天</Radio.Button>
        </Radio.Group>
      }
    >
      <Title level={4}>{currency.name} ({currency.code}) 趋势分析</Title>
      
      {trendAnalysis.length > 0 ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          {trendAnalysis.map((item, index) => (
            <Alert
              key={index}
              message={
                <Space>
                  {item.icon}
                  <Text>{item.text}</Text>
                </Space>
              }
              type={
                item.type === 'positive' ? 'success' : 
                item.type === 'negative' ? 'error' : 'warning'
              }
              showIcon={false}
            />
          ))}
        </Space>
      ) : (
        <Text type="secondary">暂无明显趋势特征</Text>
      )}
      
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">关键节点：</Text>
        <div style={{ marginTop: 8 }}>
          <Space wrap>
            <Tag color="green">近期高点: {currency.highPoint} ({currency.highPointDate})</Tag>
            <Tag color="red">近期低点: {currency.lowPoint} ({currency.lowPointDate})</Tag>
            {currency.thresholdBreak && (
              <Tag color="orange">突破重要阈值: {currency.thresholdValue}</Tag>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default TrendAnalysisPanel;
