import React from 'react';
import { Radio, Space } from 'antd';

// 主流留学国家货币列表
const CURRENCIES = [
  { code: 'USD', name: '美元' },
  { code: 'GBP', name: '英镑' },
  { code: 'EUR', name: '欧元' },
  { code: 'AUD', name: '澳元' },
  { code: 'CAD', name: '加元' },
  { code: 'JPY', name: '日元' }
];

const CurrencySelector = ({ selectedCurrency, onChange }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Radio.Group 
        value={selectedCurrency} 
        onChange={e => onChange(e.target.value)}
        buttonStyle="solid"
      >
        <Space wrap>
          {CURRENCIES.map(currency => (
            <Radio.Button key={currency.code} value={currency.code}>
              {currency.name} ({currency.code})
            </Radio.Button>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default CurrencySelector;
