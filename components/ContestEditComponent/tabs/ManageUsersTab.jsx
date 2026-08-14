"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ButtonComponent/Button";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdSearch,
  MdPersonAdd,
  MdUpload,
  MdClose,
  MdDownload,
} from "react-icons/md";
import userModule from "@/api/user/user";

export default function ManageUsersTab({
  contestData,
  setContestData,
  showNotification,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvData, setCSVData] = useState({
    prefix: "",
    clan_length: "",
    file: null,
  });
  const [csvFileInputKey, setCSVFileInputKey] = useState(Date.now());
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    password: "",
    roomNo: "",
    pcNo: "",
    allowedContest: contestData.contest.id,
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch contest users on component mount
  useEffect(() => {
    fetchContestUsers();
  }, [contestData.contest.id]);

  const fetchContestUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await userModule.getContestUsers(
        contestData.contest.id,
      );

      if (error) {
        showNotification(error, "error");
      } else if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !newUser.fullName.trim() ||
      !newUser.username.trim() ||
      !newUser.password.trim()
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      // Prepare user data
      const userData = {
        fullName: newUser.fullName,
        username: newUser.username,
        password: newUser.password,
        roomNo: newUser.roomNo || null,
        pcNo: newUser.pcNo || null,
        allowedContest: contestData.contest.id,
      };

      const { data, error } = await userModule.Register(userData);

      if (error) {
        showNotification(error, "error");
      } else if (data) {
        // Reset form
        setNewUser({
          fullName: "",
          username: "",
          password: "",
          roomNo: "",
          pcNo: "",
          allowedContest: contestData.contest.id,
        });
        setShowAddUser(false);
        showNotification("User registered successfully!", "success");

        // Refresh users list
        await fetchContestUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      showNotification("Failed to register user. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await userModule.deleteUser(userId);

      if (error) {
        showNotification(error, "error");
      } else {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        showNotification("User deleted successfully!", "success");
        await fetchContestUsers();
      }
    } catch (error) {
      console.error("Error removing user:", error);
      showNotification(
        "Failed to delete user. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCSVInputChange = (e) => {
    const { name, value } = e.target;
    setCSVData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCSVData((prev) => ({
        ...prev,
        file: file,
      }));
    } else {
      showNotification("Please select a valid CSV file", "error");
      e.target.value = "";
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();

    // Validation
    if (!csvData.prefix.trim()) {
      showNotification("Please enter a username prefix", "error");
      return;
    }

    if (!csvData.clan_length.trim()) {
      showNotification("Please enter clan length", "error");
      return;
    }

    if (!csvData.file) {
      showNotification("Please select a CSV file", "error");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("prefix", csvData.prefix);
      formData.append("clan_length", csvData.clan_length);
      formData.append("contestId", contestData.contest.id);
      formData.append("file", csvData.file);

      const { data, error } = await userModule.RegisterCSV(formData);

      if (error) {
        showNotification(error, "error");
      } else if (data) {
        showNotification("Users registered successfully via CSV!", "success");
        // Reset form
        setCSVData({
          prefix: "",
          clan_length: "",
          file: null,
        });
        setCSVFileInputKey(Date.now()); // Reset file input
        setShowCSVUpload(false);
        // Refresh users list
        await fetchContestUsers();
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      showNotification("Failed to upload CSV. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUserCreds = async () => {
    try {
      setLoading(true);

      const { data, error, filename } = await userModule.DownloadUserCredsCSV(
        contestData.contest.id,
      );

      if (error) {
        showNotification(error, "error");
      } else if (data) {
        // Create a download link and trigger download
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          filename || `contest_${contestData.contest.id}_users.csv`,
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        showNotification(
          "User credentials CSV downloaded successfully!",
          "success",
        );
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      showNotification("Failed to download CSV. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName &&
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-2 border-zinc-700">
        <h2 className="text-xl font-bold text-white">Manage Contest Users</h2>
        <Button
          name="Download User Creds"
          icon={<MdDownload />}
          onClick={handleDownloadUserCreds}
          disabled={loading || users.length === 0}
        />
      </div>

      {/* Add User Section */}
      <div className="bg-zinc-700/30 rounded-lg p-6 border border-zinc-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Register Users</h3>
          <div className="flex gap-2">
            <Button
              name="Upload CSV"
              icon={<MdUpload />}
              onClick={() => setShowCSVUpload(!showCSVUpload)}
              disabled={loading}
            />
            <Button
              name="Add User"
              icon={<MdAdd />}
              onClick={() => setShowAddUser(!showAddUser)}
              disabled={loading}
            />
          </div>
        </div>

        {showAddUser && (
          <form
            onSubmit={handleAddUser}
            className="space-y-4 border-t border-zinc-600 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={newUser.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter full name"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter username"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter password"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="roomNo"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Room No (Optional)
                </label>
                <input
                  type="text"
                  id="roomNo"
                  name="roomNo"
                  value={newUser.roomNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter room number"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="pcNo"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  PC No (Optional)
                </label>
                <input
                  type="number"
                  id="pcNo"
                  name="pcNo"
                  value={newUser.pcNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter PC number"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <Button
                name={loading ? "Registering..." : "Register User"}
                type="submit"
                disabled={loading}
              />
            </div>
          </form>
        )}

        {showCSVUpload && (
          <form
            onSubmit={handleCSVUpload}
            className="space-y-4 border-t border-zinc-600 pt-4"
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="prefix"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Username Prefix *
                </label>
                <input
                  type="text"
                  id="prefix"
                  name="prefix"
                  value={csvData.prefix}
                  onChange={handleCSVInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., user, contestant"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-zinc-400 mt-1">
                  This prefix will be added to each username
                </p>
              </div>
              <div>
                <label
                  htmlFor="clan_length"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Clan Length *
                </label>
                <input
                  type="number"
                  id="clan_length"
                  name="clan_length"
                  value={csvData.clan_length}
                  onChange={handleCSVInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 4"
                  min="1"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Length of the clan identifier
                </p>
              </div>
              <div>
                <label
                  htmlFor="csvFile"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Select CSV File *
                </label>
                <input
                  type="file"
                  id="csvFile"
                  name="csvFile"
                  key={csvFileInputKey}
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                  disabled={loading}
                  required
                />
                {csvData.file && (
                  <p className="text-xs text-green-400 mt-1">
                    Selected: {csvData.file.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCSVUpload(false);
                  setCSVData({ prefix: "", clan_length: "", file: null });
                  setCSVFileInputKey(Date.now()); // Reset file input
                }}
                className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <Button
                name={loading ? "Uploading..." : "Upload CSV"}
                type="submit"
                disabled={loading}
              />
            </div>
          </form>
        )}
      </div>

      {/* Users List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">
            Registered Users ({users.length})
          </h3>

          {/* Search */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <MdSearch className="absolute left-3 top-2.5 text-zinc-400" />
          </div>
        </div>

        {loading && !showAddUser ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-zinc-300">Loading users...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-zinc-800/70 rounded-lg overflow-hidden shadow-lg border border-zinc-700/50">
            <table className="min-w-full divide-y divide-zinc-700">
              <thead className="bg-zinc-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Room No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    PC No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-zinc-800/30 divide-y divide-zinc-700/50">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id || `user-${index}`}
                    className="hover:bg-zinc-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {(user.fullName || user.username)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-100">
                            {user.fullName || user.username}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {user.additionalInfo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-100">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-100">
                        {user.roomNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-100">
                        {user.pcNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      <div className="flex space-x-4">
                        <button
                          onClick={() =>
                            window.open(`/admin/users/${user.id}`, "_blank")
                          }
                          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                          disabled={loading}
                        >
                          <MdEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
                          disabled={loading}
                        >
                          <MdDelete />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-center">
            <MdPersonAdd className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-2 text-sm font-medium text-zinc-300">
              No users found
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {searchTerm
                ? "No users match your search."
                : "No users registered for this contest yet."}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Button
                  name="Register First User"
                  icon={<MdAdd />}
                  onClick={() => setShowAddUser(true)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
