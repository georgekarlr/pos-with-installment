import React, { useEffect, useMemo, useState } from 'react';
import type { CustomScheduleItemInput, SaleType } from '../../types/sales';
import { generateSchedule, type Frequency } from '../../utils/schedule';

interface PaymentPlanBuilderProps {
  saleType: SaleType;
  setSaleType: (t: SaleType) => void;
  total: number;
  downPayment: number;
  setDownPayment: (n: number) => void;
  schedule: CustomScheduleItemInput[];
  setSchedule: (s: CustomScheduleItemInput[]) => void;
  // Interest
  interestRate: number;
  setInterestRate: (n: number) => void;
}

const PaymentPlanBuilder: React.FC<PaymentPlanBuilderProps> = ({
  saleType,
  setSaleType,
  total,
  downPayment,
  setDownPayment,
  schedule,
  setSchedule,
  interestRate,
  setInterestRate,
}) => {
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [intervalDays, setIntervalDays] = useState<number>(7);
  const [count, setCount] = useState<number>(3);

  const remaining = useMemo(() => {
    if (saleType === 'full_payment') return 0;
    if (saleType === 'installment_with_down') {
      const base = Math.max(total - (downPayment || 0), 0);
      return Number(base.toFixed(2));
    }
    // pure_installment
    return Number(total.toFixed(2));
  }, [total, downPayment, saleType]);

  const interestAmount = useMemo(() => {
    if (saleType === 'full_payment') return 0;
    const amt = (remaining * (interestRate || 0)) / 100;
    return Number(amt.toFixed(2));
  }, [remaining, interestRate, saleType]);

  const scheduleDue = useMemo(() => {
    if (saleType === 'full_payment') return 0;
    return Number((remaining + interestAmount).toFixed(2));
  }, [saleType, remaining, interestAmount]);

  useEffect(() => {
    // Reset schedule when sale type changes
    const isInstallment = saleType === 'installment_with_down' || saleType === 'pure_installment';
    if (!isInstallment) {
      setSchedule([]);
    }
    // Force down payment to 0 for pure_installment
    if (saleType === 'pure_installment' && downPayment !== 0) {
      setDownPayment(0);
    }
  }, [saleType, setSchedule, downPayment, setDownPayment]);

  const handleGenerate = () => {
    // Now schedule amounts include interest (principal + interest distributed)
    const totalWithInterest = remaining + interestAmount;
    const s = generateSchedule(totalWithInterest, startDate, {
      frequency,
      intervalDays,
      count,
    });
    setSchedule(s);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Payment Options</h3>
        <p className="text-sm text-gray-600">Cart total: {'\u20b1'+ total.toFixed(2)}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {(['full_payment', 'installment_with_down', 'pure_installment'] as SaleType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={[
              'px-3 py-1.5 rounded-md text-sm border',
              saleType === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
            ].join(' ')}
            onClick={() => setSaleType(t)}
          >
            {t === 'full_payment' && 'Full Payment'}
            {t === 'installment_with_down' && 'Installment + Down'}
            {t === 'pure_installment' && 'Pure Installment'}
          </button>
        ))}
      </div>

      {saleType === 'installment_with_down' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Down Payment</label>
            <input
              type="number"
              min={0}
              max={total}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
              value={downPayment}
              onChange={(e) => setDownPayment(Math.min(total, Math.max(0, parseFloat(e.target.value || '0'))))}
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-700">Due on schedule (with interest): <span className="font-medium">{ '\u20b1'+ scheduleDue.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      {saleType === 'pure_installment' && (
        <div className="text-sm text-gray-700">Due on schedule (with interest): <span className="font-medium">{ '\u20b1'+ scheduleDue.toFixed(2)}</span></div>
      )}

      {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
        <div className="space-y-4">
          {/* Interest settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value || '0')))}
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-700">
                Interest amount: <span className="font-medium">{'\u20b1' + interestAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-700">
                Principal remaining: <span className="font-medium">{'\u20b1' + remaining.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Frequency</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom_days">Every N days</option>
              </select>
            </div>
            {frequency === 'custom_days' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Interval (days)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value || '1', 10)))}
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Payments count</label>
              <input
                type="number"
                min={1}
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50"
              onClick={handleGenerate}
              disabled={remaining <= 0}
            >Generate Schedule</button>
          </div>

          {schedule.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 border-b">#</th>
                    <th className="text-left px-3 py-2 border-b">Due Date</th>
                    <th className="text-right px-3 py-2 border-b">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((it, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="px-3 py-2 border-b">{idx + 1}</td>
                      <td className="px-3 py-2 border-b">{it.due_date}</td>
                      <td className="px-3 py-2 border-b text-right">{'\u20b1' +it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-2 border-t font-semibold" colSpan={2}>Total (principal + interest)</td>
                    <td className="px-3 py-2 border-t text-right font-semibold">
                      {'\u20b1' + schedule.reduce((s, it) => s + it.amount, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPlanBuilder;
