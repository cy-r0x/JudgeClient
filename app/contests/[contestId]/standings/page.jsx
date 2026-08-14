"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Bar from "@/components/BarComponent/BarComponent";
import StandingsComponent from "@/components/StandingsComponent/StandingsComponent";
import { CompactTimer } from "@/components/TimeCounterComponent/TimeCounterComponent";
import Pagination from "@/components/Pagination/Pagination";
import contestModule from "@/api/contest/contest";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

/**
 * Contest Standings Page - Client Component
 * Displays the leaderboard for a specific contest
 * Automatically refreshes standings data every 15 seconds
 * Public page - no authentication required
 *
 * @param {Object} props - Page props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.contestId - Contest ID from URL
 * @returns {JSX.Element} Standings page
 */
export default function StandingsPage({ params }) {
  const [standingsData, setStandingsData] = useState(null);
  const [standingsError, setStandingsError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contestId, setContestId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Unwrap params
  useEffect(() => {
    params.then((resolvedParams) => {
      setContestId(resolvedParams.contestId);
    });
  }, [params]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    if (!Number.isNaN(parsed) && parsed > 0) {
      setCurrentPage(parsed);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams]);

  // Fetch standings data
  const fetchStandings = async (page = 1, options = {}) => {
    if (!contestId) return;

    const { silent = false } = options;
    const hasExistingData = Boolean(standingsData);

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    try {
      const { data, error } = await contestModule.getContestStandings(
        contestId,
        page
      );

      if (error) {
        if (!silent || !hasExistingData) {
          setStandingsError(error);
        }
        // Keep existing table data visible during background refresh failures.
        if (!silent) {
          setStandingsData(null);
        }
      } else {
        setStandingsData(data);
        setStandingsError(null);
      }
    } catch (err) {
      if (!silent || !hasExistingData) {
        setStandingsError("Failed to load standings");
      }
      // Keep existing table data visible during background refresh failures.
      if (!silent) {
        setStandingsData(null);
      }
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsInitialLoading(false);
      }
    }
  };

  // Initial fetch and setup interval for auto-refresh
  useEffect(() => {
    if (!contestId) return;

    // Fetch immediately
    fetchStandings(currentPage);

    // Set up interval for auto-refresh (15 seconds)
    const interval = setInterval(() => {
      fetchStandings(currentPage, { silent: true });
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [contestId, currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    router.push(`?page=${page}`, { scroll: false });
  };

  if (isInitialLoading && !standingsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading Standings..." />
      </div>
    );
  }

  if (standingsError) {
    return (
      <div className="min-h-screen">
        <Bar title="Standings" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-900/30 border border-red-500 rounded-lg px-6 py-4">
            <p className="text-red-300">
              {standingsError || "Failed to load standings"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const contestTitle = standingsData?.contest_title || "Contest";
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Contest Header */}
        <div className="mb-6 bg-zinc-800 rounded-lg px-6 py-5 border-b-4 border-orange-500 shadow-lg">
          <div className="text-center">
            <p className="text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Standings
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">
              {contestTitle}
            </h1>
          </div>
        </div>

        {/* Compact Timer */}
        {standingsData?.startTime && standingsData?.durationSeconds && (
          <div className="mb-6">
            <CompactTimer
              startTime={standingsData.startTime}
              durationSeconds={standingsData.durationSeconds}
            />
          </div>
        )}

        {/* Standings Table */}
        <div className="bg-zinc-900 rounded-lg shadow-xl overflow-hidden border border-zinc-800">
          <StandingsComponent
            standingsData={standingsData}
            currentPage={currentPage}
            limit={standingsData?.limit || 100}
          />
        </div>

        {isRefreshing && (
          <p className="mt-3 text-xs text-zinc-500 text-right">Refreshing standings...</p>
        )}

        {/* Pagination */}
        {standingsData && standingsData.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={standingsData.totalPages}
            totalItems={standingsData.totalItem}
            limit={standingsData.limit}
            onPageChange={handlePageChange}
            itemName="participants"
          />
        )}
      </div>
    </div>
  );
}
