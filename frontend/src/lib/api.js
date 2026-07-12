import axios from "axios";

/**
 * Pre-configured axios instance for the Job AI Tracker API.
 * - Auto-attaches Bearer token from localStorage
 * - Normalizes Laravel validation errors (422) into a friendly Error
 * - On 401 (token expired/invalid), clears auth and redirects to /login
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach the token to every outgoing request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — surface validation errors clearly and handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        // Validation errors (Laravel returns 422 with `errors` object)
        if (status === 422 && data?.errors) {
            const firstError = Object.values(data.errors).flat()[0];
            error.message = firstError || "Validation failed.";
            error.fieldErrors = data.errors;
        } else if (status === 401) {
            // Token expired / invalid — clear and bounce to login
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Avoid loop if we are already on login
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        } else if (data?.message) {
            error.message = data.message;
        }

        return Promise.reject(error);
    }
);

// --- Global defaults ---
// Apply the same token attachment + error normalization to the bare `axios`
// import used by other pages, so the rest of the app keeps working
// without each page needing to import `api`.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        } else if (data?.message) {
            error.message = data.message;
        }
        return Promise.reject(error);
    }
);

export default api;
