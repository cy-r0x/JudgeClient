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
 * @param {string} params.problem_id - Problem ID
 * @param {string} params.contest_id - Contest ID (optional)
 * @param {string} params.source_code - Source code
 * @param {string} params.language - Programming language
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.submitSubmission = async ({
  problem_id,
  contest_id,
  source_code,
  language,
}) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUBMISSIONS, {
      problem_id: normalizeId(problem_id),
      contest_id: normalizeId(contest_id),
      source_code,
      language,
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Submit Solution",
      problemId: problem_id,
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
  // Input validation
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
 * @param {number} params.page - Page number (optional, default: 1)
 * @param {number} params.limit - Results per page (optional, 20-100)
 * @param {string} params.verdict - Filter by verdict (optional)
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.getSubmissions = async ({ page = 1, limit, verdict } = {}) => {
  try {
    let url = `${API_ENDPOINTS.SUBMISSIONS}?page=${page}`;
    if (limit) url += `&limit=${limit}`;
    if (verdict) url += `&verdict=${verdict}`;
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
 * @param {string} verdict - Filter by verdict (optional)
 * @returns {Promise<{data?: Object, error?: string}>}
 */
submissionModule.getSubmissionsByContest = async (
  contestId,
  page = 1,
  limit,
  verdict,
) => {
  // Input validation
  if (!contestId) {
    return { error: "Contest ID is required" };
  }

  try {
    let url = API_ENDPOINTS.SUBMISSIONS_BY_CONTEST(contestId, page);
    const queryParams = [];
    if (limit) queryParams.push(`limit=${limit}`);
    if (verdict) queryParams.push(`verdict=${verdict}`);
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
