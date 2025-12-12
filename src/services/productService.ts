// services/ProductsService.ts
import { supabase } from '../lib/supabase';
import type {
    Product,
    ProductHistory,
    GetProductsParams,
    CreateProductParams,
    UpdateProductParams,
    AdjustStockParams,
    ServiceResponse
} from '../types/products';
import {getCurrentDate} from "../utils/schedule.ts";

export class ProductsService {

    static async getProducts(params: GetProductsParams = {}): Promise<ServiceResponse<Product[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_products', {
                p_search_term: params.p_search_term || '',
                p_limit: params.p_limit || 50,
                p_offset: params.p_offset || 0
            });

            if (error) return { data: null, error: error.message };
            return { data: data as Product[], error: null };
        } catch (err: any) {
            return { data: null, error: err.message || 'An unexpected error occurred' };
        }
    }

    static async createProduct(params: CreateProductParams): Promise<ServiceResponse<Product>> {
        try {
            // Validation to prevent "function not found" errors due to missing params
            if (!params.p_account_id) throw new Error("Account ID is required");
            if (!params.p_name) throw new Error("Product Name is required");

            const { data, error } = await supabase.rpc('ins_create_product', {
                p_account_id: params.p_account_id,
                p_name: params.p_name,
                p_sku: params.p_sku || '',
                p_price: params.p_price || 0,
                p_cost_price: params.p_cost_price || 0,
                p_stock_quantity: params.p_stock_quantity || 0,
                p_created_at: getCurrentDate()
            });

            if (error) return { data: null, error: error.message };
            if (!data || data.length === 0) return { data: null, error: 'Failed to create product.' };

            return { data: data[0] as Product, error: null };
        } catch (err: any) {
            return { data: null, error: err.message || 'An unexpected error occurred' };
        }
    }

    static async updateProduct(params: UpdateProductParams): Promise<ServiceResponse<Product>> {
        try {
            if (!params.p_product_id) throw new Error("Product ID is required for update");

            const { data, error } = await supabase.rpc('ins_update_product', {
                p_product_id: params.p_product_id,
                p_name: params.p_name,
                p_sku: params.p_sku,
                p_price: params.p_price,
                p_cost_price: params.p_cost_price
            });

            if (error) return { data: null, error: error.message };
            return { data: data ? (data[0] as Product) : null, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }

    static async adjustStock(params: AdjustStockParams): Promise<ServiceResponse<Product>> {
        try {
            if (!params.p_product_id) throw new Error("Product ID is required");

            const { data, error } = await supabase.rpc('ins_adjust_product_stock', {
                p_product_id: params.p_product_id,
                p_quantity_change: params.p_quantity_change,
                p_reason: params.p_reason || ''
            });

            if (error) return { data: null, error: error.message };
            return { data: data ? (data[0] as Product) : null, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }

    static async deleteProduct(productId: number): Promise<ServiceResponse<Product>> {
        try {
            if (!productId) throw new Error("Product ID is required");

            const { data, error } = await supabase.rpc('ins_delete_product', {
                p_product_id: productId
            });

            if (error) return { data: null, error: error.message };
            return { data: data ? (data[0] as Product) : null, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }

    static async getProductHistory(productId: number): Promise<ServiceResponse<ProductHistory[]>> {
        try {
            // Fix: Ensure we don't call RPC with undefined which causes the "without parameters" error
            if (!productId) return { data: [], error: 'Invalid Product ID' };

            const { data, error } = await supabase.rpc('ins_get_product_history', {
                p_product_id: productId
            });

            if (error) return { data: null, error: error.message };
            return { data: data as ProductHistory[], error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }
}