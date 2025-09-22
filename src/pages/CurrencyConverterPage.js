import React from 'react';
import { Typography, Row, Col } from 'antd';
import CurrencyConverter from '../components/exchange/CurrencyConverter';

const { Title, Paragraph } = Typography;

const CurrencyConverterPage = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2}>汇率转换计算器</Title>
        <Paragraph>
          使用最新的汇率数据，进行人民币与外币之间的转换计算。支持买入外币和卖出外币两种模式。
        </Paragraph>
        <Paragraph>
          <b>注意：计算值仅供参考，不同银行的汇率值可能存在差异。</b>
        </Paragraph>
      </div>
      
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={14} xl={12}>
          <CurrencyConverter />
        </Col>
      </Row>
    </div>
  );
};

export default CurrencyConverterPage;
