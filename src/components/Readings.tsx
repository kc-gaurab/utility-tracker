import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatDate, formatNum, getTodayDate } from '../utils/formatters';
import { sortedReadings } from '../utils/calculations';
import { Card } from './Card';
import type { Reading } from '../types';

export const Readings: React.FC = () => {
  const { readings, addReading, updateReading, deleteReading } = useStore();

  const [formData, setFormData] = useState<Reading>({
    date: getTodayDate(),
    a_cold: 0,
    b_cold: 0,
    a_hot: 0,
    main_water: 0,
    a_kamstrup: null,
    b_sharky: null,
    main_kaukolampo: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalDate, setOriginalDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      updateReading(originalDate, formData);
    } else {
      // Check if date exists
      if (readings.some((r) => r.date === formData.date)) {
        if (
          !window.confirm(
            `A reading for ${formData.date} already exists. Overwrite?`
          )
        ) {
          return;
        }
      }
      addReading(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      a_cold: 0,
      b_cold: 0,
      a_hot: 0,
      main_water: 0,
      a_kamstrup: null,
      b_sharky: null,
      main_kaukolampo: null,
    });
    setIsEditing(false);
    setOriginalDate('');
  };

  const handleEdit = (reading: Reading) => {
    setFormData(reading);
    setIsEditing(true);
    setOriginalDate(reading.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (date: string) => {
    if (window.confirm(`Delete reading from ${date}?`)) {
      deleteReading(date);
    }
  };

  const sorted = sortedReadings(readings).reverse();

  return (
    <div>
      {/* Form */}
      <div className="bg-surface-2 border-l-4 border-accent rounded-r-md p-5 mb-6">
        <h3 className="font-serif text-lg font-medium mb-2">
          {isEditing ? `Edit reading — ${formatDate(originalDate)}` : 'Add meter reading'}
        </h3>
        <p className="text-sm text-ink-mute mb-4 italic">
          Take readings monthly when the heating bill arrives. Submit the main water
          meter to Kerava Vesihuolto via kerava.fi every 4 months.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Date
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
                A cold (m³)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={formData.a_cold || ''}
                onChange={(e) =>
                  setFormData({ ...formData, a_cold: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                B cold (m³)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={formData.b_cold || ''}
                onChange={(e) =>
                  setFormData({ ...formData, b_cold: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                A hot (m³)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={formData.a_hot || ''}
                onChange={(e) =>
                  setFormData({ ...formData, a_hot: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Main water (m³)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={formData.main_water || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    main_water: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                A kamstrup (MWh)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.a_kamstrup || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    a_kamstrup: parseFloat(e.target.value) || null,
                  })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                B sharky (MWh)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.b_sharky || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    b_sharky: parseFloat(e.target.value) || null,
                  })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1 font-mono font-medium">
                Main kaukolämpö (MWh)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.main_kaukolampo || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    main_kaukolampo: parseFloat(e.target.value) || null,
                  })
                }
                className="w-full px-3 py-2 bg-bg border border-line rounded text-sm font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-ink text-bg rounded font-medium text-sm hover:bg-accent transition"
              >
                {isEditing ? 'Update reading' : 'Save reading'}
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
              Heating-meter fields are optional if you don't have a heating bill this
              month.
            </span>
          </div>
        </form>
      </div>

      {/* Table */}
      <Card
        title="All readings"
        subtitle={`${readings.length} readings`}
      >
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-ink-mute">
            <p>No readings yet. Add your first reading above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-surface-2">
                <tr>
                  <th className="text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Date
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    A cold (m³)
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    B cold (m³)
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    A hot (m³)
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Main water (m³)
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    A kamstrup (MWh)
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    B sharky (MWh)
                  </th>
                  <th className="text-right px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink-soft border-b border-line">
                    Main kaukolämpö (MWh)
                  </th>
                  <th className="px-3 py-2 border-b border-line"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.date} className="hover:bg-bg transition">
                    <td className="px-3 py-2 border-b border-line">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.a_cold)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.b_cold)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.a_hot)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.main_water, 0)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.a_kamstrup)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.b_sharky)}
                    </td>
                    <td className="px-3 py-2 border-b border-line text-right font-mono">
                      {formatNum(r.main_kaukolampo)}
                    </td>
                    <td className="px-3 py-2 border-b border-line whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-2 py-1 text-xs bg-surface border border-line rounded hover:bg-surface-2 transition mr-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.date)}
                        className="px-2 py-1 text-xs bg-surface border border-line rounded hover:bg-bad hover:text-white transition"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
