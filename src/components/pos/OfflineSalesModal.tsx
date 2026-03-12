import React from 'react';
import Modal from '../ui/Modal';
import { OfflineSale } from '../../services/offlineSyncService';

interface OfflineSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesList: (OfflineSale & { key: number })[];
}

const OfflineSalesModal: React.FC<OfflineSalesModalProps> = ({ isOpen, onClose, salesList }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pending Offline Sales"
    >
      <div className="space-y-4 max-h-96 overflow-y-auto p-1">
        {salesList.length === 0 ? (
          <p className="text-gray-500 text-sm">No offline sales pending.</p>
        ) : (
          salesList.map((sale) => {
            const custName = sale.metadata?.customerName || (
              sale.type === 'existing_customer'
                ? `Customer ID: ${sale.params.p_customer_id}`
                : ('p_customer_name' in sale.params ? sale.params.p_customer_name : 'New Customer')
            );
              
            const items = sale.params.p_items || [];
            const itemTotal = items.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0);

            const totalWithInterest = sale.metadata?.totalWithInterest ?? sale.params.p_total_with_interest;
            const downPayment = sale.metadata?.downPayment ?? sale.params.p_payment?.amount;
            const interestRate = sale.metadata?.interestRate ?? sale.params.p_interest_rate;
            const financedAmount = sale.metadata?.financedAmount ?? sale.params.p_total_financed;

            return (
              <div key={sale.key} className="border p-3 rounded bg-white shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{custName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 block">
                      Total: ${totalWithInterest !== undefined && totalWithInterest !== null ? Number(totalWithInterest).toFixed(2) : Number(itemTotal).toFixed(2)}
                    </span>
                    {downPayment !== undefined && downPayment !== null && Number(downPayment) > 0 ? (
                      <span className="text-xs text-green-600 block">
                        Down Payment: ${Number(downPayment).toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Items: {sale.metadata?.items && sale.metadata.items.length > 0 
                    ? sale.metadata.items.map(c => `${c.quantity}x ${c.name} ($${Number(c.price).toFixed(2)})`).join(', ') 
                    : items.map(c => `${c.quantity}x (ID: ${c.product_id})`).join(', ')}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium capitalize">
                    {(sale.params.p_sale_type || '').replace(/_/g, ' ')}
                  </span>
                  {interestRate !== undefined && interestRate !== null && Number(interestRate) > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      Interest: {interestRate}%
                    </span>
                  )}
                  {financedAmount !== undefined && financedAmount !== null && Number(financedAmount) > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                      Financed: ${Number(financedAmount).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default OfflineSalesModal;
