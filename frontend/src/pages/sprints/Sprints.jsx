import { CalendarDays, Flag, Plus } from "lucide-react";

const sprints = [
  { name: "Sprint 04", goal: "Stabilize dashboard and kanban workflows", status: "Active", progress: 68, dates: "Jun 24 - Jul 08" },
  { name: "Sprint 05", goal: "Notifications, comments and profile polish", status: "Planning", progress: 22, dates: "Jul 09 - Jul 23" },
  { name: "Sprint 03", goal: "Authentication and API integration", status: "Closed", progress: 100, dates: "Jun 10 - Jun 23" },
];

export default function Sprints() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">Sprints</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Sprint planning</h1>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/25">
          <Plus size={17} />
          New sprint
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {sprints.map((sprint) => (
          <article key={sprint.name} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{sprint.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{sprint.goal}</p>
              </div>
              <span className="rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-200">
                {sprint.status}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
              <CalendarDays size={16} />
              {sprint.dates}
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${sprint.progress}%` }} />
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <Flag size={16} className="text-emerald-300" />
              {sprint.progress}% goal completion
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
