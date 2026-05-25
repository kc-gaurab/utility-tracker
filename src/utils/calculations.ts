import type {
  Reading,
  Bill,
  WaterDelta,
  HeatingDelta,
  BillSplit,
  BalanceResult,
  Settlement,
} from '../types';

/**
 * Calculate water consumption delta between two readings
 *
 * IMPORTANT: This function shows how meter readings directly affect consumption
 * - A's total water = (A cold reading 2 - A cold reading 1) + (A hot reading 2 - A hot reading 1)
 * - B's hot water is DERIVED: main water delta - A cold - B cold - A hot
 * - This means changing ANY meter reading will affect the fair share calculation!
 */
export function deltaWater(r1: Reading, r2: Reading): WaterDelta | null {
  if (
    r1.a_cold == null ||
    r2.a_cold == null ||
    r1.b_cold == null ||
    r2.b_cold == null ||
    r1.a_hot == null ||
    r2.a_hot == null ||
    r1.main_water == null ||
    r2.main_water == null
  ) {
    return null;
  }

  const dac = r2.a_cold - r1.a_cold;
  const dbc = r2.b_cold - r1.b_cold;
  const dah = r2.a_hot - r1.a_hot;
  const dmain = r2.main_water - r1.main_water;

  // B's hot water is derived from the main meter minus all other sub-meters
  const dbh = dmain - dac - dbc - dah;

  return {
    a_cold: dac,
    b_cold: dbc,
    a_hot: dah,
    b_hot: dbh,
    a_total: dac + dah,
    b_total: dbc + dbh,
    main: dmain,
  };
}

/**
 * Calculate heating consumption delta between two readings
 */
export function deltaHeating(r1: Reading, r2: Reading): HeatingDelta | null {
  if (
    r1.a_kamstrup == null ||
    r2.a_kamstrup == null ||
    r1.b_sharky == null ||
    r2.b_sharky == null ||
    r1.main_kaukolampo == null ||
    r2.main_kaukolampo == null
  ) {
    return null;
  }

  const a_space = r2.a_kamstrup - r1.a_kamstrup;
  const b_space = r2.b_sharky - r1.b_sharky;
  const main = r2.main_kaukolampo - r1.main_kaukolampo;
  const hot_water_mwh = main - a_space - b_space;

  return { a_space, b_space, main, hot_water_mwh };
}

/**
 * Sort readings chronologically (ascending - oldest first)
 */
export function sortedReadings(readings: Reading[]): Reading[] {
  return [...readings].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Sort bills chronologically (ascending - oldest first)
 */
export function sortedBills(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Find the reading period that matches a water bill
 *
 * This tries to match the bill's period_end with a reading date.
 * If that fails, it falls back to finding readings that bracket the bill date.
 */
export function periodForWaterBill(
  bill: Bill,
  readings: Reading[]
): { r1: Reading; r2: Reading } | null {
  const sorted = sortedReadings(readings);
  if (sorted.length < 2) return null;

  const periodEnd = bill.period_end || bill.date;
  const periodStart = bill.period_start || bill.date;

  // Find r2 = first reading on or after periodEnd
  let r2 = sorted.find((r) => r.date >= periodEnd);

  // Find r1 = last reading on or before periodStart
  let r1: Reading | null = null;
  for (const r of sorted) {
    if (r.date <= periodStart) r1 = r;
  }

  if (!r1 || !r2 || r1.date >= r2.date) {
    // Fallback: use the reading closest to/before bill.date and next reading
    let idx = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].date <= bill.date) idx = i;
    }
    if (idx < 0 || idx >= sorted.length - 1) return null;
    r1 = sorted[idx];
    r2 = sorted[idx + 1];
  }

  return { r1, r2 };
}

/**
 * Find the reading period that matches a heating bill
 */
export function periodForHeatingBill(
  bill: Bill,
  readings: Reading[]
): { r1: Reading; r2: Reading } | null {
  const sorted = sortedReadings(readings);
  if (sorted.length < 2) return null;

  if (bill.period_start && bill.period_end) {
    // Find r1 = last reading on or before period_start
    let r1: Reading | null = null;
    for (const r of sorted) {
      if (r.date <= bill.period_start) r1 = r;
    }

    // Find r2 = first reading on or after period_end
    const r2 = sorted.find((r) => r.date >= bill.period_end!);

    if (r1 && r2 && r1.date < r2.date) return { r1, r2 };
  }

  // Fallback: bracket the bill date
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].date < bill.date && sorted[i + 1].date >= bill.date) {
      return { r1: sorted[i], r2: sorted[i + 1] };
    }
  }

  return null;
}

/**
 * Calculate how a bill should be split between houses A and B
 *
 * CRITICAL: This is where meter readings affect the fair share!
 *
 * For water bills:
 * - Finds the meter readings that bracket the bill's period
 * - Calculates consumption delta (r2 - r1) for each meter
 * - Splits bill by: A's share = bill × (A's total water / total water consumed)
 * - Therefore, changing ANY water meter reading will change the split!
 *
 * For heating bills:
 * - Similar process but uses MWh meters
 * - Hot water heating cost is split by hot water consumption ratio
 */
export function calcBillSplit(bill: Bill, readings: Reading[]): BillSplit {
  if (bill.type === 'water') {
    const p = periodForWaterBill(bill, readings);
    if (!p) {
      return {
        a: null,
        b: null,
        reason: 'No matching reading period found',
      };
    }

    const d = deltaWater(p.r1, p.r2);
    if (!d) {
      return {
        a: null,
        b: null,
        reason: 'Incomplete water meter readings for this period',
      };
    }

    const tot = d.a_total + d.b_total;
    if (tot <= 0) {
      return {
        a: null,
        b: null,
        reason: 'Zero consumption in period (check meter readings)',
      };
    }

    const aShare = d.a_total / tot;

    return {
      a: bill.amount * aShare,
      b: bill.amount * (1 - aShare),
      aRatio: aShare,
      bRatio: 1 - aShare,
      detail: d,
      r1: p.r1,
      r2: p.r2,
    };
  } else if (bill.type === 'heating') {
    const p = periodForHeatingBill(bill, readings);
    if (!p) {
      return {
        a: null,
        b: null,
        reason: 'No matching reading period found',
      };
    }

    const dw = deltaWater(p.r1, p.r2);
    const dh = deltaHeating(p.r1, p.r2);

    if (!dh) {
      return {
        a: null,
        b: null,
        reason: 'Incomplete heating meter readings for this period',
      };
    }

    if (!dw) {
      // Fallback: split heating MWh by sub-meters only, 50/50 for hot water
      const tot = dh.a_space + dh.b_space + dh.hot_water_mwh;
      if (tot <= 0) {
        return {
          a: null,
          b: null,
          reason: 'Zero heating consumption',
        };
      }

      const a_total = dh.a_space + dh.hot_water_mwh / 2;
      const b_total = dh.b_space + dh.hot_water_mwh / 2;
      const aR = a_total / (a_total + b_total);

      return {
        a: bill.amount * aR,
        b: bill.amount * (1 - aR),
        aRatio: aR,
        bRatio: 1 - aR,
        detail: { ...dh, a_total_mwh: a_total, b_total_mwh: b_total },
        r1: p.r1,
        r2: p.r2,
        warning: 'Hot water split estimated 50/50 (incomplete water readings)',
      };
    }

    // Split hot_water_mwh by hot water consumption ratio
    const hotTot = dw.a_hot + dw.b_hot;
    let aHotShare = 0.5;
    let bHotShare = 0.5;

    if (hotTot > 0) {
      aHotShare = dw.a_hot / hotTot;
      bHotShare = dw.b_hot / hotTot;
    }

    const a_total_mwh = dh.a_space + dh.hot_water_mwh * aHotShare;
    const b_total_mwh = dh.b_space + dh.hot_water_mwh * bHotShare;
    const tot = a_total_mwh + b_total_mwh;

    if (tot <= 0) {
      return {
        a: null,
        b: null,
        reason: 'Zero heating consumption',
      };
    }

    const aR = a_total_mwh / tot;

    return {
      a: bill.amount * aR,
      b: bill.amount * (1 - aR),
      aRatio: aR,
      bRatio: 1 - aR,
      detail: { ...dh, a_total_mwh, b_total_mwh, dw },
      r1: p.r1,
      r2: p.r2,
    };
  }

  return { a: null, b: null, reason: 'Unknown bill type' };
}

/**
 * Calculate balances and running totals
 *
 * @param bills All bills
 * @param readings All readings
 * @param settlements All settlements
 * @param sinceDate Optional: only include bills on or after this date
 */
export function computeBalances(
  bills: Bill[],
  readings: Reading[],
  settlements: Settlement[],
  sinceDate?: string
): BalanceResult {
  let aPaid = 0;
  let bPaid = 0;
  let aOwes = 0;
  let bOwes = 0;
  let totalBilled = 0;
  const entries: Array<{ bill: Bill; split: BillSplit }> = [];

  // Find the effective "since" date
  const sorted = sortedBills(bills);
  const sortedSettlements = [...settlements].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  let effectiveSince = sinceDate || '0000-01-01';
  for (const s of sortedSettlements) {
    if (s.date >= effectiveSince) {
      effectiveSince = s.date;
    }
  }

  for (const bill of sorted) {
    const split = calcBillSplit(bill, readings);
    const outOfWindow =
      bill.date <= effectiveSince && effectiveSince !== '0000-01-01';

    if (outOfWindow) {
      // Include for ledger entries but don't count in totals
      entries.push({
        bill,
        split:
          split.a == null
            ? {
                a: bill.amount / 2,
                b: bill.amount / 2,
                fallback: true,
                reason: split.reason,
              }
            : split,
      });
      continue;
    }

    totalBilled += bill.amount;

    if (split.a == null) {
      // Fallback: 50/50 split
      const aSh = bill.amount / 2;
      const bSh = bill.amount / 2;

      if (bill.paid_by === 'A') aPaid += bill.amount;
      else if (bill.paid_by === 'B') bPaid += bill.amount;

      aOwes += aSh;
      bOwes += bSh;

      entries.push({
        bill,
        split: { a: aSh, b: bSh, fallback: true, reason: split.reason },
      });
    } else {
      if (bill.paid_by === 'A') aPaid += bill.amount;
      else if (bill.paid_by === 'B') bPaid += bill.amount;

      aOwes += split.a ?? 0;
      bOwes += split.b ?? 0;

      entries.push({ bill, split });
    }
  }

  const aBalance = aPaid - aOwes;
  const bBalance = bPaid - bOwes;

  return {
    aPaid,
    bPaid,
    aOwes,
    bOwes,
    aBalance,
    bBalance,
    totalBilled,
    entries,
    effectiveSince,
  };
}

/**
 * Get date N months ago from today
 */
export function dateNMonthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}
