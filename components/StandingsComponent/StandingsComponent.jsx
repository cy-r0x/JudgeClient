"use client";

import Link from "next/link";
import { RiTrophyFill, RiMedalFill, RiStarFill } from "react-icons/ri";

/**
 * Standings Component - Display contest leaderboard
 *
 * @param {Object} props - Component props
 * @param {Object} props.standingsData - Standings data from API
 * @param {number} props.standingsData.contestId - Contest ID
 * @param {Object} props.standingsData.problemMapping - Mapping of problem index to problem ID
 * @param {Array} props.standingsData.standings - Array of user standings
 * @param {number} props.currentPage - Current page number
 * @param {number} props.limit - Items per page
 * @returns {JSX.Element} Standings table component
 */
export default function StandingsComponent({
  standingsData,
  currentPage = 1,
  limit = 100,
}) {
  const { problemMapping, standings, problemSolveStatus, contestId } =
    standingsData;

  // Get problem count from mapping
  const problemCount = Object.keys(problemMapping || {}).length;

  // Generate problem letters (A, B, C, ...)
  const problemLetters = Array.from({ length: problemCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Helper function to get report stats for a problem
  const getProblemStats = (problemIndex) => {
    const problemNumber = problemIndex + 1;
    if (problemSolveStatus && problemSolveStatus[problemNumber]) {
      return problemSolveStatus[problemNumber];
    }
    return { solved: 0, attempted: 0 };
  };

  // Helper function to get problem data for a user (now just array index)
  const getProblemData = (problems, problemIndex) => {
    return problems[problemIndex];
  };

  // Helper function to format problem cell
  const formatProblemCell = (problemData) => {
    if (!problemData) {
      return { display: "-", className: "text-zinc-600" };
    }

    if (problemData.solved) {
      const attempts = problemData.attempts > 1 ? problemData.attempts - 1 : "";
      const penalty = problemData.penalty;

      return {
        display: (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-bold text-green-400 flex items-center gap-1">
              {problemData.first_blood && (
                <RiStarFill className="text-yellow-400 text-lg" />
              )}
              <span className="text-sm">+{attempts || ""}</span>
            </span>
            <span className="text-xs text-zinc-500">{penalty}'</span>
          </div>
        ),
        className: problemData.first_blood
          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 border text-green-400"
          : "bg-green-500/10 text-green-400",
      };
    } else if (problemData.attempts > 0) {
      return {
        display: (
          <div className="flex items-center justify-center">
            <span className="font-bold text-red-400 text-sm">
              -{problemData.attempts}
            </span>
          </div>
        ),
        className: "bg-red-500/10 text-red-400",
      };
    }

    return { display: "·", className: "text-zinc-600" };
  };

  // Get rank badge
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1">
          <RiTrophyFill className="text-yellow-400 text-xl" />
          <span className="font-bold text-yellow-400">1</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center gap-1">
          <RiMedalFill className="text-gray-400 text-xl" />
          <span className="font-bold text-gray-400">2</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center gap-1">
          <RiMedalFill className="text-amber-600 text-xl" />
          <span className="font-bold text-amber-600">3</span>
        </div>
      );
    }
    return <span className="font-semibold text-zinc-400">{rank}</span>;
  };

  if (!standings || standings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-400 text-lg">No standings available yet</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-zinc-800/80 border-b border-zinc-700">
            <th className="px-4 py-4 text-center font-bold text-xs uppercase tracking-wider text-zinc-400 sticky left-0 bg-zinc-800/80 z-10 w-16">
              #
            </th>
            <th className="px-4 py-4 text-left font-bold text-xs uppercase tracking-wider text-zinc-400 sticky left-16 bg-zinc-800/80 z-10 min-w-[250px]">
              Participant
            </th>
            <th className="px-4 py-4 text-center font-bold text-xs uppercase tracking-wider text-zinc-400 w-20">
              <div className="flex flex-col items-center">
                <span>Solved</span>
              </div>
            </th>
            <th className="px-4 py-4 text-center font-bold text-xs uppercase tracking-wider text-zinc-400 w-24">
              <div className="flex flex-col items-center">
                <span>Penalty</span>
              </div>
            </th>
            {problemLetters.map((letter, index) => {
              const stats = getProblemStats(index);
              const problemId = problemMapping[index + 1];
              return (
                <th
                  key={index}
                  className="px-3 py-4 text-center font-bold text-sm text-zinc-300 min-w-[70px] border-l border-zinc-700/50"
                >
                  <Link
                    href={`/contests/${contestId}/${problemId}`}
                    className="flex flex-col items-center gap-1 hover:text-orange-400 transition-colors"
                  >
                    <span>{letter}</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {stats.solved}/{stats.attempted}
                    </span>
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {standings.map((user, index) => {
            const rank = (currentPage - 1) * limit + index + 1;
            const isTopThree = rank <= 3;

            return (
              <tr
                key={user.user_id}
                className={`hover:bg-zinc-800/30 transition-colors ${
                  isTopThree ? "bg-zinc-800/20" : ""
                }`}
              >
                <td className="px-4 py-3 text-center sticky left-0 bg-zinc-900 z-10">
                  {getRankBadge(rank)}
                </td>
                <td className="px-4 py-3 sticky left-16 bg-zinc-900 z-10">
                  <div className="flex flex-col">
                    <p className="font-semibold text-zinc-100 text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{user.username}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center font-bold text-lg text-green-400 bg-green-500/10 rounded px-3 py-1">
                    {user.solved_count}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-zinc-300 text-sm">
                    {user.total_penalty}
                  </span>
                </td>
                {problemLetters.map((_, problemIndex) => {
                  const problemData = getProblemData(
                    user.problems,
                    problemIndex
                  );
                  const cellData = formatProblemCell(problemData);

                  return (
                    <td
                      key={problemIndex}
                      className={`px-3 py-3 text-center transition-all border-l border-zinc-800/50 ${cellData.className}`}
                    >
                      {cellData.display}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
