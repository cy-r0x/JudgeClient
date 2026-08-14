"use client";

import Link from "next/link";
import { formatDateTime, formatDuration } from "@/utils/dateFormatter";
import { MdEventNote } from "react-icons/md";
import PageLoading from "@/components/LoadingSpinner/PageLoading";
import EmptyState from "@/components/EmptyState/EmptyState";

export default function ContestsList({
  contests,
  loading,
  error,
  onRetry,
  onCreate,
}) {
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

    switch (status) {
      case "UPCOMING":
        return `${baseClasses} bg-blue-600/20 text-blue-400 border border-blue-600/30`;
      case "RUNNING":
        return `${baseClasses} bg-green-600/20 text-green-400 border border-green-600/30`;
      case "ENDED":
        return `${baseClasses} bg-gray-600/20 text-gray-400 border border-gray-600/30`;
      default:
        return `${baseClasses} bg-zinc-600/20 text-zinc-400 border border-zinc-600/30`;
    }
  };

  if (loading) {
    return <PageLoading text="Loading contests..." height="py-12" />;
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        <p>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm underline hover:text-red-300"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <EmptyState
        icon={<MdEventNote className="w-12 h-12" />}
        title="No Contests Found"
        description="No contests available yet. Create your first contest to get started."
        action={onCreate}
        actionLabel="Create Your First Contest"
      />
    );
  }

  return (
    <div className="bg-zinc-800/70 rounded-lg overflow-hidden shadow-lg border border-zinc-700/50">
      <table className="min-w-full divide-y divide-zinc-700">
        <thead className="bg-zinc-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Start Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-zinc-800/30 divide-y divide-zinc-700/50">
          {contests.map((contest) => (
            <tr
              key={contest.id}
              className="hover:bg-zinc-700/30 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-zinc-100">
                    {contest.title}
                  </div>
                  {contest.description && (
                    <div className="text-sm text-zinc-400 truncate max-w-xs">
                      {contest.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(contest.status)}>
                  {contest.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {formatDateTime(contest.startTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {formatDuration(contest.durationSeconds)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                <div className="flex space-x-3">
                  <Link href={`/admin/manage/${contest.id}`}>
                    <button className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                      Manage
                    </button>
                  </Link>
                  <Link href={`/admin/submissions/${contest.id}`}>
                    <button className="text-green-400 hover:text-green-300 transition-colors">
                      View Submissions
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
