import React, { useState, useRef, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip,
  ReferenceArea
} from 'recharts';
import moment from 'moment';

const CurrencyRateChart = ({ data, currencyCode }) => {
  const [mousePosition, setMousePosition] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartRef = useRef(null);
  
  // 处理鼠标移动事件
  const handleMouseMove = useCallback((e) => {
    if (!e || !e.activeCoordinate) return;
    
    setMousePosition(e.activeCoordinate.y);
    
    // 找到最近的数据点
    if (e.activePayload && e.activePayload.length > 0) {
      const activePoint = e.activePayload[0].payload;
      
      // 检查rate字段是否存在
      if (activePoint && typeof activePoint.rate === 'number') {
        setHoveredPoint({
          x: e.activeCoordinate.x,
          y: e.activeCoordinate.y,
          value: activePoint.rate,
          date: activePoint.date
        });
      }
    }
  }, []);
  
  // 处理鼠标离开事件
  const handleMouseLeave = useCallback(() => {
    setMousePosition(null);
    setHoveredPoint(null);
  }, []);

  // 自定义工具提示组件
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <p className="label">{`日期: ${label}`}</p>
          <p className="value" style={{ color: '#1677ff' }}>
            {`${currencyCode} 汇率: ${payload[0].value.toFixed(4)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // 如果没有数据，返回空组件
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => moment(tick).format('MM-DD')}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#1677ff"
            strokeWidth={2}
            dot={false} // 移除普通数据点
            activeDot={{ r: 4, stroke: '#1677ff', strokeWidth: 2, fill: '#fff' }} // 减小激活点的大小
          />
          {mousePosition !== null && (
            <ReferenceLine y={mousePosition} stroke="#666" strokeDasharray="3 3" />
          )}
          
          {/* 显示悬停点的值 */}
          {hoveredPoint && (
            <ReferenceArea
              x1={hoveredPoint.x - 1}
              x2={hoveredPoint.x + 1}
              y1={hoveredPoint.y - 1}
              y2={hoveredPoint.y + 1}
              fillOpacity={0} // 透明填充
              strokeOpacity={0} // 透明边框
              label={{
                position: 'right',
                value: hoveredPoint.value.toFixed(4),
                fill: '#1677ff',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CurrencyRateChart;
