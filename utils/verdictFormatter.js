/**
 * Verdict Formatter Utility
 * Handles verdict display logic for submissions
 */

/**
 * Get full verdict name from short code or server status name
 * @param {string} verdict - Verdict code or full status name
 * @returns {string} Full verdict name
 */
export const getVerdictName = (verdict) => {
  const verdictMap = {
    // short codes
    ac: "Accepted",
    wa: "Wrong Answer",
    tle: "Time Limit Exceeded",
    mle: "Memory Limit Exceeded",
    re: "Runtime Error",
    ce: "Compilation Error",
    pending: "Pending",
    running: "Running",
    // full server status names
    accepted: "Accepted",
    wrong_answer: "Wrong Answer",
    time_limit_exceeded: "Time Limit Exceeded",
    memory_limit_exceeded: "Memory Limit Exceeded",
    runtime_error: "Runtime Error",
    compilation_error: "Compilation Error",
    ie: "Internal Error",
    internal_error: "Internal Error",
  };

  return verdictMap[verdict?.toLowerCase()] || verdict || "Unknown";
};

/**
 * Get color class for verdict
 * @param {string} verdict - Verdict code
 * @returns {string} Tailwind color class
 */
export const getVerdictColor = (verdict) => {
  const lowerVerdict = verdict?.toLowerCase();

  switch (lowerVerdict) {
    case "ac":
    case "accepted":
      return "text-green-500";
    case "pending":
      return "text-gray-400 animate-pulse";
    default:
      return "text-red-500";
  }
};

/**
 * Get icon component for verdict
 * @param {string} verdict - Verdict code
 * @param {Object} icons - Icon components object
 * @returns {JSX.Element} Icon component
 */
export const getVerdictIcon = (verdict, icons) => {
  const lowerVerdict = verdict?.toLowerCase();
  const { MdOutlineDone, MdClose, MdAccessTime, MdMemory, MdLoop } = icons;

  switch (lowerVerdict) {
    case "ac":
    case "accepted":
      return <MdOutlineDone className="text-green-500" title="Accepted" />;
    case "wa":
    case "wrong_answer":
      return <MdClose className="text-red-500" title="Wrong Answer" />;
    case "tle":
    case "time_limit_exceeded":
      return (
        <MdAccessTime className="text-red-500" title="Time Limit Exceeded" />
      );
    case "mle":
    case "memory_limit_exceeded":
      return (
        <MdMemory className="text-red-500" title="Memory Limit Exceeded" />
      );
    case "re":
    case "runtime_error":
      return <MdClose className="text-red-500" title="Runtime Error" />;
    case "ce":
    case "compilation_error":
      return <MdClose className="text-red-500" title="Compilation Error" />;
    case "ie":
    case "internal_error":
      return <MdClose className="text-red-500" title="Internal Error" />;
    case "pending":
      return <MdLoop className="text-gray-400 animate-spin" title="Pending" />;
    default:
      return <MdClose className="text-red-500" title={verdict} />;
  }
};
