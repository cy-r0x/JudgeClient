/**
 * Compile and Run Utility
 * Handles code execution requests to the engine
 */
import apiClient, { handleApiResponse } from "./apiClient";
import { API_ENDPOINTS } from "./constants";

/**
 * Execute code with test cases
 * @param {Object} payload - Execution payload
 * @param {string|null} payload.submission_id - Submission ID (optional)
 * @param {string|null} payload.problemId - Problem ID (optional)
 * @param {string} payload.language - Programming language
 * @param {string} payload.sourceCode - Source code to execute
 * @param {Array} payload.testcases - Array of test cases
 * @param {number} payload.timeLimit - Time limit in seconds
 * @param {number} payload.memoryLimit - Memory limit in MB
 * @returns {Promise<{data?: any, error?: string}>}
 */
export const compileAndRun = async (payload) => {
  return handleApiResponse(apiClient.post(API_ENDPOINTS.ENGINE_RUN, payload));
};
