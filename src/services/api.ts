const API_BASE = '/api';

export const api = {
  // Routes & Corridors
  getRoutes: async () => {
    const res = await fetch(`${API_BASE}/routes`);
    return res.json();
  },

  // Airfare Inventory Snapshots
  getFares: async (params?: { carrier?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/fares${query ? `?${query}` : ''}`);
    return res.json();
  },

  // Laspeyres Airfare Price Index
  getIndex: async () => {
    const res = await fetch(`${API_BASE}/index`);
    return res.json();
  },

  // 90-Day Trend Data
  getTrend: async () => {
    const res = await fetch(`${API_BASE}/trend`);
    return res.json();
  },

  // AI & ML Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  // Scraper Fleet Status
  getScraperStatus: async () => {
    const res = await fetch(`${API_BASE}/scrape/status`);
    return res.json();
  },

  // Live Scraper Terminal Logs
  getScraperLogs: async () => {
    const res = await fetch(`${API_BASE}/scrape/logs`);
    return res.json();
  },

  // Trigger On-demand Sweep
  triggerScraper: async () => {
    const res = await fetch(`${API_BASE}/scrape/trigger`, { method: 'POST' });
    return res.json();
  },

  // 12-Month Historical Observatory
  getHistory: async () => {
    const res = await fetch(`${API_BASE}/history`);
    return res.json();
  },

  // Update Settings & Recalculate Index
  updateSettings: async (settings: any) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Download DGCA Compliance CSV
  downloadDGCAExport: () => {
    window.open(`${API_BASE}/export/dgca?format=csv`, '_blank');
  }
};
