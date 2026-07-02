import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Plus, Search, X, RefreshCw } from "lucide-react";
import { ticketAPI, projectAPI } from "../../services/api";
import TicketModal from "../../components/modals/TicketModal";
import toast from "react-hot-toast";

export default function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (isFetching) return;
    
    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);
      
      const projectsRes = await projectAPI.list();
      const projectsList = projectsRes.data.projects || [];
      setProjects(projectsList);
      
      if (projectsList.length === 0) {
        setTickets([]);
        setLoading(false);
        setIsFetching(false);
        return;
      }
      
      let allTickets = [];
      for (let i = 0; i < projectsList.length; i++) {
        const project = projectsList[i];
        try {
          const ticketsRes = await ticketAPI.list(project.id);
          if (ticketsRes.data?.tickets) {
            allTickets = [...allTickets, ...ticketsRes.data.tickets];
          }
        } catch (e) {
          console.error(`Failed to fetch tickets for project ${project.id}:`, e);
        }
      }
      
      setTickets(allTickets);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load tickets");
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    toast.success("Ticket created successfully!");
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: "bg-blue-500/20 text-blue-400",
      IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
      REVIEW: "bg-purple-500/20 text-purple-400",
      DONE: "bg-green-500/20 text-green-400",
    };
    return colors[status] || "bg-slate-500/20 text-slate-400";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      CRITICAL: "bg-red-500/20 text-red-400",
      HIGH: "bg-orange-500/20 text-orange-400",
      MEDIUM: "bg-yellow-500/20 text-yellow-400",
      LOW: "bg-green-500/20 text-green-400",
    };
    return colors[priority] || "bg-slate-500/20 text-slate-400";
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "ALL" || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    setFilterPriority("ALL");
  };

  if (loading) {
    return <div className="text-white p-6">Loading tickets...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400 text-center">
          <p className="text-xl font-semibold">Error loading tickets</p>
          <p className="text-slate-400 mt-2">{error}</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg">
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket size={28} className="text-indigo-400" />
            All Tickets
          </h1>
          <p className="text-slate-400 mt-1">Manage all tickets across projects</p>
        </div>
        <button
          onClick={() => {
            if (projects.length > 0) {
              setSelectedProjectId(projects[0].id);
              setIsModalOpen(true);
            } else {
              toast.error("Create a project first");
              navigate("/projects");
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.04] border border-white/10 rounded-lg p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white">
            <option value="ALL">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white">
            <option value="ALL">All Priority</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          {(searchTerm || filterStatus !== "ALL" || filterPriority !== "ALL") && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-700 transition">
              <X size={16} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-400 flex items-center justify-between">
        <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
        <button onClick={fetchData} className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white/[0.04] border border-white/10 rounded-lg p-8">
          <Ticket size={48} className="text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white">No tickets found</h3>
          <p className="text-slate-400 mt-2">{tickets.length === 0 ? "Create your first ticket" : "Try adjusting your filters"}</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-800/50 border-b border-white/10 text-xs font-medium text-slate-400">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-1">Points</div>
            <div className="col-span-1">Actions</div>
          </div>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition border-b border-white/5 last:border-0">
              <div className="col-span-4 text-white text-sm truncate cursor-pointer hover:text-indigo-400 transition" onClick={() => handleTicketClick(ticket.id)}>
                {ticket.title}
              </div>
              <div className="col-span-2 text-slate-400 text-sm truncate">
                {projects.find(p => p.id === ticket.projectId)?.name || "Unknown"}
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
              </div>
              <div className="col-span-1 text-slate-400 text-sm">{ticket.storyPoints || 0}</div>
              <div className="col-span-1">
                <button onClick={() => handleTicketClick(ticket.id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition">View</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTicketCreated={handleTicketCreated} projectId={selectedProjectId} sprints={[]} />
    </div>
  );
}
