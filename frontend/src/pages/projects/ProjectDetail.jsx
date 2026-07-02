import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw, Users, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import AddMemberModal from "../../components/modals/AddMemberModal";
import { projectAPI } from "../../services/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.detail(id);
      const projectData = response.data.project;
      setProject(projectData);
      setMembers(projectData.members || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAdded = (updatedMembers) => {
    setMembers(updatedMembers);
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await projectAPI.removeTeamMember(id, memberId);
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-white">Loading project details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6">
        <p className="text-xl font-semibold text-white">
          Could not load project
        </p>
        <p className="text-slate-400 mt-3 text-center">{error}</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const isOwner = project.createdBy?.id === user?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <h1 className="mt-3 text-3xl font-bold text-white">{project.name}</h1>
          <p className="mt-2 text-slate-400 max-w-3xl">
            {project.description || "No project description yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-full px-3 py-1">
              <Users size={14} /> {members.length} team members
            </span>
            <span className="inline-flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-full px-3 py-1">
              Status: {project.status}
            </span>
            {project.dueDate && (
              <span className="inline-flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-full px-3 py-1">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          {isOwner && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition"
            >
              <Plus size={16} /> Add Member
            </button>
          )}
          <button
            onClick={() => navigate(`/kanban/${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition"
          >
            View Kanban
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Team members"
          value={members.length.toString()}
          icon={Users}
          change="Live collaboration"
        />
        <StatCard
          title="Project status"
          value={project.status}
          icon={RefreshCw}
          change={
            project.dueDate
              ? `Due ${new Date(project.dueDate).toLocaleDateString()}`
              : "No due date"
          }
        />
        <StatCard
          title="Owned by"
          value={project.createdBy?.name || "Unknown"}
          icon={ArrowLeft}
          change={isOwner ? "You are the owner" : "Member access"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold text-white">Project members</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage the project team and invite new collaborators who can access
            this project.
          </p>

          <div className="mt-6 space-y-3">
            {members.length === 0 ? (
              <div className="text-slate-400">No members added yet.</div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                  {isOwner && member.id !== project.createdBy?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/15 transition"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold text-white">Quick summary</h2>
          <div className="mt-4 space-y-3 text-slate-300">
            <div className="rounded-xl bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Created by</p>
              <p className="font-medium text-white">
                {project.createdBy?.name}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Members</p>
              <p className="font-medium text-white">{members.length}</p>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Last updated</p>
              <p className="font-medium text-white">
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={id}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}
