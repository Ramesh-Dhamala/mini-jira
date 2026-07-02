// frontend/src/components/layout/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import NotificationPanel from "../ui/NotificationPanel";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4">
        {/* Brand: "MIRA" - Click goes to Dashboard */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500 font-bold text-white text-sm">
            M
          </div>
          <span className="text-xl font-bold text-white hidden sm:block">
            MIRA
          </span>
        </div>

        <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
          <ChevronRight size={14} />
          <span className="font-medium text-white">Workspace</span>
        </div>

        {/* Search Bar */}
        <label className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-slate-400 md:max-w-md">
          <Search size={17} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search tickets, projects, people"
          />
        </label>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Panel */}
        <NotificationPanel />

        {/* Profile - Click navigates to /profile */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-400 text-sm font-bold text-white">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-white">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-400">{user?.role || "Member"}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
