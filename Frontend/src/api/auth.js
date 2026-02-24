import axios from "axios";

const API_BASE = "http://localhost:5500/api/auth";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED") {
      return Promise.reject({ success: false, message: "Request timed out. Please try again." });
    }

    if (!err.response) {
      return Promise.reject({ success: false, message: "Cannot reach server. Check backend/CORS and try again." });
    }

    return Promise.reject(err.response.data || { success: false, message: err.message });
  }
);

export const api = {
  post: async (path, body, config = {}) => {
    const res = await axiosInstance.post(path, body, config);
    return res.data;
  },
  get: async (path, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.get(path, { headers });
    return res.data;
  },
};
