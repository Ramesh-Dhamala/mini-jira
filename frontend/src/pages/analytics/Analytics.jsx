import React, { useState, useEffect } from "react";
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

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.get();
        setStats(response.data.stats);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  const priorityData = [
    {
      name: "Critical",
      value: stats?.ticketsByPriority?.CRITICAL || 0,
      color: "#ef4444",
    },
    {
      name: "High",
      value: stats?.ticketsByPriority?.HIGH || 0,
      color: "#f97316",
    },
    {
      name: "Medium",
      value: stats?.ticketsByPriority?.MEDIUM || 0,
      color: "#eab308",
    },
    {
      name: "Low",
      value: stats?.ticketsByPriority?.LOW || 0,
      color: "#22c55e",
    },
  ];

  const statusData = [
    {
      name: "To Do",
      value: stats?.ticketsByStatus?.TODO || 0,
      color: "#3b82f6",
    },
    {
      name: "In Progress",
      value: stats?.ticketsByStatus?.IN_PROGRESS || 0,
      color: "#eab308",
    },
    {
      name: "Review",
      value: stats?.ticketsByStatus?.REVIEW || 0,
      color: "#8b5cf6",
    },
    {
      name: "Done",
      value: stats?.ticketsByStatus?.DONE || 0,
      color: "#22c55e",
    },
  ];

  const filteredPriority = priorityData.filter((d) => d.value > 0);
  const filteredStatus = statusData.filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">📊 Analytics</h1>
        <p className="text-slate-400">Detailed insights and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Total Projects</p>
          <p className="text-3xl font-bold text-white">
            {stats?.totalProjects || 0}
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Completion Rate</p>
          <p className="text-3xl font-bold text-green-400">
            {stats?.completionRate || 0}%
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Total Tickets</p>
          <p className="text-3xl font-bold text-yellow-400">
            {stats?.totalTickets || 0}
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-3xl font-bold text-blue-400">
            {stats?.completedTickets || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">
            Priority Distribution
          </h3>
          <div className="h-64">
            {filteredPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredPriority}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {filteredPriority.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No data
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Status Breakdown</h3>
          <div className="h-64">
            {filteredStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {filteredStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Progress Overview</h3>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-4 rounded-full transition-all"
            style={{ width: `${Math.min(stats?.completionRate || 0, 100)}%` }}
          />
        </div>
        <p className="text-right text-sm text-slate-400 mt-1">
          {stats?.completionRate || 0}% complete
        </p>
      </div>
    </div>
  );
}
