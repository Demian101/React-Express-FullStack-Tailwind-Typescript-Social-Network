import { logoutUser } from '@redux/slices/userSlice';
import { store } from '@redux/store';
import axios, { AxiosRequestConfig } from 'axios';

// console.log("fetchUsers process.env.REACT_APP_API_URL", process.env.REACT_APP_API_URL);
export const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // REACT_APP_API_URL=http://localhost:8080
})

export const AxiosAPI = axios.create({})

/* 请求拦截器 - 在发送请求之前做些什么 (这里是对每个请求都加上 Authorization 身份认证)  */
AxiosAPI.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = store.getState().user.currentUser.accessToken;
    config.headers =  {
      Authorization: `Bearer ${token}`,
    }
    return config
  },
  error => {
  });

/* 响应拦截器 - 对响应数据做一些事情
 *  logoutUser() : localStorage.removeItem('userDetails');
 *   - 401 说明身份认证失败, 清除 localStorage 中的 userDetails
 */
AxiosAPI.interceptors.response.use(
  response => response,
  async(error) => {
    if (error?.response?.status === 401) {  // 401 Unauthorized - 身份认证失败
      store.dispatch(logoutUser());
    }
  }
);

// const refreshToken = async () => {
//   try {
//     const token =  store.getState().user.currentUser.refreshToken;

//     const {data}:any =  await client.post("/auth/refresh", { token: token });
//     return data
//   } catch (err) {
//   }
// };