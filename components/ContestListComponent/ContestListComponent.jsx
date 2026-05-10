"use client";

import StatusComponent from "../StatusComponent/StatusComponent";
import { formatFullDate, formatDuration } from "@/utils/dateFormatter";

function ContestListComponent({ data }) {
  const durationText = data.durationSeconds
    ? formatDuration(data.durationSeconds)
    : data.duration || "Unknown";

  return (
    <div className="border-4 border-zinc-800 flex w-full justify-between items-center px-4 py-2 bg-zinc-800 rounded-lg text-base hover:border-orange-500 hover:scale-[100.2%]  transition-all cursor-pointer">
      <div className="space-y-2">
        <p className="lg:text-xl font-semibold">{data.title}</p>
        <p className="text-sm lg:text-base">
          Starting: {formatFullDate(data.startTime)}
        </p>
        <p className="text-sm lg:text-base">
          Duration: <span className="font-semibold">{durationText}</span>
        </p>
      </div>
      <div>
        <StatusComponent status={data.status} />
      </div>
    </div>
  );
}

export default ContestListComponent;
