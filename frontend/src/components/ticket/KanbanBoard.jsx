import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ticketAPI } from "../../services/api";
import KanbanColumn from "./KanbanColumn";
import { getSocket } from "../../socket";
import toast from "react-hot-toast";

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "border-blue-500/30 bg-blue-500/5" },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "border-yellow-500/30 bg-yellow-500/5",
  },
  {
    id: "REVIEW",
    title: "Review",
    color: "border-purple-500/30 bg-purple-500/5",
  },
  { id: "DONE", title: "Done", color: "border-green-500/30 bg-green-500/5" },
];

export default function KanbanBoard({ projectId, onTicketClick }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const fetchTickets = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`📋 Fetching tickets for project: ${projectId}`);
      const response = await ticketAPI.list(projectId);
      console.log("✅ Tickets loaded:", response.data);
      setTickets(response.data?.tickets || []);
    } catch (error) {
      console.error("❌ Failed to fetch tickets:", error);
      setError(error.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [projectId]);

  // Socket updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTicketCreated = (ticket) => {
      if (ticket.projectId === projectId) {
        setTickets((prev) => [...prev, ticket]);
      }
    };

    const handleTicketMoved = (ticket) => {
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
    };

    const handleTicketDeleted = ({ ticketId }) => {
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    };

    socket.on("ticketCreated", handleTicketCreated);
    socket.on("ticketMoved", handleTicketMoved);
    socket.on("ticketDeleted", handleTicketDeleted);

    return () => {
      socket.off("ticketCreated", handleTicketCreated);
      socket.off("ticketMoved", handleTicketMoved);
      socket.off("ticketDeleted", handleTicketDeleted);
    };
  }, [projectId]);

  const getTicketsByStatus = (status) => {
    return tickets.filter((t) => t.status === status);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeTicket = tickets.find((t) => t.id === active.id);
    if (!activeTicket) return;

    let destinationStatus = null;

    const column = COLUMNS.find((col) => col.id === over.id);
    if (column) {
      destinationStatus = column.id;
    } else {
      const overTicket = tickets.find((t) => t.id === over.id);
      if (overTicket) {
        destinationStatus = overTicket.status;
      }
    }

    if (!destinationStatus || activeTicket.status === destinationStatus) return;

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === active.id ? { ...t, status: destinationStatus } : t,
      ),
    );

    try {
      await ticketAPI.updateStatus(active.id, destinationStatus);

      const socket = getSocket();
      if (socket) {
        socket.emit("ticket:moved", {
          ticketId: active.id,
          status: destinationStatus,
        });
      }
    } catch (error) {
      console.error("❌ Failed to update ticket status:", error);
      toast.error("Failed to move ticket");
      await fetchTickets();
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm("Delete this ticket?")) return;

    try {
      await ticketAPI.remove(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      toast.success("Ticket deleted");
    } catch (error) {
      console.error("❌ Failed to delete ticket:", error);
      toast.error("Failed to delete ticket");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-white">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-red-400">{error}</div>
        <button
          onClick={fetchTickets}
          className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnTickets = getTicketsByStatus(column.id);
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tickets={columnTickets}
              onTicketClick={onTicketClick}
              onDeleteTicket={handleDeleteTicket}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
