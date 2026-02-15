import axios from 'axios';

// 创建axios实例
const api = axios.create({
  // 后端API地址 - 直接读取环境变量，如果不存在则使用默认值
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 先从localStorage获取token（长期登录）
    let userInfo = localStorage.getItem('userInfo');
    
    // 如果localStorage中没有，再从sessionStorage获取（会话登录）
    if (!userInfo) {
      userInfo = sessionStorage.getItem('userInfo');
    }
    
    if (userInfo) {
      try {
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo.token) {
          // 按照后端要求的格式添加Authorization头
          config.headers['Authorization'] = `Bearer ${parsedInfo.token}`;
        }
      } catch (error) {
        console.error('解析用户信息失败:', error);
        // 清除无效的用户信息
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
      }
    }
    
    // 添加Ngrok跳过警告的头部
    // 这个头部告诉Ngrok跳过中间警告页面
    config.headers['Ngrok-Skip-Browser-Warning'] = 'true';
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 检查是否是Ngrok中间页面
    if (typeof response.data === 'string' && 
        (response.data.includes('You are about to visit') || 
         response.data.includes('ngrok.com') || 
         response.data.includes('ERR_NGROK_6024'))) {
      
      console.log('检测到Ngrok中间页面，尝试自动处理...');
      
      // 从响应中提取实际的API URL
      const match = response.data.match(/visit\s+([^,]+)/);
      const ngrokUrl = match ? match[1] : null;
      
      if (ngrokUrl) {
        console.log(`提取到Ngrok URL: ${ngrokUrl}`);
        
        // 创建一个新的请求，绕过Ngrok中间页面
        // 这里我们使用fetch API直接请求，并设置特殊头部
        return fetch(response.config.url, {
          method: response.config.method,
          headers: {
            ...response.config.headers,
            'Ngrok-Skip-Browser-Warning': 'true'  // 这个头部告诉Ngrok跳过警告
          },
          body: response.config.data
        })
        .then(res => res.json())
        .catch(err => {
          console.error('绕过Ngrok中间页面失败:', err);
          throw err;
        });
      }
      
      // 如果无法提取URL，返回原始响应
      return response.data;
    }
    
    // 正常响应
    return response.data;
  },
  error => {
    // 检查错误是否包含Ngrok中间页面
    if (error.response && 
        typeof error.response.data === 'string' && 
        (error.response.data.includes('You are about to visit') || 
         error.response.data.includes('ngrok.com') || 
         error.response.data.includes('ERR_NGROK_6024'))) {
      
      console.log('错误中检测到Ngrok中间页面，尝试自动处理...');
      
      // 重新发送请求，添加特殊头部
      return axios({
        ...error.config,
        headers: {
          ...error.config.headers,
          'Ngrok-Skip-Browser-Warning': 'true'  // 这个头部告诉Ngrok跳过警告
        }
      })
      .then(response => response.data)
      .catch(err => {
        console.error('绕过Ngrok中间页面失败:', err);
        throw err;
      });
    }
    
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除用户信息（同时清除localStorage和sessionStorage）
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('userInfo');
      
      // 获取当前路径，以便登录后可以重定向回来
      const currentPath = window.location.pathname;
      
      // 将当前路径存储到sessionStorage，但不存储登录和注册页面
      if (currentPath !== '/login' && currentPath !== '/register') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      // 重定向到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 汇率相关API
export const currencyApi = {
  // 获取所有支持的货币
  getAllCurrencies: () => {
    return api.get('/currencies');
  },
  
  // 获取实时汇率
  getRealTimeRates: () => {
    return api.get('/rates/latest');
  },
  
  // 获取前一天的汇率数据
  getPreviousDayRates: () => {
    return api.get('/rates/previous-day');
  },
  
  // 获取指定货币的历史汇率数据
  getHistoricalRates: (currencyCode, days) => {
    return api.get(`/rates/historical/${currencyCode}`, {
      params: { days }
    });
  },
  
  // 获取趋势分析数据
  getTrendAnalysis: (currencyCode, days) => {
    return api.get(`/analysis/trend/${currencyCode}`, {
      params: { days }
    });
  }
};

// 用户相关API
export const userApi = {
  // 用户注册
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  
  // 用户登录
  login: (username, password) => {
    return api.post('/auth/login', { username, password });
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return api.get('/user/profile');
  },
  
  // 更新用户信息
  updateUserInfo: (userData) => {
    return api.put('/user/profile', userData);
  },
  
  // 修改密码
  changePassword: (oldPassword, newPassword) => {
    return api.put('/user/password', { 
      old_password: oldPassword, 
      new_password: newPassword 
    });
  }
};

// 提醒相关API
export const alertApi = {
  // 获取用户所有提醒
  getUserAlerts: () => {
    return api.get('/alerts');
  },
  
  // 获取单个提醒详情
  getAlert: (alertId) => {
    return api.get(`/alerts/${alertId}`);
  },
  
  // 创建新提醒
  createAlert: (alertData) => {
    return api.post('/alerts', alertData);
  },
  
  // 更新提醒
  updateAlert: (alertId, alertData) => {
    return api.put(`/alerts/${alertId}`, alertData);
  },
  
  // 删除提醒
  deleteAlert: (alertId) => {
    return api.delete(`/alerts/${alertId}`);
  },
  
  // 更新提醒状态（启用/禁用）
  updateAlertStatus: (alertId, active) => {
    return api.patch(`/alerts/${alertId}/status`, { active });
  },
  
  // 获取提醒历史记录
  getAlertHistory: (params) => {
    return api.get('/alerts/history', { params });
  }
};

// 反馈相关API
export const feedbackApi = {
  // 获取反馈列表
  getFeedbacks: (params) => {
    return api.get('/feedback', { params });
  },
  
  // 获取单个反馈详情
  getFeedback: (feedbackId) => {
    return api.get(`/feedback/${feedbackId}`);
  },
  
  // 创建新反馈
  createFeedback: (content) => {
    return api.post('/feedback', { content });
  },
  
  // 添加回复
  addReply: (feedbackId, content) => {
    return api.post(`/feedback/${feedbackId}/reply`, { content });
  },
  
  // 删除反馈
  deleteFeedback: (feedbackId) => {
    return api.delete(`/feedback/${feedbackId}`);
  },
  
  // 删除回复
  deleteReply: (feedbackId, replyId) => {
    return api.delete(`/feedback/${feedbackId}/reply/${replyId}`);
  }
};

// 埋点相关API
export const analyticsApi = {
  // 记录页面访问
  trackPageView: (data, headers = {}) => {
    return api.post('/analytics/track/page-view', data, { headers });
  },
  
  // 记录用户行为
  trackUserAction: (data, headers = {}) => {
    return api.post('/analytics/track/user-action', data, { headers });
  },
  
  // 记录错误
  trackError: (data, headers = {}) => {
    return api.post('/analytics/track/error', data, { headers });
  },
  
  // 结束会话
  endSession: (data = {}, headers = {}) => {
    return api.post('/analytics/session/end', data, { headers });
  }
};

// 第三方汇率服务API
export const thirdPartyApi = {
  // 获取Panda汇率
  getPandaRate: (amount, sourceCurrency, targetCurrency) => {
    return api.post('/third-party/panda/rate', {
      amount,
      sourceCurrency,
      targetCurrency
    });
  }
};

export default api;
