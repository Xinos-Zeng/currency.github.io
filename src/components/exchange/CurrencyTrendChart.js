import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, Spin } from 'antd';
import moment from 'moment';

const CurrencyTrendChart = ({ 
  data, 
  loading, 
  currency, 
  period = 30,
  keyPoints = [] // 关键点数据，包含高点和低点
}) => {
  if (loading) {
    return (
      <Card className="chart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin tip="加载中..." />
      </Card>
    );
  }

  // 计算最大最小值，用于Y轴范围
  const values = data.map(item => item.value);
  const minValue = Math.min(...values) * 0.998; // 稍微扩展范围以便更好地显示
  const maxValue = Math.max(...values) * 1.002;

  // 格式化提示框内容
  const renderTooltip = (props) => {
    const { payload, label } = props;
    if (payload && payload.length > 0) {
      return (
        <div style={{ 
          background: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
        }}>
          <p>{`日期: ${label}`}</p>
          <p style={{ color: '#1890ff' }}>{`${currency.name}: ${payload[0].value.toFixed(4)} CNY`}</p>
        </div>
      );
    }
    return null;
  };

  // 格式化X轴标签
  const formatXAxis = (tickItem) => {
    return moment(tickItem).format('MM-DD');
  };

  return (
    <Card title={`${currency.name} 30天走势图`} className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis} 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[minValue, maxValue]} 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <Tooltip content={renderTooltip} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#1890ff" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* 渲染关键点 */}
          {keyPoints.map((point, index) => (
            <ReferenceLine 
              key={`point-${index}`}
              x={point.date} 
              stroke={point.type === 'high' ? '#52c41a' : '#f5222d'}
              strokeDasharray="3 3"
              label={{ 
                value: point.type === 'high' ? '高点' : '低点', 
                position: 'top',
                fill: point.type === 'high' ? '#52c41a' : '#f5222d',
                fontSize: 12
              }}
            />
          ))}
          
          {/* 如果有突破阈值的区域，可以用ReferenceArea标记 */}
          {/* 示例：
          <ReferenceArea 
            x1="2023-04-01" 
            x2="2023-04-05" 
            fill="#f5222d" 
            fillOpacity={0.1} 
          />
          */}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default CurrencyTrendChart;
