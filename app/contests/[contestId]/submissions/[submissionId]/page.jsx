"use client";

import { use, useState, useEffect, useRef } from "react";
import { SubmissionCodeViewer } from "./client";
import Link from "next/link";
import submissionModule from "@/api/submission/submission";

import PageLoading from "@/components/LoadingSpinner/PageLoading";
import { getRelativeTime } from "@/utils/dateFormatter";
import { getVerdictName, getVerdictColor } from "@/utils/verdictFormatter";

const normalizeSubmission = (submission) => ({
  id: submission?.id,
  userId: submission?.userId ?? submission?.user_id ?? submission?.user?.id,
  username:
    submission?.username ?? submission?.user?.username ?? "Unknown user",
  problemId:
    submission?.problemId ?? submission?.problemId ?? submission?.problem?.id,
  problemTitle:
    submission?.problem?.title ?? submission?.problemTitle ?? "Problem",
  contestId:
    submission?.contestId ?? submission?.contestId ?? submission?.contest?.id,
  language: submission?.language ?? "",
  sourceCode: submission?.sourceCode ?? submission?.sourceCode ?? "",
  verdict: submission?.verdict ?? "",
  firstBlood: submission?.firstBlood ?? submission?.first_blood ?? false,
  executionTime:
    submission?.executionTime ?? submission?.execution_time ?? null,
  memoryUsed: submission?.memoryUsed ?? submission?.memory_used ?? null,
  submittedAt: submission?.submittedAt ?? submission?.submitted_at ?? null,
});

export default function SubmissionPage({ params }) {
  const { contestId, submissionId } = use(params);
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!submissionId) return;

    let isInitialLoad = true;

    const fetchSubmission = async () => {
      const { data, error } =
        await submissionModule.getSubmission(submissionId);

      if (error) {
        setError(error);
        if (isInitialLoad) setLoading(false);
        // Stop polling on error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const normalizedSubmission = normalizeSubmission(data);
      setSubmissionData(normalizedSubmission);
      if (isInitialLoad) {
        setLoading(false);
        isInitialLoad = false;
      }

      // Stop polling if verdict is not pending
      if (
        normalizedSubmission.verdict &&
        normalizedSubmission.verdict.toLowerCase() !== "pending"
      ) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Initial fetch
    setLoading(true);
    fetchSubmission();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchSubmission();
    }, 2000);

    // Cleanup function to clear interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [submissionId]);

  if (!contestId || !submissionId || loading) {
    return <PageLoading text="Loading submission..." />;
  }

  if (error) {
    return (
      <div className="px-6 md:px-16 py-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="px-6 md:px-16 py-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <p>Submission not found</p>
        </div>
      </div>
    );
  }

  // Format the submitted date as "time ago"
  const timeAgo = getRelativeTime(submissionData.submittedAt);
  const verdict = submissionData.verdict;
  const isPending = verdict?.toLowerCase() === "pending";
  const problemHref = submissionData.problemId
    ? `/contests/${contestId}/${submissionData.problemId}`
    : `/contests/${contestId}`;

  return (
    <div className="px-6 md:px-16 py-6">
      <Link
        href={problemHref}
        className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors mb-4"
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
        Back to Problem
      </Link>
      <h2 className="text-2xl font-bold mb-6">Submission Details</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-sm">Submission ID</div>
          <div className="font-mono text-lg text-orange-500">
            #{submissionData.id}
          </div>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-sm">Verdict</div>
          <div
            className={`font-medium text-lg ${getVerdictColor(
              verdict,
            )} ${isPending ? "animate-pulse flex items-center gap-2" : ""}`}
          >
            {isPending && (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {getVerdictName(verdict)}
          </div>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-sm">Execution Time</div>
          <div className="font-medium text-lg">
            {submissionData.executionTime != null
              ? `${(Number(submissionData.executionTime) * 1000).toFixed(2)} ms`
              : "—"}
          </div>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-sm">Memory Used</div>
          <div className="font-medium text-lg">
            {submissionData.memoryUsed != null
              ? `${Number(submissionData.memoryUsed).toFixed(2)} KB`
              : "—"}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-sm">Username</div>
          <div className="font-medium text-lg">{submissionData.username}</div>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-sm">Submitted At</div>
          <div className="font-medium text-lg">{timeAgo}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-medium">Solution Code</div>
          <div className="text-zinc-400">
            Language:{" "}
            <span className="text-white">
              {submissionData.language === "cpp"
                ? "GNU G++23"
                : submissionData.language === "py"
                  ? "Python 3.10"
                  : submissionData.language === "c"
                    ? "GNU GCC11"
                    : submissionData.language === "java"
                      ? "Java 21"
                      : submissionData.language}
            </span>
          </div>
        </div>

        <div className="border-2 border-zinc-800 rounded-lg overflow-hidden">
          <SubmissionCodeViewer
            code={submissionData.sourceCode}
            language={submissionData.language}
          />
        </div>
      </div>
    </div>
  );
}
