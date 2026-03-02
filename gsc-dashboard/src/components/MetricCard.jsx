export default function MetricCard({ label, value, sub, icon, color = 'indigo', trend }) {
  const Icon = icon;
  const colors = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', value: 'text-indigo-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', value: 'text-violet-700' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', value: 'text-rose-700' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600', value: 'text-sky-700' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="card flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`w-9 h-9 flex items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`w-4.5 h-4.5 ${c.icon}`} size={18} />
        </span>
      </div>
      <div>
        <span className={`text-3xl font-bold tracking-tight ${c.value}`}>{value}</span>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {trend && (
        <div className="pt-1 border-t border-slate-50">
          <span className="text-xs text-slate-400">{trend}</span>
        </div>
      )}
    </div>
  );
}
