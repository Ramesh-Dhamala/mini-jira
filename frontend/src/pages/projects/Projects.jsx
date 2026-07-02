import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, Users, ArrowRight } from "lucide-react";
import { projectAPI } from "../../services/api";
import ProjectModal from "../../components/modals/ProjectModal";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.list();
      console.log("📁 Projects response:", response.data);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("❌ Failed to fetch projects:", error);
      setError(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/kanban/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-center">
          <p className="text-xl font-semibold">Error loading projects</p>
          <p className="text-slate-400 mt-2">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage all your projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white/[0.04] border border-white/10 rounded-lg p-8">
          <FolderKanban size={48} className="text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white">No projects yet</h3>
          <p className="text-slate-400 mt-2">Create your first project</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-white/[0.04] border border-white/10 rounded-lg p-6 hover:border-indigo-500/50 transition cursor-pointer group"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition">
                {project.name}
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                {project.description || "No description"}
              </p>
              <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
                <span>📋 {project._count?.tickets || 0} tickets</span>
                <span>👥 {project.members?.length || 0} members</span>
                <ArrowRight
                  size={16}
                  className="text-slate-500 group-hover:text-indigo-400 transition"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
