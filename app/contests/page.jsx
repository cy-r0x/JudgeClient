"use client";

import { useEffect, useState } from "react";
import contestModule from "@/api/contest/contest";
import Bar from "@/components/BarComponent/BarComponent";
import ContestListComponent from "@/components/ContestListComponent/ContestListComponent";
import Link from "next/link";
import EmptyState from "@/components/EmptyState/EmptyState";
import PageLoading from "@/components/LoadingSpinner/PageLoading";

export default function Contest() {
  const [contests, setContests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContests = async () => {
      const response = await contestModule.getContests();
      if (response.error) {
        setError(response.error);
      } else {
        setContests(response.data || []);
      }
      setLoading(false);
    };

    loadContests();
  }, []);

  if (loading) {
    return <PageLoading text="Loading contests..." />;
  }

  if (error) {
    return (
      <div className="mx-8 my-4">
        <Bar title={"Contests"} />
        <div className="mt-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-8 my-4">
        <Bar title={"Contests"}></Bar>
        <div className="flex flex-col gap-2 my-4">
          {contests.length > 0 ? (
            contests.map((contest) => (
              <Link href={`/contests/${contest.id}`} key={contest.id}>
                <div>
                  <ContestListComponent data={contest} />
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="No Contests Available"
              description="Check back later for upcoming contests"
            />
          )}
        </div>
      </div>
    </>
  );
}
