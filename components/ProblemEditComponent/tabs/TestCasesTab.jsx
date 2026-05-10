"use client";
import Button from "@/components/ButtonComponent/Button";
import TestCaseItem from "../components/TestCaseItem";
import problemModule from "@/api/problem/problem";

export default function TestCasesTab({
  problemData,
  setProblemData,
  setShowTestCaseModal,
  setCurrentTestCaseType,
  setCurrentTestCase,
  setEditingIndex,
  showNotification,
}) {
  const handleAddTestCase = (type) => {
    setCurrentTestCaseType(type);
    setCurrentTestCase({ id: null, input: "", output: "" });
    setEditingIndex(-1); // -1 indicates we're adding a new test case
    setShowTestCaseModal(true);
  };

  const handleEditTestCase = (type, testCase, index) => {
    if (!testCase) {
      return;
    }

    setCurrentTestCaseType(type);
    setCurrentTestCase({
      id: testCase.id ?? null,
      input: testCase.input,
      output: testCase.expectedOutput,
    });
    setEditingIndex(index);
    setShowTestCaseModal(true);
  };

  const handleDeleteTestCase = async (type, testCase) => {
    if (!testCase) {
      return;
    }

    const testCaseId = testCase.id;

    // If the test case has an ID, delete it from the backend
    if (testCaseId) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this ${
          type === "sample" ? "sample" : "regular"
        } test case?`,
      );

      if (!confirmDelete) {
        return;
      }

      try {
        const { data, error } = await problemModule.deleteTestCase(testCaseId);

        if (error) {
          showNotification?.(error, "error");
          return;
        }

        if (data) {
          // Remove from local state after successful deletion
          setProblemData((prev) => ({
            ...prev,
            testCases: prev.testCases.filter((tc) => tc.id !== testCaseId),
          }));
          showNotification?.(
            `${
              type === "sample" ? "Sample" : "Regular"
            } test case deleted successfully!`,
            "success",
          );
        }
      } catch (error) {
        console.error("Error deleting test case:", error);
        showNotification?.(
          "Failed to delete test case. Please try again.",
          "error",
        );
      }
    } else {
      // If no ID, just remove from local state (shouldn't happen with new API flow)
      setProblemData((prev) => ({
        ...prev,
        testCases: prev.testCases.filter((tc) => tc !== testCase),
      }));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white border-b pb-2 border-zinc-700">
        Test Cases
      </h2>

      <div className="space-y-6">
        {/* Sample Test Cases */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-lg font-medium text-zinc-300">
              Sample Test Cases
            </label>
            <Button
              name="Add Sample Test Case"
              onClick={() => handleAddTestCase("sample")}
            />
          </div>

          {problemData.testCases.filter((tc) => tc.isSample).length > 0 ? (
            <div className="space-y-4">
              {problemData.testCases
                .filter((tc) => tc.isSample)
                .map((testCase, index) => (
                  <TestCaseItem
                    key={`sample-${testCase.id || index}`}
                    testCase={{
                      input: testCase.input,
                      output: testCase.expectedOutput,
                    }}
                    index={index}
                    onEdit={() => handleEditTestCase("sample", testCase, index)}
                    onDelete={() => handleDeleteTestCase("sample", testCase)}
                  />
                ))}
            </div>
          ) : (
            <div className="p-4 bg-zinc-700/30 rounded-md text-zinc-400 text-center">
              No sample test cases added yet. Click the button above to add one.
            </div>
          )}
        </div>

        {/* Regular Test Cases */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-lg font-medium text-zinc-300">
              Regular Test Cases
            </label>
            <Button
              name="Add Regular Test Case"
              onClick={() => handleAddTestCase("regular")}
            />
          </div>

          {problemData.testCases.filter((tc) => !tc.isSample).length > 0 ? (
            <div className="space-y-4">
              {problemData.testCases
                .filter((tc) => !tc.isSample)
                .map((testCase, index) => (
                  <TestCaseItem
                    key={`regular-${testCase.id || index}`}
                    testCase={{
                      input: testCase.input,
                      output: testCase.expectedOutput,
                    }}
                    index={index}
                    onEdit={() =>
                      handleEditTestCase("regular", testCase, index)
                    }
                    onDelete={() => handleDeleteTestCase("regular", testCase)}
                  />
                ))}
            </div>
          ) : (
            <div className="p-4 bg-zinc-700/30 rounded-md text-zinc-400 text-center">
              No regular test cases added yet. Click the button above to add
              one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
