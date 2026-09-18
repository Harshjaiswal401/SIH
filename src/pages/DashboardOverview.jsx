import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Download,
  FileDown,
  Filter,
  Plane,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../services/api';

/*
  FAREPRICEIN — Dashboard Overview
  Visual direction:
  - graphite aviation operations room
  - restrained colors
  - less "template/card" feeling
  - real information hierarchy
  - existing API/navigation actions are preserved
*/

const C = {
  bg: '#0D1412',
  panel: '#121C19',
  panel2: '#18251F',
  line: '#2A3A33',
  text: '#F2F6F1',
  muted: '#9AAA9F',
  primary: '#43D17C',
  green: '#B7D96B',
  amber: '#E8B45D',
  red: '#E97868',
};

const badgeStyles = {
  blue: 'bg-[#43D17C]/10 text-[#75E3A0] border-[#43D17C]/20',
  emerald: 'bg-[#B7D96B]/10 text-[#B7D96B] border-[#B7D96B]/20',
  rose: 'bg-[#E97868]/10 text-[#F09284] border-[#E97868]/20',
  amber: 'bg-[#E8B45D]/10 text-[#E8B45D] border-[#E8B45D]/20',
  slate: 'bg-[#1B2922] text-[#9BAEC0] border-[#294057]',
};

function StatCard({ label, value, sub, badge, badgeColor = 'blue', icon: Icon, accent = C.primary }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#2A3A33] bg-[#121C19] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#476257]">
      <div
        className="absolute left-0 top-0 h-full w-[2px] opacity-70"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.035]">
              <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            </div>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9AAA9F]">
            {label}
          </span>
        </div>

        {badge && (
          <span className={`rounded-md border px-1.5 py-1 font-mono text-[9px] font-semibold ${badgeStyles[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-[28px] font-semibold tracking-[-0.04em] text-[#F2F6F1]">
          {value}
        </span>
      </div>

      {sub && (
        <div className="mt-3 border-t border-[#2A3A33] pt-3 text-[10px] leading-relaxed text-[#9AAA9F]">
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#2A3A33] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1 text-[9px] font-mono uppercase tracking-[0.18em] text-[#718178]">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[14px] font-semibold tracking-tight text-[#F2F6F1]">{title}</h2>
        {sub && <p className="mt-1 text-[10px] text-[#9AAA9F]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[170px] rounded-xl border border-[#3B5147] bg-[#0A1310] p-3 shadow-2xl">
      <div className="mb-2 font-mono text-[10px] text-[#9AAA9F]">{label}</div>

      {payload.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2 text-[10px] text-[#B8C5BC]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
            {item.name === 'fare' ? 'Average fare' : 'API index'}
          </div>
          <span className="font-mono text-[10px] font-semibold text-[#F2F6F1]">
            {item.name === 'fare'
              ? `₹${Number(item.value || 0).toLocaleString()}`
              : `${item.value} pts`}
          </span>
        </div>
      ))}
    </div>
  );
};

export const DashboardOverview = ({ onNavigate }) => {
  const [granularity, setGranularity] = useState('Daily');
  const [showFare, setShowFare] = useState(true);
  const [showIndex, setShowIndex] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [routeFilter, setRouteFilter] = useState('');

  const loadTrend = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.getTrend();
      if (response?.data) setTrendData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrend();
  }, []);

  const handleScrape = async () => {
    setIsScraping(true);

    try {
      const response = await api.triggerScraper();

      setToast(
        `Scrape batch ${response?.job_id || 'SCR-8909'} completed — new fare buckets verified.`
      );

      setTimeout(() => setToast(null), 5000);
      await loadTrend();
    } catch (error) {
      console.error(error);
      setToast('Scraper request failed. Check the pipeline monitor.');
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsScraping(false);
    }
  };

  const filteredRoutes = useMemo(() => {
    const rows = [
      { pair: 'DEL ⇄ BOM', freq: '64 flights/day', fare: '₹5,850', tag: 'High volume', route: 'DEL-BOM' },
      { pair: 'BLR ⇄ DEL', freq: '48 flights/day', fare: '₹6,200', tag: 'High volume', route: 'BLR-DEL' },
      { pair: 'BOM ⇄ BLR', freq: '38 flights/day', fare: '₹4,120', tag: 'Normal', route: 'BOM-BLR' },
    ];

    if (!routeFilter.trim()) return rows;

    return rows.filter((row) =>
      `${row.pair} ${row.route}`.toLowerCase().includes(routeFilter.toLowerCase())
    );
  }, [routeFilter]);

  const movements = [
    { route: 'DEL ⇄ BOM', carrier: 'IndiGo', code: '6E', prev: 4299, curr: 5850, chg: '+38.1%', ago: '12m', up: true },
    { route: 'BLR ⇄ DEL', carrier: 'Vistara', code: 'UK', prev: 7100, curr: 6200, chg: '−12.7%', ago: '28m', up: false },
    { route: 'BOM ⇄ GOI', carrier: 'Air India', code: 'AI', prev: 3999, curr: 4150, chg: '+3.8%', ago: '41m', up: true },
    { route: 'HYD ⇄ DEL', carrier: 'SpiceJet', code: 'SG', prev: 4800, curr: 6500, chg: '+35.4%', ago: '1h', up: true },
  ];

  return (
    <div className="min-h-full bg-[#0D1412] text-[#F2F6F1]">
      {/* subtle background detail — intentionally restrained */}
      <div className="pointer-events-none fixed right-0 top-0 h-72 w-72 rounded-full bg-[#43D17C]/[0.035] blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] space-y-5 p-5 lg:p-6">

        {/* TOP BAR */}
        <div className="flex flex-col gap-3 border-b border-[#2A3A33] pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3B5147] bg-[#18251F]">
              <Plane className="h-4 w-4 text-[#43D17C]" />
            </div>

            <div>
              <div className="font-semibold tracking-tight text-[#F2F6F1]">FAREPRICEIN</div>
              <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#718178]">
                Smart Airfare Analytics
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row xl:ml-8">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#607A91]" />
              <input
                value={routeFilter}
                onChange={(event) => setRouteFilter(event.target.value)}
                placeholder="Search route e.g. DEL-BOM, airline..."
                className="h-9 w-full rounded-lg border border-[#2A3A33] bg-[#121C19] pl-9 pr-3 text-xs text-[#F2F6F1] outline-none placeholder:text-[#718178] focus:border-[#43D17C]/50"
              />
            </div>

            <div className="flex h-9 items-center gap-2 rounded-lg border border-[#B7D96B]/20 bg-[#B7D96B]/[0.06] px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7D96B]" />
              <span className="font-mono text-[10px] text-[#B7D96B]">DEL-BOM median −4.2%</span>
            </div>

            <div className="flex h-9 items-center gap-2 rounded-lg border border-[#2A3A33] bg-[#121C19] px-3 text-[10px] text-[#B8C5BC]">
              <CalendarDays className="h-3.5 w-3.5 text-[#7F9186]" />
              Oct 15 — Nov 14, 2024
            </div>
          </div>
        </div>

        {/* PAGE INTRO */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#718178]">
            
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B7D96B]/20 bg-[#B7D96B]/[0.07] px-2 py-1 text-[9px] font-semibold text-[#B7D96B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B7D96B]" />
                System Live
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#F2F6F1]">
              Airfare Price Intelligence
            </h1>

            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[#9AAA9F]">
              A live view of fare movement, route activity and the national airfare price index.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadTrend}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A3A33] bg-[#121C19] px-3 py-2 text-[10px] font-semibold text-[#B8C5BC] transition hover:border-[#476257] hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleScrape}
              disabled={isScraping}
              className="inline-flex items-center gap-2 rounded-lg bg-[#43D17C] px-3.5 py-2 text-[10px] font-semibold text-[#0B120F] transition hover:bg-[#68DBFF] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScraping ? 'animate-spin' : ''}`} />
              {isScraping ? 'Running…' : 'Run Scraper'}
            </button>

            <button
              onClick={() => api.downloadDGCAExport()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A3A33] bg-[#121C19] px-3 py-2 text-[10px] font-semibold text-[#B8C5BC] transition hover:border-[#476257] hover:text-white"
            >
              <FileDown className="h-3.5 w-3.5 text-[#43D17C]" />
              Export
            </button>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className="flex items-center justify-between rounded-xl border border-[#B7D96B]/20 bg-[#B7D96B]/[0.07] px-4 py-3 text-[10px] text-[#B7D96B]">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" />
              {toast}
            </div>
            <button onClick={() => setToast(null)} className="text-[#B7D96B]">×</button>
          </div>
        )}

        {/* KPI STRIP */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="National Avg Fare"
            value="₹5,420"
            badge="−2.4% / 7d"
            badgeColor="emerald"
            sub="Weighted across 142 monitored routes"
            icon={Plane}
            accent={C.primary}
          />
          <StatCard
            label="Airfare Price Index"
            value="118.6"
            badge="+1.8 WoW"
            badgeColor="blue"
            sub="Jan 2024 baseline = 100.00"
            icon={TrendingUp}
            accent={C.green}
          />
          <StatCard
            label="Monitored Corridors"
            value="142"
            badge="Active"
            badgeColor="blue"
            sub="6 key domestic hubs · 4 carriers"
            icon={Activity}
            accent={C.primary}
          />
          <StatCard
            label="Pipeline Ingestion"
            value="184,290"
            badge="99.4% valid"
            badgeColor="emerald"
            sub="Records processed across OTA sources"
            icon={Wifi}
            accent={C.green}
          />
        </div>

        {/* QUICK MARKET PULSE */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Lowest tracked fare', '₹2,180', 'BLR → HYD'],
            ['Largest move', '+38.1%', 'DEL → BOM'],
            ['Data freshness', '04 min', 'Latest batch'],
            ['Active sources', '09', 'Airlines + OTAs'],
          ].map(([label, value, sub]) => (
            <div key={label} className="border-l border-[#3B5147] pl-3">
              <div className="text-[9px] uppercase tracking-[0.14em] text-[#718178]">{label}</div>
              <div className="mt-1 font-mono text-[15px] font-semibold text-[#E1E9E2]">{value}</div>
              <div className="mt-0.5 text-[9px] text-[#84968B]">{sub}</div>
            </div>
          ))}
        </div>

        {/* CHART + ROUTES */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="xl:col-span-2 rounded-2xl border border-[#2A3A33] bg-[#121C19] p-5">
            <SectionHeader
              eyebrow="Market movement"
              title="National airfare trend"
              sub="90-day composite fare compared with the normalised API"
              action={
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#9AAA9F]">
                    <input
                      type="checkbox"
                      checked={showFare}
                      onChange={(e) => setShowFare(e.target.checked)}
                      className="accent-[#43D17C]"
                    />
                    Fare
                  </label>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#9AAA9F]">
                    <input
                      type="checkbox"
                      checked={showIndex}
                      onChange={(e) => setShowIndex(e.target.checked)}
                      className="accent-[#B7D96B]"
                    />
                    Index
                  </label>

                  <div className="flex rounded-lg border border-[#2A3A33] bg-[#0A1310] p-0.5">
                    {['Daily', 'Weekly', 'Monthly'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setGranularity(item)}
                        className={`rounded-md px-2.5 py-1 text-[9px] font-medium transition ${
                          granularity === item
                            ? 'bg-[#1A3047] text-[#F2F6F1]'
                            : 'text-[#84968B] hover:text-[#B8C5BC]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />

            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#E8B45D]/15 bg-[#E8B45D]/[0.06] px-2.5 py-1.5 text-[9px] text-[#E8B45D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8B45D]" />
              Festive surge window · Oct 28 — Nov 04
            </div>

            <div className="mt-3 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fareAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.primary} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#2A3A33" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#84968B' }}
                    interval={12}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#84968B' }}
                    domain={[3000, 8500]}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#84968B' }}
                    domain={[80, 150]}
                  />
                  <Tooltip content={<ChartTooltip />} />

                  {showFare && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="fare"
                      name="fare"
                      stroke={C.green}
                      strokeWidth={2}
                      fill="url(#fareAreaGradient)"
                    />
                  )}

                  {showIndex && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="index"
                      name="index"
                      stroke={C.green}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-[#2A3A33] bg-[#121C19] p-5">
            <SectionHeader
              eyebrow="Route monitor"
              title="Corridor activity"
              sub="Selected high-frequency domestic corridors"
              action={<Filter className="h-3.5 w-3.5 text-[#607A91]" />}
            />

            <div className="mt-4 space-y-2">
              {filteredRoutes.map((row) => (
                <button
                  key={row.route}
                  onClick={() => onNavigate('route', row.route)}
                  className="group w-full rounded-xl border border-[#2A3A33] bg-[#101A16] p-3 text-left transition hover:border-[#43D17C]/30 hover:bg-[#18251F]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-[#F2F6F1]">{row.pair}</div>
                      <div className="mt-1 font-mono text-[9px] text-[#84968B]">{row.freq}</div>
                    </div>

                    <ChevronRight className="h-3.5 w-3.5 text-[#4F677D] transition group-hover:translate-x-0.5 group-hover:text-[#43D17C]" />
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#2A3A33] pt-2">
                    <span className="font-mono text-[12px] font-semibold text-[#E1E9E2]">{row.fare}</span>
                    <span className={`rounded border px-1.5 py-0.5 font-mono text-[8px] ${
                      row.tag === 'High volume'
                        ? 'border-[#43D17C]/20 bg-[#43D17C]/[0.06] text-[#75E3A0]'
                        : 'border-[#294057] bg-[#1B2922] text-[#9BAEC0]'
                    }`}>
                      {row.tag}
                    </span>
                  </div>
                </button>
              ))}

              {filteredRoutes.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#294057] p-6 text-center text-[10px] text-[#84968B]">
                  No matching corridor
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('route')}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#2A3A33] bg-transparent py-2.5 text-[10px] font-semibold text-[#9AAA9F] transition hover:border-[#43D17C]/30 hover:text-[#75E3A0]"
            >
              Open route analytics
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </div>

        {/* LOWER GRID */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* MOVEMENTS */}
          <section className="xl:col-span-2 rounded-2xl border border-[#2A3A33] bg-[#121C19] p-5">
            <SectionHeader
              eyebrow="Anomaly watch"
              title="Recent fare movements"
              sub="Intra-day changes crossing the configured monitoring threshold"
              action={
                <button
                  onClick={() => onNavigate('route')}
                  className="text-[10px] font-semibold text-[#75E3A0] hover:text-[#A1EBFF]"
                >
                  View all
                </button>
              }
            />

            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-[#2A3A33] text-[8px] uppercase tracking-[0.14em] text-[#718178]">
                    <th className="py-3 font-semibold">Route</th>
                    <th className="py-3 font-semibold">Carrier</th>
                    <th className="py-3 text-right font-semibold">Previous</th>
                    <th className="py-3 text-right font-semibold">Current</th>
                    <th className="py-3 text-right font-semibold">Change</th>
                    <th className="py-3 text-right font-semibold">Seen</th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map((row) => (
                    <tr key={`${row.route}-${row.code}`} className="border-b border-[#162B40] transition hover:bg-white/[0.018]">
                      <td className="py-3 text-[10px] font-semibold text-[#F2F6F1]">{row.route}</td>
                      <td className="py-3 text-[10px] text-[#B8C5BC]">
                        {row.carrier}
                        <span className="ml-1 font-mono text-[8px] text-[#718178]">({row.code})</span>
                      </td>
                      <td className="py-3 text-right font-mono text-[10px] text-[#84968B]">
                        ₹{row.prev.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-[10px] font-semibold text-[#E1E9E2]">
                        ₹{row.curr.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-1 font-mono text-[9px] font-semibold ${
                          row.up
                            ? 'border-[#E97868]/20 bg-[#E97868]/[0.07] text-[#F09284]'
                            : 'border-[#B7D96B]/20 bg-[#B7D96B]/[0.07] text-[#B7D96B]'
                        }`}>
                          {row.up
                            ? <ArrowUpRight className="h-3 w-3" />
                            : <ArrowDownRight className="h-3 w-3" />}
                          {row.chg}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-[9px] text-[#607A91]">{row.ago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* OPERATIONS */}
          <section className="rounded-2xl border border-[#2A3A33] bg-[#121C19] p-5">
            <SectionHeader
              eyebrow="Operations"
              title="Control room"
              sub="Shortcuts for the daily workflow"
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                {
                  label: 'Search route',
                  sub: 'Open corridor',
                  color: C.primary,
                  icon: <ChevronRight className="h-3 w-3" />,
                  onClick: () => onNavigate('route', 'DEL-BOM'),
                },
                {
                  label: 'Instant scrape',
                  sub: 'Priority O&Ds',
                  color: C.green,
                  icon: <Zap className="h-3 w-3" />,
                  onClick: handleScrape,
                },
                {
                  label: 'Configure alerts',
                  sub: 'Surge margins',
                  color: C.amber,
                  icon: <SlidersHorizontal className="h-3 w-3" />,
                  onClick: () => onNavigate('settings'),
                },
                {
                  label: 'DGCA report',
                  sub: 'Export dataset',
                  color: C.primary,
                  icon: <Download className="h-3 w-3" />,
                  onClick: () => api.downloadDGCAExport(),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="rounded-xl border border-[#2A3A33] bg-[#101A16] p-3 text-left transition hover:border-[#476257] hover:bg-[#18251F]"
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold" style={{ color: item.color }}>
                    {item.label}
                    {item.icon}
                  </div>
                  <div className="mt-1 text-[9px] text-[#84968B]">{item.sub}</div>
                </button>
              ))}
            </div>

            {/* pipeline health */}
            <div className="mt-4 border-t border-[#2A3A33] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#718178]">
                  Pipeline health
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#B7D96B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B7D96B]" />
                  Operational
                </span>
              </div>

              {[
                ['Collection workers', '12 / 12', 100],
                ['Validation queue', '96%', 96],
                ['Source availability', '9 / 10', 90],
              ].map(([label, value, width]) => (
                <div key={label} className="mb-3">
                  <div className="mb-1 flex justify-between text-[9px]">
                    <span className="text-[#9AAA9F]">{label}</span>
                    <span className="font-mono text-[#B8C5BC]">{value}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[#1B2922]">
                    <div
                      className="h-full rounded-full bg-[#43D17C]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* TELEMETRY FOOTER */}
        <section className="rounded-2xl border border-[#2A3A33] bg-[#101A16] p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-[#43D17C]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#84968B]">
                Live telemetry
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[8px] text-[#718178]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7D96B]" />
              STREAMING
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {[
              ['WORKER #04', 'DEL-BLR sweep', '1,240 records ingested', '4m ago', C.green],
              ['INDEX #884', 'National API', '118.6 pts · +1.8 WoW', '14m ago', C.primary],
              ['ANOMALY', 'DEL-BOM · 6E-204', '+38.1% vs 7d mean', '28m ago', C.red],
            ].map(([type, route, detail, ago, color]) => (
              <div
                key={type}
                className="flex items-start gap-3 rounded-lg border border-[#2A3A33] bg-[#121C19] p-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                <div className="min-w-0">
                  <div className="font-mono text-[8px] tracking-[0.12em]" style={{ color }}>
                    {type}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold text-[#E1E9E2]">{route}</div>
                  <div className="mt-0.5 text-[9px] text-[#84968B]">{detail}</div>
                </div>
                <span className="ml-auto shrink-0 font-mono text-[8px] text-[#526B82]">{ago}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
