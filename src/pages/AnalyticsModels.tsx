import React, { useState } from 'react';
import { BrainCircuit, TrendingUp, Clock, AlertTriangle, Info, ChevronRight, Download } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Legend, ReferenceLine
} from 'recharts';

const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-slate-700">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

type Tab = 'anomaly' | 'forecast' | 'leadtime';

export const AnalyticsModels: React.FC = () => {
  const [tab, setTab] = useState<Tab>('anomaly');

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id:'anomaly',  icon:<AlertTriangle className="w-3.5 h-3.5" />, label:'Statistical Anomaly Radar' },
    { id:'forecast', icon:<TrendingUp className="w-3.5 h-3.5" />,    label:'ARIMA + XGBoost Forecast' },
    { id:'leadtime', icon:<Clock className="w-3.5 h-3.5" />,         label:'Lead-Time Decay Analytics' },
  ];

  /* Anomaly data */
  const anomalyData = Array.from({ length: 60 }, (_, i) => {
    const base = 5400;
    const noise = Math.random() * 800 - 400;
    const surge = [21, 39, 52].includes(i) ? Math.random() * 3500 + 2000 : 0;
    const fare = Math.round(base + noise + surge);
    const mean7 = Math.round(base + noise * 0.1);
    const std = 480;
    const zscore = +((fare - mean7) / std).toFixed(2);
    return { day: `D${i+1}`, fare, mean7, upper: Math.round(mean7 + 2 * std), lower: Math.round(mean7 - 2 * std), zscore };
  });

  /* Forecast data */
  const forecastData = [
    { month:'May-24', actual:6200, arima:null, xgb:null }, { month:'Jun-24', actual:5100, arima:null, xgb:null },
    { month:'Jul-24', actual:4800, arima:null, xgb:null }, { month:'Aug-24', actual:5300, arima:null, xgb:null },
    { month:'Sep-24', actual:5600, arima:null, xgb:null }, { month:'Oct-24', actual:6100, arima:null, xgb:null },
    { month:'Nov-24', actual:6800, arima:6700, xgb:6850  }, { month:'Dec-24', actual:null, arima:7100, xgb:7300 },
    { month:'Jan-25', actual:null, arima:5900, xgb:6000  }, { month:'Feb-25', actual:null, arima:5500, xgb:5600 },
    { month:'Mar-25', actual:null, arima:5800, xgb:5900  }, { month:'Apr-25', actual:null, arima:6200, xgb:6400 },
  ];

  /* Lead-time decay data */
  const decayData = [
    { days:90, indigo:4100, ai:4800, vistara:5100 }, { days:60, indigo:4350, ai:5100, vistara:5500 },
    { days:45, indigo:4500, ai:5300, vistara:5700 }, { days:30, indigo:4900, ai:5600, vistara:6200 },
    { days:21, indigo:5400, ai:6100, vistara:6800 }, { days:14, indigo:6200, ai:7000, vistara:8100 },
    { days:7,  indigo:8100, ai:9200, vistara:11400 },{ days:3,  indigo:10200, ai:11800, vistara:14200 },
    { days:1,  indigo:11600, ai:13500, vistara:16800 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">ML/Statistical Modelling Suite · MoCA Analytics</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-500" />Analytics &amp; Intelligence Models
          </h1>
          <p className="text-xs text-slate-500">Advanced statistical and ML models powering fare intelligence</p>
        </div>
        <button onClick={() => alert('Exporting model report…')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors">
          <Download className="w-3.5 h-3.5 text-blue-500" />Export Model Report
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Anomaly ────────────────────────────────────────── */}
      {tab === 'anomaly' && (
        <div className="space-y-5">
          {/* Model cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label:'Detection Algorithm', value:'Z-Score σ-Band (μ±2σ)', sub:'95.4% confidence interval' },
              { label:'Precision', value:'87.4%', sub:'Verified against 8,400 labelled events' },
              { label:'Recall', value:'91.8%', sub:'Low false-negative rate for surge classification' },
            ].map((c,i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{c.label}</span>
                <div className="mt-2 text-lg font-bold text-slate-900 font-mono">{c.value}</div>
                <div className="mt-1 text-[11px] text-slate-500">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Anomaly chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Anomaly Detection — DEL-BOM (60-Day Window)</h2>
                <p className="text-[11px] text-slate-500">Fares outside ±2σ Bollinger Band are auto-flagged</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-blue-600">● Fare</span>
                <span className="text-slate-400">--- 7d Mean</span>
                <span className="text-rose-400">--- +2σ band</span>
              </div>
            </div>

            <div className="h-[280px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={anomalyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize:9, fill:'#94a3b8' }} tickLine={false} interval={9} />
                  <YAxis domain={[2000,12000]} stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} tickFormatter={v=>`₹${v}`} />
                  <Tooltip content={<LightTooltip />} />
                  <Line type="monotone" dataKey="upper"  name="+2σ"  stroke="#fca5a5" strokeWidth={1.2} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="lower"  name="-2σ"  stroke="#86efac" strokeWidth={1.2} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="mean7"  name="7d μ" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="fare"   name="Fare" stroke="#2563eb" strokeWidth={2}   dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 3 alerts */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { time:'Day 22 · Oct 04', msg:'UK-995 DEL-BOM +45.8% vs μ · z=+3.24', sev:'Critical', clsBadge:'bg-rose-50 text-rose-700 border-rose-100', clsBg:'bg-rose-50 border-rose-100' },
                { time:'Day 40 · Sep 20', msg:'6E-204 DEL-BOM +41.4% vs μ · z=+2.88', sev:'High',     clsBadge:'bg-amber-50 text-amber-700 border-amber-100', clsBg:'bg-amber-50 border-amber-100' },
                { time:'Day 53 · Sep 29', msg:'AI-865 DEL-BOM −40.4% vs μ · z=−2.41', sev:'Yield Dump',clsBadge:'bg-sky-50 text-sky-700 border-sky-100', clsBg:'bg-sky-50 border-sky-100' },
              ].map((a,i) => (
                <div key={i} className={`p-3 rounded-lg border ${a.clsBg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${a.clsBadge}`}>{a.sev}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{a.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono">{a.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Forecast ────────────────────────────────────────── */}
      {tab === 'forecast' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label:'ARIMA Order',  value:'(2,1,1)', sub:'AIC-optimised for DEL-BOM' },
              { label:'XGBoost MAPE', value:'3.24%',   sub:'12-feature set, 92 depth' },
              { label:'Ensemble MAPE',value:'2.81%',   sub:'Weighted 40/60 blend' },
              { label:'Forecast Horizon',value:'90 days',sub:'±₹320 CI at P90' },
            ].map((c,i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{c.label}</span>
                <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono">{c.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">12-Month Airfare Forecast — DEL-BOM National Average</h2>
                <p className="text-[11px] text-slate-500">Ensemble ARIMA + XGBoost projection with seasonal adjustment</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-blue-600">● Actual</span>
                <span className="text-sky-400">-- ARIMA</span>
                <span className="text-purple-500">-- XGBoost</span>
              </div>
            </div>

            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} />
                  <YAxis domain={[4000,9000]} stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} tickFormatter={v=>`₹${v}`} />
                  <Tooltip content={<LightTooltip />} />
                  <ReferenceLine x="Nov-24" stroke="#94a3b8" strokeDasharray="3 3" label={{ value:'Forecast →', fill:'#94a3b8', fontSize:9 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#2563eb" strokeWidth={2.5} dot={{ r:3, fill:'#2563eb' }} connectNulls={false} />
                  <Line type="monotone" dataKey="arima"  name="ARIMA"  stroke="#0ea5e9" strokeWidth={2}   dot={{ r:2 }} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="xgb"    name="XGBoost" stroke="#7c3aed" strokeWidth={2}  dot={{ r:2 }} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Lead-Time Decay ────────────────────────────────── */}
      {tab === 'leadtime' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label:'Optimal Buy Window',  value:'D-21 to D-30', sub:'38.4% cheaper vs D-7 booking' },
              { label:'Critical Crossover',  value:'Day 14',       sub:'Bucket exhaustion — prices spike' },
              { label:'Worst-Case Premium',  value:'+168%',        sub:'Vistara D-1 vs D-90 baseline' },
            ].map((c,i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{c.label}</span>
                <div className="mt-1.5 text-2xl font-bold text-slate-900 font-mono">{c.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Lead-Time Yield Decay Curves — DEL-BOM</h2>
                <p className="text-[11px] text-slate-500">Average fare by days before departure across all carriers</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-blue-600">● IndiGo</span>
                <span className="text-red-500">● Air India</span>
                <span className="text-purple-500">● Vistara</span>
              </div>
            </div>

            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={decayData}>
                  <defs>
                    {[['iGrad','#2563eb'],['aGrad','#ef4444'],['vGrad','#7c3aed']].map(([id,c]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="days" reversed stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} tickFormatter={v=>`D-${v}`} />
                  <YAxis domain={[3000,18000]} stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} tickFormatter={v=>`₹${v}`} />
                  <Tooltip content={<LightTooltip />} />
                  <ReferenceLine x={14} stroke="#f59e0b" strokeDasharray="3 3" label={{ value:'D-14 Crossover', fill:'#f59e0b', fontSize:9 }} />
                  <Area type="monotone" dataKey="indigo"  name="IndiGo"    stroke="#2563eb" strokeWidth={2} fill="url(#iGrad)" />
                  <Area type="monotone" dataKey="ai"      name="Air India"  stroke="#ef4444" strokeWidth={2} fill="url(#aGrad)" />
                  <Area type="monotone" dataKey="vistara" name="Vistara"   stroke="#7c3aed" strokeWidth={2} fill="url(#vGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Optimal booking window: 21-30 days before travel.</strong> Vistara shows the steepest yield curve — last-minute TATKAL premium reaches +168% vs D-90.
                IndiGo maintains lower floor due to ancillary-disaggregated bundling strategy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
