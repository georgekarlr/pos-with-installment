import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Calendar, Percent, ArrowRight, Table as TableIcon, CheckCircle2 } from 'lucide-react';
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
    const isInstallment = saleType === 'installment_with_down' || saleType === 'pure_installment';
    if (!isInstallment) {
      setSchedule([]);
    }
    if (saleType === 'pure_installment' && downPayment !== 0) {
      setDownPayment(0);
    }
  }, [saleType, setSchedule, downPayment, setDownPayment]);

  const handleGenerate = () => {
    const totalWithInterest = remaining + interestAmount;
    const s = generateSchedule(totalWithInterest, startDate, {
      frequency,
      intervalDays,
      count,
    });
    setSchedule(s);
  };

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="text-blue-600" size={20} />
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Payment Strategy</h3>
        </div>
        <p className="text-sm font-medium text-gray-500">Select how the customer will settle the total of <span className="text-gray-900 font-bold">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['full_payment', 'installment_with_down', 'pure_installment'] as SaleType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSaleType(t)}
            className={`
              relative flex flex-col p-5 rounded-2xl border-2 text-left transition-all
              ${saleType === t 
                ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-600/5' 
                : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
              }
            `}
          >
            {saleType === t && (
              <div className="absolute top-4 right-4 text-blue-600">
                <CheckCircle2 size={20} fill="currentColor" className="text-blue-600 bg-white rounded-full" />
              </div>
            )}
            <span className={`text-xs font-black uppercase tracking-widest mb-2 ${saleType === t ? 'text-blue-600' : 'text-gray-400'}`}>
              {t === 'full_payment' ? 'Immediate' : 'Deferred'}
            </span>
            <span className="text-base font-bold text-gray-900 mb-1">
              {t === 'full_payment' && 'Full Payment'}
              {t === 'installment_with_down' && 'Installment + Down'}
              {t === 'pure_installment' && 'Pure Installment'}
            </span>
            <span className="text-xs text-gray-500 leading-relaxed">
              {t === 'full_payment' && 'Customer pays the entire amount now.'}
              {t === 'installment_with_down' && 'Pay a portion now, the rest in installments.'}
              {t === 'pure_installment' && 'Break down the entire amount into payments.'}
            </span>
          </button>
        ))}
      </div>

      {saleType !== 'full_payment' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                <Percent className="text-blue-600" size={18} />
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Financials</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {saleType === 'installment_with_down' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Down Payment</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                      <input
                        type="number"
                        min={0}
                        max={total}
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-bold text-gray-900"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Math.min(total, Math.max(0, parseFloat(e.target.value || '0'))))}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interest Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-bold text-gray-900"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value || '0')))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-wrap gap-y-4">
                <div className="flex-1 min-w-[150px]">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">To Finance</p>
                  <p className="text-lg font-black text-gray-900">₱{remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Interest</p>
                  <p className="text-lg font-black text-gray-900">₱{interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-full pt-3 mt-3 border-t border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 text-center">Final Amount to be Scheduled</p>
                  <p className="text-2xl font-black text-blue-600 text-center">₱{scheduleDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                <Calendar className="text-blue-600" size={18} />
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Schedule Plan</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interval (Days)</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Payments</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-blue-600 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                onClick={handleGenerate}
                disabled={remaining <= 0}
              >
                Generate Schedule
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {schedule.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <TableIcon size={18} className="text-blue-600" />
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Review Installments</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">No.</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {schedule.map((it, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-500">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(it.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-black text-gray-900">
                          ₱{it.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-600 text-white font-black">
                      <td className="px-6 py-4 text-sm" colSpan={2}>Grand Total (Principal + Interest)</td>
                      <td className="px-6 py-4 text-right text-lg">
                        ₱{schedule.reduce((s, it) => s + it.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {saleType === 'full_payment' && (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-100 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-xl font-black text-gray-900 mb-2">Full Payment Mode</h4>
          <p className="text-gray-500 text-center max-w-md">No installments needed. The customer will pay the full amount of <span className="text-blue-600 font-bold">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> at once.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPlanBuilder;
