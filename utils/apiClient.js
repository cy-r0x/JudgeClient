/**
 * Centralized API client with interceptors for authentication and error handling
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

/**
 * Response interceptor to unwrap API response wrapper and handle errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the server's APIResponse wrapper: { success, message, data }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        error: "Network error - unable to connect to server",
        status: null,
        originalError: error,
      });
    }

    const { status, data } = error.response;

    // Handle authentication errors globally
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Return standardized error object
    return Promise.reject({
      error: data?.message || `Server error: ${status}`,
      status,
      data,
      originalError: error,
    });
  }
);

/**
 * Helper function to handle API responses consistently
 * @param {Promise} promise - Axios promise
 * @returns {Promise<{data?: any, error?: string}>}
 */
export const handleApiResponse = async (promise) => {
  try {
    const response = await promise;
    return { data: response.data };
  } catch (error) {
    if (error.error) {
      return { error: error.error, status: error.status };
    }
    return {
      error: error.message || "An unexpected error occurred",
      status: error.status || null,
    };
  }
};

export default apiClient;
