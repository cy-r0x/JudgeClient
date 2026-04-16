/**
 * Compile and Run Utility
 * Handles code execution requests to the engine
 */
import apiClient, { handleApiResponse } from "@/utils/apiClient";
import { API_ENDPOINTS } from "@/utils/constants";

/**
 * Execute code with test cases
 * @param {Object} payload - Execution payload
 * @param {string|null} payload.submission_id - Submission ID (optional)
 * @param {string|null} payload.problem_id - Problem ID (optional)
 * @param {string} payload.language - Programming language
 * @param {string} payload.source_code - Source code to execute
 * @param {Array} payload.testcases - Array of test cases
 * @param {number} payload.time_limit - Time limit in seconds
 * @param {number} payload.memory_limit - Memory limit in MB
 * @returns {Promise<{data?: any, error?: string}>}
 */
export const compileAndRun = async (payload) => {
  payload = {
    ...payload,
    problem_id: payload.problem_id ? String(payload.problem_id) : null,
    contest_id: payload.contest_id ? String(payload.contest_id) : null,
  };
  return handleApiResponse(apiClient.post(API_ENDPOINTS.ENGINE_RUN, payload));
};
