import React from 'react';
import type { Bill } from '../types';
import { useStore } from '../store/useStore';
import { calcBillSplit, periodForHeatingBill, periodForWaterBill, deltaWater, deltaHeating } from '../utils/calculations';
import { formatDate, formatEur, formatM3, formatMWh, formatPct } from '../utils/formatters';

interface Props {
  bill: Bill;
}

export const BillDiagnostic: React.FC<Props> = ({ bill }) => {
  const { readings } = useStore();
  const split = calcBillSplit(bill, readings);

  if (bill.type === 'water') {
    const period = periodForWaterBill(bill, readings);

    if (!period) {
      return (
        <div className="p-4 bg-bad/10 border border-bad rounded text-sm">
          <strong className="text-bad">❌ No matching reading period found</strong>
          <p className="mt-2">
            This water bill covers {formatDate(bill.period_start!)} to {formatDate(bill.period_end!)},
            but there are no meter readings that bracket this period.
          </p>
        </div>
      );
    }

    const delta = deltaWater(period.r1, period.r2);

    if (!delta) {
      return (
        <div className="p-4 bg-bad/10 border border-bad rounded text-sm">
          <strong className="text-bad">❌ Incomplete water meter readings</strong>
          <p className="mt-2">
            Period: {formatDate(period.r1.date)} → {formatDate(period.r2.date)}
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-surface-2 rounded text-sm space-y-2">
        <div>
          <strong>📊 Calculation Details</strong>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div>Period: {formatDate(period.r1.date)} → {formatDate(period.r2.date)}</div>
          <div></div>
          <div>A cold: {formatM3(delta.a_cold)}</div>
          <div>B cold: {formatM3(delta.b_cold)}</div>
          <div>A hot: {formatM3(delta.a_hot)}</div>
          <div>B hot: {formatM3(delta.b_hot)} (derived)</div>
          <div className="font-bold">A total: {formatM3(delta.a_total)}</div>
          <div className="font-bold">B total: {formatM3(delta.b_total)}</div>
          <div className="text-house-a">A share: {formatPct(split.aRatio!)}</div>
          <div className="text-house-b">B share: {formatPct(split.bRatio!)}</div>
          <div className="text-house-a">A pays: {formatEur(split.a!)}</div>
          <div className="text-house-b">B pays: {formatEur(split.b!)}</div>
        </div>
      </div>
    );
  }

  // Heating bill
  const period = periodForHeatingBill(bill, readings);

  if (!period) {
    return (
      <div className="p-4 bg-bad/10 border border-bad rounded text-sm">
        <strong className="text-bad">❌ No matching reading period found</strong>
        <p className="mt-2">
          This heating bill is dated <strong>{formatDate(bill.date)}</strong>, but there are no
          two meter readings that bracket this date.
        </p>
        <p className="mt-2">
          <strong>Solution:</strong> You need a meter reading AFTER {formatDate(bill.date)}.
          Heating bills should be dated at the END of the month (e.g., 2026-05-31 for May),
          and you need readings before AND after that date.
        </p>
        <p className="mt-2 text-bad font-bold">
          ⚠️ Currently using 50/50 fallback split: {formatEur(bill.amount / 2)} each
        </p>
      </div>
    );
  }

  const deltaH = deltaHeating(period.r1, period.r2);
  const deltaW = deltaWater(period.r1, period.r2);

  if (!deltaH) {
    return (
      <div className="p-4 bg-bad/10 border border-bad rounded text-sm">
        <strong className="text-bad">❌ Incomplete heating meter readings</strong>
        <p className="mt-2">
          Period: {formatDate(period.r1.date)} → {formatDate(period.r2.date)}
        </p>
        <p className="mt-2">
          One or more heating meters (a_kamstrup, b_sharky, main_kaukolampo) are missing.
        </p>
      </div>
    );
  }

  if (!deltaW) {
    return (
      <div className="p-4 bg-orange-50 border border-orange-300 rounded text-sm">
        <strong className="text-orange-700">⚠️ Using 50/50 hot water split estimate</strong>
        <p className="mt-2">
          Water meter readings are incomplete, so hot water heating is split 50/50.
        </p>
      </div>
    );
  }

  const hotTot = deltaW.a_hot + deltaW.b_hot;
  const aHotShare = hotTot > 0 ? deltaW.a_hot / hotTot : 0.5;
  const bHotShare = hotTot > 0 ? deltaW.b_hot / hotTot : 0.5;

  const detail = split.detail as any;
  const a_total_mwh = detail?.a_total_mwh;
  const b_total_mwh = detail?.b_total_mwh;

  return (
    <div className="p-4 bg-surface-2 rounded text-sm space-y-2">
      <div>
        <strong>📊 Heating Calculation Details</strong>
      </div>
      <div className="font-mono text-xs space-y-1">
        <div>Period: {formatDate(period.r1.date)} → {formatDate(period.r2.date)}</div>
        <div className="mt-2 font-bold">Space Heating (from sub-meters):</div>
        <div className="ml-3">A kamstrup: {formatMWh(deltaH.a_space)}</div>
        <div className="ml-3">B sharky: {formatMWh(deltaH.b_space)}</div>
        <div className="mt-2 font-bold">Hot Water Heating (derived):</div>
        <div className="ml-3">Total hot water MWh: {formatMWh(deltaH.hot_water_mwh)}</div>
        <div className="ml-3">A hot water consumption: {formatM3(deltaW.a_hot)} ({formatPct(aHotShare)})</div>
        <div className="ml-3">B hot water consumption: {formatM3(deltaW.b_hot)} ({formatPct(bHotShare)})</div>
        <div className="ml-3 text-house-a">→ A gets: {formatMWh(deltaH.hot_water_mwh * aHotShare)}</div>
        <div className="ml-3 text-house-b">→ B gets: {formatMWh(deltaH.hot_water_mwh * bHotShare)}</div>
        <div className="mt-2 font-bold">Total MWh per house:</div>
        <div className="ml-3 text-house-a">A: {formatMWh(a_total_mwh)}</div>
        <div className="ml-3 text-house-b">B: {formatMWh(b_total_mwh)}</div>
        <div className="mt-2 font-bold">Bill Split:</div>
        <div className="ml-3 text-house-a">A share: {formatPct(split.aRatio!)} = {formatEur(split.a!)}</div>
        <div className="ml-3 text-house-b">B share: {formatPct(split.bRatio!)} = {formatEur(split.b!)}</div>
      </div>
    </div>
  );
};
