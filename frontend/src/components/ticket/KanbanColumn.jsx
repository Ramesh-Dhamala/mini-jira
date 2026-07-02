import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TicketCard from "./TicketCard";

export default function KanbanColumn({
  column,
  tickets,
  onTicketClick,
  onDeleteTicket,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", status: column.id },
  });

  const getColorClass = (color) => {
    const colors = {
      blue: "border-blue-500/30 bg-blue-500/5",
      yellow: "border-yellow-500/30 bg-yellow-500/5",
      purple: "border-purple-500/30 bg-purple-500/5",
      green: "border-green-500/30 bg-green-500/5",
    };
    return colors[color] || "border-white/10 bg-white/5";
  };

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg ${getColorClass(column.color)} p-4 min-h-[200px] transition-all ${
        isOver ? "ring-2 ring-indigo-400/70 bg-slate-900/80" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">{column.title}</h3>
        <span className="text-slate-400 text-sm bg-white/10 px-2 py-1 rounded-full">
          {tickets.length}
        </span>
      </div>

      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[100px]">
          {tickets.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8 border border-dashed border-white/10 rounded-lg">
              {isOver ? "✨ Drop here" : "Drop tickets here"}
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={onTicketClick}
                onDelete={onDeleteTicket}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
