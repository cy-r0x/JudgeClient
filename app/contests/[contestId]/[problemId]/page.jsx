"use client";

import { use, useState, useEffect } from "react";
import { EditorSection } from "@/components/ProblemViewComponent/ClientComponents";
import ProblemViewComponent from "@/components/ProblemViewComponent/ProblemViewComponent";
import { CompactTimer } from "@/components/TimeCounterComponent/TimeCounterComponent";
import problemModule from "@/api/problem/problem";
import PageLoading from "@/components/LoadingSpinner/PageLoading";

export default function ProblemDescription({ params }) {
  const { contestId, problemId } = use(params);
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      setLoading(true);
      const { data, error } = await problemModule.getProblem(problemId);

      if (error) {
        // Auth errors (401) handled by apiClient interceptor
        console.error("Error fetching problem:", error);
        setLoading(false);
        return;
      }

      if (!data) {
        // Auth errors (401) handled by apiClient interceptor
        console.error("Problem not found");
        setLoading(false);
        return;
      }

      // Parse JSON strings in-place
      const parsedData = { ...data };
      if (typeof parsedData.statement === "string") {
        try {
          parsedData.statement = JSON.parse(parsedData.statement);
        } catch (e) {
          console.error("Error parsing statement:", e);
        }
      }
      if (typeof parsedData.inputStatement === "string") {
        try {
          parsedData.inputStatement = JSON.parse(parsedData.inputStatement);
        } catch (e) {
          console.error("Error parsing inputStatement:", e);
        }
      }
      if (typeof parsedData.outputStatement === "string") {
        try {
          parsedData.outputStatement = JSON.parse(parsedData.outputStatement);
        } catch (e) {
          console.error("Error parsing outputStatement:", e);
        }
      }

      parsedData.contestId = contestId;

      setProblemData(parsedData);
      setLoading(false);
    };

    fetchProblem();
  }, [problemId, contestId]);

  if (!contestId || !problemId || loading) {
    return <PageLoading text="Loading problem..." size="xl" />;
  }

  if (!problemData) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden">
      <div className="flex grow overflow-hidden">
        {/* Problem description - 60% width */}
        <div className="w-[60%] overflow-auto border-r border-zinc-700">
          <ProblemViewComponent problem={problemData} contestId={contestId} />
        </div>
        {/* Editor section - 40% width - Client-side rendered */}
        <div className="w-[40%] flex flex-col overflow-hidden">
          {/* Timer at top of editor section */}
          {problemData.startTime && problemData.durationSeconds && (
            <CompactTimer
              startTime={problemData.startTime}
              durationSeconds={problemData.durationSeconds}
            />
          )}
          <div className="grow overflow-hidden">
            <EditorSection problemData={problemData} contestId={contestId} />
          </div>
        </div>
      </div>
    </div>
  );
}
