import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ToolOutlined } from '@ant-design/icons';

const UnderConstruction = () => {
  return (
    <Result
      icon={<ToolOutlined style={{ color: '#1890ff' }} />}
      title="页面正在开发中"
      subTitle="敬请期待"
      extra={
        <Link to="/">
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  );
};

export default UnderConstruction;
