export function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getPriorityClass(priority) {
  const classes = {
    High: "bg-rose-500/10 text-rose-200",
    Medium: "bg-amber-500/10 text-amber-200",
    Low: "bg-emerald-500/10 text-emerald-200",
  };

  return classes[priority] ?? "bg-slate-700 text-slate-200";
}

export function getStatusClass(status) {
  const classes = {
    todo: "bg-slate-500/10 text-slate-200",
    progress: "bg-indigo-500/10 text-indigo-200",
    review: "bg-amber-500/10 text-amber-200",
    done: "bg-emerald-500/10 text-emerald-200",
  };

  return classes[status] ?? classes.todo;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
