/**
 * Problem API Module
 * Handles all problem-related API calls
 */
import apiClient from "@/utils/apiClient";
import { handleApiError } from "@/utils/errorHandler";
import { API_ENDPOINTS } from "@/utils/constants";

const problemModule = {};

/**
 * Get problem by ID
 * @param {number|string} problemId - Problem ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.getProblem = async (problemId) => {
  // Input validation
  if (!problemId) {
    return { error: "Problem ID is required" };
  }

  // Validate problemId is a valid number or string that can be converted to number
  const numericId = parseInt(problemId);
  if (isNaN(numericId) || numericId <= 0) {
    return { error: "Invalid problem ID format" };
  }

  try {
    const response = await apiClient.get(
      API_ENDPOINTS.PROBLEM_BY_ID(numericId),
    );
    const problemData = response.data;

    // Ensure test_cases is always an array (handle null/undefined)
    if (!problemData.test_cases || !Array.isArray(problemData.test_cases)) {
      problemData.test_cases = [];
    }

    // Ensure numeric fields are properly typed
    if (problemData.time_limit) {
      problemData.time_limit = parseInt(problemData.time_limit);
    }
    if (problemData.memory_limit) {
      problemData.memory_limit = parseInt(problemData.memory_limit);
    }
    if (problemData.id) {
      problemData.id = parseInt(problemData.id);
    }
    if (problemData.created_by) {
      problemData.created_by = parseInt(problemData.created_by);
    }

    return { data: problemData };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Problem",
      problemId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 403) {
      return { error: "Access denied" };
    }
    if (error.status === 404) {
      return { error: "Problem not found" };
    }

    return { error: handledError.error };
  }
};

/**
 * Update problem
 * @param {Object} problem - Problem data with ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.updateProblem = async (problem) => {
  try {
    // Helper function to safely stringify content if it's not already a string
    const safeStringify = (content) => {
      if (typeof content === "string") {
        return content;
      }
      return JSON.stringify(content);
    };

    const response = await apiClient.patch(API_ENDPOINTS.PROBLEMS, {
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      statement: safeStringify(problem.statement),
      input_statement: safeStringify(problem.input_statement),
      output_statement: safeStringify(problem.output_statement),
      time_limit: parseInt(problem.time_limit),
      memory_limit: parseInt(problem.memory_limit),
      test_cases: problem.test_cases,
      checker_type: problem.checker_type,
      checker_strict_space: problem.checker_strict_space,
      checker_precision: problem.checker_precision,
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Update Problem",
      problemId: problem.id,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }

    return { error: handledError.error };
  }
};

/**
 * Add a test case to a problem
 * @param {Object} testCase - Test case data
 * @param {number} testCase.problem_id - Problem ID
 * @param {string} testCase.input - Test case input
 * @param {string} testCase.expected_output - Expected output
 * @param {boolean} testCase.is_sample - Whether this is a sample test case
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.addTestCase = async (testCase) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.TESTCASES, {
      problem_id: parseInt(testCase.problem_id),
      input: testCase.input,
      expected_output: testCase.expected_output,
      is_sample: testCase.is_sample,
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Add Test Case",
      problemId: testCase.problem_id,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 400) {
      return { error: "Invalid test case data" };
    }

    return { error: handledError.error };
  }
};

/**
 * Delete a test case
 * @param {number|string} testCaseId - Test case ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.deleteTestCase = async (testCaseId) => {
  try {
    const response = await apiClient.delete(
      API_ENDPOINTS.TESTCASE_BY_ID(testCaseId),
    );

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Delete Test Case",
      testCaseId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 404) {
      return { error: "Test case not found" };
    }

    return { error: handledError.error };
  }
};

export default problemModule;
