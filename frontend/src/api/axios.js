import axios from "axios";

// ==================== CONFIGURATION ====================
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== REQUEST INTERCEPTOR ====================
API.interceptors.request.use(
  (config) => {
    // ✅ Add token to headers
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Log requests in development
    if (import.meta.env.DEV) {
      console.log(
        `🚀 [API] ${config.method?.toUpperCase()} ${config.url}`,
        config.data || "",
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ [API] Request Error:", error);
    return Promise.reject(error);
  },
);

// ==================== RESPONSE INTERCEPTOR ====================
API.interceptors.response.use(
  (response) => {
    // ✅ Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ [API] ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // ✅ Check if token exists
      const token = localStorage.getItem("token");

      if (token) {
        // ✅ Dispatch unauthorized event (only once)
        if (!window._unauthorizedDispatched) {
          window._unauthorizedDispatched = true;

          // Clear session
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Dispatch event for AuthContext
          window.dispatchEvent(new CustomEvent("mini-jira:unauthorized"));

          // Redirect to login if not already there
          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }

          // Reset flag after a delay
          setTimeout(() => {
            window._unauthorizedDispatched = false;
          }, 1000);
        }
      }
    }

    // ✅ Handle network errors
    if (!error.response) {
      console.error("🌐 [API] Network Error:", error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: "Network error. Please check your connection.",
          },
        },
      });
    }

    // ✅ Log errors in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ [API] Error ${error.response?.status}:`,
        error.response?.data || error.message,
      );
    }

    return Promise.reject(error);
  },
);

// ==================== ABORT CONTROLLER HELPERS ====================
export const getAbortSignal = (timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
};

// ==================== RETRY LOGIC ====================
export const withRetry = async (apiCall, retries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on 401 or 403
      if (error.response?.status === 401 || error.response?.status === 403) {
        break;
      }

      // Don't retry on validation errors (400)
      if (error.response?.status === 400) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        const waitTime = delay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

// ==================== UPLOAD PROGRESS TRACKING ====================
export const uploadWithProgress = (url, formData, onProgress) => {
  return API.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      if (onProgress) {
        onProgress(percentCompleted);
      }
    },
  });
};

// ==================== EXPORT ====================
export default API;
