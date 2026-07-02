import KanbanBoard from "../../components/ticket/KanbanBoard";

export default function SprintDetail() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">Sprint detail</p>
        <h1 className="mt-2 text-3xl font-bold">Sprint 04</h1>
        <p className="mt-3 text-slate-400">Stabilize dashboard and kanban workflows before the next release.</p>
      </section>
      <KanbanBoard />
    </div>
  );
}
