import  React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OfflineSyncService, OfflineSale } from '../services/offlineSyncService';
import Stepper from '../components/pos/Stepper';
import CustomerSelector from '../components/pos/CustomerSelector';
import ProductPicker from '../components/pos/ProductPicker';
import CartSummary from '../components/pos/CartSummary';
import PaymentPlanBuilder from '../components/pos/PaymentPlanBuilder';
import PaymentProcessor from '../components/pos/PaymentProcessor';
import ReceiptView from '../components/pos/ReceiptView';
import OfflineSalesModal from '../components/pos/OfflineSalesModal';
import Modal from '../components/ui/Modal';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { Customer } from '../types/customer';
import type { Product } from '../types/products';
import type { CustomScheduleItemInput, SaleType } from '../types/sales';

export type CartItem = {
  product: Product;
  quantity: number;
};

const POSWizard: React.FC = () => {
  const { persona } = useAuth();
  const accountId = persona?.id ?? null;
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [saleType, setSaleType] = useState<SaleType>('full_payment');
  const [downPayment, setDownPayment] = useState<number>(0);
  const [schedule, setSchedule] = useState<CustomScheduleItemInput[]>([]);
  const [interestRate, setInterestRate] = useState<number>(0);

 /* const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);*/

  type ReceiptData = {
    orderId: number;
    status: string;
    customer: Customer | null;
    cart: CartItem[];
    saleType: SaleType;
    downPayment: number;
    schedule: CustomScheduleItemInput[];
    total: number;
    interestRate?: number;
  };
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [viewOfflineOpen, setViewOfflineOpen] = useState(false);
  const [offlineSalesList, setOfflineSalesList] = useState<(OfflineSale & { key: number })[]>([]);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const fetchCount = () => OfflineSyncService.getOfflineCount().then(setOfflineCount);
    
    fetchCount();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sales-updated', fetchCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sales-updated', fetchCount);
    };
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await OfflineSyncService.syncOfflineSales();
      if (result.success > 0 || result.failed > 0) {
        setSyncResult(result);
      }
    } finally {
      OfflineSyncService.getOfflineCount().then(setOfflineCount);
      setSyncing(false);
    }
  };

  const itemsTotal = useMemo(() => {
    return cart.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  }, [cart]);

  const remainingForSchedule = useMemo(() => {
    if (saleType === 'full_payment') return 0;
    // Principal to finance
    const principal = saleType === 'installment_with_down'
      ? Math.max(itemsTotal - (downPayment || 0), 0)
      : Math.max(itemsTotal, 0);
    const interestAmt = (principal * (interestRate || 0)) / 100;
    const withInterest = principal + interestAmt;
    return Number(withInterest.toFixed(2));
  }, [itemsTotal, downPayment, saleType, interestRate]);

  const canNextFromStep = (step: number) => {
    if (step === 0) return !!customer;
    if (step === 1) return cart.length > 0;
    if (step === 2) {
      if (saleType === 'full_payment') return true;
      // For installment types, schedule must match required remaining
      const sum = schedule.reduce((s, it) => s + it.amount, 0);
      return Number(sum.toFixed(2)) === remainingForSchedule;
    }
    return true;
  };

  const resetAll = () => {
    setActiveStep(0);
    setCustomer(null);
    setCart([]);
    setSaleType('full_payment');
    setDownPayment(0);
    setSchedule([]);
    // setOrderId(null);
    // setOrderStatus(null);
  };

  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Installment Process</h1>
          <p className="text-gray-500">Process sales with optional installments and down payments.</p>
        </div>
        {(isOffline || offlineCount > 0) && (
          <div className="flex items-center space-x-3">
            {isOffline && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Offline Mode
              </span>
            )}
            {offlineCount > 0 && (
              <>
                <button
                  onClick={async () => {
                    const sales = await OfflineSyncService.getOfflineSales();
                    setOfflineSalesList(sales);
                    setViewOfflineOpen(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  onClick={handleSync}
                  disabled={isOffline || syncing}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : `Sync ${offlineCount} Pending`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <Stepper
        steps={[
          'Select Customer',
          'Select Products',
          'Payment Plan',
          'Process & Receipt',
        ]}
        activeIndex={activeStep}
        onStepClick={(i) => setActiveStep(i)}
      />

      {/* Step content */}
      <div className="mt-6">
        {activeStep === 0 && (
          <CustomerSelector
            selected={customer}
            onSelect={(c) => setCustomer(c)}
          />
        )}

        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductPicker
                onAdd={(p) => {
                  setCart((prev) => {
                    const idx = prev.findIndex((ci) => ci.product.id === p.id);
                    if (idx >= 0) {
                      const copy = [...prev];
                      copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
                      return copy;
                    }
                    return [...prev, { product: p, quantity: 1 }];
                  });
                }}
              />
            </div>
            <div className="lg:col-span-1">
              <CartSummary
                cart={cart}
                onChangeQty={(productId, qty) => {
                  setCart((prev) => prev.map((ci) => ci.product.id === productId ? { ...ci, quantity: Math.max(1, qty) } : ci));
                }}
                onRemove={(productId) => setCart((prev) => prev.filter((ci) => ci.product.id !== productId))}
              />
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <PaymentPlanBuilder
            saleType={saleType}
            setSaleType={setSaleType}
            total={itemsTotal}
            downPayment={downPayment}
            setDownPayment={setDownPayment}
            schedule={schedule}
            setSchedule={setSchedule}
            interestRate={interestRate}
            setInterestRate={setInterestRate}
          />
        )}

        {activeStep === 3 && (
          <PaymentProcessor
            accountId={accountId}
            customer={customer}
            cart={cart}
            saleType={saleType}
            downPayment={downPayment}
            schedule={schedule}
            total={itemsTotal}
            interestRate={interestRate}
            onResult={(res) => {
              if (res?.new_order_id) {
                  // Snapshot current state for receipt
                  setReceiptData({
                      orderId: res.new_order_id,
                      status: res.status || 'success',
                      customer,
                      cart,
                      saleType,
                      downPayment,
                      schedule,
                      total: itemsTotal,
                      interestRate,
                  });
                  setReceiptOpen(true);
                  // Update offline count if we saved offline
                  if (res.status === 'offline') {
                    setOfflineCount(OfflineSyncService.getOfflineCount());
                  }
                  // Reset the wizard process
                  resetAll();
              }
              // else {
              //   // setOrderId(null);
              //   // setOrderStatus(null);
              // }
            }}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
        <button
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          disabled={activeStep === 0}
        >
          Back
        </button>
        <div className="flex gap-3 sm:gap-4">
          <button
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
            onClick={resetAll}
          >
            Reset
          </button>
          {activeStep < 3 ? (
            <button
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              onClick={() => setActiveStep((s) => Math.min(3, s + 1))}
              disabled={!canNextFromStep(activeStep)}
            >
              Next
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* Offline Sales Modal */}
      <OfflineSalesModal
        isOpen={viewOfflineOpen}
        onClose={() => setViewOfflineOpen(false)}
        salesList={offlineSalesList}
      />

      {/* Receipt Modal after success */}
      <Modal
        isOpen={receiptOpen && !!receiptData}
        onClose={() => { setReceiptOpen(false); navigate('/dashboard'); }}
        title="Receipt"
      >
        {receiptData && (
          <ReceiptView
            orderId={receiptData.orderId}
            status={receiptData.status}
            customer={receiptData.customer}
            cart={receiptData.cart}
            saleType={receiptData.saleType}
            downPayment={receiptData.downPayment}
            schedule={receiptData.schedule}
            total={receiptData.total}
            interestRate={receiptData.interestRate}
          />
        )}
      </Modal>

      {/* Sync Result Modal */}
      <Modal
        isOpen={!!syncResult}
        onClose={() => setSyncResult(null)}
        title="Sync Results"
      >
        {syncResult && (
          <div className="p-4 space-y-4 text-center">
            {syncResult.failed === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">Sync Successful</h3>
                <p className="text-sm text-gray-500">
                  Successfully synced {syncResult.success} {syncResult.success === 1 ? 'sale' : 'sales'}.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-12 h-12 text-amber-500" />
                <h3 className="text-lg font-medium text-gray-900">Sync Completed with Errors</h3>
                <p className="text-sm text-gray-500">
                  Successfully synced {syncResult.success} {syncResult.success === 1 ? 'sale' : 'sales'}.<br/>
                  Failed to sync {syncResult.failed} {syncResult.failed === 1 ? 'sale' : 'sales'}.
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setSyncResult(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default POSWizard;
