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

    if (contestData.contest?.durationSeconds) {
      contestData.contest.durationSeconds = parseInt(
        contestData.contest.durationSeconds,
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
    const startTime = new Date(contestData.startTime);
    const durationSeconds = parseInt(contestData.durationSeconds);
    const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

    const response = await apiClient.post(API_ENDPOINTS.CONTESTS, {
      title: contestData.title,
      userPrefix: contestData.userPrefix,
      description: contestData.description || "",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds,
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
    const startTime = new Date(contest.startTime);
    const durationSeconds = parseInt(contest.durationSeconds);
    const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

    const response = await apiClient.patch(API_ENDPOINTS.CONTESTS, {
      id: contest.id,
      title: contest.title,
      userPrefix: contest.userPrefix,
      description: contest.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds,
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
  if (!contestProblem || typeof contestProblem !== "object") {
    return { error: "Contest problem data is required" };
  }

  const normalizedContestId = normalizeId(contestProblem.contestId);
  const normalizedProblemId = normalizeId(contestProblem.problemId);
  if (!normalizedContestId || !normalizedProblemId) {
    return { error: "Contest ID and Problem ID are required" };
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.CONTEST_ASSIGN, {
      contestId: normalizedContestId,
      problemId: normalizedProblemId,
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
 * Update contest problem indices
 * @param {Array} contestProblems - Array of { contestId, problemId, index }
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.updateContestIndex = async (contestProblems) => {
  if (!Array.isArray(contestProblems) || contestProblems.length === 0) {
    return { error: "Contest problems array is required" };
  }

  try {
    const response = await apiClient.patch(
      API_ENDPOINTS.CONTEST_UPDATE_INDEX,
      contestProblems,
    );
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Update Contest Problem Index",
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "No contest problems updated" };
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

/**
 * Export standings for a contest (Admin only)
 * @param {string} contestId - Contest ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
contestModule.exportStandings = async (contestId) => {
  const normalizedContestId = normalizeId(contestId);
  if (!normalizedContestId) {
    return { error: "Contest ID is required" };
  }

  try {
    const response = await apiClient.get(
      API_ENDPOINTS.CONTEST_STANDINGS_EXPORT(normalizedContestId),
    );
    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Export Contest Standings",
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
