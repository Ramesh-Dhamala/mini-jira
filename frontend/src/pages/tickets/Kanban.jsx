import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, RefreshCw } from "lucide-react";
import KanbanBoard from "../../components/ticket/KanbanBoard";
import TicketModal from "../../components/modals/TicketModal";
import { projectAPI, sprintAPI } from "../../services/api";

export default function Kanban() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  console.log("🔍 Kanban page - projectId from URL:", projectId);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    } else {
      setLoading(false);
      setError("No project ID provided");
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📁 Fetching project: ${projectId}`);

      // ✅ Fetch all data in parallel correctly
      const [projectResponse, sprintsResponse, projectsResponse] =
        await Promise.all([
          projectAPI.detail(projectId),
          sprintAPI.list(projectId).catch(() => ({ data: { sprints: [] } })),
          projectAPI.list().catch(() => ({ data: { projects: [] } })),
        ]);

      console.log("✅ Project data:", projectResponse.data);
      console.log("✅ Sprints data:", sprintsResponse.data);
      console.log("✅ Projects list:", projectsResponse.data);

      setProject(projectResponse.data.project);
      setSprints(sprintsResponse.data?.sprints || []);
      setProjects(projectsResponse.data?.projects || []);
    } catch (error) {
      console.error("❌ Failed to fetch project:", error);
      setError(error.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    setRefreshKey((prev) => prev + 1);
    // Refresh project data to update ticket counts
    fetchProjectData();
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-red-400 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p className="text-slate-400 mt-2">{error || "Project not found"}</p>
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-white mt-2">{project.name}</h1>
          <p className="text-slate-400 text-sm">
            {project.description || "No description"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchProjectData();
              setRefreshKey((prev) => prev + 1);
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-slate-400" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
          >
            <Plus size={18} />
            New Ticket
          </button>
        </div>
      </div>

      <KanbanBoard
        key={refreshKey}
        projectId={projectId}
        onTicketClick={handleTicketClick}
      />

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
        projectId={projectId}
        sprints={sprints}
        projects={projects}
      />
    </div>
  );
}
