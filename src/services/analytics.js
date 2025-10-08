import { analyticsApi } from './api';

class AnalyticsSDK {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.pageStartTime = Date.now();
    this.isInitialized = false;
    this.eventQueue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5秒
    
    this.init();
  }

  // 获取或创建会话ID
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // 生成会话ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 初始化埋点SDK
  init() {
    if (this.isInitialized) return;
    
    // 记录页面访问
    this.trackPageView();
    
    // 设置页面卸载时的处理
    window.addEventListener('beforeunload', () => {
      this.trackPageView(true); // 记录页面离开
      this.endSession();
    });

    // 设置定期批量发送事件
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    this.isInitialized = true;
  }

  // 记录页面访问
  trackPageView(isPageLeave = false) {
    const pageUrl = window.location.href;
    const pageTitle = document.title;
    const referrer = document.referrer;
    const viewDuration = isPageLeave ? Math.floor((Date.now() - this.pageStartTime) / 1000) : null;

    this.sendEvent('page_view', {
      page_url: pageUrl,
      page_title: pageTitle,
      referrer: referrer,
      view_duration: viewDuration
    });

    if (!isPageLeave) {
      this.pageStartTime = Date.now();
    }
  }

  // 记录用户行为
  trackUserAction(actionName, eventData = {}) {
    this.sendEvent('user_action', {
      action_name: actionName,
      page_url: window.location.href,
      event_data: eventData
    });
  }

  // 记录错误
  trackError(errorName, errorMessage, errorData = {}) {
    this.sendEvent('error', {
      error_name: errorName,
      error_message: errorMessage,
      page_url: window.location.href,
      event_data: errorData
    });
  }

  // 发送事件到队列
  sendEvent(eventType, data) {
    const event = {
      type: eventType,
      data: data,
      timestamp: Date.now()
    };

    this.eventQueue.push(event);

    // 如果队列满了，立即发送
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // 批量发送事件
  async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // 根据事件类型发送到不同的API端点
      for (const event of events) {
        await this.sendEventToAPI(event);
      }
    } catch (error) {
      console.error('埋点事件发送失败:', error);
      // 发送失败的事件重新加入队列
      this.eventQueue.unshift(...events);
    }
  }

  // 发送单个事件到API
  async sendEventToAPI(event) {
    const headers = {
      'X-Session-ID': this.sessionId,
      'Content-Type': 'application/json'
    };

    switch (event.type) {
      case 'page_view':
        await analyticsApi.trackPageView(event.data, headers);
        break;
      case 'user_action':
        await analyticsApi.trackUserAction(event.data, headers);
        break;
      case 'error':
        await analyticsApi.trackError(event.data, headers);
        break;
      default:
        console.warn('未知的事件类型:', event.type);
    }
  }

  // 结束会话
  endSession() {
    try {
      analyticsApi.endSession({}, {
        'X-Session-ID': this.sessionId
      });
    } catch (error) {
      console.error('会话结束失败:', error);
    }
  }

  // 货币转换埋点
  trackCurrencyConversion(fromCurrency, toCurrency, amount) {
    this.trackUserAction('currency_conversion', {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount: amount
    });
  }

  // 提醒创建埋点
  trackAlertCreation(alertType, currencyCode) {
    this.trackUserAction('alert_created', {
      alert_type: alertType,
      currency_code: currencyCode
    });
  }

  // 提醒修改埋点
  trackAlertModification(alertId, alertType, currencyCode) {
    this.trackUserAction('alert_modified', {
      alert_id: alertId,
      alert_type: alertType,
      currency_code: currencyCode
    });
  }

  // 用户登录埋点
  trackUserLogin(username) {
    this.trackUserAction('user_login', {
      username: username
    });
  }

  // 用户注册埋点
  trackUserRegister(username) {
    this.trackUserAction('user_register', {
      username: username
    });
  }

  // 反馈提交埋点
  trackFeedbackSubmission() {
    this.trackUserAction('feedback_submitted');
  }
}

// 创建全局实例
const analytics = new AnalyticsSDK();

// 全局错误处理
window.addEventListener('error', (event) => {
  analytics.trackError('javascript_error', event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

// Promise rejection 错误处理
window.addEventListener('unhandledrejection', (event) => {
  analytics.trackError('promise_rejection', event.reason?.message || 'Unknown promise rejection', {
    reason: event.reason
  });
});

export default analytics;
