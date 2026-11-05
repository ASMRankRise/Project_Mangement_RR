import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (
      error.response?.status === 401 &&
      !error.config._retry &&
      !error.config.url?.includes("/auth/refresh")
    ) {
      error.config._retry = true;

      await api.post("/auth/refresh");

      return api(error.config);
    }

    return Promise.reject(error);
  },
);

export default api;
