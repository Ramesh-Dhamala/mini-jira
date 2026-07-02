import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
          {user.name?.charAt(0) || "U"}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-white text-sm font-medium">{user.name}</p>
          <p className="text-slate-400 text-xs">{user.role || "Member"}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-white/10">
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>

          <div className="p-2">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
            >
              <Settings size={16} />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
