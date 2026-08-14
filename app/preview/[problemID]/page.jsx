"use client";
import ProblemPreviewComponent from "@/components/ProblemPreviewComponent/ProblemPreviewComponet";
import problemModule from "@/api/problem/problem";
import { use, useEffect, useState } from "react";

export default function PreviewPage({ params }) {
  const { problemID } = use(params);
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!problemID) return;

    const fetchProblem = async () => {
      setLoading(true);
      const { data, error } = await problemModule.getProblem(problemID);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Problem not found");
        setLoading(false);
        return;
      }

      // Parse JSON strings in-place with proper validation
      const parsedData = { ...data };
      if (
        typeof parsedData.statement === "string" &&
        parsedData.statement.trim()
      ) {
        try {
          parsedData.statement = JSON.parse(parsedData.statement);
        } catch (e) {
          console.error("Error parsing statement:", e);
        }
      }
      if (
        typeof parsedData.inputStatement === "string" &&
        parsedData.inputStatement.trim()
      ) {
        try {
          parsedData.inputStatement = JSON.parse(parsedData.inputStatement);
        } catch (e) {
          console.error("Error parsing inputStatement:", e);
          parsedData.inputStatement = "";
        }
      }
      if (
        typeof parsedData.outputStatement === "string" &&
        parsedData.outputStatement.trim()
      ) {
        try {
          parsedData.outputStatement = JSON.parse(parsedData.outputStatement);
        } catch (e) {
          console.error("Error parsing outputStatement:", e);
          parsedData.outputStatement = "";
        }
      }

      setProblemData(parsedData);
      setLoading(false);
    };

    fetchProblem();
  }, [problemID]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-zinc-300 text-lg">Loading problem...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-400">Error: {error}</div>;
  }

  if (!problemData) {
    return null;
  }

  return (
    <>
      <ProblemPreviewComponent problem={problemData} problemID={problemID} />
    </>
  );
}
