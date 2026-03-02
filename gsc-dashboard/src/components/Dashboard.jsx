import { useMemo, useState } from 'react';
import {
  MousePointerClick, Eye, TrendingUp, Hash, Award, Zap, FileSpreadsheet, RefreshCw, Tag,
} from 'lucide-react';
import MetricCard from './MetricCard.jsx';
import BrandToggle from './BrandToggle.jsx';
import QueryTable from './QueryTable.jsx';
import {
  BrandedPieChart,
  TopQueriesBar,
  PositionBucketChart,
  CtrDistributionBar,
  BrandedMetricCompare,
} from './Charts.jsx';
import {
  classifyQueries,
  splitByBrand,
  aggregateMetrics,
  getTopByClicks,
  getTopByImpressions,
  getTopOpportunities,
  getPositionBuckets,
  getCtrDistribution,
} from '../utils/brandDetection.js';

const TABS = ['Oversikt', 'Branded', 'Non-branded', 'Muligheter', 'Alle søkeord'];

export default function Dashboard({ rows, fileName, onReset }) {
  const [brandTerms, setBrandTerms] = useState('');
  const [activeTab, setActiveTab] = useState('Oversikt');
  const [pieMetric, setPieMetric] = useState('clicks');

  const classified = useMemo(() => classifyQueries(rows, brandTerms), [rows, brandTerms]);
  const { branded, nonBranded } = useMemo(() => splitByBrand(classified), [classified]);

  const totalMetrics = useMemo(() => aggregateMetrics(classified), [classified]);
  const brandedMetrics = useMemo(() => aggregateMetrics(branded), [branded]);
  const nonBrandedMetrics = useMemo(() => aggregateMetrics(nonBranded), [nonBranded]);

  const topClicksAll = useMemo(() => getTopByClicks(classified, 10), [classified]);
  const topImpressAll = useMemo(() => getTopByImpressions(classified, 10), [classified]);
  const topClicksBranded = useMemo(() => getTopByClicks(branded, 10), [branded]);
  const topClicksNonBranded = useMemo(() => getTopByClicks(nonBranded, 10), [nonBranded]);
  const opportunities = useMemo(() => getTopOpportunities(nonBranded, 20), [nonBranded]);
  const positionBuckets = useMemo(() => getPositionBuckets(classified), [classified]);
  const ctrDist = useMemo(() => getCtrDistribution(classified), [classified]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-sm">GSC Dashboard</span>
              {fileName && (
                <span className="ml-2 text-xs text-slate-400 hidden sm:inline">— {fileName}</span>
              )}
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Last opp ny fil</span>
          </button>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Brand config */}
        <BrandToggle brandTerms={brandTerms} onChange={setBrandTerms} />

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Totale klikk"
            value={totalMetrics.clicks.toLocaleString('nb-NO')}
            icon={MousePointerClick}
            color="indigo"
            sub="Alle søkeord"
          />
          <MetricCard
            label="Totale visninger"
            value={totalMetrics.impressions >= 1000
              ? `${(totalMetrics.impressions / 1000).toFixed(0)}k`
              : totalMetrics.impressions.toLocaleString('nb-NO')}
            icon={Eye}
            color="violet"
            sub="Alle søkeord"
          />
          <MetricCard
            label="Avg. CTR"
            value={`${totalMetrics.avgCtr.toFixed(1)}%`}
            icon={TrendingUp}
            color="emerald"
            sub="Vektet snitt"
          />
          <MetricCard
            label="Avg. Posisjon"
            value={totalMetrics.avgPosition.toFixed(1)}
            icon={Award}
            color="amber"
            sub="Vektet snitt"
          />
          <MetricCard
            label="Unike søkeord"
            value={totalMetrics.queryCount.toLocaleString('nb-NO')}
            icon={Hash}
            color="sky"
            sub="Totalt"
          />
        </div>

        {/* Branded summary cards */}
        {brandTerms.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge bg-indigo-100 text-indigo-700">Branded</span>
                <span className="text-xs text-slate-400">{branded.length} søkeord</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-indigo-700">{brandedMetrics.clicks.toLocaleString('nb-NO')}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Klikk</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-700">
                    {brandedMetrics.impressions >= 1000
                      ? `${(brandedMetrics.impressions / 1000).toFixed(0)}k`
                      : brandedMetrics.impressions.toLocaleString('nb-NO')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Visninger</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-700">{brandedMetrics.avgCtr.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400 mt-0.5">CTR</p>
                </div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge bg-emerald-100 text-emerald-700">Non-branded</span>
                <span className="text-xs text-slate-400">{nonBranded.length} søkeord</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{nonBrandedMetrics.clicks.toLocaleString('nb-NO')}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Klikk</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {nonBrandedMetrics.impressions >= 1000
                      ? `${(nonBrandedMetrics.impressions / 1000).toFixed(0)}k`
                      : nonBrandedMetrics.impressions.toLocaleString('nb-NO')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Visninger</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{nonBrandedMetrics.avgCtr.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400 mt-0.5">CTR</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-sm w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Oversikt' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopQueriesBar
                rows={topClicksAll}
                metric="clicks"
                title="Topp 10 søkeord — Klikk"
                color="#6366f1"
              />
              <TopQueriesBar
                rows={topImpressAll}
                metric="impressions"
                title="Topp 10 søkeord — Visninger"
                color="#8b5cf6"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PositionBucketChart data={positionBuckets} />
              <CtrDistributionBar data={ctrDist} />
            </div>
            {brandTerms.trim() && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BrandedPieChart
                  branded={brandedMetrics}
                  nonBranded={nonBrandedMetrics}
                  metric={pieMetric}
                />
                <BrandedMetricCompare branded={brandedMetrics} nonBranded={nonBrandedMetrics} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'Branded' && (
          <div className="space-y-6">
            {brandTerms.trim() ? (
              <>
                <TopQueriesBar
                  rows={topClicksBranded}
                  metric="clicks"
                  title="Branded — Topp søkeord etter klikk"
                  color="#6366f1"
                />
                <QueryTable
                  rows={branded}
                  title="Branded søkeord"
                  badge={`${branded.length} søkeord`}
                  badgeColor="indigo"
                />
              </>
            ) : (
              <NoBrandWarning />
            )}
          </div>
        )}

        {activeTab === 'Non-branded' && (
          <div className="space-y-6">
            {brandTerms.trim() ? (
              <>
                <TopQueriesBar
                  rows={topClicksNonBranded}
                  metric="clicks"
                  title="Non-branded — Topp søkeord etter klikk"
                  color="#10b981"
                />
                <QueryTable
                  rows={nonBranded}
                  title="Non-branded søkeord"
                  badge={`${nonBranded.length} søkeord`}
                  badgeColor="emerald"
                />
              </>
            ) : (
              <NoBrandWarning />
            )}
          </div>
        )}

        {activeTab === 'Muligheter' && (
          <div className="space-y-6">
            <div className="card bg-amber-50 border-amber-100">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">SEO-muligheter</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Søkeord med høy synlighet (≥50 visninger), posisjon 1–20 og lav CTR.
                    Disse har stort potensial for forbedring av titler og metabeskrivelser.
                  </p>
                </div>
              </div>
            </div>
            <QueryTable
              rows={opportunities}
              title="Top muligheter"
              badge="Prioriterte"
              badgeColor="indigo"
            />
          </div>
        )}

        {activeTab === 'Alle søkeord' && (
          <QueryTable
            rows={classified}
            title="Alle søkeord"
            badge={`${classified.length} totalt`}
            badgeColor="slate"
          />
        )}
      </div>
    </div>
  );
}

function NoBrandWarning() {
  return (
    <div className="card flex flex-col items-center py-16 text-center">
      <Tag className="w-10 h-10 text-slate-200 mb-3" />
      <p className="font-semibold text-slate-600">Ingen brand-termer konfigurert</p>
      <p className="text-slate-400 text-sm mt-1 max-w-sm">
        Legg til brand-termer i feltet øverst for å se branded vs. non-branded splitt.
      </p>
    </div>
  );
}

