"use client";

import { MdCode } from "react-icons/md";
import PageLoading from "@/components/LoadingSpinner/PageLoading";

export default function AvailableProblemsList({ loading }) {
  // Dummy data for now
  const dummyProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      setter: "admin_user",
      created_at: "2025-12-15T10:00:00Z",
      submissions: 1250,
      acceptance_rate: 45.5,
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      tags: ["Tree", "DFS", "BFS"],
      setter: "john_doe",
      created_at: "2025-12-18T14:30:00Z",
      submissions: 890,
      acceptance_rate: 38.2,
    },
    {
      id: 3,
      title: "Dynamic Programming Challenge",
      difficulty: "Hard",
      tags: ["Dynamic Programming", "Optimization"],
      setter: "jane_smith",
      created_at: "2025-12-20T09:15:00Z",
      submissions: 345,
      acceptance_rate: 22.8,
    },
    {
      id: 4,
      title: "String Manipulation",
      difficulty: "Easy",
      tags: ["String", "Sliding Window"],
      setter: "admin_user",
      created_at: "2025-12-10T11:45:00Z",
      submissions: 2100,
      acceptance_rate: 52.3,
    },
    {
      id: 5,
      title: "Graph Shortest Path",
      difficulty: "Medium",
      tags: ["Graph", "Dijkstra", "BFS"],
      setter: "john_doe",
      created_at: "2025-12-19T16:20:00Z",
      submissions: 670,
      acceptance_rate: 35.7,
    },
  ];

  const getDifficultyBadge = (difficulty) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

    switch (difficulty) {
      case "Easy":
        return `${baseClasses} bg-green-600/20 text-green-400 border border-green-600/30`;
      case "Medium":
        return `${baseClasses} bg-yellow-600/20 text-yellow-400 border border-yellow-600/30`;
      case "Hard":
        return `${baseClasses} bg-red-600/20 text-red-400 border border-red-600/30`;
      default:
        return `${baseClasses} bg-zinc-600/20 text-zinc-400 border border-zinc-600/30`;
    }
  };

  if (loading) {
    return <PageLoading text="Loading problems..." height="py-12" />;
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
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Tags
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Setter
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Stats
            </th>
          </tr>
        </thead>
        <tbody className="bg-zinc-800/30 divide-y divide-zinc-700/50">
          {dummyProblems.map((problem) => (
            <tr
              key={problem.id}
              className="hover:bg-zinc-700/30 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <MdCode className="text-orange-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-zinc-100">
                      {problem.title}
                    </div>
                    <div className="text-xs text-zinc-400">
                      ID: {problem.id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getDifficultyBadge(problem.difficulty)}>
                  {problem.difficulty}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {problem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {problem.setter}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                <div className="flex flex-col">
                  <span className="text-xs">
                    Submissions: {problem.submissions}
                  </span>
                  <span className="text-xs text-green-400">
                    Acceptance: {problem.acceptance_rate}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
