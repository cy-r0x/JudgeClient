import { CopyButton } from "./ClientComponents";
import KatexRenderer from "@/components/KatexRenderer/KatexRenderer";
import convertTiptapToHtml from "@/utils/tiptapToHtml";
import Link from "next/link";
import { useMemo } from "react";

export default function ProblemViewComponent({ problem, contestId }) {
  const descriptionHtml = useMemo(
    () => convertTiptapToHtml(problem.statement),
    [problem.statement]
  );
  const inputDescriptionHtml = useMemo(
    () => convertTiptapToHtml(problem.inputStatement),
    [problem.inputStatement]
  );
  const outputDescriptionHtml = useMemo(
    () => convertTiptapToHtml(problem.outputStatement),
    [problem.outputStatement]
  );

  // Filter sample test cases
  const sampleTestCases = problem.testCases
    ? problem.testCases.filter((tc) => tc.isSample)
    : [];

  return (
    <>
      <div className=" overflow-y-auto p-4">
        {/* Back button */}
        <div className="mb-3">
          {contestId ? (
            <Link
              href={`/contests/${contestId}`}
              className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Problems
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>

        <div className="border border-zinc-800 p-2 rounded mb-4">
          <p className="font-medium">
            Time Limit: {problem.timeLimit}s | Memory Limit:{" "}
            {problem.memoryLimit}MB
          </p>
        </div>

        <div className="prose max-w-none leading-relaxed text-gray-700 dark:text-gray-300">
          <KatexRenderer html={descriptionHtml} />
        </div>

        <div className="space-y-4 mb-4">
          {/* input desc */}
          <div className="space-y-2">
            <p className="text-2xl font-bold">Input</p>
            <KatexRenderer html={inputDescriptionHtml} />
          </div>

          {/* output desc */}
          <div className="space-y-2">
            <p className="text-2xl font-bold">Output</p>
            <KatexRenderer html={outputDescriptionHtml} />
          </div>
        </div>

        {/* sample input/output section */}
        {sampleTestCases.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold">Sample Test Cases</h2>
            {sampleTestCases.map((sample, index) => (
              <div
                key={sample.id || index}
                className="border border-zinc-800 rounded-lg overflow-hidden"
              >
                {/* Header */}
                {sampleTestCases.length > 1 && (
                  <div className="bg-zinc-800/30 px-4 py-2 border-b border-zinc-800">
                    <h3 className="font-semibold text-sm">
                      Test Case {index + 1}
                    </h3>
                  </div>
                )}

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 divide-x divide-zinc-800">
                  {/* Input Column */}
                  <div className="relative">
                    <div className="bg-zinc-900/30 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                      <h4 className="font-semibold text-sm h-8">Input</h4>
                      <CopyButton text={sample.input} />
                    </div>
                    <div className="p-4">
                      <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
                        {sample.input}
                      </pre>
                    </div>
                  </div>

                  {/* Output Column */}
                  <div className="relative">
                    <div className="bg-zinc-900/30 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                      <h4 className="font-semibold text-sm h-8">Output</h4>
                      <CopyButton text={sample.expectedOutput} />
                    </div>
                    <div className="p-4">
                      <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
                        {sample.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
