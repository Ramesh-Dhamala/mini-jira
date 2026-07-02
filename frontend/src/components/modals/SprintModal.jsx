import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { sprintAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function SprintModal({
  isOpen,
  onClose,
  onSprintCreated,
  projectId,
}) {
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim().length < 3) {
      setError("Sprint name must be at least 3 characters");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Start date and end date are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        projectId,
      };

      console.log("📝 Creating sprint:", payload);
      const response = await sprintAPI.create(payload);
      console.log("✅ Sprint created:", response.data);

      toast.success("Sprint created successfully! 🏃");
      onSprintCreated(response.data.sprint);
      onClose();
      setFormData({ name: "", goal: "", startDate: "", endDate: "" });
    } catch (err) {
      console.error("❌ Sprint creation error:", err);
      setError(err.response?.data?.message || "Failed to create sprint");
      toast.error("Failed to create sprint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create Sprint</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="sm:col-span-2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400 text-white placeholder-slate-500"
            placeholder="Sprint name"
          />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400 text-white"
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400 text-white"
          />
          <textarea
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="sm:col-span-2 min-h-24 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400 text-white placeholder-slate-500"
            placeholder="Sprint goal"
          />

          {error && (
            <div className="sm:col-span-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Sprint"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
