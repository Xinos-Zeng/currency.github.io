# 汇率监控平台

基于React开发的汇率监控与智能提醒系统，支持实时汇率查看、趋势分析和智能提醒功能。

## 功能特点

### 1. 汇率信息展示模块
- **实时汇率看板**：支持查看主流留学国家货币（美元、英镑、欧元、澳元、加元、日元）的实时汇率、24小时变化幅度和30天变化趋势图
- **智能趋势分析**：支持自定义时间范围查询（7/30/90天），自动标识关键节点（近期高点/低点、突破重要阈值），提供简单趋势判断

### 2. 用户系统
- **注册登录**：支持用户注册、登录和个人信息管理
- **智能提醒订阅**：
  - 阈值提醒：设置具体汇率值触发提醒
  - 趋势提醒：系统预设条件提醒（如"创30天新低"、"单日跌幅超1%"）
  - 提醒管理：查看所有设置提醒的状态和历史触发记录

## 技术栈

- React 18
- React Router v6
- Ant Design 5
- Recharts (图表库)
- Axios (HTTP请求)

## 项目结构

```
src/
├── components/            # 组件
│   ├── exchange/          # 汇率相关组件
│   ├── analysis/          # 趋势分析组件
│   ├── user/              # 用户相关组件
│   └── layout/            # 布局组件
├── pages/                 # 页面
├── services/              # API服务
├── utils/                 # 工具函数
├── App.js                 # 应用入口
└── index.js               # 渲染入口
```

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm start

# 构建生产版本
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 部署步骤

1. 确保已安装gh-pages包：
```bash
npm install --save-dev gh-pages
```

2. 使用以下命令部署到GitHub Pages：
```bash
npm run deploy
```

3. 或者，推送代码到main分支，GitHub Actions会自动部署


## 后端API接口

API接口见`src/services/api.js`。