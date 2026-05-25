import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card } from './Card';
import type { AppState } from '../types';
import { seedFirebase } from '../utils/seedFirebase';

export const Settings: React.FC = () => {
  const { exportData, importData, resetData, uploadLocalDataToFirebase, isFirebaseSynced } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paivolanrinne_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AppState;
        if (!data.readings || !data.bills) {
          throw new Error('Invalid format');
        }
        if (!data.settlements) {
          data.settlements = [];
        }
        if (!window.confirm('Replace all current data with imported data?')) {
          return;
        }
        importData(data);
        alert('Imported successfully');
      } catch (err: any) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (!window.confirm('Permanently delete ALL data? Export a backup first.')) {
      return;
    }
    if (!window.confirm('Really? This cannot be undone.')) {
      return;
    }
    resetData();
    alert('All data has been reset to seed data.');
  };

  const handleUploadToFirebase = async () => {
    if (!window.confirm('Upload all current local data to Firebase? This will overwrite any existing data in the cloud.')) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadLocalDataToFirebase();
      alert('Data successfully uploaded to Firebase!');
    } catch (error: any) {
      alert('Failed to upload data: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeedFirebase = async () => {
    if (!window.confirm('Upload seed data to Firebase? This will add 11 readings, 23 bills, and 6 settlements to the cloud.')) {
      return;
    }

    setIsSeeding(true);
    try {
      await seedFirebase();
      alert('Seed data successfully uploaded to Firebase! Refresh the page to see the data.');
    } catch (error: any) {
      alert('Failed to seed Firebase: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      <Card title="Firebase Cloud Sync">
        <p className="text-sm text-ink-mute mb-4">
          {isFirebaseSynced ? (
            <span className="text-good font-medium">✓ Connected to Firebase. All changes sync automatically in real-time.</span>
          ) : (
            <span className="text-yellow-600 font-medium">⚠ Connecting to Firebase...</span>
          )}
        </p>

        <div className="bg-surface-2 border border-line rounded p-4 mb-4">
          <h3 className="font-medium mb-2 text-sm">First-time setup</h3>
          <p className="text-sm text-ink-mute mb-3">
            Upload seed data to Firebase to get started with sample readings, bills, and settlements.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSeedFirebase}
              disabled={isSeeding}
              className="px-4 py-2 bg-good text-white rounded font-medium text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? 'Seeding...' : 'Upload Seed Data'}
            </button>
            <button
              onClick={handleUploadToFirebase}
              disabled={isUploading}
              className="px-4 py-2 bg-ink text-bg rounded font-medium text-sm hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Current Local Data'}
            </button>
          </div>
          <p className="text-xs text-ink-mute mt-2 italic">
            Use "Upload Seed Data" if Firebase is empty, or "Upload Current Local Data" if you have existing data in your browser.
          </p>
        </div>

        <p className="text-xs text-ink-mute italic">
          Note: Once Firebase sync is active, all changes are saved to the cloud automatically.
          Multiple users can access and edit the same data in real-time.
        </p>
      </Card>

      <Card title="Data management">
        <p className="text-sm text-ink-mute mb-4 italic">
          Export and import JSON backups for local storage.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-ink text-bg rounded font-medium text-sm hover:bg-accent transition"
          >
            Export JSON backup
          </button>

          <button
            onClick={handleImportClick}
            className="px-4 py-2 bg-surface text-ink border border-line rounded font-medium text-sm hover:bg-surface-2 transition"
          >
            Import JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex-1"></div>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-bad text-white rounded font-medium text-sm hover:bg-red-700 transition"
          >
            Reset all data
          </button>
        </div>
      </Card>

      <details className="bg-surface border border-line rounded-md p-5 mb-3">
        <summary className="cursor-pointer font-medium select-none">
          About the calculations
        </summary>
        <div className="text-sm leading-relaxed mt-3 space-y-2">
          <p>
            <strong>Water bill split:</strong> For each period (between two readings), A's
            total water = A cold + A hot. B's total water = B cold + B hot, where B hot =
            main water − (A cold + B cold + A hot). The bill is split proportionally.
          </p>
          <p>
            <strong>Heating bill split:</strong> For each heating period, hot-water-heating
            MWh = main kaukolämpö − (A kamstrup + B sharky). This is split between A and B
            by their hot water consumption ratio. Each house's total MWh = its meter (space
            heating) + its share of hot-water-heating MWh. Bill is split by MWh ratio.
          </p>
          <p>
            <strong>Period matching:</strong> Bills are matched to the reading period that
            contains the bill date (or the period whose end-date matches the bill's
            period_end for water bills).
          </p>
          <p className="text-good font-medium">
            ✓ Meter readings directly affect fair share calculations! Changing any meter
            reading will recalculate the consumption for that period and update all
            associated bill splits.
          </p>
        </div>
      </details>

      <details className="bg-surface border border-line rounded-md p-5">
        <summary className="cursor-pointer font-medium select-none">
          How to verify calculations
        </summary>
        <div className="text-sm leading-relaxed mt-3 space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Go to the <strong>Readings</strong> tab and note the meter values for two
              consecutive periods
            </li>
            <li>
              Calculate the consumption manually: subtract the earlier reading from the
              later one for each meter
            </li>
            <li>
              Go to the <strong>Bills</strong> tab and find a bill that falls in that
              period
            </li>
            <li>
              The "A share" and "B share" columns show how the bill was split based on
              consumption
            </li>
            <li>
              Try editing a meter reading and watch how the bill splits update immediately
              in the Bills tab!
            </li>
          </ol>
        </div>
      </details>
    </div>
  );
};
