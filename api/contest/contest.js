/**
 * Contest API Module
 * Handles all contest-related API calls
 */
import apiClient from "@/utils/apiClient";
import { handleApiError } from "@/utils/errorHandler";
import { API_ENDPOINTS } from "@/utils/constants";

const contestModule = {};
const normalizeId = (id) => String(id ?? "").trim();

/**
 * Get all contests
 * @returns {Promise<{data?: Array, error?: string}>}
 */
contestModule.getContests = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CONTESTS);
    const contests = response.data;

    // Ensure contests is always an array
    if (!Array.isArray(contests)) {
      return { data: [] };
    }

    return { data: contests };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Contests",
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get contest by ID
 * @param {string} contestId - Contest ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.getContest = async (contestId) => {
  const normalizedContestId = normalizeId(contestId);
  if (!normalizedContestId) {
    return { error: "Contest ID is required" };
  }

  try {
    const response = await apiClient.get(
      API_ENDPOINTS.CONTEST_BY_ID(normalizedContestId),
    );
    const contestData = response.data;

    // Ensure numeric fields are properly typed
    if (contestData.contest?.duration_seconds) {
      contestData.contest.duration_seconds = parseInt(
        contestData.contest.duration_seconds,
      );
    }

    return { data: contestData };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Contest",
      contestId: normalizedContestId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "Contest not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Create new contest (Admin only)
 * @param {Object} contestData - Contest data
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.createContest = async (contestData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CONTESTS, {
      title: contestData.title,
      description: contestData.description || "",
      start_time: contestData.start_time,
      duration_seconds: parseInt(contestData.duration_seconds),
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Create Contest",
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }

    return { error: handledError.error };
  }
};

/**
 * Update contest (Admin only)
 * @param {Object} contest - Contest data with ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.updateContest = async (contest) => {
  try {
    const response = await apiClient.patch(API_ENDPOINTS.CONTESTS, {
      id: contest.id,
      title: contest.title,
      description: contest.description,
      start_time: contest.start_time,
      duration_seconds: parseInt(contest.duration_seconds),
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Update Contest",
      contestId: contest.id,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }

    return { error: handledError.error };
  }
};

/**
 * Assign problem to contest
 * @param {Object} contestProblem - Contest problem assignment data
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.assignProblem = async (contestProblem) => {
  // Input validation
  if (!contestProblem || typeof contestProblem !== "object") {
    return { error: "Contest problem data is required" };
  }

  const normalizedContestId = normalizeId(contestProblem.contest_id);
  const normalizedProblemId = normalizeId(contestProblem.problem_id);
  if (!normalizedContestId || !normalizedProblemId) {
    return { error: "Contest ID and Problem ID are required" };
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.CONTEST_ASSIGN, {
      contest_id: normalizedContestId,
      problem_id: normalizedProblemId,
      index: contestProblem.index
        ? parseInt(contestProblem.index, 10)
        : undefined,
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Assign Problem to Contest",
      contestId: normalizedContestId,
      problemId: normalizedProblemId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "Contest or problem not found" };
    }
    if (error.status === 409) {
      return { error: "Problem already assigned to this contest" };
    }
    if (error.status === 422) {
      return { error: "Invalid data provided" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get problems for a contest
 * @param {string} contestId - Contest ID
 * @returns {Promise<{data?: Array, error?: string}>}
 */
contestModule.getContestProblems = async (contestId) => {
  const normalizedContestId = normalizeId(contestId);
  if (!normalizedContestId) {
    return { error: "Contest ID is required" };
  }

  try {
    const response = await apiClient.get(
      API_ENDPOINTS.CONTEST_PROBLEMS(normalizedContestId),
    );
    const problems = response.data;

    // Ensure problems is always an array
    if (!Array.isArray(problems)) {
      return { data: [] };
    }

    return { data: problems };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Contest Problems",
      contestId: normalizedContestId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "Contest not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Get standings for a contest
 * @param {string} contestId - Contest ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 100)
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.getContestStandings = async (
  contestId,
  page = 1,
  limit = 100,
) => {
  const normalizedContestId = normalizeId(contestId);
  if (!normalizedContestId) {
    return { error: "Contest ID is required" };
  }

  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.CONTEST_STANDINGS(
        normalizedContestId,
      )}?page=${page}&limit=${limit}`,
    );

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Contest Standings",
      contestId: normalizedContestId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "Contest not found" };
    }

    return { error: handledError.error };
  }
};

export default contestModule;
