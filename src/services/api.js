import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api` || "http://localhost:8001/api",
    withCredentials: true, // Important for Cookies
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // specific check for 401 and avoid infinite loops
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/admin-login" // Don't refresh on login failure
        ) {
            originalRequest._retry = true;

            try {
                // Attempt Refresh
                const { data } = await api.post("/auth/refresh-token");
                const newAccessToken = data.accessToken;

                // Store new token
                localStorage.setItem("accessToken", newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired or invalid) -> Logout
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
