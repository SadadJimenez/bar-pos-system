import { supabase } from '../lib/supabase';

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'AMLicoresSalt2026!'); // Salted hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export interface User {
  id?: number;
  username: string;
  password?: string;
  role: 'admin' | 'cashier';
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  category: 'Cervezas' | 'Licores' | 'Cocteles' | 'Bebidas sin alcohol' | 'Snacks' | string;
  priceBottle: number;
  priceShot?: number;
  stock: number;
  stockMin: number;
  shotsPerBottle?: number;
  trackShots?: boolean;
  image?: string;
}

export interface SaleItem {
  productId: number;
  productName: string;
  type: 'bottle' | 'shot';
  price: number;
  quantity: number;
}

export interface Sale {
  id?: number;
  timestamp: Date | string;
  userId: number;
  userName: string;
  total: number;
  discount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  items: SaleItem[];
  splitCount: number;
}

export interface CashControl {
  id?: number;
  type: 'open' | 'close' | 'expense' | 'income';
  timestamp: Date | string;
  userId: number;
  userName?: string;
  amount: number;
  notes?: string;
}

export interface BarTable {
  id?: number;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: number;
}

export interface Order {
  id?: number;
  tableId: number;
  items: SaleItem[];
  status: 'pending' | 'served' | 'paid';
  timestamp: Date | string;
  total: number;
}

export interface Waste {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
  timestamp: Date | string;
}

// Wrapper to help migrating from Dexie. The components have been updated to use this.
export const db = {
  users: {
    toArray: async () => {
      const { data } = await supabase.from('users').select('*').order('id');
      return data || [];
    },
    add: async (user: User) => {
      const { data, error } = await supabase.from('users').insert(user).select().single();
      if (error) throw error;
      return data.id;
    },
    update: async (id: number, user: Partial<User>) => {
      const { error } = await supabase.from('users').update(user).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
    where: (field: string) => ({
      equals: (value: any) => ({
        first: async () => {
          const { data, error } = await supabase.from('users').select('*').eq(field, value).limit(1);
          if (error) {
            console.error('Supabase query error:', error);
            return undefined;
          }
          return data?.[0];
        }
      })
    })
  },
  products: {
    toArray: async () => {
      const { data } = await supabase.from('products').select('*').order('name');
      return data || [];
    },
    add: async (product: Product) => {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data.id;
    },
    update: async (id: number, product: Partial<Product>) => {
      const { error } = await supabase.from('products').update(product).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    }
  },
  barTables: {
    toArray: async () => {
      const { data } = await supabase.from('barTables').select('*').order('number');
      return data || [];
    },
    get: async (id: number) => {
      const { data } = await supabase.from('barTables').select('*').eq('id', id).single();
      return data;
    },
    add: async (table: BarTable) => {
      const { data, error } = await supabase.from('barTables').insert(table).select().single();
      if (error) throw error;
      return data.id;
    },
    update: async (id: number, table: Partial<BarTable>) => {
      const { error } = await supabase.from('barTables').update(table).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: number) => {
      // Eliminamos primero las órdenes vinculadas a esta cuenta (mesa) para evitar error de llave foránea
      await supabase.from('orders').delete().eq('tableId', id);
      const { error } = await supabase.from('barTables').delete().eq('id', id);
      if (error) throw error;
    }
  },
  orders: {
    add: async (order: Order) => {
      // guardamos los items en tabla relacional o como JSON asumiendo que el usuario ejecute un alter table
      const itemsString = JSON.stringify(order.items);
      const insertData = { ...order, items: itemsString } as any;
      const { data, error } = await supabase.from('orders').insert(insertData).select().single();
      if (error) throw error;
      return data.id;
    },
    update: async (id: number, order: Partial<Order>) => {
      const updateData = { ...order } as any;
      if (order.items) updateData.items = JSON.stringify(order.items);
      const { error } = await supabase.from('orders').update(updateData).eq('id', id);
      if (error) throw error;
    },
    where: (field: string) => ({
      equals: (value: any) => ({
        and: (fn: (o: Order) => boolean) => ({
          first: async () => {
            const { data } = await supabase.from('orders').select('*').eq(field, value).order('timestamp', { ascending: false });
            if (!data) return undefined;
            // Parse items since they might be stored as string or JSONB
            const parsed = data.map(d => ({
              ...d,
              items: typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || [])
            }));
            return parsed.find(fn);
          }
        })
      })
    })
  },
  sales: {
    toArray: async () => {
      const { data } = await supabase.from('sales').select('*').order('timestamp', { ascending: false });
      if (!data) return [];
      return data.map(d => ({
        ...d,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || [])
      }));
    },
    add: async (sale: Sale) => {
      const insertData = { ...sale, items: JSON.stringify(sale.items) } as any;
      const { error } = await supabase.from('sales').insert(insertData);
      if (error) throw error;
    }
  },
  cashControl: {
    toArray: async () => {
      const { data } = await supabase.from('cashControl').select('*').order('timestamp', { ascending: false });
      return data || [];
    },
    add: async (cc: CashControl) => {
      const { error } = await supabase.from('cashControl').insert(cc);
      if (error) throw error;
    }
  },
  waste: {
    toArray: async () => {
      const { data } = await supabase.from('waste').select('*').order('timestamp', { ascending: false });
      return data || [];
    },
    add: async (waste: Waste) => {
      const { error } = await supabase.from('waste').insert(waste);
      if (error) throw error;
    }
  }
};

export const seedDatabase = async () => {
  // Ya no hace nada en el cliente, todo está en Supabase
  console.log("Supabase connected");
};
