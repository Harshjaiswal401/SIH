import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Share2, Calendar, ChevronRight, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage = () => {
  const [tab, setTab] = useState('pdf');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1600));
    setIsGenerating(false);
    api.downloadDGCAExport();
  };

  const tabs = [
    { id:'pdf',  label:'PDF Reports',    icon:<FileText   className="w-3.5 h-3.5" /> },
    { id:'csv',  label:'CSV Data Exports',icon:<Download   className="w-3.5 h-3.5" /> },
    { id:'dgca', label:'DGCA Compliance', icon:<Shield     className="w-3.5 h-3.5" /> },
  ];

  const savedReports = [
    { title:'September 2024 — National Airfare Intelligence Report',   date:'Oct 01, 2024', type:'PDF', size:'2.4 MB', status:'Published', statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { title:'Q3 2024 — Route Performance & Index Analysis (JAS)',      date:'Oct 01, 2024', type:'PDF', size:'3.8 MB', status:'Published', statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { title:'August 2024 — Carrier Fare Dispersion Audit',            date:'Sep 02, 2024', type:'PDF', size:'1.9 MB', status:'Archived',  statusCls:'bg-slate-100 text-slate-500 border-slate-200' },
    { title:'July 2024 — Off-Peak Structural Analysis',               date:'Aug 01, 2024', type:'PDF', size:'1.6 MB', status:'Archived',  statusCls:'bg-slate-100 text-slate-500 border-slate-200' },
    { title:'October 2024 — Festive Surge Event Log (Draft)',         date:'Oct 14, 2024', type:'PDF', size:'—',     status:'Draft',     statusCls:'bg-amber-50 text-amber-700 border-amber-100' },
  ];

  const dgcaChecks = [
    { label:'Minimum Capacity Monitoring',          pass:true  },
    { label:'Fare Band Transparency Compliance',    pass:true  },
    { label:'Surge Pricing Threshold Reporting',    pass:true  },
    { label:'Dynamic Pricing Disclosure Log',       pass:true  },
    { label:'Carrier Code Validation (IATA/DGCA)',  pass:true  },
    { label:'APAS Feed Synchronisation',            pass:false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">Report Generation Suite · DGCA &amp; MoCA Compliance</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />Reports &amp; Export Centre
          </h1>
          <p className="text-xs text-slate-500">Automated report generation and regulatory submission portal</p>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50 shrink-0">
          <Download className={`w-3.5 h-3.5 ${isGenerating ? 'animate-bounce' : ''}`} />
          {isGenerating ? 'Generating…' : 'Generate Now'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Reports Published',   value:'28',      badge:'YTD',     badgeCls:'bg-blue-50 text-blue-600 border-blue-100' },
          { label:'DGCA Compliance',     value:'98.2%',   badge:'APAS Pending', badgeCls:'bg-amber-50 text-amber-600 border-amber-100' },
          { label:'Total Data Exported', value:'184 MB',  badge:'This Month', badgeCls:'bg-slate-100 text-slate-500 border-slate-200' },
          { label:'Avg Generation Time', value:'1.4 min', badge:'Automated', badgeCls:'bg-emerald-50 text-emerald-600 border-emerald-100' },
        ].map((c,i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border font-mono ${c.badgeCls}`}>{c.badge}</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tracking-tight">{c.value}</div>
          </div>
        ))}
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
          >{t.icon}{t.label}</button>
        ))}
      </div>

      {/* PDF tab */}
      {tab === 'pdf' && (
        <div className="space-y-4">
          {/* Config builder */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Report Builder</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Report Period</label>
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200">
                  <option value="daily">Daily Snapshot</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="monthly">Monthly Intelligence Report</option>
                  <option value="quarterly">Quarterly Review</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Coverage Scope</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400">
                  <option>All 142 Monitored Corridors</option>
                  <option>Trunk Routes Only (Tier-1)</option>
                  <option>Regional Routes (Tier-2)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Format</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400">
                  <option>A4 Landscape — Executive Summary</option>
                  <option>Full Technical Annexure (DGCA)</option>
                  <option>Data-Dense Analyst Edition</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                Include statistical anomaly log
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer ml-4">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                Append DGCA compliance certificate
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer ml-4">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
                Analyst commentary section
              </label>
            </div>
          </div>

          {/* Saved reports */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Published Report Library</h2>
            <div className="space-y-2 mt-3">
              {savedReports.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{r.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {r.type} · {r.size !== '—' ? r.size : 'In progress'} · {r.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.statusCls}`}>{r.status}</span>
                    <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV tab */}
      {tab === 'csv' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">CSV Data Export Catalogue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {[
              { title:'Airfare Snapshots — Full Export',      desc:'All 1.28M records · All routes · All carriers',       size:'~240 MB', recency:'Updated 2m ago' },
              { title:'Index History — YTD Monthly',         desc:'National API composite · Monthly granularity · 2024', size:'~48 KB',  recency:'Updated 4h ago' },
              { title:'Route Pair Metadata',                 desc:'142 corridors · Origin-Destination pairs · GIS data', size:'~28 KB',  recency:'Updated 3d ago' },
              { title:'Anomaly Event Log',                   desc:'All flagged surge events · Z-scores · Classifications',size:'~1.2 MB', recency:'Updated 12m ago' },
              { title:'Carrier Price Dispersion Summary',    desc:'Min / Mean / Max · Per carrier · Per route · Daily',  size:'~8 MB',  recency:'Updated 2m ago' },
              { title:'Lead-Time Decay Curves',             desc:'Days-to-departure vs fare · All routes · All carriers',size:'~18 MB', recency:'Updated 2m ago' },
            ].map((e,i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900">{e.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{e.desc}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{e.size} · {e.recency}</div>
                </div>
                <button onClick={() => api.downloadDGCAExport()}
                  className="shrink-0 ml-4 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DGCA tab */}
      {tab === 'dgca' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">DGCA Regulatory Compliance Audit — October 2024</h2>
                <p className="text-[11px] text-slate-500">Compliance status against Ministry of Civil Aviation audit requirements</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">5 / 6 Checks Passed</span>
            </div>

            <div className="space-y-2.5 mt-4">
              {dgcaChecks.map((c, i) => (
                <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  c.pass ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-100'
                }`}>
                  <span className="text-xs font-semibold text-slate-800">{c.label}</span>
                  {c.pass
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>PASS</span>
                    : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>PENDING</span>}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
              <strong>APAS Integration:</strong> Real-time feed pending API key approval from DGCA APAS portal (ETA: Oct 18, 2024).
              All other checks are fully compliant with MoCA audit framework v2.4.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
