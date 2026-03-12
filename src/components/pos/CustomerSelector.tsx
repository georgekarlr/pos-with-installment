import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Users, CheckCircle2, Phone, Mail, IdCard, MapPin, CreditCard } from 'lucide-react';
import type { Customer } from '../../types/customer';
import { CustomersService } from '../../services/customerService';

interface CustomerSelectorProps {
  selected: Customer | null;
  onSelect: (c: Customer) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ selected, onSelect }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    full_name: '',
    phone: '',
    email: '',
    identity_card_no: '',
    address: '',
    credit_limit: 0
  });

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await CustomersService.getCustomers({ p_search_term: search, p_limit: 24 });
    if (error) setError(error);
    else setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedId = selected?.id ?? null;

  const handleCreateNew = () => {
    if (!newCustomer.full_name) {
      setError('Name is required for a new customer.');
      return;
    }
    const mockCustomer: Customer = {
      id: 0, // Using 0 to represent a new, unsaved customer
      account_id: 0,
      user_id: '',
      full_name: newCustomer.full_name || '',
      phone: newCustomer.phone || null,
      email: newCustomer.email || null,
      identity_card_no: newCustomer.identity_card_no || null,
      address: newCustomer.address || null,
      credit_limit: newCustomer.credit_limit || 0,
      created_at: new Date().toISOString()
    };
    onSelect(mockCustomer);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-1 bg-gray-100 rounded-lg w-fit mx-auto sm:mx-0">
        <button
          className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-all ${
            !isNewCustomer 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setIsNewCustomer(false)}
        >
          <Users size={18} />
          Search Existing
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-all ${
            isNewCustomer 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => { setIsNewCustomer(true); setError(null); }}
        >
          <UserPlus size={18} />
          New Customer
        </button>
      </div>

      {!isNewCustomer ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="Search customers by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchCustomers(); }}
              />
            </div>
            <button
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              onClick={fetchCustomers}
            >
              Search
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No customers found matching your search.
              </div>
            ) : customers.map((c) => (
              <div
                key={c.id}
                className={`
                  relative group border-2 rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all
                  ${selectedId === c.id 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-md'
                  }
                `}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c); } }}
              >
                {selectedId === c.id && (
                  <div className="absolute top-3 right-3 text-blue-600">
                    <CheckCircle2 size={20} fill="currentColor" className="text-blue-600 bg-white rounded-full" />
                  </div>
                )}
                
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.full_name}</div>
                  <div className="mt-2 space-y-1">
                    {c.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={14} className="text-gray-400" />
                        {c.phone}
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedId === c.id && (
                  <div className="mt-auto pt-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Active Selection</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden max-w-2xl">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            <h3 className="font-bold text-gray-900">New Customer Registration</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <input
                    className="w-full pl-3 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="Enter full name"
                    value={newCustomer.full_name || ''}
                    onChange={(e) => setNewCustomer({...newCustomer, full_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="e.g. 09123456789"
                    value={newCustomer.phone || ''}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="customer@example.com"
                    value={newCustomer.email || ''}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Identity Card No.</label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="ID Number"
                    value={newCustomer.identity_card_no || ''}
                    onChange={(e) => setNewCustomer({...newCustomer, identity_card_no: e.target.value})}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Billing Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="Street, City, Province"
                    value={newCustomer.address || ''}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credit Limit</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900"
                    placeholder="0.00"
                    value={newCustomer.credit_limit || 0}
                    onChange={(e) => setNewCustomer({...newCustomer, credit_limit: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg transform active:scale-[0.98]"
                onClick={handleCreateNew}
              >
                <CheckCircle2 size={20} />
                Confirm & Use Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && !isNewCustomer && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-sm">
              {selected.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider leading-none mb-1">Current selection</p>
              <p className="text-sm font-bold text-gray-900">{selected.full_name}</p>
            </div>
          </div>
          <CheckCircle2 size={20} className="text-green-500" />
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
