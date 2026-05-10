"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdInfo,
  MdDescription,
  MdCode,
  MdSpeed,
  MdCheckCircle,
} from "react-icons/md";
import BasicInfoTab from "./tabs/BasicInfoTab";
import DescriptionTab from "./tabs/DescriptionTab";
import TestCasesTab from "./tabs/TestCasesTab";
import LimitsTab from "./tabs/LimitsTab";
import SolutionsTab from "./tabs/SolutionsTab";
import CheckerTab from "./tabs/CheckerTab";
import TestCaseModal from "./modals/TestCaseModal";
import SolutionModal from "./modals/SolutionModal";
import Button from "@/components/ButtonComponent/Button";
import NotificationComponent from "@/components/NotificationComponent/NotificationComponent";
import problemMoudle from "@/api/problem/problem";

export default function ProblemEditComponent({ problemId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [problemData, setProblemData] = useState({
    id: 0,
    slug: "",
    title: "",
    statement: "",
    inputStatement: "",
    outputStatement: "",
    timeLimit: 1,
    memoryLimit: 256,
    testCases: [],
    solutions: [],
    checkerType: "string",
    checkerStrictSpace: false,
    checkerPrecision: null,
    created_by: 0,
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);

        // Validate problemId
        if (!problemId) {
          throw new Error("No problem ID provided");
        }

        // Fetch problem data
        const { data, error } = await problemMoudle.getProblem(problemId);

        if (error) {
          throw new Error(error);
        }

        // Set the problem data (getProblem now handles test_cases normalization)
        if (data) {
          setProblemData((prev) => ({
            ...prev,
            ...data,
            checkerType: data.checkerType || "string",
            checkerStrictSpace:
              data.checkerStrictSpace !== undefined
                ? data.checkerStrictSpace
                : false,
            checkerPrecision: data.checkerPrecision || null,
          }));
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        // Note: Auth errors (401) are handled by apiClient interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]); // Added dependency to re-fetch if problemId changes

  // Modal states
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [currentTestCaseType, setCurrentTestCaseType] = useState("sample"); // "sample" or "regular"
  const [currentTestCase, setCurrentTestCase] = useState({
    input: "",
    output: "",
  });
  const [currentSolution, setCurrentSolution] = useState({
    language: "cpp",
    source: "",
  });
  const [editingIndex, setEditingIndex] = useState(-1); // -1 for new, >= 0 for editing existing

  // Notification states
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

  const showNotification = (message, type = "info") => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  //solution has not been implemented yet!
  const menuItems = [
    {
      title: "Basic Info",
      icon: <MdInfo className="text-xl" />,
    },
    {
      title: "Problem Description",
      icon: <MdDescription className="text-xl" />,
    },
    {
      title: "Test Cases",
      icon: <MdCode className="text-xl" />,
    },
    {
      title: "Limits",
      icon: <MdSpeed className="text-xl" />,
    },
    {
      title: "Checker",
      icon: <MdCheckCircle className="text-xl" />,
    },
  ];

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProblemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { data, error } = await problemMoudle.updateProblem(problemData);

      if (error) {
        // Handle API error response
        showNotification(error, "error");
      } else if (data) {
        // Success - update local data with response and show success message
        setProblemData(data);
        showNotification("Problem updated successfully!", "success");
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Error saving problem:", error);
      showNotification("Failed to save problem. Please try again.", "error");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-linear-to-br from-zinc-950 to-zinc-900">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900/80 shadow-xl backdrop-blur-sm border-r border-zinc-800 flex flex-col">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-orange-400">
            {loading ? "Loading..." : problemData.title || "Problem Edit"}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Problem Management</p>
        </div>

        <div className="py-2 px-3 flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 ml-2">
            Navigation
          </p>
          {menuItems.map((item, idx) => (
            <div
              className={`px-4 py-3 mb-1 rounded-lg transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                activeTab === idx
                  ? "bg-orange-500/90 text-white shadow-md shadow-orange-900/20 font-medium"
                  : "hover:bg-zinc-800/70 text-zinc-400 hover:text-white"
              }`}
              key={`nav-item-${idx}`}
              onClick={() => setActiveTab(idx)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="w-full">{item.title}</span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800 mt-4">
          <Button
            name={loading ? "Loading..." : "Save Changes"}
            onClick={handleSave}
            disabled={loading}
            className="w-full"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-800/50 p-6">
            <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-zinc-800">
              <span className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                {menuItems[activeTab].icon}
              </span>
              <h1 className="text-2xl font-bold text-white">
                {menuItems[activeTab].title}
              </h1>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-zinc-300 text-lg">
                    Loading problem data...
                  </span>
                </div>
              </div>
            ) : (
              <div>
                {activeTab === 0 && (
                  <BasicInfoTab
                    problemData={problemData}
                    handleInputChange={handleInputChange}
                  />
                )}
                {activeTab === 1 && (
                  <DescriptionTab
                    problemData={problemData}
                    setProblemData={setProblemData}
                  />
                )}
                {activeTab === 2 && (
                  <TestCasesTab
                    problemData={problemData}
                    setProblemData={setProblemData}
                    setShowTestCaseModal={setShowTestCaseModal}
                    setCurrentTestCaseType={setCurrentTestCaseType}
                    setCurrentTestCase={setCurrentTestCase}
                    setEditingIndex={setEditingIndex}
                    showNotification={showNotification}
                  />
                )}
                {activeTab === 3 && (
                  <LimitsTab
                    problemData={problemData}
                    handleInputChange={handleInputChange}
                  />
                )}
                {activeTab === 4 && (
                  <CheckerTab
                    problemData={problemData}
                    setProblemData={setProblemData}
                  />
                )}
                {activeTab === 5 && (
                  <SolutionsTab
                    problemData={problemData}
                    setProblemData={setProblemData}
                    setShowSolutionModal={setShowSolutionModal}
                    setCurrentSolution={setCurrentSolution}
                    setEditingIndex={setEditingIndex}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTestCaseModal && (
        <TestCaseModal
          isOpen={showTestCaseModal}
          onClose={() => setShowTestCaseModal(false)}
          testCaseType={currentTestCaseType}
          testCase={currentTestCase}
          setTestCase={setCurrentTestCase}
          problemData={problemData}
          setProblemData={setProblemData}
          editingIndex={editingIndex}
          showNotification={showNotification}
        />
      )}

      {showSolutionModal && (
        <SolutionModal
          isOpen={showSolutionModal}
          onClose={() => setShowSolutionModal(false)}
          solution={currentSolution}
          setSolution={setCurrentSolution}
          problemData={problemData}
          setProblemData={setProblemData}
          editingIndex={editingIndex}
        />
      )}

      {/* Notification Component */}
      <NotificationComponent
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}
