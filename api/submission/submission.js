/**
 * Submission API Module
 * Handles all submission-related API calls
 */
import apiClient from "@/utils/apiClient";
import { handleApiError } from "@/utils/errorHandler";
import { API_ENDPOINTS } from "@/utils/constants";

const submissionModule = {};
const normalizeId = (id) => {
  const normalized = String(id ?? "").trim();
  return normalized || undefined;
};

/**
 * Submit a solution
 * @param {Object} params - Submission parameters
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.submitSubmission = async ({
  problemId,
  contestId,
  sourceCode,
  language,
}) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUBMISSIONS, {
      problemId: normalizeId(problemId),
      contestId: normalizeId(contestId),
      sourceCode,
      language,
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Submit Solution",
      problemId,
      language,
    });

    return { error: handledError.error };
  }
};

/**
 * Get submission by ID
 * @param {number|string} submissionId - Submission ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.getSubmission = async (submissionId) => {
  if (!submissionId) {
    return { error: "Submission ID is required" };
  }

  const numericId = parseInt(submissionId);
  if (isNaN(numericId) || numericId <= 0) {
    return { error: "Invalid submission ID format" };
  }

  try {
    const response = await apiClient.get(
      API_ENDPOINTS.SUBMISSION_BY_ID(numericId),
    );

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Submission",
      submissionId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "Submission not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get all submissions for the current user
 * @param {Object} params - Query parameters
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.getSubmissions = async ({ page = 1, limit, status } = {}) => {
  try {
    let url = `${API_ENDPOINTS.SUBMISSIONS}?page=${page}`;
    if (limit) url += `&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await apiClient.get(url);
    const data = response.data;
    return { data: data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Submissions",
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "No submissions found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get submissions by contest ID
 * @param {number|string} contestId - Contest ID
 * @param {number} page - Page number (optional, default: 1)
 * @param {number} limit - Results per page (optional, 20-100)
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.getSubmissionsByContest = async (
  contestId,
  page = 1,
  limit,
  status,
) => {
  if (!contestId) {
    return { error: "Contest ID is required" };
  }

  try {
    let url = API_ENDPOINTS.SUBMISSIONS_BY_CONTEST(contestId, page);
    const queryParams = [];
    if (limit) queryParams.push(`limit=${limit}`);
    if (status) queryParams.push(`status=${status}`);
    if (queryParams.length > 0) {
      url += (url.includes("?") ? "&" : "?") + queryParams.join("&");
    }
    const response = await apiClient.get(url);
    const data = response.data;

    return { data: data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Contest Submissions",
      contestId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied to contest" };
    }
    if (error.status === 404) {
      return { error: "Contest not found" };
    }

    return { error: handledError.error };
  }
};

export default submissionModule;
