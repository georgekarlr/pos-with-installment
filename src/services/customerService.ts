// services/CustomersService.ts
import { supabase } from '../lib/supabase';
import type {
    Customer,
    GetCustomersParams,
    CreateCustomerParams,
    UpdateCustomerParams
} from '../types/customer.ts';


export class CustomersService {

    /**
     * Search and retrieve customers with pagination.
     */
    static async getCustomers(params: GetCustomersParams = {}): Promise<{ data: Customer[]; error: string | null }> {
        if (!navigator.onLine) {
            const cached = localStorage.getItem('ins_customers_cache');
            if (cached) {
                let customers: Customer[] = JSON.parse(cached);
                const term = (params.p_search_term || '').toLowerCase();
                if (term) {
                    customers = customers.filter(c => 
                        c.full_name.toLowerCase().includes(term) || 
                        (c.phone || '').toLowerCase().includes(term) || 
                        (c.email || '').toLowerCase().includes(term)
                    );
                }
                const offset = params.p_offset || 0;
                const limit = params.p_limit || 20;
                customers = customers.slice(offset, offset + limit);
                return { data: customers, error: null };
            }
            return { data: [], error: 'Offline and no cached data available.' };
        }

        try {
            const { data, error } = await supabase
                .rpc('ins_get_customers', {
                    p_search_term: params.p_search_term ?? '',
                    p_limit: params.p_limit ?? 20,
                    p_offset: params.p_offset ?? 0
                });

            if (error) return { data: [], error: error.message };

            if (data && data.length > 0) {
                try {
                    const cached = localStorage.getItem('ins_customers_cache');
                    const cacheList: Customer[] = cached ? JSON.parse(cached) : [];
                    const newItems = data as Customer[];
                    const cacheMap = new Map(cacheList.map(c => [c.id, c]));
                    newItems.forEach(c => cacheMap.set(c.id, c));
                    localStorage.setItem('ins_customers_cache', JSON.stringify(Array.from(cacheMap.values())));
                } catch (e) {
                    console.error('Error caching customers', e);
                }
            }

            return { data: (data as Customer[]) ?? [], error: null };
        } catch (e: any) {
            const cached = localStorage.getItem('ins_customers_cache');
            if (cached) {
                let customers: Customer[] = JSON.parse(cached);
                const term = (params.p_search_term || '').toLowerCase();
                if (term) {
                    customers = customers.filter(c => 
                        c.full_name.toLowerCase().includes(term) || 
                        (c.phone || '').toLowerCase().includes(term) || 
                        (c.email || '').toLowerCase().includes(term)
                    );
                }
                const offset = params.p_offset || 0;
                const limit = params.p_limit || 20;
                customers = customers.slice(offset, offset + limit);
                return { data: customers, error: null };
            }
            return { data: [], error: e?.message || 'Failed to fetch customers' };
        }
    }

    /**
     * Create a new customer.
     */
    static async createCustomer(customer: Omit<CreateCustomerParams, 'p_created_at'>): Promise<{ data: Customer | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .rpc('ins_create_customer', {
                    ...customer,
                    p_created_at: new Date().toISOString()
                });

            if (error) return { data: null, error: error.message };

            // Postgres functions returning TABLE return an array of rows, we take the first one
            const row = (data as Customer[])?.[0] || null;
            return { data: row, error: null };
        } catch (e: any) {
            return { data: null, error: e?.message || 'Failed to create customer' };
        }
    }

    /**
     * Update an existing customer.
     */
    static async updateCustomer(params: UpdateCustomerParams): Promise<{ data: Customer | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .rpc('ins_update_customer', params);

            if (error) return { data: null, error: error.message };

            const row = (data as Customer[])?.[0] || null;
            return { data: row, error: null };
        } catch (e: any) {
            return { data: null, error: e?.message || 'Failed to update customer' };
        }
    }

    /**
     * Delete a customer.
     */
    static async deleteCustomer(customerId: number): Promise<{ data: Customer | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .rpc('ins_delete_customer', { p_customer_id: customerId });

            if (error) return { data: null, error: error.message };

            // Returns the deleted record if successful
            const row = (data as Customer[])?.[0] || null;
            return { data: row, error: null };
        } catch (e: any) {
            return { data: null, error: e?.message || 'Failed to delete customer' };
        }
    }
}