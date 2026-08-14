"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@/utils/constants";
import Button from "@/components/ButtonComponent/Button";
import userModule from "@/api/user/user";
import {
  MdPersonSearch,
  MdSave,
  MdWarning,
  MdCheckCircle,
  MdArrowBack,
} from "react-icons/md";

function EditUserPage({ params }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  // Unwrap params using `use()` for Next.js 15+
  const unwrappedParams = use(params);
  const userId = unwrappedParams.userId;

  // Redirect if not admin
  if (
    typeof window !== "undefined" &&
    (!isAuthenticated() || role !== USER_ROLES.ADMIN)
  ) {
    router.push("/");
    return null;
  }

  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    additionalInfo: "",
    roomNo: "",
    pcNo: "",
    allowedContest: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Fetch initial user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setInitialLoading(true);
        const { data, error } = await userModule.getUserInfo(userId);

        if (error) {
          setError(error);
        } else if (data) {
          setUserInfo(data);
          setFormData({
            fullName: data.fullName || "",
            password: "", // Keep password blank
            additionalInfo: data.additionalInfo || "",
            roomNo: data.roomNo || "",
            pcNo: data.pcNo || "",
            allowedContest: data.allowedContest
              ? String(data.allowedContest)
              : "",
          });
        }
      } catch (err) {
        setError("Failed to fetch user information");
      } finally {
        setInitialLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    // Build payload with only non-empty values (omitempty)
    const payload = {};
    if (formData.fullName) payload.fullName = formData.fullName;
    if (formData.password) payload.password = formData.password;
    if (formData.additionalInfo) payload.additionalInfo = formData.additionalInfo;
    if (formData.roomNo) payload.roomNo = formData.roomNo;
    if (formData.pcNo) payload.pcNo = formData.pcNo;
    if (formData.allowedContest)
      payload.allowedContest = formData.allowedContest.trim();

    if (Object.keys(payload).length === 0) {
      setError("Please provide at least one field to update.");
      setLoading(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    const response = await userModule.updateUser(userId, payload);

    if (response.error) {
      setError(response.error);
    } else {
      setSuccess(`User ${userInfo?.username || userId} updated successfully!`);
      // Update form state but keep password empty
      setFormData((prev) => ({ ...prev, password: "" }));
    }

    setLoading(false);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  if (initialLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-zinc-950 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="text-zinc-400 text-lg">Loading user info...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-zinc-950 px-6 py-10 w-full relative overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-3">
              <MdPersonSearch className="text-4xl" />
              Edit User
            </h1>
            <Button
              name="Go Back"
              icon={<MdArrowBack />}
              onClick={() => router.back()}
              bgColor="bg-zinc-800"
              hoverColor="hover:bg-zinc-700"
            />
          </div>
          <p className="text-zinc-400 mt-2 text-sm">
            Updating profile for{" "}
            <strong className="text-zinc-200">@{userInfo?.username}</strong>{" "}
            {userInfo?.role && `(Role: ${userInfo.role})`}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <MdWarning className="text-red-500 text-xl shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-500 font-semibold text-sm">Error</h3>
              <p className="text-red-400/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3">
            <MdCheckCircle className="text-green-500 text-xl shrink-0 mt-0.5" />
            <div>
              <h3 className="text-green-500 font-semibold text-sm">Success</h3>
              <p className="text-green-400/80 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Update user full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Leave empty to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Additional Info
                </label>
                <input
                  type="text"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="User's clan or team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Physical room location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  PC Number
                </label>
                <input
                  type="text"
                  name="pcNo"
                  value={formData.pcNo}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Assigned PC identifier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Allowed Contest (UUID)
                </label>
                <input
                  type="text"
                  name="allowedContest"
                  value={formData.allowedContest}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                  placeholder="Contest ID user can access"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 flex justify-end">
              <Button
                type="submit"
                name={loading ? "Updating..." : "Update User"}
                disabled={loading}
                icon={!loading && <MdSave className="text-xl" />}
                className="w-full md:w-auto"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUserPage;
