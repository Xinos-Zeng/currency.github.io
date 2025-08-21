import React from 'react';
import { Card, Statistic, Tooltip, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const CurrencyCard = ({ currency, isLoggedIn }) => {
  const { 
    code, 
    name, 
    rate, 
    change24h, 
    changePercentage 
  } = currency;
  
  const isPositive = change24h > 0;
  
  return (
    <Card 
      className="currency-card"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{code} - {name}</span>
          {isLoggedIn && (
            <Tooltip title="设置提醒">
              <Link to={`/alert-settings?currency=${code}`}>
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  size="small"
                />
              </Link>
            </Tooltip>
          )}
        </div>
      }
      hoverable
    >
      <Statistic
        value={rate}
        precision={4}
        valueStyle={{ fontWeight: 'bold' }}
        suffix="CNY"
      />
      <div style={{ marginTop: 16 }}>
        <Statistic
          title="24小时变化"
          value={change24h}
          precision={4}
          valueStyle={{ 
            color: isPositive ? '#52c41a' : '#f5222d',
            fontSize: '14px'
          }}
          prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          suffix={`(${changePercentage}%)`}
        />
      </div>
    </Card>
  );
};

export default CurrencyCard;
