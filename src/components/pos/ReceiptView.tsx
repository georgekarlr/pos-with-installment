import React from 'react';
import type { Customer } from '../../types/customer';
import type { CustomScheduleItemInput, SaleType } from '../../types/sales';
import type { CartItem } from '../../pages/POSWizard';

interface ReceiptViewProps {
  orderId: number;
  status: string;
  customer: Customer | null;
  cart: CartItem[];
  saleType: SaleType;
  downPayment: number;
  schedule: CustomScheduleItemInput[];
  total: number;
  interestRate?: number;
}

const ReceiptView: React.FC<ReceiptViewProps> = ({ orderId, status, customer, cart, saleType, downPayment, schedule, total, interestRate = 0 }) => {
  const principalFinanced = React.useMemo(() => {
    if (saleType === 'pure_installment') return Math.max(total, 0);
    if (saleType === 'installment_with_down') return Math.max(total - (downPayment || 0), 0);
    return 0;
  }, [saleType, total, downPayment]);

  const interestAmount = React.useMemo(() => {
    if (saleType === 'full_payment') return 0;
    const amt = (principalFinanced * (interestRate || 0)) / 100;
    return Math.round(amt * 100) / 100;
  }, [principalFinanced, interestRate, saleType]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white print:w-full print:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Receipt</h3>
          <div className="text-sm text-gray-600">Order #{orderId} • {status}</div>
        </div>
        <button
          className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-black print:hidden"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-600">Customer</div>
          <div className="font-medium text-gray-900">{customer?.full_name ?? '-'}</div>
          {customer?.phone && <div className="text-sm text-gray-600">{customer.phone}</div>}
          {customer?.email && <div className="text-sm text-gray-600">{customer.email}</div>}
        </div>
        <div className="text-sm">
          <div className="flex justify-between"><span>Sale Type</span><span className="font-medium">
            {saleType === 'full_payment' && 'Full Payment'}
            {saleType === 'installment_with_down' && 'Installment + Down'}
            {saleType === 'pure_installment' && 'Pure Installment'}
          </span></div>
          {saleType === 'installment_with_down' && (
            <div className="flex justify-between"><span>Down Payment</span><span className="font-medium">{'\u20b1'+(downPayment || 0).toFixed(2)}</span></div>
          )}
          <div className="flex justify-between font-semibold mt-2"><span>Cart Total</span><span>{'\u20b1' + total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium text-gray-900">Items</h4>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border-b">Product</th>
                <th className="text-right px-3 py-2 border-b">Price</th>
                <th className="text-right px-3 py-2 border-b">Qty</th>
                <th className="text-right px-3 py-2 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((ci) => (
                <tr key={ci.product.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{ci.product.name}</td>
                  <td className="px-3 py-2 border-b text-right">{'\u20b1' + ci.product.price.toFixed(2)}</td>
                  <td className="px-3 py-2 border-b text-right">{ci.quantity}</td>
                  <td className="px-3 py-2 border-b text-right">{ '\u20b1' + (ci.product.price * ci.quantity).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="px-3 py-2 border-t font-semibold" colSpan={3}>Subtotal</td>
                <td className="px-3 py-2 border-t text-right font-semibold">{'\u20b1'+ total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {(saleType === 'installment_with_down' || saleType === 'pure_installment') && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900">Installment Summary</h4>
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between"><span>Principal Financed</span><span className="font-medium">{'\u20b1' + principalFinanced.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Interest Rate</span><span className="font-medium">{(interestRate || 0).toFixed(2)}%</span></div>
            <div className="flex justify-between"><span>Interest Amount</span><span className="font-medium">{'\u20b1' + interestAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Grand Total</span><span>{'\u20b1' + (principalFinanced + interestAmount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total on Schedule</span><span className="font-medium">{'\u20b1' + schedule.reduce((s, it) => s + it.amount, 0).toFixed(2)}</span></div>
            {saleType === 'installment_with_down' && (
              <div className="flex justify-between"><span>Final Total (Down + Schedule)</span><span className="font-semibold">{'\u20b1' + ((downPayment || 0) + schedule.reduce((s, it) => s + it.amount, 0)).toFixed(2)}</span></div>
            )}
          </div>
        </div>
      )}

      {(saleType === 'installment_with_down' || saleType === 'pure_installment') && schedule.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900">Installment Schedule</h4>
          <div className="mt-2 overflow-x-auto">
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
                    <td className="px-3 py-2 border-b text-right">{'\u20b1' + it.amount.toFixed(2)}</td>
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
        </div>
      )}
    </div>
  );
};

export default ReceiptView;
