import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Card, List, Avatar, Form, Button, 
  Input, Pagination, Spin, message, Divider, Space 
} from 'antd';
import { UserOutlined, CommentOutlined, DeleteOutlined } from '@ant-design/icons';
import SimpleComment from '../components/common/SimpleComment';
import { feedbackApi } from '../services/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [replyVisible, setReplyVisible] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  
  // 获取当前用户信息
  useEffect(() => {
    const getUserInfo = () => {
      // 先从localStorage获取token（长期登录）
      let userInfo = localStorage.getItem('userInfo');
      
      // 如果localStorage中没有，再从sessionStorage获取（会话登录）
      if (!userInfo) {
        userInfo = sessionStorage.getItem('userInfo');
      }
      
      if (userInfo) {
        try {
          setCurrentUser(JSON.parse(userInfo));
        } catch (error) {
          console.error('解析用户信息失败:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    
    getUserInfo();
  }, []);

  // 获取反馈列表
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getFeedbacks({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize
      });
      
      if (response) {
        setFeedbacks(response.items || []);
        setTotal(response.total || 0);
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      message.error('获取反馈列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // 首次加载和页码变化时获取数据
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // 提交反馈
  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('请输入反馈内容');
      return;
    }

    try {
      setSubmitting(true);
      
      await feedbackApi.createFeedback(content);
      
      message.success('反馈提交成功');
      setContent('');
      
      // 刷新反馈列表
      fetchFeedbacks();
    } catch (error) {
      console.error('提交反馈失败:', error);
      message.error('提交反馈失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 提交回复
  const handleReply = async (feedbackId) => {
    const content = replyContent[feedbackId];
    
    if (!content || !content.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    try {
      setSubmitting(true);
      
      await feedbackApi.addReply(feedbackId, content);
      
      message.success('回复提交成功');
      
      // 清空回复内容并隐藏回复框
      setReplyContent(prev => ({ ...prev, [feedbackId]: '' }));
      setReplyVisible(prev => ({ ...prev, [feedbackId]: false }));
      
      // 刷新反馈列表
      fetchFeedbacks();
    } catch (error) {
      console.error('提交回复失败:', error);
      message.error('提交回复失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 显示回复框
  const showReplyBox = (feedbackId) => {
    setReplyVisible(prev => ({ ...prev, [feedbackId]: true }));
  };

  // 隐藏回复框
  const hideReplyBox = (feedbackId) => {
    setReplyVisible(prev => ({ ...prev, [feedbackId]: false }));
  };

  // 处理回复内容变化
  const handleReplyChange = (feedbackId, value) => {
    setReplyContent(prev => ({ ...prev, [feedbackId]: value }));
  };

  // 删除反馈
  const handleDeleteFeedback = async (feedbackId) => {
    try {
      setSubmitting(true);
      
      await feedbackApi.deleteFeedback(feedbackId);
      
      message.success('反馈删除成功');
      
      // 刷新反馈列表
      fetchFeedbacks();
    } catch (error) {
      console.error('删除反馈失败:', error);
      message.error('删除反馈失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除回复
  const handleDeleteReply = async (feedbackId, replyId) => {
    try {
      setSubmitting(true);
      
      await feedbackApi.deleteReply(feedbackId, replyId);
      
      message.success('回复删除成功');
      
      // 刷新反馈列表
      fetchFeedbacks();
    } catch (error) {
      console.error('删除回复失败:', error);
      message.error('删除回复失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 检查是否有删除权限
  const canDelete = (item) => {
    return currentUser && item.user_name === currentUser.username;
  };

  // 处理页码变化
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div>
      <Title level={2}>反馈建议</Title>
      <Paragraph>
        欢迎提供您的宝贵意见和建议，帮助我们改进服务。您的反馈将对所有用户可见。
      </Paragraph>

      {/* 提交反馈表单 */}
      <Card title="提交新反馈" style={{ marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item>
            <TextArea 
              rows={4} 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="请输入您的反馈内容..."
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={submitting}
              icon={<CommentOutlined />}
            >
              提交反馈
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 反馈列表 */}
      <Card title="反馈列表">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin tip="加载中..." />
          </div>
        ) : (
          <>
            <List
              itemLayout="vertical"
              dataSource={feedbacks}
              renderItem={feedback => (
                <List.Item key={feedback.id}>
                  <SimpleComment
                    author={feedback.user_name}
                    avatar={<Avatar icon={<UserOutlined />} />}
                    content={<p>{feedback.content}</p>}
                    datetime={
                      <span>
                        {formatDate(feedback.created_at)}
                        {canDelete(feedback) && (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small"
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            style={{ marginLeft: 8 }}
                          >
                            删除
                          </Button>
                        )}
                      </span>
                    }
                  />
                  
                  {/* 回复列表 */}
                  {feedback.replies && feedback.replies.length > 0 && (
                    <div style={{ marginLeft: 48, marginTop: 16 }}>
                      <List
                        itemLayout="vertical"
                        dataSource={feedback.replies}
                        renderItem={reply => (
                          <List.Item key={reply.id}>
                            <SimpleComment
                              author={reply.user_name}
                              avatar={<Avatar icon={<UserOutlined />} size="small" />}
                              content={<p>{reply.content}</p>}
                              datetime={
                                <span>
                                  {formatDate(reply.created_at)}
                                  {canDelete(reply) && (
                                    <Button 
                                      type="text" 
                                      danger 
                                      icon={<DeleteOutlined />} 
                                      size="small"
                                      onClick={() => handleDeleteReply(feedback.id, reply.id)}
                                      style={{ marginLeft: 8 }}
                                    >
                                      删除
                                    </Button>
                                  )}
                                </span>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                  
                  {/* 回复按钮和回复框 */}
                  <div style={{ marginLeft: 48, marginTop: 16 }}>
                    {!replyVisible[feedback.id] ? (
                      <Button 
                        type="link" 
                        onClick={() => showReplyBox(feedback.id)}
                        icon={<CommentOutlined />}
                      >
                        回复
                      </Button>
                    ) : (
                      <div>
                        <TextArea 
                          rows={2} 
                          value={replyContent[feedback.id] || ''}
                          onChange={e => handleReplyChange(feedback.id, e.target.value)}
                          placeholder="请输入回复内容..."
                          style={{ marginBottom: 8 }}
                        />
                        <Space>
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => handleReply(feedback.id)}
                            loading={submitting}
                          >
                            提交回复
                          </Button>
                          <Button 
                            size="small"
                            onClick={() => hideReplyBox(feedback.id)}
                          >
                            取消
                          </Button>
                        </Space>
                      </div>
                    )}
                  </div>
                  
                  <Divider />
                </List.Item>
              )}
              locale={{ emptyText: '暂无反馈' }}
            />
            
            {/* 分页 */}
            {total > 0 && (
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={total => `共 ${total} 条反馈`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default FeedbackPage;
