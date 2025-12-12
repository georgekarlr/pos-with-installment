import React, { useMemo, useState } from 'react';
import type { Customer } from '../../types/customer';
import type { CustomScheduleItemInput, PaymentDetailsInput, ProcessSaleResult, SaleType } from '../../types/sales';
import { SalesService } from '../../services/salesService';
import type { CartItem } from '../../pages/POSWizard';

interface PaymentProcessorProps {
  accountId: number | null;
  customer: Customer | null;
  cart: CartItem[];
  saleType: SaleType;
  downPayment: number;
  schedule: CustomScheduleItemInput[];
  total: number;
  interestRate: number;
  onResult: (res: ProcessSaleResult | null) => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  accountId,
  customer,
  cart,
  saleType,
  downPayment,
  schedule,
  total,
  onResult,
  interestRate,
}) => {
  const [deduct, setDeduct] = useState<number>(0);
  const netTotalForFull = useMemo(() => Math.max(total - (deduct || 0), 0), [total, deduct]);
  const amountNow = useMemo(() => {
    if (saleType === 'full_payment') return netTotalForFull;
    if (saleType === 'installment_with_down') return (downPayment || 0);
    // pure_installment
    return 0;
  }, [saleType, netTotalForFull, downPayment]);
  const [method, setMethod] = useState<string>('cash');
  const [tendered, setTendered] = useState<number>(amountNow);
  const change = Math.max(0, Math.round((tendered - amountNow) * 100) / 100);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canProcess = useMemo(() => {
    if (!accountId || !customer) return false;
    if (cart.length === 0) return false;
    if (amountNow > 0 && tendered < amountNow) return false;
    if (saleType === 'installment_with_down' || saleType === 'pure_installment') {
      const principal = saleType === 'pure_installment' ? Math.max(total, 0) : Math.max(total - (downPayment || 0), 0);
      const interest = (principal * (interestRate || 0)) / 100;
      const remaining = principal + interest;
      const sum = schedule.reduce((s, it) => s + it.amount, 0);
      if (Math.round(sum * 100) !== Math.round(remaining * 100)) return false;
    }
    return true;
  }, [accountId, customer, cart.length, amountNow, tendered, saleType, schedule, total, downPayment, interestRate]);

  // Keep tendered synced with amount due for convenience when it changes
  React.useEffect(() => {
    setTendered(amountNow);
  }, [amountNow, saleType]);

  // Derived values for installments (principal-only schedule + separate interest)
  const principalFinanced = useMemo(() => {
    if (saleType === 'pure_installment') return Math.max(total, 0);
    if (saleType === 'installment_with_down') return Math.max(total - (downPayment || 0), 0);
    return 0;
  }, [saleType, total, downPayment]);

  const interestAmount = useMemo(() => {
    if (saleType === 'full_payment') return 0;
    const amt = (principalFinanced * (interestRate || 0)) / 100;
    return Math.round(amt * 100) / 100;
  }, [principalFinanced, interestRate, saleType]);

  const scheduleTotal = useMemo(() => {
    return Math.round(schedule.reduce((s, it) => s + it.amount, 0) * 100) / 100;
  }, [schedule]);

  // New API fields: calculate totals including interest
  const totalWithInterest = useMemo(() => {
    if (saleType === 'full_payment') return null;
    return Math.round((principalFinanced + interestAmount) * 100) / 100;
  }, [saleType, principalFinanced, interestAmount]);

  const totalFinanced = useMemo(() => {
    if (saleType === 'full_payment') return null;
    // The financed total equals the schedule total (principal + interest)
    // Use schedule sum if provided, else fallback to computed totalWithInterest
    const sched = scheduleTotal;
    const computed = totalWithInterest ?? 0;
    const val = sched > 0 ? sched : computed;
    return Math.round(val * 100) / 100;
  }, [saleType, scheduleTotal, totalWithInterest]);

  const handleProcess = async () => {
    setError(null);
    if (!accountId || !customer) {
      setError('Missing account or customer context.');
      return;
    }
    setLoading(true);
    const p_items = cart.map((ci) => ({
      product_id: ci.product.id,
      quantity: ci.quantity,
      unit_price: ci.product.price,
      total: Math.round(ci.product.price * ci.quantity * 100) / 100,
    }));

    const payment: PaymentDetailsInput = {
      amount: Math.round(amountNow * 100) / 100,
      tendered: Math.round(tendered * 100) / 100,
      method,
      change,
      /*deduct: saleType === 'full_payment' ? Math.round((deduct || 0) * 100) / 100 : undefined,
      net_amount: saleType === 'full_payment' ? Math.round(netTotalForFull * 100) / 100 : undefined,*/
    };

    const { data, error } = await SalesService.processSale({
      p_account_id: accountId,
      p_customer_id: customer.id,
      p_sale_type: saleType,
      p_items,
      p_payment: payment,
      p_installment_plan_id: null,
      p_custom_schedule: (saleType === 'installment_with_down' || saleType === 'pure_installment') ? schedule : null,
      // Latest API fields
      p_sale_date: new Date().toISOString(),
      p_interest_rate: (saleType === 'installment_with_down' || saleType === 'pure_installment') ? (interestRate || 0) : 0,
      p_interest_amount: (saleType === 'installment_with_down' || saleType === 'pure_installment')
        ? interestAmount
        : 0,
      // New totals for the sales API
      p_total_with_interest: (saleType === 'installment_with_down' || saleType === 'pure_installment')
        ? (totalWithInterest ?? null)
        : null,
      p_total_financed: (saleType === 'installment_with_down' || saleType === 'pure_installment')
        ? (totalFinanced ?? null)
        : null,
    });

    setLoading(false);
    if (error) {
      setError(error);
      onResult(null);
    } else {
      onResult(data);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sale Type</span>
            <span className="text-sm font-medium text-gray-900">
              {saleType === 'full_payment' && 'Full Payment'}
              {saleType === 'installment_with_down' && 'Installment + Down'}
              {saleType === 'pure_installment' && 'Pure Installment'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cart Total</span>
            <span className="text-sm font-semibold">{'\u20b1'}{total.toFixed(2)}</span>
          </div>
          {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Principal Financed</span>
                <span className="text-xs font-medium text-gray-900">{'\u20b1'}{principalFinanced.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Interest ({(interestRate || 0).toFixed(2)}%)</span>
                <span className="text-xs font-medium text-gray-900">{'\u20b1'}{interestAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total with Interest</span>
                <span className="text-sm font-semibold">{'\u20b1'}{(totalWithInterest ?? 0).toFixed(2)}</span>
              </div>
            </div>
          )}
          {saleType === 'full_payment' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Deduct</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={deduct}
                  onChange={(e) => setDeduct(Math.max(0, parseFloat(e.target.value || '0')))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Net Due</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                  value={`\u20B1${netTotalForFull.toFixed(2)}`}
                  readOnly
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount Due Now</span>
            <span className="text-sm font-semibold">{'\u20B1'}{amountNow.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Payment Method</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tendered</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={tendered}
                onChange={(e) => setTendered(parseFloat(e.target.value || '0'))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Change</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                value={`\u20b1${change.toFixed(2)}`}
                readOnly
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!canProcess || loading}
            onClick={handleProcess}
          >
            {loading ? 'Processing...' : 'Process Payment'}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Customer</span><span className="font-medium">{customer?.full_name ?? '-'}</span></div>
          <div className="flex justify-between"><span>Items</span><span className="font-medium">{cart.length}</span></div>
          {saleType === 'installment_with_down' && (
            <div className="flex justify-between"><span>Down Payment</span><span className="font-medium">{'\u20b1'+ (downPayment || 0).toFixed(2)}</span></div>
          )}
          {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
            <div className="flex justify-between"><span>Installments</span><span className="font-medium">{schedule.length}</span></div>
          )}
          {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
            <>
              <div className="flex justify-between"><span>Principal Financed</span><span className="font-medium">{'\u20b1'}{principalFinanced.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Interest Rate</span><span className="font-medium">{(interestRate || 0).toFixed(2)}%</span></div>
              <div className="flex justify-between"><span>Interest Amount</span><span className="font-medium">{'\u20b1'}{interestAmount.toFixed(2)}</span></div>
            </>
          )}
        </div>
        <div className="mt-3 border-t pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>{'\u20b1'+ total.toFixed(2)}</span>
        </div>
        {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
          <div className="mt-1 flex justify-between text-sm">
            <span>Grand Total (principal + interest)</span>
            <span className="font-semibold">{'\u20b1'}{(principalFinanced + interestAmount).toFixed(2)}</span>
          </div>
        )}
        {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
          <>
            <div className="mt-1 flex justify-between text-sm">
              <span>Total on Schedule</span>
              <span className="font-semibold">{'\u20b1'}{scheduleTotal.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span>Final Total (Down + Schedule)</span>
              <span className="font-semibold">{'\u20b1'}{((downPayment || 0) + scheduleTotal).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessor;
