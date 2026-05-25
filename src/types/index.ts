export interface Reading {
  date: string; // YYYY-MM-DD
  a_cold: number;
  b_cold: number;
  a_hot: number;
  main_water: number;
  a_kamstrup: number | null;
  b_sharky: number | null;
  main_kaukolampo: number | null;
}

export interface Bill {
  id: string;
  type: 'water' | 'heating';
  date: string; // YYYY-MM-DD
  amount: number;
  paid_by: 'A' | 'B' | 'unpaid';
  period_start: string | null;
  period_end: string | null;
  mwh: number | null;
  notes: string;
}

export interface Settlement {
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface WaterDelta {
  a_cold: number;
  b_cold: number;
  a_hot: number;
  b_hot: number;
  a_total: number;
  b_total: number;
  main: number;
}

export interface HeatingDelta {
  a_space: number;
  b_space: number;
  main: number;
  hot_water_mwh: number;
}

export interface BillSplit {
  a: number | null;
  b: number | null;
  aRatio?: number;
  bRatio?: number;
  detail?: WaterDelta | (HeatingDelta & { a_total_mwh: number; b_total_mwh: number; dw?: WaterDelta });
  r1?: Reading;
  r2?: Reading;
  reason?: string;
  fallback?: boolean;
  warning?: string;
}

export interface BalanceResult {
  aPaid: number;
  bPaid: number;
  aOwes: number;
  bOwes: number;
  aBalance: number;
  bBalance: number;
  totalBilled: number;
  entries: Array<{ bill: Bill; split: BillSplit }>;
  effectiveSince: string;
}

export interface AppState {
  readings: Reading[];
  bills: Bill[];
  settlements: Settlement[];
}
