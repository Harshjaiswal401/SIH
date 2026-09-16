import React, { useState } from 'react';
import { Settings, Info, Save, RotateCcw, CheckCircle } from 'lucide-react';

export const SettingsFormula = () => {
  const [toast, setToast] = useState(false);

  /* Laspeyres Formula Parameters */
  const [weights, setWeights] = useState({ DEL_BOM:0.22, BLR_DEL:0.18, BOM_BLR:0.14, HYD_DEL:0.12, CCU_DEL:0.10, DEL_GOI:0.08, others:0.16 });
  const [surgeThreshold, setSurgeThreshold] = useState(20);
  const [anomalyZ, setAnomalyZ] = useState(2.0);
  const [baselineDate] = useState('January 15, 2024');
  const [scraperInterval, setScraperInterval] = useState(8);
  const [forecastHorizon, setForecastHorizon] = useState(90);
  const [enableDGCAAlert, setEnableDGCAAlert] = useState(true);
  const [enableEmailReport, setEnableEmailReport] = useState(true);
  const [enableRealtime, setEnableRealtime] = useState(true);

  const handleSave = () => {
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightValid = Math.abs(totalWeight - 1.0) < 0.001;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">Model Configuration · Formula Engine</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />Settings &amp; Formula Configuration
          </h1>
          <p className="text-xs text-slate-500">Configure the Laspeyres index weighting, anomaly thresholds, and system parameters</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => alert('Settings restored to defaults')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />Reset
          </button>
          <button onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors">
            <Save className="w-3.5 h-3.5" />Save Configuration
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl">
          <CheckCircle className="w-3.5 h-3.5" />Configuration saved and applied to Index Engine Cycle #885
        </div>
      )}

      {/* Formula block */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Laspeyres Price Index Formula</h2>
            <p className="text-[11px] text-slate-500">Standard Laspeyres formulation with capacity-share route weighting</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            weightValid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            Σ weights = {totalWeight.toFixed(3)} {weightValid ? '✓ Valid' : '✗ Must = 1.000'}
          </span>
        </div>

        {/* Typeset formula */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
          <div className="text-center font-mono text-sm text-slate-800 min-w-[400px]">
            <div>API<sub>t</sub> = (Σ (P<sub>it</sub> × Q<sub>i0</sub> × W<sub>i</sub>)) / (Σ (P<sub>i0</sub> × Q<sub>i0</sub> × W<sub>i</sub>)) × 100</div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 justify-center text-[11px] text-slate-500 font-mono">
            <span>P<sub>it</sub> = fare at time t</span>
            <span>P<sub>i0</sub> = baseline fare</span>
            <span>Q<sub>i0</sub> = base period quantity</span>
            <span>W<sub>i</sub> = route weight</span>
          </div>
        </div>
      </div>

      {/* Route Weights */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Route Weight Configuration (W<sub>i</sub>)</h2>
        <div className="space-y-4 mt-4">
          {Object.entries(weights).map(([key, val]) => {
            const label = key === 'others' ? 'All Other Routes' : key.replace('_', ' ↔ ');
            return (
              <div key={key} className="flex items-center gap-4">
                <div className="w-28 text-xs font-mono font-bold text-slate-700 shrink-0">{label}</div>
                <input
                  type="range" min={0} max={0.5} step={0.01} value={val}
                  onChange={e => setWeights(w => ({ ...w, [key]: parseFloat(e.target.value) }))}
                  className="flex-1 h-2 accent-blue-600"
                />
                <div className="w-16 text-right">
                  <span className="font-mono text-sm font-bold text-slate-900">{val.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 ml-0.5">({(val * 100).toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {!weightValid && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700">
            <Info className="w-4 h-4 text-rose-500 shrink-0" />
            Weights must sum to exactly 1.000. Current sum: {totalWeight.toFixed(3)}. Adjust route weights before saving.
          </div>
        )}
      </div>

      {/* Detection thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-5">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Detection Thresholds</h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Surge Alert Threshold</label>
              <span className="font-mono text-sm font-bold text-amber-600">{surgeThreshold}%</span>
            </div>
            <input type="range" min={5} max={60} step={1} value={surgeThreshold} onChange={e => setSurgeThreshold(+e.target.value)}
              className="w-full h-2 accent-blue-600" />
            <p className="text-[10px] text-slate-400 mt-1">Flag fares exceeding this % above the 7-day moving average</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Anomaly Z-Score Cutoff</label>
              <span className="font-mono text-sm font-bold text-blue-600">σ {anomalyZ.toFixed(1)}</span>
            </div>
            <input type="range" min={1.0} max={4.0} step={0.1} value={anomalyZ} onChange={e => setAnomalyZ(+e.target.value)}
              className="w-full h-2 accent-blue-600" />
            <p className="text-[10px] text-slate-400 mt-1">Statistical z-score boundary for anomaly classification</p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide block">Baseline Reference</span>
            <span className="text-sm font-bold text-blue-900 font-mono block mt-1">{baselineDate}</span>
            <p className="text-[10px] text-blue-700 mt-0.5">Index = 100.000 (fixed reference; cannot be changed after publication)</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-5">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Operational Parameters</h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Scraper Interval</label>
              <span className="font-mono text-sm font-bold text-slate-900">Every {scraperInterval}h</span>
            </div>
            <input type="range" min={1} max={24} step={1} value={scraperInterval} onChange={e => setScraperInterval(+e.target.value)}
              className="w-full h-2 accent-blue-600" />
            <p className="text-[10px] text-slate-400 mt-1">Frequency of full OTA sweep across all configured routes</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Forecast Horizon</label>
              <span className="font-mono text-sm font-bold text-slate-900">{forecastHorizon} days</span>
            </div>
            <input type="range" min={14} max={180} step={7} value={forecastHorizon} onChange={e => setForecastHorizon(+e.target.value)}
              className="w-full h-2 accent-blue-600" />
            <p className="text-[10px] text-slate-400 mt-1">Maximum look-ahead window for ARIMA + XGBoost models</p>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { label:'DGCA Alert Notifications', sub:'Broadcast critical surges to regulatory inbox', checked:enableDGCAAlert,    set:setEnableDGCAAlert    },
              { label:'Weekly Email Report Digest',sub:'Send compiled summary to registered recipients',checked:enableEmailReport, set:setEnableEmailReport  },
              { label:'Real-Time Websocket Feed', sub:'Enable live streaming for developer API consumers',checked:enableRealtime,  set:setEnableRealtime     },
            ].map((s,i) => (
              <label key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors">
                <input type="checkbox" checked={s.checked} onChange={e => s.set(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-200" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">{s.label}</div>
                  <div className="text-[10px] text-slate-500">{s.sub}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
