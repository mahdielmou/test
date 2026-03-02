import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const COLUMN_ALIASES = {
  query: ['query', 'queries', 'søkeord', 'keyword', 'search term', 'søkefrase'],
  clicks: ['clicks', 'klikk', 'click'],
  impressions: ['impressions', 'visnigner', 'visninger', 'impression'],
  ctr: ['ctr', 'click-through rate', 'klikkfrekvens'],
  position: ['position', 'avg. position', 'average position', 'posisjon', 'gj.snitt posisjon', 'gjennomsnittlig posisjon'],
};

function normalizeHeader(header) {
  return header.toLowerCase().trim().replace(/[^a-zæøå0-9\s.]/g, '');
}

function detectColumn(headers, aliases) {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.findIndex(h => h.includes(alias));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  const s = String(val).replace(/[%,\s]/g, '').replace(',', '.');
  return parseFloat(s) || 0;
}

function normalizeRows(rawRows, headers) {
  const colIdx = {};
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    colIdx[key] = detectColumn(headers, aliases);
  }

  const missing = Object.entries(colIdx)
    .filter(([, idx]) => idx === -1)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Kunne ikke finne følgende kolonner: ${missing.join(', ')}.\n` +
      `Forventede kolonner: Query, Clicks, Impressions, CTR, Position.\n` +
      `Fant: ${headers.join(', ')}`
    );
  }

  return rawRows
    .filter(row => row[colIdx.query]?.trim?.())
    .map(row => ({
      query: String(row[colIdx.query]).trim().toLowerCase(),
      clicks: parseNumber(row[colIdx.clicks]),
      impressions: parseNumber(row[colIdx.impressions]),
      ctr: parseNumber(row[colIdx.ctr]),
      position: parseNumber(row[colIdx.position]),
    }))
    .filter(row => row.impressions > 0 || row.clicks > 0);
}

export async function parseGSCFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv' || ext === 'tsv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          try {
            const [headerRow, ...dataRows] = result.data;
            const rows = dataRows.map(row =>
              Object.fromEntries(row.map((v, i) => [i, v]))
            );
            const headers = headerRow.map(String);
            resolve(normalizeRows(rows.map(r => Object.values(r)), headers));
          } catch (e) {
            reject(e);
          }
        },
        error: reject,
      });
    });
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (raw.length < 2) throw new Error('Filen inneholder ingen data.');
    const [headerRow, ...dataRows] = raw;
    const headers = headerRow.map(String);
    const rows = dataRows.map(row => row.map(String));
    return normalizeRows(rows, headers);
  }

  throw new Error(`Filformat ".${ext}" støttes ikke. Last opp CSV eller Excel-fil.`);
}
