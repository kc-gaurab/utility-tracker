import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { computeBalances } from '../utils/calculations';
import { formatDate, formatEur, getTodayDate } from '../utils/formatters';
import { Card } from './Card';
import type { Settlement } from '../types';

export const Ledger: React.FC = () => {
  const { bills, readings, settlements, addSettlement, deleteSettlement } = useStore();

  const [settlementForm, setSettlementForm] = useState<Settlement>({
    date: getTodayDate(),
    notes: '',
  });

  const balances = useMemo(() => {
    return computeBalances(bills, readings, settlements);
  }, [bills, readings, settlements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (settlements.some((s) => s.date === settlementForm.date)) {
      alert('A settlement already exists for that date.');
      return;
    }

    addSettlement(settlementForm);
    setSettlementForm({ date: getTodayDate(), notes: '' });
  };

  const handleDelete = (date: string) => {
    if (
      window.confirm(
        `Delete settlement on ${date}? This will reopen all previously-settled bills.`
      )
    ) {
      deleteSettlement(date);
    }
  };

  // Compute running balance with settlements
  const rows = useMemo(() => {
    const sortedSettlements = [...settlements].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    let settlementIdx = 0;
    let runningA = 0;

    const allRows: Array<
      | { type: 'bill'; bill: any; split: any; dA: number; dB: number; netClass: string; netDesc: string }
      | { type: 'settlement'; settlement: Settlement; runningANow: number }
    > = [];

    for (const e of balances.entries) {
      const bill = e.bill;

      // Insert settlements that come before this bill
      while (
        settlementIdx < sortedSettlements.length &&
        sortedSettlements[settlementIdx].date < bill.date
      ) {
        const s = sortedSettlements[settlementIdx];
        allRows.push({ type: 'settlement', settlement: s, runningANow: runningA });
        runningA = 0;
        settlementIdx++;
      }

      const split = e.split;
      let dA = 0;
      let dB = 0;

      if (bill.paid_by === 'A') dA += bill.amount;
      else if (bill.paid_by === 'B') dB += bill.amount;

      dA -= split.a ?? 0;
      dB -= split.b ?? 0;

      runningA += dA;

      const net = runningA;
      let netClass = '';
      let netDesc = '';

      if (Math.abs(net) < 0.01) {
        netDesc = '€0.00 (even)';
      } else if (net > 0) {
        netClass = 'text-good';
        netDesc = `B owes A ${formatEur(net)}`;
      } else {
        netClass = 'text-bad';
        netDesc = `A owes B ${formatEur(-net)}`;
      }

      allRows.push({ type: 'bill', bill, split, dA, dB, netClass, netDesc });
    }

    // Remaining settlements after last bill
    while (settlementIdx < sortedSettlements.length) {
      const s = sortedSettlements[settlementIdx];
      allRows.push({ type: 'settlement', settlement: s, runningANow: runningA });
      runningA = 0;
      settlementIdx++;
    }

    return allRows.reverse(); // newest first for display
  }, [balances.entries, settlements]);

  return (
    <div>
      {/* Settlement Form */}
      <div className="bg-surface-2 border-l-4 border-accent rounded-r-md p-5 mb-6">
        <h3 className="font-serif text-lg font-medium mb-2">Add settlement</h3>
        <p className="text-sm text-ink-mute mb-4 italic">
          When you settle up (typically every 4 months when the water bill arrives),
          record the date here. The running balance resets to zero from that point forward.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
              Settlement date
            </label>
            <input
              type="date"
              required
              value={settlementForm.date}
              onChange={(e) =>
                setSettlementForm({ ...settlementForm, date: e.target.value })
              }
              className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex-[2]">
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
              Notes (optional)
            </label>
            <input
              type="text"
              value={settlementForm.notes}
              onChange={(e) =>
                setSettlementForm({ ...settlementForm, notes: e.target.value })
              }
              placeholder="e.g. Q2 2026 settlement"
              className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-ink text-bg rounded font-medium text-sm hover:bg-accent transition"
            >
              Add settlement
            </button>
          </div>
        </form>
      </div>

      {/* Ledger Table */}
      <Card
        title="Settlement ledger"
        subtitle="Chronological — running balance resets at each settlement"
      >
        {rows.length === 0 ? (
          <div className="text-center py-16 text-ink-mute">
            <p>No bills yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      Date
                    </th>
                    <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      Bill
                    </th>
                    <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      Amount
                    </th>
                    <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      Paid by
                    </th>
                    <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      A share
                    </th>
                    <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      B share
                    </th>
                    <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      A balance Δ
                    </th>
                    <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      B balance Δ
                    </th>
                    <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                      Running net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    if (row.type === 'settlement') {
                      const s = row.settlement;
                      return (
                        <tr key={`settlement-${s.date}`} className="bg-surface-2">
                          <td className="px-3 py-2 border-b border-line">
                            {formatDate(s.date)}
                          </td>
                          <td
                            colSpan={7}
                            className="px-3 py-2 border-b border-line italic text-ink-soft"
                          >
                            ⎯ Settlement {s.notes ? `· ${s.notes}` : ''} ⎯ balance reset to €0.00
                          </td>
                          <td className="px-3 py-2 border-b border-line whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDelete(s.date)}
                              className="px-2 py-1 text-xs bg-surface border border-line rounded hover:bg-bad hover:text-white transition"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    const { bill, split, dA, dB, netClass, netDesc } = row;

                    return (
                      <tr key={`bill-${bill.id}-${idx}`} className="hover:bg-bg transition">
                        <td className="px-3 py-2 border-b border-line">
                          {formatDate(bill.date)}
                        </td>
                        <td className="px-3 py-2 border-b border-line">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium font-mono mr-1 ${
                              bill.type === 'water'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {bill.type}
                          </span>
                          <span className="text-xs text-ink-mute">{bill.notes || ''}</span>
                        </td>
                        <td className="px-3 py-2 border-b border-line text-right font-mono">
                          {formatEur(bill.amount)}
                        </td>
                        <td className="px-3 py-2 border-b border-line">
                          {bill.paid_by === 'unpaid' ? (
                            <em className="text-ink-mute">unpaid</em>
                          ) : (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium font-mono ${
                                bill.paid_by === 'A'
                                  ? 'bg-house-a-soft text-house-a'
                                  : 'bg-house-b-soft text-house-b'
                              }`}
                            >
                              {bill.paid_by}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border-b border-line text-right font-mono">
                          {formatEur(split.a)}
                        </td>
                        <td className="px-3 py-2 border-b border-line text-right font-mono">
                          {formatEur(split.b)}
                        </td>
                        <td
                          className={`px-3 py-2 border-b border-line text-right font-mono ${
                            dA >= 0 ? 'text-good' : 'text-bad'
                          }`}
                        >
                          {dA >= 0 ? '+' : ''}
                          {dA.toFixed(2)}
                        </td>
                        <td
                          className={`px-3 py-2 border-b border-line text-right font-mono ${
                            dB >= 0 ? 'text-good' : 'text-bad'
                          }`}
                        >
                          {dB >= 0 ? '+' : ''}
                          {dB.toFixed(2)}
                        </td>
                        <td
                          className={`px-3 py-2 border-b border-line text-right font-mono font-medium ${netClass}`}
                        >
                          {netDesc}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-mute mt-2 leading-relaxed">
              Positive net balance = B owes A; negative = A owes B. Each row updates the
              running net; settlement rows reset it to zero.
            </p>
          </>
        )}
      </Card>
    </div>
  );
};
