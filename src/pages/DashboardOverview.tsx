import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  RefreshCw,
  FileDown,
  Plane,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Download,
  ChevronRight,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { TrendDataPoint } from '../types';

interface DashboardOverviewProps {
  onNavigate: (page: string, route?: string) => void;
}

/* ─── Reusable StatCard ──────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  badge,
  badgeColor = 'blue',
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'rose' | 'amber';
}) {
  const badgeClasses = {
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
  }[badgeColor];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border font-mono ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">{value}</div>
      {sub && <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

/* ─── Custom chart tooltip ──────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-slate-700">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
          <span className="text-slate-500">{p.name === 'fare' ? 'Avg Fare' : 'API Index'}:</span>
          <span className="font-semibold text-slate-800">
            {p.name === 'fare' ? `₹${p.value?.toLocaleString()}` : `${p.value} pts`}
          </span>
        </div>
      ))}
    </div>
  );
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [granularity, setGranularity] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [showFare, setShowFare] = useState(true);
  const [showIndex, setShowIndex] = useState(true);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api.getTrend().then(r => r?.data && setTrendData(r.data)).catch(console.error);
  }, []);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const r = await api.triggerScraper();
      setToast(`Scrape batch ${r.job_id || 'SCR-8909'} completed — +1,480 new fare buckets verified.`);
      setTimeout(() => setToast(null), 5500);
      api.getTrend().then(r => r?.data && setTrendData(r.data));
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold tracking-widest text-slate-400 uppercase">
              Civil Aviation Radar · SIH 2026
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot"></span>
              System Steady
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">AeroIndex Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time airfare monitoring, price index volatility & national aviation telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleScrape}
            disabled={isScraping}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            {isScraping ? 'Scraping…' : 'Run Scraper'}
          </button>
          <button
            onClick={() => api.downloadDGCAExport()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-500" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5" />{toast}</div>
          <button onClick={() => setToast(null)} className="text-emerald-500 font-mono">✕</button>
        </div>
      )}

      {/* ── 4 KPI Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="National Avg Fare"
          value="₹5,420"
          badge="−2.4% 7d"
          badgeColor="emerald"
          sub="Weighted across 142 routes"
        />
        <StatCard
          label="Airfare Price Index (API)"
          value={<>118.6 <span className="text-sm font-mono text-slate-400">pts</span></>}
          badge="+1.8 WoW"
          badgeColor="blue"
          sub="Jan 2024 baseline = 100.00"
        />
        <StatCard
          label="Monitored Corridors"
          value="142"
          badge="Active"
          badgeColor="blue"
          sub="6 key domestic hubs · 4 carriers"
        />
        <StatCard
          label="Data Pipeline Ingestion"
          value="184,290"
          badge="99.4% valid"
          badgeColor="emerald"
          sub="Records scraped today across OTAs"
        />
      </div>

      {/* ── Trend Chart + Corridor Density ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main trend chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">National Airfare Trend &amp; Price Index</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">90-day composite fare vs. normalised API</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={showFare} onChange={e => setShowFare(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                  <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block"></span>Fare
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={showIndex} onChange={e => setShowIndex(e.target.checked)}
                    className="rounded border-slate-300 text-sky-400 focus:ring-0" />
                  <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block"></span>Index
                </label>
              </div>
              {/* Granularity tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
                {(['Daily','Weekly','Monthly'] as const).map(g => (
                  <button key={g} onClick={() => setGranularity(g)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      granularity === g ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >{g}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Festive annotation */}
          <div className="mt-3 mb-1 inline-flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 live-dot"></span>
            Festive surge detected: Oct 28 – Nov 04
          </div>

          <div className="h-[260px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="fareGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} interval={12} />
                <YAxis yAxisId="left"  stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} domain={[3000,8500]} tickFormatter={v => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} domain={[80,150]} />
                <Tooltip content={<ChartTooltip />} />
                {showFare  && <Area  yAxisId="left"  type="monotone" dataKey="fare"  name="fare"  stroke="#3b82f6" strokeWidth={2} fill="url(#fareGrad)" />}
                {showIndex && <Line  yAxisId="right" type="monotone" dataKey="index" name="index" stroke="#0ea5e9" strokeWidth={1.8} dot={false} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Corridor density card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Corridor Density</h2>
                <p className="text-[11px] text-slate-500">Hub traffic &amp; congestion telemetry</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Live</span>
            </div>

            <div className="space-y-2 mt-4">
              {[
                { pair: 'DEL ⇄ BOM', freq: '64 flights/day', fare: '₹5,850', tag: 'High Vol', tagColor: 'blue',    route: 'DEL-BOM' },
                { pair: 'BLR ⇄ DEL', freq: '48 flights/day', fare: '₹6,200', tag: 'High Vol', tagColor: 'blue',    route: 'BLR-DEL' },
                { pair: 'BOM ⇄ BLR', freq: '38 flights/day', fare: '₹4,120', tag: 'Normal',   tagColor: 'slate',   route: 'BOM-BLR' },
              ].map(row => (
                <button
                  key={row.route}
                  onClick={() => onNavigate('route', row.route)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{row.pair}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{row.freq}</div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 font-mono">{row.fare}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border font-mono ${
                      row.tagColor === 'blue'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>{row.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('route')}
            className="mt-4 w-full py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            Deep Dive Corridor Analytics <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Recent Movements + Live Telemetry ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Fare Movements Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Recent Significant Fare Movements</h2>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">Surge Radar</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Intra-day fluctuations &gt; ±10% threshold</p>
            </div>
            <button onClick={() => onNavigate('route')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 tracking-wide">
                  <th className="pb-2 text-left">Route</th>
                  <th className="pb-2 text-left">Carrier</th>
                  <th className="pb-2 text-right">Prev Fare</th>
                  <th className="pb-2 text-right">Current Fare</th>
                  <th className="pb-2 text-right">Change</th>
                  <th className="pb-2 text-right">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { route:'DEL ⇄ BOM', carrier:'IndiGo',   code:'6E', prev:4299, curr:5850, chg:'+38.1%', ago:'12m ago', up:true  },
                  { route:'BLR ⇄ DEL', carrier:'Vistara',  code:'UK', prev:7100, curr:6200, chg:'−12.7%', ago:'28m ago', up:false },
                  { route:'BOM ⇄ GOI', carrier:'Air India',code:'AI', prev:3999, curr:4150, chg:'+3.8%',  ago:'41m ago', up:true  },
                  { route:'HYD ⇄ DEL', carrier:'SpiceJet', code:'SG', prev:4800, curr:6500, chg:'+35.4%', ago:'1h 5m',   up:true  },
                ].map((row, i) => (
                  <tr key={i} className="table-row-hover transition-colors">
                    <td className="py-2.5 font-bold text-slate-900">{row.route}</td>
                    <td className="py-2.5 text-slate-600">{row.carrier} <span className="text-slate-400 text-[10px]">({row.code})</span></td>
                    <td className="py-2.5 text-right font-mono text-slate-400">₹{row.prev.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">₹{row.curr.toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        row.up
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {row.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {row.chg}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">{row.ago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ops Control + Live Telemetry */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Operations Hub</h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Control Panel</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { label:'Search Route',    sub:'Deep parity analysis',      color:'text-blue-600',   icon:<ChevronRight className="w-3 h-3"/>, onClick:() => onNavigate('route','DEL-BOM') },
                { label:'Instant Scrape',  sub:'Sweep priority O&Ds',       color:'text-emerald-600',icon:<Zap className="w-3 h-3"/>,         onClick: handleScrape },
                { label:'Configure Alerts',sub:'Define surge margins',      color:'text-amber-600',  icon:<Sliders className="w-3 h-3"/>,     onClick:() => onNavigate('settings') },
                { label:'DGCA Report',     sub:'Export compliance file',    color:'text-sky-600',    icon:<Download className="w-3 h-3"/>,    onClick:() => api.downloadDGCAExport() },
              ].map((a,i) => (
                <button key={i} onClick={a.onClick}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white text-left transition-all group"
                >
                  <div className={`text-xs font-semibold flex items-center justify-between ${a.color}`}>
                    <span>{a.label}</span>{a.icon}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{a.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live telemetry feed */}
          <div className="border-t border-slate-100 pt-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Live Telemetry</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>Streaming
              </span>
            </div>

            <div className="space-y-2 text-[11px] font-mono max-h-36 overflow-y-auto">
              {[
                { dot:'bg-emerald-400', msg:'Worker #04 — DEL-BLR sweep: 1,240 records ingested (4m ago)' },
                { dot:'bg-blue-400',    msg:'Index Cycle #884 — National API: 118.6 pts (+1.8 WoW) (14m ago)' },
                { dot:'bg-rose-400',    msg:'Anomaly ⚡ DEL-BOM 6E-204 +38.1% vs 7d mean (28m ago)' },
              ].map((l,i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${l.dot}`}></span>
                  <span className="text-slate-600 leading-snug">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
