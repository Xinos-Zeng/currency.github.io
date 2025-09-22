import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { currencyApi } from '../../services/api';

const { Option } = Select;

const CurrencySelector = ({ selectedCurrency, onChange }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取所有支持的货币
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const response = await currencyApi.getAllCurrencies();
        
        if (Array.isArray(response)) {
          setCurrencies(response);
        } else {
          // 如果API返回的不是数组，使用默认货币列表
          setCurrencies([
            { code: 'USD', name: '美元' },
            { code: 'GBP', name: '英镑' },
            { code: 'EUR', name: '欧元' },
            { code: 'AUD', name: '澳元' },
            { code: 'CAD', name: '加元' },
            { code: 'JPY', name: '日元' }
          ]);
        }
      } catch (error) {
        console.error('获取货币列表失败:', error);
        // 出错时使用默认货币列表
        setCurrencies([
          { code: 'USD', name: '美元' },
          { code: 'GBP', name: '英镑' },
          { code: 'EUR', name: '欧元' },
          { code: 'AUD', name: '澳元' },
          { code: 'CAD', name: '加元' },
          { code: 'JPY', name: '日元' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleChange = (value) => {
    onChange(value);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {loading ? (
        <Spin size="small" />
      ) : (
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="选择货币"
          optionFilterProp="children"
          onChange={handleChange}
          value={selectedCurrency}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {currencies.map(currency => (
            <Option key={currency.code} value={currency.code}>
              {currency.name} ({currency.code})
            </Option>
          ))}
        </Select>
      )}
    </div>
  );
};

export default CurrencySelector;