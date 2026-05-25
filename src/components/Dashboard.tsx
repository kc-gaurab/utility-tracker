import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { computeBalances, dateNMonthsAgo } from '../utils/calculations';
import { formatEur, formatDate } from '../utils/formatters';
import { Stat } from './Stat';
import { Card } from './Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { sortedReadings } from '../utils/calculations';
import { deltaWater } from '../utils/calculations';

export const Dashboard: React.FC = () => {
  const { readings, bills, settlements } = useStore();

  const balances = useMemo(() => {
    return computeBalances(bills, readings, settlements, dateNMonthsAgo(4));
  }, [bills, readings, settlements]);

  const net = balances.aBalance;

  // Recent consumption chart data (last 8 periods)
  const consumptionData = useMemo(() => {
    const sorted = sortedReadings(readings);
    const data: Array<{ date: string; houseA: number; houseB: number }> = [];

    for (let i = 1; i < sorted.length; i++) {
      const d = deltaWater(sorted[i - 1], sorted[i]);
      if (d) {
        data.push({
          date: formatDate(sorted[i].date),
          houseA: Number(d.a_total.toFixed(2)),
          houseB: Number(d.b_total.toFixed(2)),
        });
      }
    }

    return data.slice(-8);
  }, [readings]);

  // Recent cost chart data (last 8 bills)
  const costData = useMemo(() => {
    const recent = balances.entries.slice(-8);
    return recent.map((e) => ({
      date: formatDate(e.bill.date),
      type: e.bill.type,
      houseA: e.split.a || 0,
      houseB: e.split.b || 0,
    }));
  }, [balances.entries]);

  // Cumulative cost data
  const cumulativeData = useMemo(() => {
    let cumA = 0;
    let cumB = 0;
    return balances.entries.map((e) => {
      cumA += e.split.a || 0;
      cumB += e.split.b || 0;
      return {
        date: formatDate(e.bill.date),
        houseA: Number(cumA.toFixed(2)),
        houseB: Number(cumB.toFixed(2)),
      };
    });
  }, [balances.entries]);

  const billsInWindow = balances.entries.filter(
    (e) => e.bill.date > balances.effectiveSince
  ).length;

  let windowDesc = '';
  if (
    balances.effectiveSince &&
    balances.effectiveSince !== '0000-01-01' &&
    balances.effectiveSince > dateNMonthsAgo(4)
  ) {
    windowDesc = `${billsInWindow} bills since settlement ${formatDate(
      balances.effectiveSince
    )}`;
  } else {
    windowDesc = `${billsInWindow} bills in last 4 months`;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-4">
        <h2 className="font-serif text-xl sm:text-2xl font-medium">Last 4 months</h2>
        <span className="text-xs sm:text-sm text-ink-mute italic">
          Full history available in Ledger tab
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat
          label="Net balance (4mo)"
          value={
            Math.abs(net) < 0.01
              ? '€0.00'
              : net > 0
              ? formatEur(net)
              : formatEur(-net)
          }
          subtitle={
            Math.abs(net) < 0.01
              ? 'All settled — no one owes anyone'
              : net > 0
              ? `B should pay A ${formatEur(net)}`
              : `A should pay B ${formatEur(-net)}`
          }
          variant="accent"
          valueClassName={net > 0 ? 'text-good' : net < 0 ? 'text-bad' : ''}
        />

        <Stat
          label="House A · paid (4mo)"
          value={formatEur(balances.aPaid)}
          subtitle={`fair share: ${formatEur(balances.aOwes)}`}
          variant="house-a"
        />

        <Stat
          label="House B · paid (4mo)"
          value={formatEur(balances.bPaid)}
          subtitle={`fair share: ${formatEur(balances.bOwes)}`}
          variant="house-b"
        />

        <Stat
          label="Total billed (4mo)"
          value={formatEur(balances.totalBilled)}
          subtitle={windowDesc}
        />
      </div>

      {/* Recent Consumption Chart */}
      <Card
        title="Consumption — last 8 periods"
        subtitle="m³ of water per house, per period"
      >
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="houseA" fill="#2d6a4f" name="House A" />
              <Bar dataKey="houseB" fill="#6a4a8c" name="House B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-surface-2 rounded text-sm text-ink-soft">
          <strong>Note:</strong> These consumption values are calculated by taking the
          difference between consecutive meter readings. Changing meter readings WILL
          affect how bills are split!
        </div>
      </Card>

      {/* Recent Cost & Cumulative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Cost split — recent bills">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="date" type="category" tick={{ fontSize: 9 }} width={60} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="houseA" fill="#2d6a4f" name="House A" stackId="a" />
                <Bar dataKey="houseB" fill="#6a4a8c" name="House B" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Cumulative cost per house">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="houseA"
                  stroke="#2d6a4f"
                  name="House A"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="houseB"
                  stroke="#6a4a8c"
                  name="House B"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
