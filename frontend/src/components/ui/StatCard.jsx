import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, change, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-500/25 to-indigo-500/5 text-indigo-200",
    emerald: "from-emerald-500/25 to-emerald-500/5 text-emerald-200",
    amber: "from-amber-500/25 to-amber-500/5 text-amber-200",
    rose: "from-rose-500/25 to-rose-500/5 text-rose-200",
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-lg bg-gradient-to-br p-3 ${tones[tone]}`}>
            <Icon size={22} />
          </div>
        ) : null}
      </div>
      {change ? (
        <div className="mt-5 flex items-center gap-1 text-sm text-emerald-300">
          <ArrowUpRight size={15} />
          <span>{change}</span>
        </div>
      ) : null}
    </motion.article>
  );
}
