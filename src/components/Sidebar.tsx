import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  GitFork,
  History,
  BrainCircuit,
  Radio,
  Database,
  FileSpreadsheet,
  Settings,
  Radar,
  UserCheck,
  Plane
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard },
    { id: 'index',     label: 'Airfare Index',  icon: TrendingUp },
    { id: 'route',     label: 'Route Analysis', icon: GitFork },
    { id: 'history',   label: 'Fare History',   icon: History },
    { id: 'analytics', label: 'Analytics',      icon: BrainCircuit },
    { id: 'scraper',   label: 'Scraper Monitor',icon: Radio },
    { id: 'data',      label: 'Data Management',icon: Database },
    { id: 'reports',   label: 'Reports',        icon: FileSpreadsheet },
    { id: 'settings',  label: 'Settings',       icon: Settings },
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* ── Brand ── */}
      <div>
        <div className="px-5 py-4 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">AeroIndex</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              SIH 2026 · MoCA
            </p>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="p-3 mt-1 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onSelectPage(id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-slate-800 space-y-2.5">
        {/* Scraper live status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">Scraper: Live</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">2 m ago</span>
        </div>

        {/* Operator */}
        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-slate-800/40">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            RV
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">Rohit Varma</div>
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
              Lead Analyst
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
