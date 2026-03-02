/**
 * Detects whether a query is branded or non-branded.
 * Brand terms are configurable by the user.
 */
export function classifyQueries(rows, brandTerms) {
  const terms = brandTerms
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  if (terms.length === 0) {
    return rows.map(r => ({ ...r, isBranded: false }));
  }

  return rows.map(row => ({
    ...row,
    isBranded: terms.some(term => row.query.includes(term)),
  }));
}

export function splitByBrand(classifiedRows) {
  const branded = classifiedRows.filter(r => r.isBranded);
  const nonBranded = classifiedRows.filter(r => !r.isBranded);
  return { branded, nonBranded };
}

export function aggregateMetrics(rows) {
  if (rows.length === 0) {
    return { clicks: 0, impressions: 0, avgCtr: 0, avgPosition: 0, queryCount: 0 };
  }
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  // Weighted avg position by impressions
  const weightedPos = rows.reduce((s, r) => s + r.position * r.impressions, 0);
  const avgPosition = impressions > 0 ? weightedPos / impressions : 0;
  return {
    clicks,
    impressions,
    avgCtr,
    avgPosition,
    queryCount: rows.length,
  };
}

export function getTopByClicks(rows, n = 10) {
  return [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, n);
}

export function getTopByImpressions(rows, n = 10) {
  return [...rows].sort((a, b) => b.impressions - a.impressions).slice(0, n);
}

export function getTopOpportunities(rows, n = 10) {
  // High impressions + low position (close to page 1) + low CTR = opportunity
  return [...rows]
    .filter(r => r.impressions >= 50 && r.position <= 20)
    .sort((a, b) => {
      const scoreA = a.impressions / Math.max(a.position, 1);
      const scoreB = b.impressions / Math.max(b.position, 1);
      return scoreB - scoreA;
    })
    .slice(0, n);
}

export function getPositionBuckets(rows) {
  const buckets = {
    'Top 3': rows.filter(r => r.position <= 3),
    '4–10': rows.filter(r => r.position > 3 && r.position <= 10),
    '11–20': rows.filter(r => r.position > 10 && r.position <= 20),
    '21–50': rows.filter(r => r.position > 20 && r.position <= 50),
    '50+': rows.filter(r => r.position > 50),
  };
  return Object.entries(buckets).map(([name, items]) => ({
    name,
    queries: items.length,
    clicks: items.reduce((s, r) => s + r.clicks, 0),
    impressions: items.reduce((s, r) => s + r.impressions, 0),
  }));
}

export function getCtrDistribution(rows) {
  const buckets = [
    { name: '0–1%', min: 0, max: 1 },
    { name: '1–3%', min: 1, max: 3 },
    { name: '3–5%', min: 3, max: 5 },
    { name: '5–10%', min: 5, max: 10 },
    { name: '10%+', min: 10, max: Infinity },
  ];
  return buckets.map(b => ({
    name: b.name,
    count: rows.filter(r => r.ctr >= b.min && r.ctr < b.max).length,
  }));
}
