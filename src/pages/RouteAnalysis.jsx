import React, { useState } from 'react';
import { Calendar, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
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
          <span className="font-bold text-slate-900">{p.value ? `₹${p.value.toLocaleString()}` : '—'}</span>
        </div>
      ))}
    </div>
  );
};

export const RouteAnalysis = ({ initialRoute = 'DEL-BOM' }) => {

  const evolutionData = [
    { day:'D-30', observed:4200,  predicted:null  },
    { day:'D-25', observed:4350,  predicted:null  },
    { day:'D-21', observed:4500,  predicted:null  },
    { day:'D-18', observed:4800,  predicted:null  },
    { day:'D-14', observed:5850,  predicted:5850  },
    { day:'D-10', observed:null,  predicted:6700  },
    { day:'D-7',  observed:null,  predicted:7600  },
    { day:'D-5',  observed:null,  predicted:8400  },
    { day:'D-3',  observed:null,  predicted:9400  },
    { day:'D-1',  observed:null,  predicted:10600 },
    { day:'D-0',  observed:null,  predicted:11500 },
  ];

  const dispersion = [
    { carrier:'IndiGo (6E)',   flights:35, min:4199, mean:5400, max:8200,  share:52, color:'#2563eb' },
    { carrier:'Air India (AI)',flights:19, min:4650, mean:6100, max:9400,  share:28, color:'#ef4444' },
    { carrier:'Vistara (UK)',  flights:14, min:5200, mean:6800, max:12100, share:20, color:'#8b5cf6' },
  ];

  const inventory = [
    { flight:'6E 205',  depArr:'06:10 – 08:20', carrier:'IndiGo',    fare:4199, tag:'Lowest',     tagCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { flight:'UK 933',  depArr:'07:30 – 09:45', carrier:'Vistara',   fare:5450, tag:'Normal',     tagCls:'bg-slate-100 text-slate-500 border-slate-200' },
    { flight:'AI 865',  depArr:'10:00 – 12:15', carrier:'Air India', fare:4980, tag:'Normal',     tagCls:'bg-slate-100 text-slate-500 border-slate-200' },
    { flight:'6E 5012', depArr:'17:15 – 19:30', carrier:'IndiGo',    fare:6890, tag:'Peak Slot',  tagCls:'bg-amber-50 text-amber-700 border-amber-100' },
    { flight:'UK 995',  depArr:'18:45 – 21:00', carrier:'Vistara',   fare:8400, tag:'High Demand',tagCls:'bg-rose-50 text-rose-700 border-rose-100' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Page header & corridor meta */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">Trunk Corridor A1 · Real-Time GDS</span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">DEL ✈ BOM — New Delhi – Mumbai</h1>
            <p className="text-xs text-slate-500">Deep parity analysis, carrier dispersion &amp; decision intelligence</p>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono">
            {[['1,148 km','Air Distance'],['2h 10m','Block Time'],['68 flights','Daily Scheduled']].map(([v,l],i)=>(
              <div key={i} className={i ? 'border-l border-slate-200 pl-6' : ''}>
                <div className="text-[10px] text-slate-400 uppercase">{l}</div>
                <div className="font-bold text-slate-900 text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market share bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold text-slate-500 uppercase tracking-wide">Capacity Market Share</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-blue-600">● IndiGo 52%</span>
              <span className="text-red-500">● Air India 28%</span>
              <span className="text-purple-500">● Vistara 20%</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
            <div className="h-full bg-blue-500" style={{ width:'52%' }}></div>
            <div className="h-full bg-red-500"  style={{ width:'28%' }}></div>
            <div className="h-full bg-purple-500" style={{ width:'20%' }}></div>
          </div>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Current Avg Fare',    value:'₹5,850', badge:'+14.2%', up:true,  sub:'Route Index: 122.4 pts' },
          { label:'Lowest Available',    value:'₹4,199', badge:'Competitive',up:false,sub:'IndiGo 6E-205 · 06:10 AM' },
          { label:'Median Peak Fare',    value:'₹8,900', badge:'Evening',  up:true,  sub:'Vistara UK-995 · 18:30 PM' },
          { label:'Corridor Volatility', value:'0.28 σ', badge:'High',     up:true,  sub:'Historical mean: 0.14' },
        ].map((c,i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border font-mono ${
                c.up == null ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : c.up ? 'bg-rose-50 text-rose-600 border-rose-100'
                         : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>{c.badge}</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tracking-tight">{c.value}</div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Fare Evolution + BUY/WAIT widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">30-Day Fare Evolution (DEL-BOM: Oct 28)</h2>
              <p className="text-[11px] text-slate-500">Average quoted fare as departure approaches</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-blue-600">● Observed</span>
              <span className="text-sky-400">-- ML Prediction</span>
            </div>
          </div>

          <div className="h-[260px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} />
                <YAxis domain={[3500,13000]} stroke="#94a3b8" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} tickFormatter={v=>`₹${v}`} />
                <Tooltip content={<LightTooltip />} />
                <Line type="monotone" dataKey="observed" name="Observed" stroke="#2563eb" strokeWidth={2.5} dot={{ r:4, fill:'#2563eb' }} connectNulls={false} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="4 4" dot={{ r:3, fill:'#0ea5e9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 font-mono">
            <span>Historical (Observed): <strong className="text-blue-600">D-30 → D-14</strong></span>
            <span>ML Ramp: <strong className="text-sky-500">D-14 → D-0</strong></span>
            <span>Step-spike at <strong className="text-rose-500">D-7</strong></span>
          </div>
        </div>

        {/* BUY/WAIT signal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Buy Now or Wait?</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                91% Confidence
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">Book within 48 hours</div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                DEL-BOM inventory curves indicate bucket saturation at D-12. Fares typically spike <strong>+28%</strong> at D-10.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Expected Shift</span>
                <span className="text-sm font-bold text-rose-600 font-mono mt-0.5 block">+₹1,640</span>
                <span className="text-[10px] text-slate-400">by Thu Oct 17</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Recommended</span>
                <span className="text-xs font-bold text-emerald-600 mt-0.5 block">Secure Floor</span>
                <span className="text-[10px] text-slate-400">Target sub-₹4,500</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            Based on 14,200 DEL-BOM historical trajectory records
          </div>
        </div>
      </div>

      {/* Carrier Dispersion + Live Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Carrier Price Dispersion &amp; Yield Spread</h2>
              <p className="text-[11px] text-slate-500">Min · Mean · Max quote bounds for Oct 28</p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded">Range: ₹4,199 – ₹12,100</span>
          </div>

          <div className="space-y-4 mt-4">
            {dispersion.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="font-bold text-slate-900">{d.carrier}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{d.flights} flights</span>
                  </div>
                  <div className="font-mono text-slate-600 text-[11px]">
                    Min <strong className="text-slate-900">₹{d.min.toLocaleString()}</strong> ·
                    Avg <strong className="text-blue-600">₹{d.mean.toLocaleString()}</strong> ·
                    Max <strong className="text-rose-600">₹{d.max.toLocaleString()}</strong>
                  </div>
                </div>
                {/* Range bar */}
                <div className="h-5 w-full rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden">
                  <div className="h-2 rounded-full absolute top-1.5"
                    style={{
                      left: `${((d.min - 3500)/(13000-3500))*100}%`,
                      width:`${((d.max - d.min)/(13000-3500))*100}%`,
                      backgroundColor: d.color,
                      opacity: 0.35
                    }}
                  />
                  <div className="w-1 h-4 bg-white border border-slate-300 rounded-full absolute top-0.5 shadow-sm"
                    style={{ left:`${((d.mean - 3500)/(13000-3500))*100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Inventory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Live Fare Inventory</h2>
            <p className="text-[11px] text-slate-500">Active non-stop flights for Oct 28</p>
          </div>

          <div className="space-y-2 mt-3">
            {inventory.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-xs">{f.flight}</span>
                    <span className="text-[11px] text-slate-500">{f.carrier}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{f.depArr}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">₹{f.fare.toLocaleString()}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${f.tagCls}`}>{f.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
