import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Activity } from 'lucide-react';
import { api } from '../services/api';

export const ScraperMonitor = () => {
  const [jobs, setJobs] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mockJobs = [
    { id:'SCR-8909', source:'MakeMyTrip', status:'Completed', records_found:24800, records_valid:24580, records_failed:220, started:'14:21:08', duration:'2m 14s', route:'DEL-BOM' },
    { id:'SCR-8908', source:'Goibibo',    status:'Completed', records_found:21400, records_valid:21190, records_failed:210, started:'14:18:44', duration:'2m 08s', route:'BLR-DEL' },
    { id:'SCR-8907', source:'Cleartrip',  status:'Running',   records_found:18200, records_valid:17840, records_failed:360, started:'14:22:01', duration:'1m 47s', route:'BOM-BLR' },
    { id:'SCR-8906', source:'Ixigo',      status:'Failed',    records_found:8400,  records_valid:0,     records_failed:8400, started:'14:14:10', duration:'0m 18s', route:'HYD-DEL' },
    { id:'SCR-8905', source:'Yatra',      status:'Queued',    records_found:0,     records_valid:0,     records_failed:0,   started:'—',        duration:'—',      route:'DEL-CCU' },
  ];

  useEffect(() => { setJobs(mockJobs); }, []);

  const refresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setJobs([...mockJobs]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const statusBadge = (s) => {
    const map = {
      Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Running:   'bg-blue-50 text-blue-700 border-blue-100',
      Failed:    'bg-rose-50 text-rose-700 border-rose-100',
      Queued:    'bg-slate-100 text-slate-600 border-slate-200',
    };
    return map[s] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const statusIcon = (s) => {
    if (s === 'Completed') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (s === 'Running')   return <Activity    className="w-3.5 h-3.5 text-blue-500 animate-pulse" />;
    if (s === 'Failed')    return <XCircle     className="w-3.5 h-3.5 text-rose-500" />;
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  const completed = jobs.filter(j => j.status === 'Completed').length;
  const running   = jobs.filter(j => j.status === 'Running').length;
  const failed    = jobs.filter(j => j.status === 'Failed').length;
  const totalRecs = jobs.reduce((a, j) => a + j.records_valid, 0);
  const totalFound = jobs.reduce((a,j) => a + j.records_found, 0);
  const pctValid  = totalFound > 0 ? ((totalRecs / totalFound) * 100).toFixed(1) : 'N/A';

  const telemetryLines = [
    { dot:'bg-emerald-500', msg:'[14:22:48] Cleartrip scrape — 18,200 fares fetched (17,840 valid)' },
    { dot:'bg-blue-500',    msg:'[14:22:45] Worker #02 scaling up — Goibibo BLR-DEL pass OK' },
    { dot:'bg-rose-500',    msg:'[14:22:31] ERROR SCR-8906 — Ixigo rate-limit 429 (8,400 records aborted)' },
    { dot:'bg-emerald-500', msg:'[14:22:14] MakeMyTrip scrape finalised — 24,580 validated records' },
    { dot:'bg-blue-500',    msg:'[14:21:09] Scheduler triggered batch #8909 (5 sources / 6 corridors)' },
    { dot:'bg-blue-500',    msg:'[14:20:00] Index Cycle #884 completed — composite API: 118.64 pts' },
    { dot:'bg-slate-400',   msg:'[14:18:44] Goibibo session token refreshed (OAuth2)' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">Data Ingestion Layer · ETL Orchestration</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-500" />
            Scraper Telemetry Monitor
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            Live visibility into the distributed web-scraping pipeline
            <span className="font-mono text-slate-400">Last refresh: {lastRefresh.toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => api.triggerScraper().then(refresh)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors">
            <Radio className="w-3.5 h-3.5" />Run Scrape Batch
          </button>
          <button onClick={refresh} disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Completed Jobs', value:completed, badge:'OK',       badgeCls:'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label:'Running',        value:running,   badge:'Live',     badgeCls:'bg-blue-50 text-blue-600 border-blue-100' },
          { label:'Failed',         value:failed,    badge:'Alert',    badgeCls:'bg-rose-50 text-rose-600 border-rose-100' },
          { label:'Records Valid',  value:totalRecs.toLocaleString(), badge:`${pctValid}% OK`, badgeCls:'bg-emerald-50 text-emerald-600 border-emerald-100' },
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

      {/* Jobs table + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Jobs table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Scrape Jobs</h2>
              <p className="text-[11px] text-slate-500">Latest batch status by OTA source</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>Auto-refreshing
            </span>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 tracking-wide">
                  <th className="pb-2 text-left">Job ID</th>
                  <th className="pb-2 text-left">Source</th>
                  <th className="pb-2 text-left">Route</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-right">Found</th>
                  <th className="pb-2 text-right">Valid</th>
                  <th className="pb-2 text-right">Failed</th>
                  <th className="pb-2 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j, i) => (
                  <tr key={i} className="table-row-hover transition-colors">
                    <td className="py-2.5 font-mono text-xs font-bold text-slate-700">{j.id}</td>
                    <td className="py-2.5 font-medium text-slate-900">{j.source}</td>
                    <td className="py-2.5 font-mono text-slate-500 text-[10px]">{j.route}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(j.status)}`}>
                        {statusIcon(j.status)}{j.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600">{j.records_found > 0 ? j.records_found.toLocaleString() : '—'}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-600 font-semibold">{j.records_valid > 0 ? j.records_valid.toLocaleString() : '—'}</td>
                    <td className={`py-2.5 text-right font-mono font-semibold ${j.records_failed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{j.records_failed > 0 ? j.records_failed.toLocaleString() : '0'}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">{j.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telemetry log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Event Log</h2>
              <p className="text-[11px] text-slate-500">Real-time pipeline telemetry</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot"></span>Streaming
            </span>
          </div>

          <div className="mt-3 space-y-1.5 overflow-y-auto flex-1 max-h-80">
            {telemetryLines.map((l, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${l.dot}`}></span>
                <span className="terminal-scroll text-slate-700 leading-snug">{l.msg}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            Next scheduled batch: <strong className="text-slate-600">14:30:00 IST</strong>
          </div>
        </div>
      </div>

      {/* Worker health */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Worker Node Health</h2>
            <p className="text-[11px] text-slate-500">Distributed scraper cluster resource utilisation</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">6 of 6 nodes healthy</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {[
            { id:'W-01', cpu:72, mem:61, status:'OK' },
            { id:'W-02', cpu:48, mem:44, status:'OK' },
            { id:'W-03', cpu:85, mem:78, status:'High' },
            { id:'W-04', cpu:31, mem:29, status:'OK' },
            { id:'W-05', cpu:58, mem:52, status:'OK' },
            { id:'W-06', cpu:0,  mem:0,  status:'Idle' },
          ].map((w,i) => (
            <div key={i} className={`p-3 rounded-xl border text-center ${
              w.status === 'High' ? 'bg-amber-50 border-amber-100' :
              w.status === 'Idle' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
            }`}>
              <div className="text-xs font-bold text-slate-900 font-mono">{w.id}</div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-1 inline-block ${
                w.status === 'High' ? 'bg-amber-50 text-amber-700 border-amber-100'
                : w.status === 'Idle' ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>{w.status}</span>
              <div className="mt-2 space-y-1">
                <div>
                  <div className="text-[9px] text-slate-400 mb-0.5">CPU {w.cpu}%</div>
                  <div className="h-1 w-full rounded-full bg-slate-100"><div className={`h-full rounded-full ${w.cpu > 80 ? 'bg-amber-400' : 'bg-blue-500'}`} style={{ width:`${w.cpu}%` }}></div></div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 mb-0.5">MEM {w.mem}%</div>
                  <div className="h-1 w-full rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-400" style={{ width:`${w.mem}%` }}></div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
