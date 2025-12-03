import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Stepper from '../components/pos/Stepper';
import CustomerSelector from '../components/pos/CustomerSelector';
import ProductPicker from '../components/pos/ProductPicker';
import CartSummary from '../components/pos/CartSummary';
import PaymentPlanBuilder from '../components/pos/PaymentPlanBuilder';
import PaymentProcessor from '../components/pos/PaymentProcessor';
import ReceiptView from '../components/pos/ReceiptView';
import Modal from '../components/ui/Modal';
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
  };
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const itemsTotal = useMemo(() => {
    return cart.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  }, [cart]);

  const remainingForSchedule = useMemo(() => {
    if (saleType === 'full_payment') return 0;
    if (saleType === 'installment_with_down') {
      const base = Math.max(itemsTotal - (downPayment || 0), 0);
      return Number(base.toFixed(2));
    }
    // pure_installment
    return Number(itemsTotal.toFixed(2));
  }, [itemsTotal, downPayment, saleType]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-500">Process sales with optional installments and down payments.</p>
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
                  });
                  setReceiptOpen(true);
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
          />
        )}
      </Modal>
    </div>
  );
};

export default POSWizard;
