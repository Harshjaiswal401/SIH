import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, FileText, Flame, Clock, AlertTriangle, Info } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { api } from '../services/api';
import { IndexData } from '../types';

/* shared mini card */
function KpiCard({ label, value, sub, badge, up }: { label:string; value:string; sub?:string; badge?:string; up?:boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border font-mono ${
            up == null ? 'bg-slate-100 text-slate-500 border-slate-200'
              : up ? 'bg-rose-50 text-rose-600 border-rose-100'
                   : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>{badge}</span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">{value}</div>
      {sub && <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-slate-700 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
          <span className="text-slate-500">{p.name === 'y2024' ? '2024 API' : '2023 Benchmark'}:</span>
          <span className="font-bold text-slate-900">{p.value} pts</span>
        </div>
      ))}
    </div>
  );
};

export const AirfareIndexMacro: React.FC = () => {
  const [showBenchmark, setShowBenchmark] = useState(true);

  const macroData = [
    { date:'Jan 15 (Base)', y2024:100.0, y2023:94.2 },
    { date:'Feb 01',        y2024:102.4, y2023:96.0 },
    { date:'Mar 01',        y2024:105.1, y2023:98.4 },
    { date:'Apr 01',        y2024:108.5, y2023:101.2 },
    { date:'May 15',        y2024:124.5, y2023:114.8 },
    { date:'Jun 15',        y2024:106.8, y2023:102.1 },
    { date:'Jul 15',        y2024:98.5,  y2023:95.0  },
    { date:'Aug 15',        y2024:104.2, y2023:99.8  },
    { date:'Sep 16',        y2024:112.1, y2023:104.5 },
    { date:'Oct 04',        y2024:126.8, y2023:116.2 },
    { date:'Oct 12',        y2024:118.64,y2023:111.4 },
    { date:'Nov 01',        y2024:121.2, y2023:115.0 },
  ];

  const dailyObs = [
    { date:'Oct 14, 2024', composite:118.64, change:'+0.42 pts', metro:121.30, tier2:114.20, driver:'ATF Spot Surcharge Revision' },
    { date:'Oct 13, 2024', composite:118.22, change:'+0.85 pts', metro:120.94, tier2:113.80, driver:'Sunday Pre-Festive Outflow' },
    { date:'Oct 12, 2024', composite:117.37, change:'−0.14 pts', metro:119.80, tier2:113.40, driver:'Mid-Day Yield Equalization' },
    { date:'Oct 11, 2024', composite:117.51, change:'+1.12 pts', metro:120.10, tier2:113.15, driver:'Weekend Inventory Compression' },
    { date:'Oct 10, 2024', composite:116.39, change:'+0.30 pts', metro:118.82, tier2:112.50, driver:'Tier-2 Durga Puja Demand' },
    { date:'Oct 09, 2024', composite:116.09, change:'−0.48 pts', metro:118.40, tier2:112.20, driver:'Midweek Lean Booking Cycle' },
    { date:'Oct 08, 2024', composite:116.57, change:'+0.19 pts', metro:118.90, tier2:112.75, driver:'Fleet Capacity Rebalancing' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">
            Laspeyres Formulation v2.8 · Mathematical Model
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Airfare Price Index (API) Macro Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardised capacity-weighted index tracking fare fluctuations vs Jan 2024 baseline (100.0)
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => api.downloadDGCAExport()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors">
            <Download className="w-3.5 h-3.5 text-blue-500" />Export CSV
          </button>
          <button onClick={() => alert('Downloading Laspeyres Methodology Whitepaper…')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors">
            <FileText className="w-3.5 h-3.5" />Methodology Whitepaper
          </button>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Current Index"      value="118.64" badge="MoM +3.2%"   up={true}  sub="Pre-festive acceleration" />
        <KpiCard label="30-Day High"        value="126.80" badge="Peak Alert"  up={true}  sub="Recorded Oct 04 — Festival peak" />
        <KpiCard label="30-Day Low"         value="112.10" badge="Trough"      up={false} sub="Recorded Sep 16 — Off-season dip" />
        <KpiCard label="Volatility σ"       value="σ 4.82" badge="Moderate"   sub="Gaussian fit — optimal band" />
      </div>

      {/* Trendline chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">National API Historical Trendline (2024 YTD)</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Baseline: Jan 15 2024 = 100.00</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={showBenchmark} onChange={e => setShowBenchmark(e.target.checked)}
              className="rounded border-slate-300 text-blue-600" />
            <span className="w-2 h-2 rounded-sm bg-slate-400 inline-block"></span>
            Show 2023 benchmark
          </label>
        </div>

        <div className="h-[260px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={macroData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} />
              <YAxis domain={[90,135]} stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} />
              <Tooltip content={<LightTooltip />} />
              <ReferenceLine y={100} stroke="#3b82f6" strokeDasharray="3 3"
                label={{ value:'Base 100', fill:'#3b82f6', fontSize:10 }} />
              <Line type="monotone" dataKey="y2024" name="y2024" stroke="#2563eb" strokeWidth={2.5} dot={{ r:3, fill:'#2563eb' }} />
              {showBenchmark && (
                <Line type="monotone" dataKey="y2023" name="y2023" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Highlighted annotation */}
        <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-blue-900">Oct 12 — 118.64 pts (+2.1% WoW):</span>
            <span className="text-blue-700 ml-1">
              Dominant driver: ATF price adjustment (+1.14 pts) &amp; festive holiday advance booking surge on Northern corridors.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: daily table + drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Daily observations */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Index Observations & Deconstructed Basket</h2>
              <p className="text-[11px] text-slate-500">Breakdown across metro trunk vs regional network</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded">Last 7 days</span>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 tracking-wide">
                  <th className="pb-2 text-left">Date</th>
                  <th className="pb-2 text-right">Composite API</th>
                  <th className="pb-2 text-right">Daily Δ</th>
                  <th className="pb-2 text-right">Metro</th>
                  <th className="pb-2 text-right">Tier-2</th>
                  <th className="pb-2 text-left pl-4">Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyObs.map((o, i) => (
                  <tr key={i} className="table-row-hover transition-colors">
                    <td className="py-2.5 font-bold text-slate-900 font-mono">{o.date}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-blue-600">{o.composite.toFixed(2)}</td>
                    <td className={`py-2.5 text-right font-mono font-semibold ${o.change.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>{o.change}</td>
                    <td className="py-2.5 text-right font-mono text-slate-600">{o.metro.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">{o.tier2.toFixed(2)}</td>
                    <td className="py-2.5 pl-4 text-slate-500 truncate max-w-[180px]">{o.driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Index Drivers */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Index Drivers</h2>
            <p className="text-[11px] text-slate-500 mt-2 mb-3">Contribution breakdown for +3.2% MoM trajectory</p>
            <div className="space-y-3">
              {[
                { icon:<Flame className="w-3.5 h-3.5 text-amber-500"/>, label:'Fuel Price (ATF)',       pts:'+1.4 pts', color:'text-amber-600', desc:'OMC benchmark hike passed to base fare bands.' },
                { icon:<Clock className="w-3.5 h-3.5 text-blue-500" />, label:'Booking Window Compression', pts:'+2.1 pts', color:'text-blue-600',  desc:'Late booking share: 18% → 31% festive surge.' },
                { icon:<AlertTriangle className="w-3.5 h-3.5 text-rose-500"/>, label:'Fleet Supply Constraints', pts:'+0.6 pts', color:'text-rose-600', desc:'P&W engine groundings curtailing trunk ASKs.' },
              ].map((d,i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">{d.icon}<span className="text-xs font-semibold text-slate-800">{d.label}</span></div>
                    <span className={`text-xs font-bold font-mono ${d.color}`}>{d.pts}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst insight */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-900">Analyst Macro Insight</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              The 3.2% MoM rise is driven by Dussehra/Diwali demand compression in Western and Northern corridors, compounded by tight A320neo availability.
            </p>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-blue-100 text-[10px] font-mono">
              <span className="text-blue-600">Confidence: <strong>High</strong></span>
              <span className="text-blue-600">DGCA Parity: <strong>Met</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
