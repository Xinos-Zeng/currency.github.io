import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

/**
 * 简单评论组件，替代 antd 的 Comment 组件
 */
const SimpleComment = ({ author, avatar, content, datetime, children }) => {
  return (
    <div className="simple-comment" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {avatar && <div style={{ marginRight: 12 }}>{avatar}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 4 }}>
            {author && <Text strong style={{ marginRight: 8 }}>{author}</Text>}
            {datetime && <Text type="secondary">{datetime}</Text>}
          </div>
          <div style={{ marginBottom: 8 }}>{content}</div>
          {children && <div style={{ marginLeft: 24 }}>{children}</div>}
        </div>
      </div>
    </div>
  );
};

export default SimpleComment;
