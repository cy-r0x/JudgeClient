"use client";

import { useEffect, useState } from "react";
import { MdCreate, MdList, MdPerson } from "react-icons/md";
import Button from "@/components/ButtonComponent/Button";
import CreateContestModal from "@/components/CreateContestModal/CreateContestModal";
import contestModule from "@/api/contest/contest";
import userModule from "@/api/user/user";
import { withRole } from "@/components/HOC/withAuth";
import { USER_ROLES } from "@/utils/constants";
import axios from "axios";
import { getToken } from "@/utils/auth";
import ContestsList from "@/components/AdminPanel/ContestsList";
import SettersList from "@/components/AdminPanel/SettersList";
import CreateSetterForm from "@/components/AdminPanel/CreateSetterForm";
import SearchBar from "@/components/AdminPanel/SearchBar";
import AvailableProblemsList from "@/components/AdminPanel/AvailableProblemsList";

function AdminPanel() {
  const [contestList, setContestList] = useState([]);
  const [setterList, setSetterList] = useState([]);
  const [activeItem, setActiveItem] = useState(0);
  const [modalActive, setModalActive] = useState(false);
  const [createSetterActive, setCreateSetterActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setterError, setSetterError] = useState("");
  const [setterSuccess, setSetterSuccess] = useState("");

  useEffect(() => {
    if (activeItem === 0) {
      fetchContests();
    } else if (activeItem === 1) {
      fetchSetters();
    }
  }, [activeItem]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contestModule.getContests();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && Array.isArray(response.data)) {
        setContestList(response.data);
      } else {
        setContestList([]);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      setError(error.message || "Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  const fetchSetters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userModule.getSetters();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && Array.isArray(response.data)) {
        setSetterList(response.data);
      } else {
        setSetterList([]);
      }
    } catch (error) {
      console.error("Error fetching setters:", error);
      setError(error.message || "Failed to load setters");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalActive(true);
  };

  const handleCreateSetter = () => {
    setCreateSetterActive(!createSetterActive);
    setSetterError("");
    setSetterSuccess("");
  };

  const handleSetterSubmit = async (formData) => {
    setSetterError("");
    setSetterSuccess("");
    try {
      const response = await userModule.Register({
        fullName: formData.name,
        username: formData.username,
        password: formData.password,
        role: "setter",
      });

      if (response.error) {
        setSetterError(response.error);
        return;
      }

      setSetterSuccess("Setter created successfully!");
      setCreateSetterActive(false);
      fetchSetters();
    } catch (err) {
      setSetterError(
        err.response?.data?.message ||
          "Failed to create setter. Please try again."
      );
    }
  };

  const handleDeleteSetter = async (userId) => {
    if (!confirm("Are you sure you want to delete this setter?")) {
      return;
    }
    setSetterError("");
    setSetterSuccess("");
    try {
      const token = getToken();
      const response = await axios.post(
        `/api/users/delete/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setSetterSuccess("Setter deleted successfully!");
        fetchSetters();
      }
    } catch (error) {
      setSetterError(
        error.response?.data?.message || "Failed to delete setter"
      );
    }
  };

  const menuItems = [
    {
      title: "Available Contests",
      icon: <MdList className="text-xl" />,
    },
    {
      title: "Manage Setters",
      icon: <MdPerson className="text-xl" />,
    },
    {
      title: "View Available Problems",
      icon: <MdCreate className="text-xl" />,
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-linear-to-br from-zinc-950 to-zinc-900">
      {modalActive && (
        <CreateContestModal
          isOpen={modalActive}
          onClose={() => setModalActive(false)}
        />
      )}

      {/* Sidebar */}
      <div className="w-72 bg-zinc-900/80 shadow-xl backdrop-blur-sm border-r border-zinc-800">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-orange-400">Admin Panel</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage contests and competitions
          </p>
        </div>

        <div className="py-2 px-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 ml-2">
            Navigation
          </p>
          {menuItems.map((item, idx) => (
            <div
              className={`px-4 py-3 mb-1 rounded-lg transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                activeItem === idx
                  ? "bg-orange-500/90 text-white shadow-md shadow-orange-900/20 font-medium"
                  : "hover:bg-zinc-800/70 text-zinc-400 hover:text-white"
              }`}
              key={`nav-item-${idx}`}
              onClick={() => setActiveItem(idx)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="w-full">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-800/50 p-6 h-full">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                {menuItems[activeItem].icon}
              </span>
              <h1 className="text-2xl font-bold text-white">
                {menuItems[activeItem].title}
              </h1>
            </div>
            <div>
              {activeItem === 0 && (
                <Button
                  name="Create New Contest"
                  icon={<MdCreate />}
                  onClick={handleCreate}
                  disabled={loading}
                />
              )}
              {activeItem === 1 && (
                <Button
                  name={createSetterActive ? "Cancel" : "Create New Setter"}
                  icon={<MdCreate />}
                  onClick={handleCreateSetter}
                />
              )}
            </div>
          </div>

          {activeItem === 1 && createSetterActive && (
            <CreateSetterForm
              onSubmit={handleSetterSubmit}
              onCancel={handleCreateSetter}
              errorMessage={setterError}
              successMessage={setterSuccess}
            />
          )}

          <div>
            {activeItem === 0 && (
              <SearchBar placeholder="Search contests..." disabled={loading} />
            )}

            {activeItem === 1 && (
              <SearchBar placeholder="Search setters..." disabled={loading} />
            )}

            {activeItem === 2 && (
              <SearchBar placeholder="Search problems..." disabled={loading} />
            )}

            {activeItem === 0 ? (
              <ContestsList
                contests={contestList}
                loading={loading}
                error={error}
                onRetry={fetchContests}
                onCreate={handleCreate}
              />
            ) : activeItem === 1 ? (
              <SettersList
                setters={setterList}
                loading={loading}
                error={error}
                onRetry={fetchSetters}
                onCreate={handleCreateSetter}
                onDelete={handleDeleteSetter}
                successMessage={setterSuccess}
                errorMessage={setterError}
              />
            ) : (
              <AvailableProblemsList loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRole(AdminPanel, USER_ROLES.ADMIN);
