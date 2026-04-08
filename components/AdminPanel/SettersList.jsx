"use client";

import { MdDelete, MdPerson, MdEdit } from "react-icons/md";
import PageLoading from "@/components/LoadingSpinner/PageLoading";
import EmptyState from "@/components/EmptyState/EmptyState";

export default function SettersList({
  setters,
  loading,
  error,
  onRetry,
  onCreate,
  onDelete,
  successMessage,
  errorMessage,
}) {
  if (loading) {
    return <PageLoading text="Loading setters..." height="py-12" />;
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

  if (setters.length === 0) {
    return (
      <EmptyState
        icon={<MdPerson className="w-12 h-12" />}
        title="No Setters Found"
        description="No setters available yet. Create your first setter to get started."
        action={onCreate}
        actionLabel="Create Your First Setter"
      />
    );
  }

  return (
    <>
      {errorMessage && (
        <div className="text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2 text-sm mb-4">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="text-green-400 bg-green-900/20 border border-green-800/50 rounded-lg px-4 py-2 text-sm mb-4">
          {successMessage}
        </div>
      )}
      <div className="bg-zinc-800/70 rounded-lg overflow-hidden shadow-lg border border-zinc-700/50">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-zinc-800/30 divide-y divide-zinc-700/50">
            {setters.map((setter) => (
              <tr
                key={setter.id}
                className="hover:bg-zinc-700/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {setter.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-zinc-100">
                    {setter.full_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {setter.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  <div className="flex space-x-4">
                    <button
                      onClick={() =>
                        window.open(`/admin/users/${setter.id}`, "_blank")
                      }
                      className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <MdEdit className="text-lg" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(setter.userId)}
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <MdDelete className="text-lg" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
