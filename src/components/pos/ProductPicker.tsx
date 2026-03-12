import React, { useEffect, useState } from 'react';
import { Search, Package, Plus, AlertCircle } from 'lucide-react';
import { ProductsService } from '../../services/productService';
import type { Product } from '../../types/products';

interface ProductPickerProps {
  onAdd: (product: Product) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ onAdd }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await ProductsService.getProducts({ p_search_term: search, p_limit: 50 });
    if (error) setError(error);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchProducts(); }}
          />
        </div>
        <button
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
          onClick={fetchProducts}
        >
          Search
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <div 
              key={p.id} 
              className="group bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Package size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{p.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">SKU: {p.sku || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-gray-50">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${p.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-semibold text-gray-500">Stock: {p.stock_quantity}</span>
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    <span className="text-sm font-normal mr-0.5 text-gray-500">₱</span>
                    {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onAdd(p)}
                  disabled={p.stock_quantity <= 0}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPicker;
