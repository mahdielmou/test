import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';

const COLORS = {
  branded: '#6366f1',
  nonBranded: '#10b981',
  bars: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  pie: ['#6366f1', '#10b981'],
};

const TICK_STYLE = { fill: '#94a3b8', fontSize: 11 };

function formatK(v) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return v;
}

const TooltipWrapper = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatter ? formatter(p.value) : p.value.toLocaleString('nb-NO')}
        </p>
      ))}
    </div>
  );
};

export function BrandedPieChart({ branded, nonBranded, metric = 'clicks' }) {
  const labels = { clicks: 'Klikk', impressions: 'Visninger' };
  const data = [
    { name: 'Branded', value: branded[metric] },
    { name: 'Non-branded', value: nonBranded[metric] },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card">
      <h2 className="section-title">Branded vs Non-branded — {labels[metric] || metric}</h2>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="60%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              <Cell fill={COLORS.branded} />
              <Cell fill={COLORS.nonBranded} />
            </Pie>
            <Tooltip content={<TooltipWrapper formatter={v => v.toLocaleString('nb-NO')} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-4">
          {data.map((d, i) => (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: i === 0 ? COLORS.branded : COLORS.nonBranded }}
                  />
                  {d.name}
                </span>
                <span className="font-bold text-slate-800">{d.value.toLocaleString('nb-NO')}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: total > 0 ? `${(d.value / total) * 100}%` : '0%',
                    background: i === 0 ? COLORS.branded : COLORS.nonBranded,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 text-right">
                {total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TopQueriesBar({ rows, metric = 'clicks', title, color = COLORS.branded }) {
  const labels = { clicks: 'Klikk', impressions: 'Visninger' };
  const data = rows.slice(0, 10).map(r => ({
    name: r.query.length > 30 ? r.query.slice(0, 28) + '…' : r.query,
    fullName: r.query,
    value: r[metric],
  }));

  return (
    <div className="card">
      <h2 className="section-title">{title}</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={TICK_STYLE} tickFormatter={formatK} />
          <YAxis
            type="category"
            dataKey="name"
            tick={TICK_STYLE}
            width={160}
            tickLine={false}
          />
          <Tooltip
            content={<TooltipWrapper formatter={v => v.toLocaleString('nb-NO')} />}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="value" name={labels[metric]} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PositionBucketChart({ data }) {
  return (
    <div className="card">
      <h2 className="section-title">Søkeord fordelt på posisjon</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={TICK_STYLE} />
          <YAxis tick={TICK_STYLE} tickFormatter={formatK} />
          <Tooltip
            content={<TooltipWrapper formatter={v => v.toLocaleString('nb-NO')} />}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="queries" name="Søkeord" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS.bars[i % COLORS.bars.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS.bars[i] }} />
            <span className="text-xs text-slate-500">
              {d.name}: <strong>{d.queries}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CtrDistributionBar({ data }) {
  return (
    <div className="card">
      <h2 className="section-title">CTR-fordeling</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={TICK_STYLE} />
          <YAxis tick={TICK_STYLE} />
          <Tooltip cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" name="Søkeord" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrandedMetricCompare({ branded, nonBranded }) {
  const metrics = [
    {
      label: 'Avg. CTR',
      branded: branded.avgCtr,
      nonBranded: nonBranded.avgCtr,
      fmt: v => `${v.toFixed(1)}%`,
    },
    {
      label: 'Avg. Posisjon',
      branded: branded.avgPosition,
      nonBranded: nonBranded.avgPosition,
      fmt: v => v.toFixed(1),
      lowerBetter: true,
    },
  ];

  return (
    <div className="card">
      <h2 className="section-title">Branded vs Non-branded — Nøkkeltall</h2>
      <div className="space-y-5">
        {metrics.map(m => {
          const max = Math.max(m.branded, m.nonBranded, 0.01);
          return (
            <div key={m.label}>
              <p className="text-sm font-medium text-slate-600 mb-2">{m.label}</p>
              <div className="space-y-2">
                {[
                  { label: 'Branded', val: m.branded, color: COLORS.branded },
                  { label: 'Non-branded', val: m.nonBranded, color: COLORS.nonBranded },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{item.label}</span>
                      <span className="font-mono font-medium text-slate-700">{m.fmt(item.val)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(item.val / max) * 100}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
