export interface RouteItem {
  id: number;
  origin: string;
  destination: string;
  name: string;
  distance_km: number;
  block_time: string;
  daily_flights: number;
  corridor_type: 'METRO_TRUNK' | 'TIER1_TIER2' | 'REGIONAL_UDAN';
  weight: number;
  p0: number;
  current_avg: number;
  lowest_fare: number;
  median_peak: number;
  volatility: number;
  status: string;
  change_pct: number;
}

export interface FareItem {
  flight: string;
  depArr: string;
  carrier: string;
  baseFare: number;
  tax: number;
  udf: number;
  convenience: number;
  fare: number;
  status: string;
  seatClass: string;
}

export interface IndexData {
  status: string;
  model: string;
  anchor_date: string;
  anchor_base: number;
  current_index: number;
  yoy_change_pct: number;
  mom_change_pct: number;
  wow_points: number;
  thirty_day_high: number;
  thirty_day_low: number;
  volatility_sigma: number;
  basket_weights: {
    metro: number;
    tier1_tier2: number;
    regional: number;
  };
  sub_baskets: {
    metro_trunk: { weight_pct: number; index: number; driver: string };
    tier1_tier2: { weight_pct: number; index: number; driver: string };
    regional_udan: { weight_pct: number; index: number; driver: string };
  };
  drivers: Array<{
    name: string;
    impact_pts: number;
    details: string;
  }>;
}

export interface AnomalyItem {
  id: string;
  severity: 'CRITICAL' | 'FLASH_DROP' | 'WARNING';
  route: string;
  terminal: string;
  airline: string;
  flight: string;
  observed: number;
  expected: number;
  deviation_pct: number;
  z_score: number;
  reason: string;
  detected_at: string;
  status: string;
}

export interface ScraperWorker {
  id: string;
  source: string;
  type: string;
  scope: string;
  method: string;
  status: string;
  records_found: number;
  duration: string;
  last_run: string;
  cadence: string;
  health: string;
}

export interface ScraperTelemetry {
  timestamp: string;
  level: string;
  worker: string;
  message: string;
}

export interface CarrierDispersion {
  airline: string;
  flightsScheduled: number;
  minFare: number;
  meanFare: number;
  maxFare: number;
  marketShare: number;
  competitiveCluster: string;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  fare: number;
  index: number;
  isFestiveSurge: boolean;
  tier2Feeder: number;
  metroTrunk: number;
}
