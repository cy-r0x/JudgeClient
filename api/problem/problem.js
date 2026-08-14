/**
 * Problem API Module
 * Handles all problem-related API calls
 */
import apiClient from "@/utils/apiClient";
import { handleApiError } from "@/utils/errorHandler";
import { API_ENDPOINTS } from "@/utils/constants";

const problemModule = {};
const normalizeId = (id) => String(id ?? "").trim();

/**
 * Get problem by ID
 * @param {string} problemId - Problem ID
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.getProblem = async (problemId) => {
  const normalizedProblemId = normalizeId(problemId);
  if (!normalizedProblemId) {
    return { error: "Problem ID is required" };
  }

  try {
    const response = await apiClient.get(
      API_ENDPOINTS.PROBLEM_BY_ID(normalizedProblemId),
    );
    const problemData = response.data;

    if (!problemData.testCases || !Array.isArray(problemData.testCases)) {
      problemData.testCases = [];
    }

    if (problemData.timeLimit) {
      problemData.timeLimit = parseInt(problemData.timeLimit);
    }
    if (problemData.memoryLimit) {
      problemData.memoryLimit = parseInt(problemData.memoryLimit);
    }
    return { data: problemData };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Get Problem",
      problemId: normalizedProblemId,
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
    const safeStringify = (content) => {
      if (typeof content === "string") {
        return content;
      }
      return JSON.stringify(content);
    };

    const response = await apiClient.patch(API_ENDPOINTS.PROBLEMS, {
      id: problem.id,
      title: problem.title,
      statement: safeStringify(problem.statement),
      inputStatement: safeStringify(problem.inputStatement),
      outputStatement: safeStringify(problem.outputStatement),
      timeLimit: parseInt(problem.timeLimit),
      memoryLimit: parseInt(problem.memoryLimit),
      checkerType: problem.checkerType,
      checkerStrictSpace: problem.checkerStrictSpace,
      checkerPrecision: problem.checkerPrecision,
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
 * @param {string} testCase.problemId - Problem ID
 * @param {string} testCase.input - Test case input
 * @param {string} testCase.expectedOutput - Expected output
 * @param {boolean} testCase.isSample - Whether this is a sample test case
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.addTestCase = async (testCase) => {
  const normalizedProblemId = normalizeId(testCase.problemId);
  if (!normalizedProblemId) {
    return { error: "Problem ID is required" };
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.TESTCASES, {
      problemId: normalizedProblemId,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isSample: testCase.isSample,
    });

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Add Test Case",
      problemId: normalizedProblemId,
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
 * Update a test case
 * @param {number|string} testCaseId - Test case ID
 * @param {Object} testCase - Test case data
 * @returns {Promise<{data?: Object, error?: string}>}
 */
problemModule.updateTestCase = async (testCaseId, testCase) => {
  const normalizedTestCaseId = normalizeId(testCaseId);
  if (!normalizedTestCaseId) {
    return { error: "Test case ID is required" };
  }

  try {
    const response = await apiClient.patch(
      API_ENDPOINTS.TESTCASE_BY_ID(normalizedTestCaseId),
      {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isSample: testCase.isSample,
      },
    );

    return { data: response.data };
  } catch (error) {
    const handledError = handleApiError(error, {
      context: "Update Test Case",
      testCaseId: normalizedTestCaseId,
    });

    if (error.status === 401) {
      return { error: "Invalid or expired token" };
    }
    if (error.status === 400) {
      return { error: "Invalid test case data" };
    }
    if (error.status === 404) {
      return { error: "Test case not found" };
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
