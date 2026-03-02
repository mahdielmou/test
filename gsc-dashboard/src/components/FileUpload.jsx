import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, X } from 'lucide-react';

export default function FileUpload({ onFileLoaded, onError }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setFileName(file.name);
      try {
        const { parseGSCFile } = await import('../utils/parseGSC.js');
        const data = await parseGSCFile(file);
        onFileLoaded(data, file.name);
      } catch (e) {
        onError(e.message);
        setFileName(null);
      }
    },
    [onFileLoaded, onError]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
          <FileSpreadsheet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          GSC Dashboard
        </h1>
        <p className="mt-2 text-slate-500 text-lg">
          Last opp din Google Search Console-fil og få innsikt øyeblikkelig
        </p>
      </div>

      {/* Drop zone */}
      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative flex flex-col items-center justify-center w-full max-w-xl
          h-64 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
            : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50'
          }
          shadow-sm
        `}
      >
        <input
          type="file"
          accept=".csv,.tsv,.xlsx,.xls"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={onInputChange}
        />
        <Upload
          className={`w-10 h-10 mb-3 ${dragging ? 'text-indigo-500' : 'text-slate-300'}`}
        />
        {fileName ? (
          <p className="text-indigo-600 font-medium">{fileName}</p>
        ) : (
          <>
            <p className="text-slate-600 font-medium">
              Dra og slipp filen her, eller{' '}
              <span className="text-indigo-600 underline underline-offset-2">klikk for å velge</span>
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Støtter CSV og Excel (.xlsx, .xls)
            </p>
          </>
        )}
      </label>

      {/* Format hint */}
      <div className="mt-8 max-w-xl w-full">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Slik eksporterer du fra GSC
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: '1', text: 'Gå til Search Console → Søkeresultater' },
            { step: '2', text: 'Sett datoperiode og filtrer etter ønske' },
            { step: '3', text: 'Klikk Eksporter → Last ned CSV/Excel' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                {s.step}
              </span>
              <p className="text-slate-500 text-xs leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onClose }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-lg">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-red-800 text-sm">Feil ved innlasting</p>
          <p className="text-red-600 text-xs mt-1 whitespace-pre-wrap">{message}</p>
        </div>
        <button onClick={onClose} className="text-red-400 hover:text-red-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
