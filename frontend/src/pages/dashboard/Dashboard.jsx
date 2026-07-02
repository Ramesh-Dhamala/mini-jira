import React, { useState, useEffect } from "react";
import {
  Activity,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  FolderKanban,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTickets: 0,
    completedTickets: 0,
    pendingTickets: 0,
    completionRate: 0,
    ticketsByPriority: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    ticketsByStatus: { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 },
    teamPerformance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.get();
      const data = response.data?.stats || {};

      setStats({
        totalProjects: data.totalProjects || 0,
        totalTickets: data.totalTickets || 0,
        completedTickets: data.completedTickets || 0,
        pendingTickets: data.pendingTickets || 0,
        completionRate: data.completionRate || 0,
        ticketsByPriority: {
          CRITICAL: data.ticketsByPriority?.CRITICAL || 0,
          HIGH: data.ticketsByPriority?.HIGH || 0,
          MEDIUM: data.ticketsByPriority?.MEDIUM || 0,
          LOW: data.ticketsByPriority?.LOW || 0,
        },
        ticketsByStatus: {
          TODO: data.ticketsByStatus?.TODO || 0,
          IN_PROGRESS: data.ticketsByStatus?.IN_PROGRESS || 0,
          REVIEW: data.ticketsByStatus?.REVIEW || 0,
          DONE: data.ticketsByStatus?.DONE || 0,
        },
        teamPerformance: data.teamPerformance || [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  // ✅ Filter out zero values to avoid Recharts errors
  const priorityData = [
    {
      name: "Critical",
      value: stats.ticketsByPriority?.CRITICAL || 0,
      color: "#ef4444",
    },
    {
      name: "High",
      value: stats.ticketsByPriority?.HIGH || 0,
      color: "#f97316",
    },
    {
      name: "Medium",
      value: stats.ticketsByPriority?.MEDIUM || 0,
      color: "#eab308",
    },
    { name: "Low", value: stats.ticketsByPriority?.LOW || 0, color: "#22c55e" },
  ].filter((item) => item.value > 0);

  const statusData = [
    {
      name: "To Do",
      value: stats.ticketsByStatus?.TODO || 0,
      color: "#3b82f6",
    },
    {
      name: "In Progress",
      value: stats.ticketsByStatus?.IN_PROGRESS || 0,
      color: "#eab308",
    },
    {
      name: "Review",
      value: stats.ticketsByStatus?.REVIEW || 0,
      color: "#8b5cf6",
    },
    { name: "Done", value: stats.ticketsByStatus?.DONE || 0, color: "#22c55e" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome back, {user?.name || "User"}! 👋 Here's what's happening
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/[0.04] px-4 py-2 rounded-lg border border-white/10">
          <Calendar size={16} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="group bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-white mt-2 group-hover:text-indigo-400 transition">
                {stats.totalProjects}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition">
              <FolderKanban className="text-indigo-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <TrendingUp size={16} />
            <span>+{stats.totalProjects} this month</span>
          </div>
        </div>

        <div className="group bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Total Tickets
              </p>
              <p className="text-3xl font-bold text-white mt-2 group-hover:text-emerald-400 transition">
                {stats.totalTickets}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Activity className="text-emerald-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400">
            <Clock size={16} />
            <span>{stats.pendingTickets} pending</span>
          </div>
        </div>

        <div className="group bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-white mt-2 group-hover:text-blue-400 transition">
                {stats.completedTickets}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <CheckCircle className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <Target size={16} />
            <span>{stats.completionRate}% completion rate</span>
          </div>
        </div>

        <div className="group bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Team Members</p>
              <p className="text-3xl font-bold text-white mt-2 group-hover:text-purple-400 transition">
                {stats.teamPerformance?.length || 1}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Users className="text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <span>Active team members</span>
          </div>
        </div>
      </div>

      {/* Charts - Only render if data exists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Priority Distribution
          </h2>
          <div className="h-64">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#f1f5f9" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No priority data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Status Breakdown
          </h2>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No status data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Overall Progress
        </h2>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Completion Rate</span>
            <span className="text-white font-semibold">
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
