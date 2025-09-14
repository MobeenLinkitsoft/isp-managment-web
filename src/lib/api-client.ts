import axios from 'axios';
import { getAccessToken } from './storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_UR2L || 'http://52.3.153.225:1337';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getRefreshToken = () =>{

}

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // try {
      //   const refreshToken = getRefreshToken();
      //   if (refreshToken) {
      //     const response = await axios.post(`${BASE_URL}user/refresh`, { 
      //       token: refreshToken 
      //     });
          
      //     const newAccessToken = response.data.accessToken;
      //     setAccessToken(newAccessToken);
          
      //     originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      //     return apiClient(originalRequest);
      //   }
      // } catch (refreshError) {
      //   console.error('Failed to refresh token:', refreshError);
      //   logout();
      // }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;