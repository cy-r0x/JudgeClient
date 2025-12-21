"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import ProblemComponent from "@/components/ProblemListComponent/ProblemListComponent";
import TimeCounterComponent from "@/components/TimeCounterComponent/TimeCounterComponent";
import Bar from "@/components/BarComponent/BarComponent";

import EmptyState from "@/components/EmptyState/EmptyState";
import PageLoading from "@/components/LoadingSpinner/PageLoading";
import contestModule from "@/api/contest/contest";

function ProblemList({ params }) {
  const { contestId } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ contest: null, problems: [] });

  useEffect(() => {
    const fetchContestData = async () => {
      if (!contestId) return;

      setLoading(true);
      try {
        const response = await contestModule.getContest(contestId);
        console.log(response);
        if (response.error) {
          setError(response.error);
        } else {
          setData(response.data);
        }
      } catch (err) {
        setError("Failed to load contest data");
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [contestId]);

  if (loading) {
    return <PageLoading text="Loading contest..." />;
  }

  if (error) {
    return (
      <div className="mx-8 my-4">
        <Bar title={"Error"} />
        <div className="mt-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { contest, problems } = data;

  // Calculate end time from start_time and duration_seconds
  const startTime = new Date(contest.start_time).getTime() / 1000; // Convert to Unix timestamp
  const endTime = startTime + contest.duration_seconds;

  return (
    <>
      <div className="flex my-4 mx-8 gap-x-4">
        <div className="flex-7 space-y-4">
          <Bar title={"Problems"} />
          <div className="flex flex-col gap-2">
            {problems && problems.length > 0 ? (
              problems.map((problem) => (
                <Link
                  href={`/contests/${contestId}/${problem.id}`}
                  key={problem.id}
                >
                  <ProblemComponent
                    problemData={problem}
                    index={problem.index}
                  />
                </Link>
              ))
            ) : (
              <EmptyState
                title="No Problems Available"
                description="Problems will be added soon"
              />
            )}
          </div>
        </div>

        <div className="flex-3 text-wrap space-y-4">
          <div className="space-y-4">
            <Bar title={contest.title} />
            <TimeCounterComponent startUnix={startTime} endUnix={endTime} />
          </div>

          <div className="space-y-4">
            <Bar title={"Setters"} />
            <div className="min-h-32 border-4 border-zinc-800 flex items-center justify-center px-4 text-justify">
              <p className="text-zinc-400">
                Author information will be available soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProblemList;
