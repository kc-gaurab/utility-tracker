import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { sortedReadings, sortedBills, deltaWater, calcBillSplit } from '../utils/calculations';
import { formatDate } from '../utils/formatters';
import { Card } from './Card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Trends: React.FC = () => {
  const { readings, bills } = useStore();

  // Water consumption chart data
  const waterData = useMemo(() => {
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

    return data;
  }, [readings]);

  // Hot water consumption chart data
  const hotWaterData = useMemo(() => {
    const sorted = sortedReadings(readings);
    const data: Array<{ date: string; aHot: number; bHot: number }> = [];

    for (let i = 1; i < sorted.length; i++) {
      const d = deltaWater(sorted[i - 1], sorted[i]);
      if (d) {
        data.push({
          date: formatDate(sorted[i].date),
          aHot: Number(d.a_hot.toFixed(2)),
          bHot: Number(d.b_hot.toFixed(2)),
        });
      }
    }

    return data;
  }, [readings]);

  // Water bill cost chart data
  const waterCostData = useMemo(() => {
    const waterBills = sortedBills(bills).filter((b) => b.type === 'water');
    return waterBills.map((bill) => {
      const split = calcBillSplit(bill, readings);
      return {
        date: formatDate(bill.date),
        houseA: split.a || 0,
        houseB: split.b || 0,
      };
    });
  }, [bills, readings]);

  // Heating bill cost chart data
  const heatingCostData = useMemo(() => {
    const heatingBills = sortedBills(bills).filter((b) => b.type === 'heating');
    return heatingBills.map((bill) => {
      const split = calcBillSplit(bill, readings);
      return {
        date: formatDate(bill.date),
        houseA: split.a || bill.amount / 2,
        houseB: split.b || bill.amount / 2,
        total: bill.amount,
      };
    });
  }, [bills, readings]);

  return (
    <div className="space-y-5">
      <Card
        title="Water consumption per house (m³)"
        subtitle="Per reading period"
      >
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="houseA" fill="#2d6a4f" name="House A" />
              <Bar dataKey="houseB" fill="#6a4a8c" name="House B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        title="Hot water consumption (m³)"
        subtitle="A hot from sub-meter, B hot derived"
      >
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hotWaterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="aHot"
                stroke="#2d6a4f"
                strokeWidth={2}
                name="A hot"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="bHot"
                stroke="#6a4a8c"
                strokeWidth={2}
                name="B hot (derived)"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Water bill cost split (€)">
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterCostData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="houseA" fill="#2d6a4f" name="House A" stackId="a" />
              <Bar dataKey="houseB" fill="#6a4a8c" name="House B" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Heating bills over time (€)">
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heatingCostData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd2" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="houseA"
                stroke="#2d6a4f"
                strokeWidth={2}
                name="House A"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="houseB"
                stroke="#6a4a8c"
                strokeWidth={2}
                name="House B"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#b4530a"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="Total"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
