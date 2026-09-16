import React, { useState } from 'react';
import { Database, Upload, Download, Trash2, CheckCircle, AlertTriangle, Table, RefreshCw, Info } from 'lucide-react';
import { api } from '../services/api';

export const DataManagement = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleImport = async () => {
    setIsImporting(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsImporting(false);
    setToast('Import complete — 48,200 records staged, 47,901 validated (99.4% acceptance rate)');
    setTimeout(() => setToast(null), 6000);
  };

  const tables = [
    { name:'airfare_snapshots', rows:'1,284,320', size:'2.4 GB',  freshness:'2 min ago',  status:'Healthy',  statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name:'routes',            rows:'142',       size:'48 KB',   freshness:'1 day ago',   status:'Healthy',  statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name:'airlines',          rows:'6',         size:'12 KB',   freshness:'1 week ago',  status:'Healthy',  statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name:'airports',          rows:'32',        size:'28 KB',   freshness:'3 days ago',  status:'Healthy',  statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name:'scrape_jobs',       rows:'8,909',     size:'12 MB',   freshness:'12 min ago',  status:'Healthy',  statusCls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name:'index_history',     rows:'480',       size:'820 KB',  freshness:'4 hours ago', status:'Stale',    statusCls:'bg-amber-50 text-amber-700 border-amber-100' },
  ];

  const validationChecks = [
    { label:'Fare Range Validation',     pass:true,  detail:'₹799 – ₹82,400 within acceptable bounds' },
    { label:'Carrier Code Integrity',    pass:true,  detail:'All IATA codes validated against DGCA registry' },
    { label:'Route Pair Consistency',    pass:true,  detail:'All 142 routes bidirectionally consistent' },
    { label:'Timestamp Alignment',       pass:true,  detail:'All timestamps within ±30s NTP tolerance' },
    { label:'Duplicate Detection',       pass:false, detail:'399 near-duplicate rows flagged (same origin, fare, date, carrier)' },
    { label:'Outlier Z-Score Audit',     pass:true,  detail:'21 legitimate anomaly events preserved' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">PostgreSQL Schema v2 · ETL Control Panel</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />Data Management
          </h1>
          <p className="text-xs text-slate-500">Schema explorer, ingestion control &amp; data quality management</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleImport} disabled={isImporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50">
            <Upload className={`w-3.5 h-3.5 ${isImporting ? 'animate-bounce' : ''}`} />
            {isImporting ? 'Importing…' : 'Import CSV Batch'}
          </button>
          <button onClick={() => api.downloadDGCAExport()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors">
            <Download className="w-3.5 h-3.5 text-blue-500" />Export Snapshot
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" />{toast}</div>
          <button onClick={() => setToast(null)} className="text-emerald-500 font-mono">✕</button>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Records',     value:'1,284,320', badge:'Live',   badgeCls:'bg-blue-50 text-blue-600 border-blue-100' },
          { label:'Storage Used',      value:'2.6 GB',    badge:'5 tables',badgeCls:'bg-slate-100 text-slate-500 border-slate-200' },
          { label:'Last Ingestion',    value:'2 min ago', badge:'OK',     badgeCls:'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label:'Data Quality Score',value:'99.4%',     badge:'Healthy',badgeCls:'bg-emerald-50 text-emerald-600 border-emerald-100' },
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

      {/* Schema table explorer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">PostgreSQL Schema Explorer</h2>
              <p className="text-[11px] text-slate-500">Table statistics and health metrics</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
            <RefreshCw className="w-3 h-3" />Reload
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 tracking-wide">
                <th className="pb-2 text-left">Table Name</th>
                <th className="pb-2 text-right">Row Count</th>
                <th className="pb-2 text-right">Size</th>
                <th className="pb-2 text-right">Last Updated</th>
                <th className="pb-2 text-center">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tables.map((t, i) => (
                <tr key={i} className="table-row-hover transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-900">{t.name}</td>
                  <td className="py-2.5 text-right font-mono text-slate-600">{t.rows}</td>
                  <td className="py-2.5 text-right font-mono text-slate-500">{t.size}</td>
                  <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">{t.freshness}</td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${t.statusCls}`}>
                      {t.status === 'Healthy'
                        ? <CheckCircle className="w-3 h-3" />
                        : <AlertTriangle className="w-3 h-3" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="text-[11px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">Export</button>
                      <button className="text-[11px] text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors">Refresh</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Checks */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Quality Validation Checks</h2>
            <p className="text-[11px] text-slate-500">Automated ingestion pipeline quality gates</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded">5/6 Passed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {validationChecks.map((c, i) => (
            <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              c.pass ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-100'
            }`}>
              {c.pass
                ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
              <div>
                <div className="text-xs font-bold text-slate-900">{c.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Dedup action */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-900">Action Required: Near-Duplicate Cleanup</div>
              <p className="text-[11px] text-amber-700 mt-0.5">399 rows flagged for deduplication review. Recommend manual inspection before deletion.</p>
            </div>
          </div>
          <button onClick={() => alert('Deduplication workflow launched…')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-200 hover:bg-amber-200 text-amber-800 text-xs font-semibold transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />Resolve
          </button>
        </div>
      </div>
    </div>
  );
};
