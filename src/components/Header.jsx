import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  HelpCircle,
  TrendingDown,
  ChevronDown,
  ShieldCheck,
  X
} from 'lucide-react';

export const Header = ({ onSearchRoute, activeRoute = 'DEL-BOM' }) => {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { title: 'Dynamic Surge Alert', desc: 'IndiGo 6E-205 (DEL-BOM) surged +38.1%', time: '12 m ago', dot: 'bg-rose-500' },
    { title: 'Batch Completed',     desc: 'Worker #04 completed DEL-BLR sweep (1,240 recs)', time: '18 m ago', dot: 'bg-emerald-500' },
    { title: 'ATF Surcharge Update',desc: 'Index benchmark updated (+1.8 WoW)', time: '41 m ago', dot: 'bg-blue-500' },
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchRoute) onSearchRoute(searchVal);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_0_0_#e2e8f0]">
      {/* ── Left: Search ── */}
      <div className="flex items-center space-x-3 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search route e.g. DEL-BOM, airline…"
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-10 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Route ticker */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs shrink-0 font-mono">
          <TrendingDown className="w-3 h-3" />
          <span className="font-semibold">{activeRoute}</span>
          <span className="text-emerald-600 font-normal">median −4.2%</span>
        </div>
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex items-center space-x-2 ml-4">
        {/* Date range chip */}
        <button className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>Oct 15 – Nov 14, 2024</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* DGCA badge */}
        <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>DGCA Verified</span>
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 z-50 space-y-1.5">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Radar Alerts</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100">3 New</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${n.dot}`}></span>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{n.desc}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help */}
        <button className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            RV
          </div>
        </div>
      </div>
    </header>
  );
};
