/**
 * Compile and Run Utility
 * Handles code execution requests to the engine
 */
import apiClient, { handleApiResponse } from "@/utils/apiClient";
import { API_ENDPOINTS } from "@/utils/constants";

/**
 * Execute code with test cases
 * @param {Object} payload - Execution payload
 * @returns {Promise<{data?: any, error?: string}>}
 */
export const compileAndRun = async (payload) => {
  const normalizedPayload = {
    ...payload,
    problemId: payload.problemId ? String(payload.problemId) : null,
    contestId: payload.contestId ? String(payload.contestId) : null,
  };
  return handleApiResponse(
    apiClient.post(API_ENDPOINTS.ENGINE_RUN, normalizedPayload),
  );
};
