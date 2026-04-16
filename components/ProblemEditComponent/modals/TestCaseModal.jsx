"use client";

import { useState } from "react";
import Button from "@/components/ButtonComponent/Button";
import CodeMirror from "@uiw/react-codemirror";
import { material } from "@uiw/codemirror-theme-material";
import problemModule from "@/api/problem/problem";

export default function TestCaseModal({
  isOpen,
  onClose,
  testCaseType,
  testCase,
  setTestCase,
  problemData,
  setProblemData,
  editingIndex,
  showNotification,
}) {
  const [input, setInput] = useState(testCase.input || "");
  const [output, setOutput] = useState(testCase.output || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!input.trim() && !output.trim()) {
      alert("Both input and output must not be empty");
      return;
    }

    setIsSaving(true);

    try {
      if (editingIndex === -1) {
        // Add new test case - send POST request to API
        const { data, error } = await problemModule.addTestCase({
          problem_id: problemData.id,
          input,
          expected_output: output,
          is_sample: testCaseType === "sample",
        });

        if (error) {
          showNotification?.(error, "error");
          setIsSaving(false);
          return;
        }

        if (data) {
          // Add the new test case with the returned ID to the local state
          setProblemData((prev) => ({
            ...prev,
            test_cases: [...prev.test_cases, data],
          }));
          showNotification?.(
            `${
              testCaseType === "sample" ? "Sample" : "Regular"
            } test case added successfully!`,
            "success",
          );
        }
      } else {
        const testCaseId = testCase?.id;
        if (!testCaseId) {
          showNotification?.(
            "Unable to update test case: missing ID.",
            "error",
          );
          setIsSaving(false);
          return;
        }

        const { data, error } = await problemModule.updateTestCase(testCaseId, {
          input,
          expected_output: output,
          is_sample: testCaseType === "sample",
        });

        if (error) {
          showNotification?.(error, "error");
          setIsSaving(false);
          return;
        }

        const updatedFromApi =
          data && typeof data === "object"
            ? {
                ...data,
                id: data.id ?? testCaseId,
                input: data.input ?? input,
                expected_output: data.expected_output ?? output,
                is_sample: data.is_sample ?? testCaseType === "sample",
              }
            : {
                id: testCaseId,
                input,
                expected_output: output,
                is_sample: testCaseType === "sample",
              };

        setProblemData((prev) => ({
          ...prev,
          test_cases: prev.test_cases.map((tc) =>
            tc.id === testCaseId ? { ...tc, ...updatedFromApi } : tc,
          ),
        }));
        showNotification?.(
          `${
            testCaseType === "sample" ? "Sample" : "Regular"
          } test case updated!`,
          "success",
        );
      }

      onClose();
    } catch (error) {
      console.error("Error saving test case:", error);
      showNotification?.(
        "Failed to save test case. Please try again.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-4xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 border-b pb-2 border-zinc-700">
          {editingIndex === -1 ? "Add" : "Edit"}{" "}
          {testCaseType === "sample" ? "Sample" : "Regular"} Test Case
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Input
            </label>
            <div className="border border-zinc-700 rounded-md overflow-hidden">
              <CodeMirror
                value={input}
                height="16rem"
                onChange={setInput}
                theme={material}
                placeholder="Enter test case input..."
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Output
            </label>
            <div className="border border-zinc-700 rounded-md overflow-hidden">
              <CodeMirror
                value={output}
                height="16rem"
                onChange={setOutput}
                theme={material}
                placeholder="Enter expected output..."
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-700 mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <Button
            name={isSaving ? "Saving..." : "Save Test Case"}
            onClick={handleSave}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
