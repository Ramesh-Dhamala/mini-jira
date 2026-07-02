import { motion } from "framer-motion";
import { CalendarDays, Users } from "lucide-react";

export default function ProjectCard({ project }) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{project.description}</p>
        </div>
        <span className="rounded-md border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-200">
          {project.status}
        </span>
      </div>

      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{project.progress}% complete</span>
        <span>{project.sprints} sprints</span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.team.map((member) => (
            <span
              key={member}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-900 bg-slate-700 text-xs font-bold"
            >
              {member}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {project.team.length}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={14} />
            {project.due}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
