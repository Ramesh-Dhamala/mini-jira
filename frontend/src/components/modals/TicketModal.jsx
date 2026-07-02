import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ticketAPI, projectAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function TicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  projectId: defaultProjectId,
  sprints = [],
  projects: initialProjects = [],
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "TASK",
    priority: "MEDIUM",
    status: "TODO",
    storyPoints: 0,
    sprintId: "",
    projectId: defaultProjectId || "",
  });

  // ✅ Use a ref to prevent multiple fetches
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isOpen && !hasFetched.current) {
      if (initialProjects.length === 0) {
        hasFetched.current = true;
        fetchProjects();
      } else {
        setProjects(initialProjects);
        setFetchingProjects(false);
        if (!formData.projectId && initialProjects.length > 0) {
          setFormData((prev) => ({
            ...prev,
            projectId: initialProjects[0].id,
          }));
        }
      }
    }
    // ✅ Reset the ref when modal closes
    if (!isOpen) {
      hasFetched.current = false;
    }
  }, [isOpen, initialProjects]);

  useEffect(() => {
    if (defaultProjectId) {
      setFormData((prev) => ({ ...prev, projectId: defaultProjectId }));
    }
  }, [defaultProjectId]);

  useEffect(() => {
    if (projects.length > 0 && !formData.projectId) {
      setFormData((prev) => ({
        ...prev,
        projectId: projects[0].id,
      }));
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setFetchingProjects(true);
      setError("");
      console.log("📋 Fetching projects for ticket modal...");
      const response = await projectAPI.list();
      console.log("✅ Projects fetched:", response.data);

      if (response.data && response.data.projects) {
        setProjects(response.data.projects);
        if (response.data.projects.length > 0 && !formData.projectId) {
          setFormData((prev) => ({
            ...prev,
            projectId: response.data.projects[0].id,
          }));
        }
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch projects:", error);
      setError("Failed to load projects");
      setProjects([]);
    } finally {
      setFetchingProjects(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.title.trim().length < 3) {
      setError("Ticket title must be at least 3 characters");
      return;
    }

    if (!formData.projectId) {
      setError("Please select a project");
      return;
    }

    const selectedProject = projects.find((p) => p.id === formData.projectId);
    if (!selectedProject) {
      setError(
        "Selected project does not exist. Please select a valid project.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        storyPoints: parseInt(formData.storyPoints) || 0,
        projectId: formData.projectId,
        sprintId: formData.sprintId || undefined,
      };

      console.log("📝 Creating ticket with payload:", payload);
      const response = await ticketAPI.create(payload);
      console.log("✅ Ticket created:", response.data);

      toast.success(
        `Ticket created in "${selectedProject.name}" successfully! 🎫`,
      );

      if (onTicketCreated) {
        onTicketCreated(response.data.ticket);
      }

      setFormData({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        status: "TODO",
        storyPoints: 0,
        sprintId: "",
        projectId: projects.length > 0 ? projects[0].id : "",
      });
      onClose();
    } catch (err) {
      console.error("❌ Ticket creation error:", err);
      setError(err.response?.data?.message || "Failed to create ticket");
      toast.error("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg border border-white/10 w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Create New Ticket
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Project *
              </label>
              {fetchingProjects ? (
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  ⚠️ No projects available. Please create a project first.
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = "/projects";
                    }}
                    className="block mt-2 text-indigo-400 hover:text-indigo-300"
                  >
                    Create a project →
                  </button>
                </div>
              ) : (
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                  required
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
              {formData.projectId && projects.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Creating ticket in:{" "}
                  {projects.find((p) => p.id === formData.projectId)?.name}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter ticket title"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter ticket description"
                rows="3"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="TASK">Task</option>
                  <option value="BUG">Bug</option>
                  <option value="STORY">Story</option>
                  <option value="EPIC">Epic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Status & Story Points */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  name="storyPoints"
                  value={formData.storyPoints}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Sprint (optional) */}
            {sprints && sprints.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Sprint
                </label>
                <select
                  name="sprintId"
                  value={formData.sprintId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="">No Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="w-full py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
