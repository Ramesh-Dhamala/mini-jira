import React, { useState, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";
import { projectAPI, userAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  onMemberAdded,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isOpen && searchTerm.length > 1) {
      searchUsers();
    }
  }, [searchTerm, isOpen]);

  const searchUsers = async () => {
    try {
      const response = await userAPI.list();
      const filtered = response.data.users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setUsers(filtered);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      setError("Please select a user from the search results");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await projectAPI.addTeamMember(projectId, {
        userId: selectedUser.id,
      });
      toast.success(`${selectedUser.name} added to project!`);
      onMemberAdded(response.data.members);
      setSelectedUser(null);
      setSearchTerm("");
      setUsers([]);
      onClose();
    } catch (err) {
      console.error("❌ Failed to add member:", err);
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg border border-white/10 w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-400" />
            Add Team Member
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Search Users
              </label>
              <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 focus-within:border-indigo-400">
                <Search size={17} className="text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type name or email..."
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {users.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-900/50 rounded-lg p-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-2 rounded-lg cursor-pointer transition ${
                      selectedUser?.id === user.id
                        ? "bg-indigo-500/20 border border-indigo-500/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <p className="text-white text-sm">{user.name}</p>
                    <p className="text-slate-400 text-xs">{user.email}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-sm text-indigo-300">
                Selected: {selectedUser.name} ({selectedUser.email})
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedUser}
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition disabled:opacity-50"
            >
              <UserPlus size={18} />
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
