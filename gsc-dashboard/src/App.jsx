import { useState, useCallback } from 'react';
import FileUpload, { ErrorBanner } from './components/FileUpload.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleFileLoaded = useCallback((rows, name) => {
    setData(rows);
    setFileName(name);
    setError(null);
  }, []);

  const handleError = useCallback((msg) => {
    setError(msg);
    setData(null);
  }, []);

  const handleReset = useCallback(() => {
    setData(null);
    setFileName(null);
    setError(null);
  }, []);

  return (
    <>
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      {data
        ? <Dashboard rows={data} fileName={fileName} onReset={handleReset} />
        : <FileUpload onFileLoaded={handleFileLoaded} onError={handleError} />
      }
    </>
  );
}
