import React from 'react';
import { Layout, Typography, Divider } from 'antd';

const { Footer } = Layout;
const { Text, Link } = Typography;

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
      <Text>汇率小助手 &copy; {currentYear}</Text>
      <Divider type="vertical" />
      <Link href="https://www.waihui580.com/" target="_blank">数据来源: 外汇580</Link>
      <Divider type="vertical" />
      <Text>仅供学习交流使用</Text>
      <br />
      <Text>如有疑问，请联系xinos_zeng@163.com</Text>
    </Footer>
  );
};

export default AppFooter;
