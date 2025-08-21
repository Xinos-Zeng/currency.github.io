import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', padding: '12px 50px' }}>
      汇率监控平台 ©{new Date().getFullYear()} 版权所有
    </Footer>
  );
};

export default AppFooter;
