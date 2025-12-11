import axios from 'axios';

import { base_url } from '../config'

// 1. 创建一个独立的 Axios 实例
const api = axios.create({
  baseURL: base_url, // 设定后端基础 URL
  timeout: 10000,
  // 可以在这里设置固定的、不依赖 Token 的全局头部
  headers: {
    'Content-Type': 'application/json',
  }
});

// 2. 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在这里获取动态 Token，通常从 Local Storage, Redux/Zustand Store 中获取
    const token = localStorage.getItem('token'); 

    if (token) {
      // 检查 Token 是否存在，如果存在则将其添加到请求头中
      config.headers.Authorization = `${token}`;
    }
    
    // 必须返回 config 对象
    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (response) => {
      // 正常响应，直接返回
      return response;
    },
    (error) => {
      // 检查错误响应的状态码
      const status = error.response ? error.response.status : null;
  
      if (status === 401 || status === 403) {
        console.log('认证失败或Token过期，正在跳转到登录页...');
        
        // 1. 清除本地存储中的无效 Token
        localStorage.removeItem('token'); 
        
        // 2. 执行重定向
        // 在拦截器（非 React 组件）中，最简单且可靠的跳转方式是使用原生的 window 对象
        window.location.href = '/login#login'; 
        
        // 3. 阻止错误继续传递到组件的 catch 块
        return new Promise(() => {}); // 返回一个永远不会被解决的 Promise
      }
      
      // 其他错误（如 404, 500 等）正常抛出
      return Promise.reject(error);
    }
  );

// 3. 导出这个实例供应用其他部分使用
export default api;