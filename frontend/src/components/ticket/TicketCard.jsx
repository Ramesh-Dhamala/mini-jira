import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";

export default function TicketCard({ ticket, onClick, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: { type: "ticket", status: ticket.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(ticket.id);
  };

  const handleClick = () => {
    if (onClick && !isDragging) onClick(ticket.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-white/[0.04] border border-white/10 rounded-lg p-3 cursor-grab hover:bg-white/10 transition group ${
        isDragging ? "ring-2 ring-indigo-400 shadow-xl scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {ticket.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                ticket.priority === "CRITICAL"
                  ? "bg-red-500/20 text-red-400"
                  : ticket.priority === "HIGH"
                    ? "bg-orange-500/20 text-orange-400"
                    : ticket.priority === "MEDIUM"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
              }`}
            >
              {ticket.priority || "MEDIUM"}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-400 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
