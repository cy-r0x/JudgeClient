/**
 * User API Module
 * Handles all user-related API calls
 */
import apiClient, { handleApiResponse } from "@/utils/apiClient";
import { handleApiError } from "@/utils/errorHandler";
import { API_ENDPOINTS } from "@/utils/constants";
import { setUser, clearUser } from "@/utils/auth";

const userModule = {};

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{data?: Object, error?: string}>}
 */
userModule.Login = async (username, password) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
      username,
      password,
    });

    // Store user data
    setUser(response.data);
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "User Login",
      username,
    });

    // Special handling for invalid credentials
    if (error.status === 401) {
      return { error: "Invalid username or password" };
    }

    return { error: handledError.error };
  }
};

/**
 * Register a new user (Admin only)
 * @param {Object} userData - User data
 * @returns {Promise<{data?: Object, error?: string}>}
 */
userModule.Register = async (userData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "User Registration",
    });

    // Handle specific error cases
    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Insufficient permissions to register users" };
    }
    if (error.status === 409) {
      return { error: "User already exists" };
    }
    if (error.status === 422) {
      return { error: "Invalid user data provided" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get contest users
 * @param {number} contestId - Contest ID
 * @returns {Promise<{data?: Array, error?: string}>}
 */
userModule.getContestUsers = async (contestId) => {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.CONTEST_USERS(contestId),
    );
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Contest Users",
      contestId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Insufficient permissions" };
    }
    if (error.status === 404) {
      return { error: "Contest not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get user information by ID
 * @param {string|number} userId - User ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
userModule.getUserInfo = async (userId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.USER_INFO(userId));
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get User Info",
      userId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 404) {
      return { error: "User not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Update user information (Admin only)
 * @param {string|number} userId - User ID
 * @param {Object} payload - User update payload
 * @returns {Promise<{data?: Object, error?: string}>}
 */
userModule.updateUser = async (userId, payload) => {
  try {
    const response = await apiClient.patch(
      API_ENDPOINTS.UPDATE_USER(userId),
      payload,
    );
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Update User",
      userId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Insufficient permissions to update user" };
    }
    if (error.status === 404) {
      return { error: "User not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get all setters (Admin only)
 * @returns {Promise<{data?: Array, error?: string}>}
 */
userModule.getSetters = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SETTERS());
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Setters",
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Insufficient permissions to view setters" };
    }

    return { error: handledError.error };
  }
};

/**
 * Register users via CSV upload (Admin only)
 * @param {FormData} formData - FormData containing prefix, clan_length, contest_id, and file
 * @returns {Promise<{data?: Object, error?: string}>}
 */
userModule.RegisterCSV = async (formData) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.REGISTER_CSV,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "CSV User Registration",
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Insufficient permissions to register users" };
    }
    if (error.status === 400) {
      return { error: "Invalid CSV file or form data" };
    }
    if (error.status === 422) {
      return { error: "Invalid data in CSV file" };
    }

    return { error: handledError.error };
  }
};

/**
 * Download user credentials CSV for a contest (Admin only)
 * @param {number} contestId - Contest ID
 * @returns {Promise<{data?: Blob, error?: string, filename?: string}>}
 */
userModule.DownloadUserCredsCSV = async (contestId) => {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.DOWNLOAD_USER_CREDS_CSV(contestId),
      {
        responseType: "blob",
      },
    );

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers["content-disposition"];
    let filename = `contest_${contestId}_users.csv`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    return { data: response.data, filename };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Download User Credentials CSV",
      contestId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Insufficient permissions" };
    }
    if (error.status === 404) {
      return { error: "CSV file not found for this contest" };
    }
    if (error.status === 400) {
      return { error: "Contest ID is required" };
    }

    return { error: handledError.error };
  }
};

/**
 * Logout user
 */
userModule.Logout = () => {
  clearUser();
};

// Export for backward compatibility
export default userModule;
