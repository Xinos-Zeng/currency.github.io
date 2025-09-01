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
    // 从localStorage获取token
    const userInfo = localStorage.getItem('userInfo');
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
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除用户信息并重定向到登录页
      localStorage.removeItem('userInfo');
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

export default api;
