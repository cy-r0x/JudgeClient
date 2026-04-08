/**
 * Application-wide constants
 */

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  SETTER: "setter",
  USER: "user",
  PARTICIPANT: "participant",
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/users/login",
  REGISTER: "/api/users/register",

  // Contests
  CONTESTS: "/api/contests",
  CONTEST_BY_ID: (id) => `/api/contests/${id}`,
  CONTEST_ASSIGN: "/api/contests/assign",
  CONTEST_PROBLEMS: (id) => `/api/contests/problems/${id}`,
  CONTEST_STANDINGS: (id) => `/api/standings/${id}`,

  // Problems
  PROBLEMS: "/api/problems",
  PROBLEM_BY_ID: (id) => `/api/problems/${id}`,
  SETTER_PROBLEMS: "/api/setters/problems",

  // Test Cases
  TESTCASES: "/api/problems/testcases",
  TESTCASE_BY_ID: (id) => `/api/problems/testcases/${id}`,

  // Submissions
  SUBMISSIONS: "/api/submissions",
  SUBMISSION_BY_ID: (id) => `/api/submissions/${id}`,
  SUBMISSIONS_BY_CONTEST: (contestId, page = 1) =>
    `/api/submissions/all/${contestId}?page=${page}`,

  // Engine
  ENGINE_RUN: "/api/compile",

  // Users
  CONTEST_USERS: (contestId) => `/api/users/${contestId}`,
  UPDATE_USER: (userId) => `/api/users/${userId}`,
  USER_INFO: (userId) => `/api/users/info/${userId}`,
  SETTERS: () => "/api/users/setter",
  REGISTER_CSV: "/api/users/register/csv",
  DOWNLOAD_USER_CREDS_CSV: (contestId) =>
    `/api/users/csv?contestId=${contestId}`,
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: "user",
  TOKEN: "access_token",
  THEME: "theme",
};

// Contest status
export const CONTEST_STATUS = {
  UPCOMING: "UPCOMING",
  RUNNING: "RUNNING",
  ENDED: "ENDED",
};

// Submission status
export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  IN_QUEUE: "In Queue",
  JUDGING: "Judging",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  RUNTIME_ERROR: "Runtime Error",
  COMPILATION_ERROR: "Compilation Error",
};

// Programming languages
export const LANGUAGES = {
  CPP: "cpp",
  JAVA: "java",
  PYTHON: "py",
  JAVASCRIPT: "js",
};
