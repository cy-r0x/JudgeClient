"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdInfo, MdPeople, MdQuestionAnswer } from "react-icons/md";
import ContestDetailsTab from "@/components/ContestEditComponent/tabs/ContestDetailsTab";
import ManageUsersTab from "@/components/ContestEditComponent/tabs/ManageUsersTab";
import ManageProblemsTab from "@/components/ContestEditComponent/tabs/ManageProblemsTab";
import Button from "@/components/ButtonComponent/Button";
import NotificationComponent from "@/components/NotificationComponent/NotificationComponent";
import contestModule from "@/api/contest/contest";

export default function ContestManageComponent({ contestId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [contestData, setContestData] = useState({
    contest: {
      id: 0,
      title: "",
      userPrefix: "",
      description: "",
      startTime: "",
      durationSeconds: 0,
      status: "",
      createdAt: "",
    },
    problems: [],
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);

        // Validate contestId
        if (!contestId) {
          throw new Error("Contest ID not provided");
        }

        // Fetch contest data
        const { data, error } = await contestModule.getContest(contestId);

        if (error) {
          throw new Error(error);
        }

        // Set the contest data
        if (data) {
          setContestData(data);
        }
      } catch (error) {
        console.error("Error fetching contest:", error);
        // Note: Auth errors (401) are handled by apiClient interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId, router]);

  const menuItems = [
    {
      title: "Contest Details",
      icon: <MdInfo className="text-xl" />,
    },
    {
      title: "Manage Users",
      icon: <MdPeople className="text-xl" />,
    },
    {
      title: "Manage Problems",
      icon: <MdQuestionAnswer className="text-xl" />,
    },
  ];

  const handleSave = async () => {
    try {
      // Convert start_time to ISO format before sending
      const contestToUpdate = {
        ...contestData.contest,
        startTime: new Date(contestData.contest.startTime).toISOString(),
      };

      const { data, error } = await contestModule.updateContest(
        contestToUpdate
      );

      if (error) {
        showNotification(error, "error");
      } else if (data) {
        setContestData((prev) => ({ ...prev, contest: data }));
        showNotification("Contest updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving contest:", error);
      showNotification("Failed to save contest. Please try again.", "error");
    }
  };

  const handleViewSubmissions = () => {
    router.push(`/admin/submissions/${contestId}`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-linear-to-br from-zinc-950 to-zinc-900">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900/80 shadow-xl backdrop-blur-sm border-r border-zinc-800 flex flex-col">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-orange-400">
            {loading ? "Loading..." : contestData.contest.title}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Contest Management</p>
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
                    Loading contest data...
                  </span>
                </div>
              </div>
            ) : (
              <div>
                {activeTab === 0 && (
                  <ContestDetailsTab
                    contestData={contestData}
                    setContestData={setContestData}
                  />
                )}
                {activeTab === 1 && (
                  <ManageUsersTab
                    contestData={contestData}
                    setContestData={setContestData}
                    showNotification={showNotification}
                  />
                )}
                {activeTab === 2 && (
                  <ManageProblemsTab
                    contestData={contestData}
                    setContestData={setContestData}
                    showNotification={showNotification}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
