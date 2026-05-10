"use client";

import { use, useState, useEffect } from "react";
import { FaUser, FaClock, FaMemory } from "react-icons/fa";
import { GoFileCode, GoVersions, GoHash } from "react-icons/go";
import {
  MdOutlineDone,
  MdClose,
  MdLoop,
  MdAccessTime,
  MdMemory,
  MdError,
} from "react-icons/md";
import Link from "next/link";
import submissionModule from "@/api/submission/submission";

import PageLoading from "@/components/LoadingSpinner/PageLoading";
import { getRelativeTime } from "@/utils/dateFormatter";
import EmptyState from "@/components/EmptyState/EmptyState";
import {
  getVerdictName,
  getVerdictColor,
  getVerdictIcon,
} from "@/utils/verdictFormatter";
import Pagination from "@/components/Pagination/Pagination";

export default function SubmissionsTable({ isAdmin, params }) {
  const { contestId } = use(params);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(20);
  const [verdict, setVerdict] = useState("");

  useEffect(() => {
    if (!contestId) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });

      const { data, error } = await submissionModule.getSubmissions({
        page: currentPage,
        limit,
        verdict: verdict || undefined,
      });

      // const { data, error } = await submissionModule.getSubmissionsByContest(1);

      console.log(data);
      if (error) {
        setError(error);
      } else {
        console.log(Array.isArray(data.submissions));
        setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total_item || 0);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [contestId, currentPage, limit, verdict]);

  if (!contestId || loading) {
    return (
      <PageLoading
        text="Loading submissions..."
        height="h-[calc(100vh-200px)]"
      />
    );
  }

  if (error) {
    return (
      <div className="px-6 md:px-16 py-6">
        <div className="mb-6">
          <Link
            href={`/contests/${contestId}`}
            className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Contest
          </Link>
        </div>
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const getLanguageDisplay = (language) => {
    switch (language) {
      case "cpp":
        return "C++";
      case "py":
        return "Python";
      case "java":
        return "Java";
      default:
        return language;
    }
  };

  return (
    <div className="px-6 md:px-16 py-6">
      <div className="mb-6">
        <Link
          href={`/contests/${contestId}`}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Contest
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Contest Submissions</h2>

      {/* Filter Controls */}
      <div className="mb-6 bg-zinc-900 rounded-lg border-2 border-zinc-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Verdict Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Filter by Verdict
            </label>
            <select
              value={verdict}
              onChange={(e) => {
                setVerdict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Verdicts</option>
              <option value="ac">Accepted</option>
              <option value="wa">Wrong Answer</option>
              <option value="tle">Time Limit Exceeded</option>
              <option value="mle">Memory Limit Exceeded</option>
              <option value="re">Runtime Error</option>
              <option value="ce">Compilation Error</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Limit Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Results Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          title="No Submissions Yet"
          description="Submit a solution to see it here"
          icon={
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border-2 border-zinc-800">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-zinc-900 text-zinc-300 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <FaUser />
                    User
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <GoHash />
                    Language
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <GoFileCode />
                    Problem
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <MdLoop />
                    Verdict
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <FaClock />
                    Time
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <FaMemory />
                    Memory
                  </div>
                </th>
                <th className="py-3 px-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="text-zinc-200">
              {submissions.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-700 hover:bg-zinc-800 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-mono text-orange-500 hover:underline">
                    <Link
                      href={`/contests/${contestId}/submissions/${item.id}`}
                    >
                      #{item.id}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{item.username}</td>
                  <td className="py-3 px-4">
                    {getLanguageDisplay(item.language)}
                  </td>
                  <td className="py-3 px-4 text-blue-400 hover:underline">
                    <Link href={`/contests/${contestId}/${item.problemId}`}>
                      {String.fromCharCode(
                        "A".charCodeAt(0) + item.problemIndex - 1
                      )}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {getVerdictIcon(item.verdict, {
                          MdOutlineDone,
                          MdClose,
                          MdAccessTime,
                          MdMemory,
                          MdLoop,
                        })}
                      </span>
                      <span
                        className={`font-medium text-sm ${getVerdictColor(
                          item.verdict
                        )}`}
                      >
                        {getVerdictName(item.verdict)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {item.execution_time
                      ? `${item.execution_time * 1000} ms`
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {item.memory_used ? `${item.memory_used} KB` : "—"}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {getRelativeTime(item.submitted_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {submissions.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setCurrentPage}
          itemName="submissions"
        />
      )}
    </div>
  );
}
