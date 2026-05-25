import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatDate, formatEur, getTodayDate } from '../utils/formatters';
import { sortedBills, calcBillSplit } from '../utils/calculations';
import { Card } from './Card';
import { BillDiagnostic } from './BillDiagnostic';
import type { Bill } from '../types';

export const Bills: React.FC = () => {
  const { bills, readings, addBill, updateBill, deleteBill } = useStore();
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Bill, 'id'>>({
    type: 'water',
    date: getTodayDate(),
    amount: 0,
    paid_by: 'A',
    period_start: null,
    period_end: null,
    mwh: null,
    notes: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const billData: Bill = {
      ...formData,
      id: isEditing
        ? editingId
        : `bill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };

    if (isEditing) {
      updateBill(editingId, billData);
    } else {
      addBill(billData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'water',
      date: getTodayDate(),
      amount: 0,
      paid_by: 'A',
      period_start: null,
      period_end: null,
      mwh: null,
      notes: '',
    });
    setIsEditing(false);
    setEditingId('');
  };

  const handleEdit = (bill: Bill) => {
    setFormData(bill);
    setIsEditing(true);
    setEditingId(bill.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this bill?')) {
      deleteBill(id);
    }
  };

  const sorted = sortedBills(bills).reverse();

  const isWater = formData.type === 'water';

  return (
    <div>
      {/* Form */}
      <div className="bg-surface-2 border-l-4 border-accent rounded-r-md p-5 mb-6">
        <h3 className="font-serif text-lg font-medium mb-4">
          {isEditing ? `Edit bill — ${formatDate(formData.date)}` : 'Add bill'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Type
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'water' | 'heating' })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
              >
                <option value="water">Water (Kerava Vesihuolto)</option>
                <option value="heating">Heating (Keravan Energia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Bill date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Amount (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Paid by
              </label>
              <select
                required
                value={formData.paid_by}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paid_by: e.target.value as 'A' | 'B' | 'unpaid',
                  })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
              >
                <option value="A">House A</option>
                <option value="B">House B</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Period start
              </label>
              <input
                type="date"
                value={formData.period_start || ''}
                onChange={(e) =>
                  setFormData({ ...formData, period_start: e.target.value || null })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Period end
              </label>
              <input
                type="date"
                value={formData.period_end || ''}
                onChange={(e) =>
                  setFormData({ ...formData, period_end: e.target.value || null })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
              />
            </div>

            {!isWater && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                  Energy (MWh) — optional
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.mwh || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mwh: parseFloat(e.target.value) || null,
                    })
                  }
                  className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
              Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Invoice #77594835"
              className="w-full px-3 py-2 bg-bg border border-line rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-ink text-bg rounded font-medium text-sm hover:bg-accent transition"
              >
                {isEditing ? 'Update bill' : 'Save bill'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-surface text-ink border border-line rounded font-medium text-sm hover:bg-surface-2 transition"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <span className="text-xs sm:text-sm text-ink-mute italic">
              {isWater
                ? 'Water bills are split by total water consumption (cold + hot) in the period.'
                : 'Heating bills are split by space heating (A/B sub-meters) plus hot water consumption ratio.'}
            </span>
          </div>
        </form>
      </div>

      {/* Table */}
      <Card title="All bills" subtitle={`${bills.length} bills`}>
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-ink-mute">
            <p>No bills yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[900px]">
              <thead className="bg-surface-2">
                <tr>
                  <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Date
                  </th>
                  <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Type
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Amount
                  </th>
                  <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Period
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
                  <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Notes
                  </th>
                  <th className="px-3 py-2 border-b border-line"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((bill) => {
                  const split = calcBillSplit(bill, readings);
                  const period =
                    bill.period_start && bill.period_end
                      ? `${formatDate(bill.period_start)} — ${formatDate(bill.period_end)}`
                      : bill.notes?.match(/[A-Za-z]+ \d{4}/)?.[0] || '—';

                  return (
                    <React.Fragment key={bill.id}>
                      <tr className="hover:bg-bg transition">
                        <td className="px-3 py-2 border-b border-line">
                          {formatDate(bill.date)}
                        </td>
                        <td className="px-3 py-2 border-b border-line">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium font-mono ${
                              bill.type === 'water'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {bill.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b border-line text-right font-mono">
                          {formatEur(bill.amount)}
                        </td>
                        <td className="px-3 py-2 border-b border-line text-sm">
                          {period}
                        </td>
                        <td className="px-3 py-2 border-b border-line">
                          {bill.paid_by === 'unpaid' ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium font-mono bg-gray-200 text-gray-600">
                              unpaid
                            </span>
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
                        <td className={`px-3 py-2 border-line text-right font-mono ${
                          split.a == null || split.b == null ? 'bg-yellow-50' : ''
                        } ${expandedBillId === bill.id ? '' : 'border-b'}`}>
                          {formatEur(split.a)}
                          {split.a == null && <span className="ml-1 text-bad">⚠️</span>}
                        </td>
                        <td className={`px-3 py-2 border-line text-right font-mono ${
                          split.a == null || split.b == null ? 'bg-yellow-50' : ''
                        } ${expandedBillId === bill.id ? '' : 'border-b'}`}>
                          {formatEur(split.b)}
                          {split.b == null && <span className="ml-1 text-bad">⚠️</span>}
                        </td>
                        <td className={`px-3 py-2 border-line text-xs text-ink-mute ${expandedBillId === bill.id ? '' : 'border-b'}`}>
                          {bill.notes}
                        </td>
                        <td className={`px-3 py-2 border-line whitespace-nowrap ${expandedBillId === bill.id ? '' : 'border-b'}`}>
                          <button
                            onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                            className="px-2 py-1 text-xs bg-accent/10 text-accent border border-accent/30 rounded hover:bg-accent/20 transition mr-1"
                            title="Show calculation details"
                          >
                            {expandedBillId === bill.id ? '▼' : '▶'}
                          </button>
                          <button
                            onClick={() => handleEdit(bill)}
                            className="px-2 py-1 text-xs bg-surface border border-line rounded hover:bg-surface-2 transition mr-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(bill.id)}
                            className="px-2 py-1 text-xs bg-surface border border-line rounded hover:bg-bad hover:text-white transition"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                      {expandedBillId === bill.id && (
                        <tr className="bg-bg">
                          <td colSpan={9} className="px-3 py-3 border-b border-line">
                            <BillDiagnostic bill={bill} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
