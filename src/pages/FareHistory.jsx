import React, { useState } from 'react';
import { Download, Calendar, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, LineChart, Line
} from 'recharts';

const LightTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-slate-700">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-900">₹{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export const FareHistory = () => {
  const [route, setRoute] = useState('DEL-BOM');
  const [view, setView] = useState('daily');

  const fareData = Array.from({ length: 60 }, (_, i) => {
    const base = route === 'DEL-BOM' ? 5200 : route === 'BLR-DEL' ? 6100 : 4200;
    const noise = Math.random() * 2000 - 1000;
    const festive = i > 40 && i < 55 ? 1800 : 0;
    return {
      day: `Day ${i + 1}`,
      indigo: Math.round(base * 0.88 + noise * 0.8 + festive * 0.7),
      airindia: Math.round(base * 1.05 + noise * 0.9 + festive),
      vistara: Math.round(base * 1.18 + noise + festive * 1.2),
    };
  });

  const summaryStats = [
    { label:'60-Day Avg',     value:'₹5,842',  badge:'Composite',  badgeCls:'bg-slate-100 text-slate-500 border-slate-200' },
    { label:'Historical High',value:'₹10,500', badge:'Oct 04',     badgeCls:'bg-rose-50 text-rose-600 border-rose-100' },
    { label:'Historical Low', value:'₹3,280',  badge:'Sep 03',     badgeCls:'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label:'Surge Days',     value:'8 / 60',  badge:'+35%+ events',badgeCls:'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">60-Day Audit Log · Historical Fare Ledger</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Fare History Ledger</h1>
          <p className="text-xs text-slate-500">Multi-carrier fare trajectory analysis with surge event annotation</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Route selector */}
          <select
            value={route}
            onChange={e => setRoute(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          >
            {['DEL-BOM','BLR-DEL','BOM-BLR','HYD-DEL','DEL-CCU'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Granularity */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
            {['daily','weekly','monthly'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  view === v ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >{v}</button>
            ))}
          </div>

          <button onClick={() => alert('Exporting fare history CSV…')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors">
            <Download className="w-3.5 h-3.5 text-blue-500" />Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border font-mono ${s.badgeCls}`}>{s.badge}</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Multi-carrier chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Multi-Carrier Fare History — {route}</h2>
            <p className="text-[11px] text-slate-500">60-day quoted economy fare per carrier · All sources</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-blue-600">● IndiGo (6E)</span>
            <span className="text-red-500">● Air India (AI)</span>
            <span className="text-purple-500">● Vistara (UK)</span>
          </div>
        </div>

        {/* Surge annotation */}
        <div className="mt-3 mb-1 flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 w-fit font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Surge Events (Day 41–54): Festive demand — Navratri &amp; Dussehra window
        </div>

        <div className="h-[280px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fareData}>
              <defs>
                {[['indigoGrad','#2563eb'],['aiGrad','#ef4444'],['vistaraGrad','#8b5cf6']].map(([id,color]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize:9, fill:'#94a3b8' }} tickLine={false} interval={9} />
              <YAxis domain={[2500,12000]} stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} tickFormatter={v=>`₹${v}`} />
              <Tooltip content={<LightTooltip />} />
              <ReferenceLine x="Day 41" stroke="#f59e0b" strokeDasharray="3 3" label={{ value:'Surge', fill:'#f59e0b', fontSize:9 }} />
              <Area type="monotone" dataKey="indigo"   name="IndiGo"    stroke="#2563eb" strokeWidth={2} fill="url(#indigoGrad)" />
              <Area type="monotone" dataKey="airindia" name="Air India"  stroke="#ef4444" strokeWidth={2} fill="url(#aiGrad)" />
              <Area type="monotone" dataKey="vistara"  name="Vistara"   stroke="#8b5cf6" strokeWidth={2} fill="url(#vistaraGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly log table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Surge Event Log — {route}</h2>
            <p className="text-[11px] text-slate-500">Flagged anomalies exceeding ±20% threshold vs 7-day moving average</p>
          </div>
          <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">8 Events · 60-Day Window</span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 tracking-wide">
                <th className="pb-2 text-left">Date</th>
                <th className="pb-2 text-left">Flight</th>
                <th className="pb-2 text-right">Fare</th>
                <th className="pb-2 text-right">7d Mean</th>
                <th className="pb-2 text-right">Δ%</th>
                <th className="pb-2 text-left pl-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { date:'Oct 04',   flight:'UK-995',   fare:10500, mean:7200, delta:'+45.8%', cls:'Critical Surge',  clsCls:'bg-rose-50 text-rose-700 border-rose-100'    },
                { date:'Oct 02',   flight:'6E-5012',  fare:8900,  mean:6800, delta:'+30.9%', cls:'High Surge',      clsCls:'bg-amber-50 text-amber-700 border-amber-100'  },
                { date:'Sep 29',   flight:'AI-865',   fare:3100,  mean:5200, delta:'−40.4%', cls:'Yield Dump',      clsCls:'bg-emerald-50 text-emerald-700 border-emerald-100'},
                { date:'Sep 20',   flight:'6E-204',   fare:8200,  mean:5800, delta:'+41.4%', cls:'High Surge',      clsCls:'bg-amber-50 text-amber-700 border-amber-100'  },
              ].map((r,i) => (
                <tr key={i} className="table-row-hover transition-colors">
                  <td className="py-2.5 font-bold text-slate-900 font-mono">{r.date}</td>
                  <td className="py-2.5 text-slate-600 font-mono">{r.flight}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">₹{r.fare.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono text-slate-500">₹{r.mean.toLocaleString()}</td>
                  <td className={`py-2.5 text-right font-mono font-bold ${r.delta.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}`}>{r.delta}</td>
                  <td className="py-2.5 pl-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${r.clsCls}`}>{r.cls}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
