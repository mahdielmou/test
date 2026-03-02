import { useState } from 'react';
import { Tag, Info } from 'lucide-react';

export default function BrandToggle({ brandTerms, onChange }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(brandTerms);

  const save = () => {
    onChange(input);
    setEditing(false);
  };

  const terms = brandTerms
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Brand-termer</p>
          <p className="text-xs text-slate-400">Kommaseparert — brukes til branded/non-branded splitting</p>
        </div>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            placeholder="mitt brand, mitt firma, url.no"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
          />
          <button
            onClick={save}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Lagre
          </button>
          <button
            onClick={() => { setInput(brandTerms); setEditing(false); }}
            className="px-3 py-2 text-slate-500 text-sm hover:text-slate-700"
          >
            Avbryt
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {terms.length === 0 ? (
            <span className="text-slate-400 text-sm italic">Ingen brand-termer satt</span>
          ) : (
            terms.map(t => (
              <span key={t} className="badge bg-indigo-100 text-indigo-700">
                {t}
              </span>
            ))
          )}
          <button
            onClick={() => setEditing(true)}
            className="ml-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
          >
            {terms.length === 0 ? 'Legg til' : 'Rediger'}
          </button>
        </div>
      )}
    </div>
  );
}
