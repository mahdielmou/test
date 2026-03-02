import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

const COLS = [
  { key: 'query', label: 'Søkeord', align: 'left' },
  { key: 'clicks', label: 'Klikk', align: 'right' },
  { key: 'impressions', label: 'Visninger', align: 'right' },
  { key: 'ctr', label: 'CTR', align: 'right' },
  { key: 'position', label: 'Posisjon', align: 'right' },
];

function fmt(key, val) {
  if (key === 'ctr') return `${val.toFixed(1)}%`;
  if (key === 'position') return val.toFixed(1);
  return val.toLocaleString('nb-NO');
}

export default function QueryTable({ rows, title, badge, badgeColor = 'indigo' }) {
  const [sort, setSort] = useState({ key: 'clicks', dir: 'desc' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const badgeColors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r => r.query.includes(q));
  }, [rows, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const v = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'query') return v * a.query.localeCompare(b.query);
      return v * (b[sort.key] - a[sort.key]);
    });
  }, [filtered, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const sliced = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    setPage(1);
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="section-title mb-0">{title}</h2>
          {badge && (
            <span className={`badge ${badgeColors[badgeColor] || badgeColors.indigo}`}>
              {badge}
            </span>
          )}
          <span className="ml-1 text-xs text-slate-400">({filtered.length} søkeord)</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filtrer søkeord..."
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`
                    px-6 py-3 font-semibold text-slate-500 cursor-pointer select-none
                    hover:text-slate-700 whitespace-nowrap
                    ${col.align === 'right' ? 'text-right' : 'text-left'}
                  `}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sort.key === col.key ? (
                      sort.dir === 'desc'
                        ? <ChevronDown className="w-3.5 h-3.5" />
                        : <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-20" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sliced.map((row, i) => (
              <tr
                key={`${row.query}-${i}`}
                className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-slate-700 max-w-xs truncate" title={row.query}>
                  {row.query}
                </td>
                <td className="px-6 py-3 text-right text-slate-600 font-mono">{fmt('clicks', row.clicks)}</td>
                <td className="px-6 py-3 text-right text-slate-600 font-mono">{fmt('impressions', row.impressions)}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`
                    font-mono text-xs px-2 py-0.5 rounded-full
                    ${row.ctr >= 10 ? 'bg-emerald-100 text-emerald-700' :
                      row.ctr >= 5 ? 'bg-amber-100 text-amber-700' :
                      'text-slate-500'}
                  `}>
                    {fmt('ctr', row.ctr)}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className={`
                    font-mono text-xs px-2 py-0.5 rounded-full
                    ${row.position <= 3 ? 'bg-emerald-100 text-emerald-700' :
                      row.position <= 10 ? 'bg-sky-100 text-sky-700' :
                      row.position <= 20 ? 'bg-amber-100 text-amber-700' :
                      'text-slate-400'}
                  `}>
                    {fmt('position', row.position)}
                  </span>
                </td>
              </tr>
            ))}
            {sliced.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Ingen søkeord funnet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">Side {page} av {pages}</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Forrige
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Neste
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
