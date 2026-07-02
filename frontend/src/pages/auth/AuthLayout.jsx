import { motion } from "framer-motion";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen bg-[#0F172A] text-white lg:grid-cols-[1fr_520px]">
      <section className="hidden border-r border-white/10 bg-slate-950/60 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-500 font-bold">
            MJ
          </div>
          <div>
            <p className="text-lg font-bold">Mini Jira</p>
            <p className="text-xs text-slate-400">Project delivery workspace</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
            Modern delivery
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-bold leading-tight tracking-tight">
            Plan sprints, track tickets and keep product teams moving.
          </h1>
          <p className="mt-5 max-w-lg text-slate-400">
            A focused dark workspace for projects, boards, notifications and analytics.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {["Projects", "Sprints", "Kanban"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </section>

      <main className="flex items-center justify-center p-6">{children}</main>
    </div>
  );
}
