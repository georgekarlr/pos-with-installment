import { ProcessSaleParams, ProcessSaleWithNewCustomerParams } from '../types/sales';
import { SalesService } from './salesService';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'ins_offline_db';
const STORE_NAME = 'offline_sales';
const DB_VERSION = 1;

export type OfflineSaleMetadata = {
  totalWithInterest?: number;
  downPayment?: number;
  interestRate?: number;
  financedAmount?: number;
  customerName?: string;
  items?: { name: string; price: number; quantity: number }[];
};

export type OfflineSale = 
  | { type: 'existing_customer'; params: ProcessSaleParams; timestamp: number; metadata?: OfflineSaleMetadata }
  | { type: 'new_customer'; params: ProcessSaleWithNewCustomerParams; timestamp: number; metadata?: OfflineSaleMetadata };

interface POSDB extends DBSchema {
  offline_sales: {
    key: number; // auto-incrementing key
    value: OfflineSale;
  };
}

let dbPromise: Promise<IDBPDatabase<POSDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<POSDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export const OfflineSyncService = {
  async saveOfflineSale(sale: OfflineSale): Promise<void> {
    const db = await getDB();
    await db.add(STORE_NAME, sale);
    
    // Dispatch a custom event to notify listeners (e.g., POSWizard) that the count has changed
    window.dispatchEvent(new Event('offline-sales-updated'));
  },

  async getOfflineSales(): Promise<(OfflineSale & { key: number })[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    let cursor = await store.openCursor();
    const sales = [];
    while (cursor) {
      sales.push({ ...cursor.value, key: cursor.key as number });
      cursor = await cursor.continue();
    }
    return sales;
  },

  async clearOfflineSales(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
    window.dispatchEvent(new Event('offline-sales-updated'));
  },

  async getOfflineCount(): Promise<number> {
    const db = await getDB();
    return db.count(STORE_NAME);
  },

  async syncOfflineSales(): Promise<{ success: number; failed: number }> {
    const sales = await this.getOfflineSales();
    if (sales.length === 0) return { success: 0, failed: 0 };

    let successCount = 0;
    const db = await getDB();

    for (const sale of sales) {
      try {
        let res;
        if (sale.type === 'existing_customer') {
          res = await SalesService.processSale(sale.params);
        } else {
          res = await SalesService.processSaleWithNewCustomer(sale.params);
        }

        if (res.error) {
          // Keep it in db, maybe log error
        } else {
          successCount++;
          // Remove from db upon success
          const tx = db.transaction(STORE_NAME, 'readwrite');
          await tx.objectStore(STORE_NAME).delete(sale.key);
          await tx.done;
        }
      } catch (err) {
        // Keep it in DB
      }
    }
    
    window.dispatchEvent(new Event('offline-sales-updated'));
    return { success: successCount, failed: sales.length - successCount };
  }
};
