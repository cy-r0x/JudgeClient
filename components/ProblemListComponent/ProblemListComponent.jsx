import { RiGroupLine, RiCheckLine, RiCloseCircleLine } from "react-icons/ri";

function ProblemComponent({ problemData, index }) {
  const { solved, attempted, totalSolvers, title } = problemData;

  // Determine status badge
  const getStatusBadge = () => {
    if (solved) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-green-400 text-sm font-medium">
          <RiCheckLine size={16} />
          <span>Solved</span>
        </div>
      );
    }
    if (attempted) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded text-yellow-400 text-sm font-medium">
          <RiCloseCircleLine size={16} />
          <span>Attempted</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-zinc-800 border-4 border-zinc-800 hover:border-orange-500 px-4 py-4 flex items-center justify-between cursor-pointer transition-all duration-200 group`}
    >
      <div className="flex gap-4 items-center flex-1">
        {/* Problem Index */}
        <div
          className={`text-4xl font-bold ${
            solved
              ? "text-green-400"
              : attempted
              ? "text-yellow-400"
              : "text-zinc-500"
          } group-hover:text-orange-400 transition-colors`}
        >
          {String.fromCharCode("A".charCodeAt(0) + index - 1)}
        </div>

        {/* Problem Title and Status */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-lg font-medium">{title}</p>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Solvers Count */}
      <div className="flex items-center gap-2 px-3 py-1 bg-zinc-700/50 rounded justify-around">
        <RiGroupLine size={18} className="text-zinc-400" />
        <span className="text-base font-medium text-zinc-300">
          x{totalSolvers || 0}
        </span>
      </div>
    </div>
  );
}

export default ProblemComponent;
