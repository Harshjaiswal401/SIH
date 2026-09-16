import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================================
// IN-MEMORY ACTIVE POSTGRESQL-COMPATIBLE DATABASE STORE
// ==========================================================

const airlines = [
  { id: 1, name: 'IndiGo', code: '6E', market_share: 52, active: true },
  { id: 2, name: 'Air India', code: 'AI', market_share: 28, active: true },
  { id: 3, name: 'Vistara', code: 'UK', market_share: 20, active: true },
  { id: 4, name: 'SpiceJet', code: 'SG', market_share: 8, active: true },
  { id: 5, name: 'Akasa Air', code: 'QP', market_share: 5, active: true }
];

const airports = [
  { id: 1, code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', tier: 'Metro' },
  { id: 2, code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', tier: 'Metro' },
  { id: 3, code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', tier: 'Metro' },
  { id: 4, code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', tier: 'Metro' },
  { id: 5, code: 'CCU', name: 'Netaji Subhash Chandra Bose Airport', city: 'Kolkata', tier: 'Metro' },
  { id: 6, code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', tier: 'Metro' },
  { id: 7, code: 'GOI', name: 'Dabolim Airport', city: 'Goa', tier: 'Tier-1' },
  { id: 8, code: 'AMD', name: 'Sardar Vallabhbhai Patel Airport', city: 'Ahmedabad', tier: 'Tier-1' },
  { id: 9, code: 'PNQ', name: 'Pune Airport', city: 'Pune', tier: 'Tier-1' }
];

// Routes with Laspeyres basket weights: Metro Trunk (55%), Tier-1/Tier-2 (30%), Regional (15%)
let routeBasketWeights = {
  metro: 0.55,
  tier1_tier2: 0.30,
  regional: 0.15
};

let formulaSettings = {
  anchorDate: '2024-01-15',
  baseIndex: 100.0,
  normalizationMethod: 'Median Economy 14-Day',
  minCorridorSampleSize: 10,
  outlierSigma: 5.0,
  autoQuarterlyAdjust: true
};

const routes = [
  {
    id: 1,
    origin: 'DEL',
    destination: 'BOM',
    name: 'New Delhi - Mumbai Metro Corridor',
    distance_km: 1148,
    block_time: '2h 10m',
    daily_flights: 68,
    corridor_type: 'METRO_TRUNK',
    weight: 0.28,
    p0: 4850,
    current_avg: 5850,
    lowest_fare: 4199,
    median_peak: 8900,
    volatility: 0.28,
    status: 'High Volume',
    change_pct: 14.2
  },
  {
    id: 2,
    origin: 'BLR',
    destination: 'DEL',
    name: 'Bengaluru - New Delhi Trunk',
    distance_km: 1740,
    block_time: '2h 45m',
    daily_flights: 48,
    corridor_type: 'METRO_TRUNK',
    weight: 0.27,
    p0: 5200,
    current_avg: 6200,
    lowest_fare: 4499,
    median_peak: 9800,
    volatility: 0.24,
    status: 'High Vol',
    change_pct: -12.7
  },
  {
    id: 3,
    origin: 'BOM',
    destination: 'BLR',
    name: 'Mumbai - Bengaluru Commercial Link',
    distance_km: 842,
    block_time: '1h 45m',
    daily_flights: 38,
    corridor_type: 'METRO_TRUNK',
    weight: 0.15,
    p0: 3800,
    current_avg: 4120,
    lowest_fare: 3250,
    median_peak: 6800,
    volatility: 0.18,
    status: 'Norm',
    change_pct: 3.8
  },
  {
    id: 4,
    origin: 'DEL',
    destination: 'HYD',
    name: 'Delhi - Hyderabad Deccan Express',
    distance_km: 1260,
    block_time: '2h 15m',
    daily_flights: 32,
    corridor_type: 'TIER1_TIER2',
    weight: 0.15,
    p0: 4400,
    current_avg: 4950,
    lowest_fare: 3890,
    median_peak: 7500,
    volatility: 0.21,
    status: 'Norm',
    change_pct: 4.1
  },
  {
    id: 5,
    origin: 'BOM',
    destination: 'GOI',
    name: 'Mumbai - Goa Leisure Corridor',
    distance_km: 435,
    block_time: '1h 15m',
    daily_flights: 24,
    corridor_type: 'TIER1_TIER2',
    weight: 0.08,
    p0: 3200,
    current_avg: 4150,
    lowest_fare: 2899,
    median_peak: 6400,
    volatility: 0.32,
    status: 'High Season',
    change_pct: 18.5
  },
  {
    id: 6,
    origin: 'HYD',
    destination: 'DEL',
    name: 'Hyderabad - Delhi Return',
    distance_km: 1260,
    block_time: '2h 20m',
    daily_flights: 30,
    corridor_type: 'REGIONAL_UDAN',
    weight: 0.07,
    p0: 4200,
    current_avg: 6500,
    lowest_fare: 4800,
    median_peak: 11200,
    volatility: 0.35,
    status: 'Surge Alert',
    change_pct: 35.4
  }
];

// Ingestion Pipeline Workers / Scraper Fleet Status
let scrapeFleet = [
  {
    id: 'SCR-8902',
    source: 'IndiGo Direct Portal',
    type: 'Direct Carrier',
    scope: '42 Metro Routes',
    method: 'Headless Chromium',
    status: 'Completed',
    records_found: 18420,
    duration: '3m 42s',
    last_run: '4 mins ago',
    cadence: 'Every 30 mins',
    health: 'Verified'
  },
  {
    id: 'SCR-8903',
    source: 'Air India GDS API',
    type: 'Direct Carrier',
    scope: 'Pan-India 38 Routes',
    method: 'REST API Poller',
    status: 'Running 68%',
    records_found: 8252,
    duration: '1m 55s',
    last_run: 'Active',
    cadence: 'Hourly',
    health: 'Verified'
  },
  {
    id: 'SCR-8904',
    source: 'MakeMyTrip Aggregator',
    type: 'OTA Aggregator',
    scope: 'Top 25 Tier-1/2',
    method: 'Playwright Cluster',
    status: 'Completed',
    records_found: 24110,
    duration: '5m 12s',
    last_run: '18 mins ago',
    cadence: 'Daily 02:00 IST',
    health: 'Verified'
  },
  {
    id: 'SCR-8905',
    source: 'EaseMyTrip OTA',
    type: 'OTA Aggregator',
    scope: 'Trunk Corridors (DEL, BOM, BLR)',
    method: 'Direct DOM Scraper',
    status: 'Completed',
    records_found: 14800,
    duration: '2m 49s',
    last_run: '32 mins ago',
    cadence: 'Daily 04:00 IST',
    health: 'Verified'
  },
  {
    id: 'SCR-8906',
    source: 'SpiceJet Regional Portal',
    type: 'Direct Carrier',
    scope: '18 Regional Routes',
    method: 'Headless Chromium',
    status: 'Failed: 429 Rate Limit',
    records_found: 1220,
    duration: '48s',
    last_run: '1h ago',
    cadence: 'Every 4 hours',
    health: 'Minor Drift'
  },
  {
    id: 'SCR-8907',
    source: 'Vistara Web Feeder',
    type: 'Direct Carrier',
    scope: '28 Premium Metro',
    method: 'Headless Browser',
    status: 'Completed',
    records_found: 11450,
    duration: '3m 15s',
    last_run: '24m ago',
    cadence: 'Every 2 hours',
    health: 'Verified'
  },
  {
    id: 'SCR-8908',
    source: 'DGCA Monthly Traffic',
    type: 'Regulatory',
    scope: 'Pan-India Scheduled',
    method: 'CSV Auto-Parser',
    status: 'Completed',
    records_found: 14200,
    duration: '1m 10s',
    last_run: 'Oct 01, 2024',
    cadence: 'Monthly',
    health: 'Verified'
  }
];

let liveTelemetryLogs = [
  { timestamp: '14:22:01', level: 'INFO', worker: 'worker-04', message: 'Initiating DEL->BOM departure date matrix (Oct 25 - Nov 25)' },
  { timestamp: '14:22:04', level: 'SUCCESS', worker: 'worker-04', message: 'Parsed 68 non-stop flight fare buckets in 1.4s' },
  { timestamp: '14:22:09', level: 'INFO', worker: 'worker-02', message: 'Air India API token refreshed successfully (expiry 3600s)' },
  { timestamp: '14:22:15', level: 'WARN', worker: 'worker-07', message: 'SpiceJet response latency elevated (1,840ms), applying adaptive throttle' },
  { timestamp: '14:22:20', level: 'INGESTION', worker: 'db-writer', message: 'Batch 482 committed 1,240 records to TimescaleDB partition airfare_p2024_w42' },
  { timestamp: '14:22:31', level: 'INFO', worker: 'index-worker', message: 'Index calculation Cycle #884 done. National benchmark: 118.64 (+1.8 WoW)' },
  { timestamp: '14:22:45', level: 'ALERT', worker: 'radar-ai', message: 'Dynamic surge algorithm tripped on 6E-204 (DEL-BOM): +38.1% vs 7d trailing mean' }
];

// Sanitization Rules State
let sanitizationRules = {
  rule1_outliers: true, // >5x corridor standard deviation
  rule2_duplicate_dedup: true, // flight_no + departure_time
  rule3_rbi_currency: true, // Spot RBI reference rate normalization to INR
  rule4_unbundled_economy: true // Separate seat-only fares vs inclusive baggage
};

// ==========================================================
// MATHEMATICAL ENGINE FUNCTIONS
// ==========================================================

// Laspeyres Capacity-Weighted Airfare Price Index:
// API_t = ( Sum( P_t * Q_0 ) / Sum( P_0 * Q_0 ) ) * 100
function calculateLaspeyresIndex(weights = routeBasketWeights) {
  let weightedNumerator = 0;
  let weightedDenominator = 0;

  routes.forEach(route => {
    let weightFactor = 1.0;
    if (route.corridor_type === 'METRO_TRUNK') weightFactor = weights.metro / 0.55;
    else if (route.corridor_type === 'TIER1_TIER2') weightFactor = weights.tier1_tier2 / 0.30;
    else weightFactor = weights.regional / 0.15;

    const currentP = route.current_avg;
    const baseP = route.p0;
    const baseQ = 10000 * route.weight * weightFactor;

    weightedNumerator += currentP * baseQ;
    weightedDenominator += baseP * baseQ;
  });

  const apiValue = (weightedNumerator / weightedDenominator) * 100;
  return Number(apiValue.toFixed(2));
}

// 90-Day National Airfare Trend Generator
function generateNationalTrendData() {
  const data = [];
  const startDate = new Date('2024-08-15');
  const baseNationalFare = 4900;
  const baseIndex = 106.5;

  for (let i = 0; i <= 90; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    const label = `${month} ${day < 10 ? '0' + day : day}`;

    // Simulation of seasonal patterns:
    // Mid-Sep: Post-monsoon dip (lowest ~4,100)
    // Late-Oct/Early Nov: Diwali festive surge peak (up to ~7,850 and index 126.8)
    // Nov 15: Today (~5,420 and index 118.64)
    let fareVariation = 0;
    let indexVariation = 0;
    let isFestiveSurge = false;

    if (i >= 25 && i <= 40) {
      // Monsoon dip (Sep 10 - Sep 25)
      fareVariation = -650 + Math.sin(i) * 120;
      indexVariation = -8.2 + Math.cos(i) * 1.5;
    } else if (i >= 65 && i <= 82) {
      // Festive Surge Spike: Oct 28 - Nov 04 peak
      isFestiveSurge = true;
      const surgeIntensity = Math.sin(((i - 65) / 17) * Math.PI);
      fareVariation = 2650 * surgeIntensity + 200;
      indexVariation = 19.5 * surgeIntensity + 1.2;
    } else {
      fareVariation = Math.sin(i * 0.25) * 220 + (i * 5.5);
      indexVariation = (fareVariation / baseNationalFare) * 100 * 0.85;
    }

    const compositeFare = Math.round(baseNationalFare + fareVariation);
    const airfareIndex = Number((baseIndex + (indexVariation * 0.7)).toFixed(1));

    data.push({
      date: dateStr,
      label,
      fare: compositeFare,
      index: airfareIndex,
      isFestiveSurge,
      tier2Feeder: Math.round(compositeFare * 0.82),
      metroTrunk: Math.round(compositeFare * 1.14)
    });
  }
  return data;
}

// 14-Day Price Forecasting Model (ARIMA + XGBoost Envelope)
function generate14DayForecast() {
  const historical = [
    { day: 'D-7', actual: 5200, predicted: null, lower95: null, upper95: null },
    { day: 'D-6', actual: 5310, predicted: null, lower95: null, upper95: null },
    { day: 'D-5', actual: 5400, predicted: null, lower95: null, upper95: null },
    { day: 'D-4', actual: 5520, predicted: null, lower95: null, upper95: null },
    { day: 'D-3', actual: 5690, predicted: null, lower95: null, upper95: null },
    { day: 'D-2', actual: 5780, predicted: null, lower95: null, upper95: null },
    { day: 'D-1', actual: 5850, predicted: null, lower95: null, upper95: null },
    { day: 'D-0 (Today)', actual: 5850, predicted: 5850, lower95: 5850, upper95: 5850 }
  ];

  const forecast = [
    { day: 'D+1', actual: null, predicted: 6020, lower95: 5740, upper95: 6300 },
    { day: 'D+2', actual: null, predicted: 6180, lower95: 5850, upper95: 6510 },
    { day: 'D+3', actual: null, predicted: 6390, lower95: 6000, upper95: 6780 },
    { day: 'D+5', actual: null, predicted: 6850, lower95: 6350, upper95: 7350 },
    { day: 'D+7 (Surge Cliff)', actual: null, predicted: 7600, lower95: 6980, upper95: 8220 },
    { day: 'D+10', actual: null, predicted: 8400, lower95: 7600, upper95: 9200 },
    { day: 'D+14 (Final)', actual: null, predicted: 9450, lower95: 8400, upper95: 10500 }
  ];

  return [...historical, ...forecast];
}

// Lead-Time Decay Analytics Curve (D-60 to D-0)
function generateLeadTimeDecayCurve() {
  return [
    { lead: 'D-60', window: 'T+60', fare: 4199, label: 'Optimal Window', multiplier: '1.0x', penalty: '0%' },
    { lead: 'D-45', window: 'T+45', fare: 4350, label: 'Early Bird', multiplier: '1.03x', penalty: '+3.5%' },
    { lead: 'D-30', window: 'T+30', fare: 4590, label: 'Standard Advance', multiplier: '1.09x', penalty: '+9.3%' },
    { lead: 'D-21', window: 'T+21', fare: 4950, label: 'Normal Plateau', multiplier: '1.18x', penalty: '+17.8%' },
    { lead: 'D-14', window: 'T+14', fare: 5420, label: 'Inversion Zone', multiplier: '1.29x', penalty: '+29.0%' },
    { lead: 'D-7', window: 'T+7', fare: 6800, label: 'Surge Cliff Start', multiplier: '1.62x', penalty: '+61.9%' },
    { lead: 'D-3', window: 'T+3', fare: 7480, label: 'Critical Escalation', multiplier: '1.78x', penalty: '+78.2%' },
    { lead: 'D-1', window: 'T+1', fare: 8900, label: 'Emergency Business', multiplier: '2.12x', penalty: '+112.0%' },
    { lead: 'D-0', window: 'Same Day', fare: 11200, label: 'Peak Distress', multiplier: '2.67x', penalty: '+166.7%' }
  ];
}

// 12-Month Multi-Airline Historical Comparison Data
function generate12MonthHistory() {
  const months = [
    { month: 'Oct 23', indigo: 4800, airIndia: 5100, vistara: 5600, spiceJet: 4400 },
    { month: 'Nov 23 (Diwali)', indigo: 6800, airIndia: 7200, vistara: 8100, spiceJet: 6200 },
    { month: 'Dec 23 (Year-End)', indigo: 6400, airIndia: 6900, vistara: 7800, spiceJet: 5900 },
    { month: 'Jan 24 (Base)', indigo: 4850, airIndia: 5200, vistara: 5900, spiceJet: 4500 },
    { month: 'Feb 24', indigo: 4950, airIndia: 5350, vistara: 6100, spiceJet: 4600 },
    { month: 'Mar 24', indigo: 5100, airIndia: 5450, vistara: 6250, spiceJet: 4750 },
    { month: 'Apr 24', indigo: 5300, airIndia: 5700, vistara: 6500, spiceJet: 4900 },
    { month: 'May 24 (Summer Surge)', indigo: 6950, airIndia: 7400, vistara: 8200, spiceJet: 6400 },
    { month: 'Jun 24', indigo: 4900, airIndia: 5250, vistara: 6050, spiceJet: 4600 },
    { month: 'Jul 24 (Monsoon Dip)', indigo: 3850, airIndia: 4100, vistara: 4900, spiceJet: 3240 },
    { month: 'Aug 24', indigo: 4200, airIndia: 4500, vistara: 5300, spiceJet: 3700 },
    { month: 'Sep 24 (Pre-Festive)', indigo: 5200, airIndia: 5600, vistara: 6400, spiceJet: 4700 },
    { month: 'Oct 24 (Current)', indigo: 5850, airIndia: 6300, vistara: 7200, spiceJet: 5120 }
  ];
  return months;
}

// Statistical Anomaly Radar (Z > 2.5)
const anomalyRecords = [
  {
    id: 'ANOM-101',
    severity: 'CRITICAL',
    route: 'DEL - BOM',
    terminal: 'Terminal 3',
    airline: 'IndiGo',
    flight: '6E-205',
    observed: 9850,
    expected: 5200,
    deviation_pct: 89.4,
    z_score: 3.42,
    reason: 'Festive seat class exhaustion',
    detected_at: '12m ago',
    status: 'Flagged'
  },
  {
    id: 'ANOM-102',
    severity: 'CRITICAL',
    route: 'BLR - HYD',
    terminal: 'Direct A320',
    airline: 'SpiceJet',
    flight: 'SG-102',
    observed: 11200,
    expected: 4100,
    deviation_pct: 173.1,
    z_score: 4.15,
    reason: 'High congestion impact on GDS',
    detected_at: '24m ago',
    status: 'Flagged'
  },
  {
    id: 'ANOM-103',
    severity: 'FLASH_DROP',
    route: 'DEL - MAA',
    terminal: 'Evening Hub',
    airline: 'Air India',
    flight: 'AI-439',
    observed: 3150,
    expected: 6800,
    deviation_pct: -53.7,
    z_score: -2.85,
    reason: 'Promotional bucket release (unbundled economy)',
    detected_at: '35m ago',
    status: 'Verified Drop'
  },
  {
    id: 'ANOM-104',
    severity: 'WARNING',
    route: 'BOM - CCU',
    terminal: 'Midday Leg',
    airline: 'Vistara',
    flight: 'UK-771',
    observed: 8400,
    expected: 6200,
    deviation_pct: 35.5,
    z_score: 2.12,
    reason: 'Mid-day corporate booking surge',
    detected_at: '52m ago',
    status: 'Monitoring'
  },
  {
    id: 'ANOM-105',
    severity: 'WARNING',
    route: 'DEL - BLR',
    terminal: 'Early Bird',
    airline: 'IndiGo',
    flight: '6E-618',
    observed: 8900,
    expected: 6500,
    deviation_pct: 36.9,
    z_score: 2.26,
    reason: 'Inventory choke at D-7 threshold',
    detected_at: '1h ago',
    status: 'Monitoring'
  }
];

// Carrier Price Dispersion & Yield Spread Data (DEL-BOM focus)
const carrierPriceDispersion = [
  {
    airline: 'IndiGo (6E)',
    flightsScheduled: 35,
    minFare: 4199,
    meanFare: 5400,
    maxFare: 8200,
    marketShare: 52,
    competitiveCluster: '₹4,600 - ₹5,400',
    color: '#3B82F6'
  },
  {
    airline: 'Air India (AI)',
    flightsScheduled: 19,
    minFare: 4650,
    meanFare: 6100,
    maxFare: 9400,
    marketShare: 28,
    competitiveCluster: '₹5,200 - ₹6,400',
    color: '#EF4444'
  },
  {
    airline: 'Vistara (UK)',
    flightsScheduled: 14,
    minFare: 5200,
    meanFare: 6800,
    maxFare: 12100,
    marketShare: 20,
    competitiveCluster: '₹6,000 - ₹7,800',
    color: '#8B5CF6'
  }
];

// Live Fare Inventory snapshots for DEL-BOM
const liveFareInventory = [
  { flight: '6E 205', depArr: '06:10 - 08:20', carrier: 'IndiGo', baseFare: 3649, tax: 200, udf: 0, convenience: 350, fare: 4199, status: 'Lowest Available', seatClass: 'Eco Saver' },
  { flight: 'UK 933', depArr: '07:30 - 09:45', carrier: 'Vistara', baseFare: 4850, tax: 250, udf: 0, convenience: 350, fare: 5450, status: 'Normal', seatClass: 'Eco Standard' },
  { flight: 'AI 865', depArr: '10:00 - 12:15', carrier: 'Air India', baseFare: 4400, tax: 230, udf: 0, convenience: 350, fare: 4980, status: 'Normal', seatClass: 'Eco Value' },
  { flight: '6E 5012', depArr: '17:15 - 19:30', carrier: 'IndiGo', baseFare: 6200, tax: 340, udf: 0, convenience: 350, fare: 6890, status: 'Peak Slot', seatClass: 'Eco Flex' },
  { flight: 'UK 995', depArr: '18:45 - 21:00', carrier: 'Vistara', baseFare: 7650, tax: 400, udf: 0, convenience: 350, fare: 8400, status: 'High Demand', seatClass: 'Eco Premium' }
];

// ==========================================================
// REST API ENDPOINTS
// ==========================================================

// 1. GET /api/routes - List corridors with live telemetry and weights
app.get('/api/routes', (req, res) => {
  res.json({
    status: 'success',
    total_monitored: routes.length,
    active_corridors: 142,
    corridors: routes
  });
});

// 2. GET /api/fares - Query snapshots table with filtering
app.get('/api/fares', (req, res) => {
  const { route, carrier, window, status } = req.query;
  let filtered = [...liveFareInventory];

  if (carrier) {
    filtered = filtered.filter(f => f.carrier.toLowerCase().includes(carrier.toLowerCase()));
  }
  if (status) {
    filtered = filtered.filter(f => f.status.toLowerCase().includes(status.toLowerCase()));
  }

  res.json({
    status: 'success',
    count: filtered.length,
    total_records_ingested: 184290,
    records: filtered
  });
});

// 3. GET /api/index - Laspeyres Index Engine & breakdown
app.get('/api/index', (req, res) => {
  const compositeIndex = calculateLaspeyresIndex();
  res.json({
    status: 'success',
    model: 'Laspeyres Capacity-Weighted Formulation v2.8',
    anchor_date: formulaSettings.anchorDate,
    anchor_base: formulaSettings.baseIndex,
    current_index: compositeIndex,
    yoy_change_pct: 18.64,
    mom_change_pct: 3.2,
    wow_points: 1.8,
    thirty_day_high: 126.80,
    thirty_day_low: 112.10,
    volatility_sigma: 4.82,
    basket_weights: routeBasketWeights,
    sub_baskets: {
      metro_trunk: {
        weight_pct: Math.round(routeBasketWeights.metro * 100),
        index: 121.30,
        driver: 'Jet Fuel ATF Price Surcharge (+1.14 pts)'
      },
      tier1_tier2: {
        weight_pct: Math.round(routeBasketWeights.tier1_tier2 * 100),
        index: 114.20,
        driver: 'Booking Window Compression (+2.1 pts)'
      },
      regional_udan: {
        weight_pct: Math.round(routeBasketWeights.regional * 100),
        index: 108.90,
        driver: 'Fleet Supply Constraints (+0.6 pts)'
      }
    },
    drivers: [
      { name: 'Fuel Price (ATF) Impact', impact_pts: 1.4, details: 'OMC domestic benchmark hike passed to basic fare bands' },
      { name: 'Booking Window Compression', impact_pts: 2.1, details: 'Late festive surge booking share moved from 18% to 31%' },
      { name: 'Fleet Supply Constraints', impact_pts: 0.6, details: 'Pratt & Whitney engine groundings curtailing trunk ASKs' }
    ]
  });
});

// 4. GET /api/analytics - All AI/ML diagnostic modules
app.get('/api/analytics', (req, res) => {
  res.json({
    status: 'success',
    modules: {
      decision_engine: {
        model: 'ARIMA-XGB Ensemble v3.2',
        confidence_target: '95%',
        ensemble_f1: '94.2%',
        false_positive_rate: '2.1%',
        training_sample_size: '1.8M Indian flight records',
        last_updated: '6h ago'
      },
      anomalies: {
        total_24h: 14,
        critical_surges: 8,
        flash_drops: 4,
        suspected_glitches: 2,
        records: anomalyRecords
      },
      forecast_14d: generate14DayForecast(),
      lead_time_decay: generateLeadTimeDecayCurve(),
      price_dispersion: carrierPriceDispersion,
      buy_decision: {
        route: 'DEL-BOM',
        signal: 'BUY WITHIN 48 HOURS',
        confidence: '91%',
        expected_shift: '+₹1,640 by Thu, Oct 17',
        recommended_action: 'Secure Floor Target sub-₹4,500',
        rationale: 'DEL-BOM inventory curves indicate bucket saturation at D-12. Fares typically spike by +28% at D-10 as business travelers absorb economy cabins.'
      }
    }
  });
});

// 5. GET /api/scrape/status - Scraper fleet telemetry & health
app.get('/api/scrape/status', (req, res) => {
  res.json({
    status: 'success',
    engine_status: 'Healthy & Running',
    active_workers: 8,
    degraded_nodes: 0,
    daily_records_ingested: 184290,
    records_throughput: '~128 rec/s',
    job_success_rate: '99.42%',
    proxy_health: '98.8%',
    residential_latency: '340ms',
    lockouts: 0,
    fleet: scrapeFleet,
    sanitization_rules: sanitizationRules,
    incident_breakdown: [
      { name: 'HTTP 429 Rate Limit Throttles', count: 5, target: 'SpiceJet & Cleartrip' },
      { name: 'Parse Schema Shift (Unrecognized DOM)', count: 4, target: 'MakeMyTrip UI Patch' },
      { name: 'Network / Proxy Gateway Timeout', count: 2, target: 'Residential Node Pool' }
    ]
  });
});

// 6. POST /api/scrape/trigger - On-demand scraper run simulation
app.post('/api/scrape/trigger', (req, res) => {
  const timestamp = new Date().toLocaleTimeString('en-GB');
  const newLog = {
    timestamp,
    level: 'INGESTION',
    worker: 'worker-adhoc',
    message: `Manual sweep triggered by operator. Ingested 1,480 new fare buckets across DEL-BOM, DEL-BLR corridors.`
  };
  liveTelemetryLogs.unshift(newLog);
  if (liveTelemetryLogs.length > 30) liveTelemetryLogs.pop();

  res.json({
    status: 'triggered',
    message: 'Scraper fleet sweep initiated across high-volume corridors',
    job_id: `SCR-${Math.floor(8900 + Math.random() * 1000)}`,
    estimated_duration: '45 seconds'
  });
});

// 7. GET /api/scrape/logs - Terminal log stream
app.get('/api/scrape/logs', (req, res) => {
  res.json({
    status: 'success',
    buffer_utilization: '256/1024 KB',
    logs: liveTelemetryLogs
  });
});

// 8. GET /api/trend - 90-day national fare & index trend
app.get('/api/trend', (req, res) => {
  const trendData = generateNationalTrendData();
  res.json({
    status: 'success',
    range: 'Last 90 Days',
    baseline_date: '2024-08-15',
    data: trendData
  });
});

// 9. GET /api/history - 12-Month Longitudinal Fare Observatory
app.get('/api/history', (req, res) => {
  res.json({
    status: 'success',
    monitored_corridor: 'DEL (Delhi) ⇄ BLR (Bengaluru)',
    all_time_lowest: { fare: 3240, label: 'Monsoon Low', date: 'July 12, 2024' },
    all_time_peak: { fare: 14800, label: '+150% Spike Diwali', date: 'Nov 11, 2023' },
    historical_mean: 5920,
    price_inflation_index: '+8.4%',
    cagr: '6.1%',
    carriers: generate12MonthHistory()
  });
});

// 10. POST /api/settings - Update calculation weights & params
app.post('/api/settings', (req, res) => {
  const { metroWeight, tierWeight, regionalWeight, outlierSigma, baseAnchorDate } = req.body;

  if (metroWeight !== undefined && tierWeight !== undefined && regionalWeight !== undefined) {
    const total = metroWeight + tierWeight + regionalWeight;
    if (Math.abs(total - 100) < 0.01) {
      routeBasketWeights = {
        metro: metroWeight / 100,
        tier1_tier2: tierWeight / 100,
        regional: regionalWeight / 100
      };
    }
  }

  if (outlierSigma) formulaSettings.outlierSigma = outlierSigma;
  if (baseAnchorDate) formulaSettings.anchorDate = baseAnchorDate;

  const recalculatedIndex = calculateLaspeyresIndex(routeBasketWeights);

  res.json({
    status: 'success',
    message: 'Configuration saved and Laspeyres Index recalculated in real time.',
    recalculated_index: recalculatedIndex,
    weights: routeBasketWeights,
    settings: formulaSettings
  });
});

// 11. GET /api/export/dgca - Export DGCA Compliance Report (CSV/JSON)
app.get('/api/export/dgca', (req, res) => {
  const format = req.query.format || 'json';
  if (format === 'csv') {
    const headers = 'Route,Carrier,Flight_Number,Travel_Date,Booking_Window,Base_Fare,Tax,Convenience_Fee,Total_Fare,Status,Z_Score\n';
    const rows = liveFareInventory.map(f =>
      `DEL-BOM,${f.carrier},${f.flight},2024-10-28,T+12,${f.baseFare},${f.tax},${f.convenience},${f.fare},NORMAL,0.42`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="DGCA_AeroIndex_Compliance_Audit_2024.csv"');
    return res.send(headers + rows);
  }

  res.json({
    compliance_report: 'DGCA Tariff Regulation Compliance Report',
    audit_date: new Date().toISOString(),
    compliance_rate: '99.4%',
    records_audited: 184290,
    excessive_surge_count: 8,
    status: 'AUDIT_PASSED'
  });
});

app.listen(PORT, () => {
  console.log(`[AeroIndex Backend] REST API Server running on port ${PORT}`);
});
