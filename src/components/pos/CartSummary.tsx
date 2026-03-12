import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import type { CartItem } from '../../pages/POSWizard';

interface CartSummaryProps {
  cart: CartItem[];
  onChangeQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart, onChangeQty, onRemove }) => {
  const subtotal = cart.reduce((s, ci) => s + ci.product.price * ci.quantity, 0);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Current Cart</h3>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {cart.reduce((s, ci) => s + ci.quantity, 0)} Items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 opacity-60">
            <ShoppingCart size={48} strokeWidth={1} />
            <p className="text-sm font-medium">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((ci) => (
              <div key={ci.product.id} className="group flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{ci.product.name}</div>
                    <div className="text-xs font-medium text-gray-500">₱{ci.product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} each</div>
                  </div>
                  <button
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => onRemove(ci.product.id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between gap-4 mt-1">
                  <div className="flex items-center border border-gray-200 rounded-lg p-1">
                    <button 
                      className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                      onClick={() => onChangeQty(ci.product.id, ci.quantity - 1)}
                      disabled={ci.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      className="w-10 text-center text-sm font-bold border-0 focus:ring-0 p-0"
                      value={ci.quantity}
                      onChange={(e) => onChangeQty(ci.product.id, parseInt(e.target.value || '1', 10))}
                    />
                    <button 
                      className="p-1 text-gray-500 hover:text-blue-600"
                      onClick={() => onChangeQty(ci.product.id, ci.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    ₱{(ci.product.price * ci.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
          <span className="text-sm font-bold text-gray-900">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
          <span className="text-xl font-black text-blue-600">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
