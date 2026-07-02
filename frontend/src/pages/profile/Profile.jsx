// frontend/src/pages/profile/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit2,
  Save,
  X,
  Twitter,
  Github,
  Linkedin,
  Users,
  CheckCircle,
  MessageCircle,
  FolderKanban,
  TrendingUp,
  Award,
  Calendar,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    ticketsCreated: 0,
    ticketsCompleted: 0,
    comments: 0,
    projects: 0,
    completionRate: 0,
    sprintHealth: 0,
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio:
      user?.bio ||
      "Passionate about creating amazing products and leading teams to success.",
    role: user?.role || "Member",
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

const fetchUserStats = async () => {
  try {
    setStatsLoading(true);
    const response = await authAPI.getStats();
    console.log("📊 Stats response:", response.data);
    if (response.data.success) {
      setStats(response.data.stats);
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    // Use fallback data if API fails
    setStats({
      ticketsCreated: 0,
      ticketsCompleted: 0,
      comments: 0,
      projects: 0,
      completionRate: 0,
      sprintHealth: 0,
      recentActivity: [],
    });
  } finally {
    setStatsLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(formData);
      await refreshUser();
      setEditing(false);
      toast.success("Profile updated successfully! 🎉");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white/[0.04] border border-white/10 rounded-lg p-4 hover:border-indigo-500/50 transition group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && <p className="text-xs text-green-400 mt-1">↑ {change}%</p>}
        </div>
        <div
          className={`p-2.5 bg-${color}-500/20 rounded-lg group-hover:bg-${color}-500/30 transition`}
        >
          <Icon className={`text-${color}-400`} size={20} />
        </div>
      </div>
    </div>
  );

  const PermissionBadge = ({ children }) => (
    <span className="text-xs text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/5">
      {children}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 text-center">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                {user?.name?.charAt(0) || "U"}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition border-2 border-slate-900">
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-white mt-4">
              {user?.name || "User"}
            </h2>
            <p className="text-slate-400 text-sm">{user?.role || "Member"}</p>
            <p className="text-slate-500 text-xs mt-1">{user?.email}</p>

            <div className="flex justify-center gap-3 mt-4">
              <button className="p-2 bg-white/[0.04] rounded-lg hover:bg-white/10 transition">
                <Twitter size={16} className="text-slate-400" />
              </button>
              <button className="p-2 bg-white/[0.04] rounded-lg hover:bg-white/10 transition">
                <Github size={16} className="text-slate-400" />
              </button>
              <button className="p-2 bg-white/[0.04] rounded-lg hover:bg-white/10 transition">
                <Linkedin size={16} className="text-slate-400" />
              </button>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
            >
              {editing ? <X size={16} /> : <Edit2 size={16} />}
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* About Section */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">About</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {formData.bio}
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
              <Calendar size={14} />
              <span>
                Joined{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield size={16} className="text-indigo-400" />
              Role & Permissions
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-medium">
                {user?.role || "Member"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <PermissionBadge>Manage Projects</PermissionBadge>
              <PermissionBadge>Manage Tickets</PermissionBadge>
              <PermissionBadge>View Reports</PermissionBadge>
              {user?.role === "ADMIN" && (
                <PermissionBadge>System Settings</PermissionBadge>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          {editing && (
            <form
              onSubmit={handleSubmit}
              className="bg-white/[0.04] border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Edit Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={FolderKanban}
              label="Tickets Created"
              value={stats.ticketsCreated}
              change={12}
              color="indigo"
            />
            <StatCard
              icon={CheckCircle}
              label="Tickets Completed"
              value={stats.ticketsCompleted}
              change={18}
              color="green"
            />
            <StatCard
              icon={MessageCircle}
              label="Comments"
              value={stats.comments}
              change={8}
              color="purple"
            />
            <StatCard
              icon={Users}
              label="Projects"
              value={stats.projects}
              change={15}
              color="blue"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.completionRate}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="text-emerald-400" size={24} />
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-green-400 h-2 rounded-full"
                  style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Sprint Health</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.sprintHealth}%
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Award className="text-yellow-400" size={24} />
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                  style={{ width: `${Math.min(stats.sprintHealth, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                {
                  action: "Created ticket 'Authentication Fix'",
                  time: "2 hours ago",
                },
                { action: "Completed sprint 12", time: "5 hours ago" },
                { action: "Added comment on 'UI Redesign'", time: "1 day ago" },
                {
                  action: "Assigned to project 'Mobile App'",
                  time: "2 days ago",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-slate-300 text-sm">
                    {activity.action}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Change Password
            </h3>
            <form className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button className="w-full py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition">
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
