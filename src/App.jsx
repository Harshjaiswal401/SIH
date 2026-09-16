import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './pages/DashboardOverview';
import { AirfareIndexMacro } from './pages/AirfareIndexMacro';
import { RouteAnalysis } from './pages/RouteAnalysis';
import { FareHistory } from './pages/FareHistory';
import { AnalyticsModels } from './pages/AnalyticsModels';
import { ScraperMonitor } from './pages/ScraperMonitor';
import { DataManagement } from './pages/DataManagement';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsFormula } from './pages/SettingsFormula';

export const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');

  const handleNavigate = (page, route) => {
    if (route) setSelectedRoute(route);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchRoute = (query) => {
    const q = query.toUpperCase().trim();
    if (q.includes('DEL') || q.includes('BOM') || q.includes('BLR') || q.includes('HYD')) {
      setSelectedRoute(q);
      setCurrentPage('route');
    }
  };

  return (
    <div className="flex h-screen bg-[#070C1A] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onSelectPage={(page) => handleNavigate(page)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header onSearchRoute={handleSearchRoute} activeRoute={selectedRoute} />

        {/* Dynamic Page Router */}
        <main className="flex-1 pb-12">
          {currentPage === 'dashboard' && <DashboardOverview onNavigate={handleNavigate} />}
          {currentPage === 'index' && <AirfareIndexMacro />}
          {currentPage === 'route' && <RouteAnalysis initialRoute={selectedRoute} />}
          {currentPage === 'history' && <FareHistory />}
          {currentPage === 'analytics' && <AnalyticsModels />}
          {currentPage === 'scraper' && <ScraperMonitor />}
          {currentPage === 'data' && <DataManagement />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'settings' && <SettingsFormula />}
        </main>
      </div>
    </div>
  );
};

export default App;
