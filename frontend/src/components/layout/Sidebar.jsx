import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/sprints", icon: Calendar, label: "Sprints" },
  { to: "/tickets", icon: Ticket, label: "Tickets" }, // ✅ Goes to Tickets list
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/profile", icon: Settings, label: "Profile" },
];
  return (
    <aside className="w-64 bg-slate-900/50 border-r border-white/10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold text-white">MIRA</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to} // ✅ Unique key
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
