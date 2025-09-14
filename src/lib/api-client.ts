import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token && config && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (basic)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // you can add refresh-token logic here if needed
    return Promise.reject(error);
  }
);

export default apiClient;
