import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';
import { Customer, CustomerStatus, CustomerTimelineEvent } from '../types';
import { CustomerRow, mapCustomerRowToCustomer } from '../types/database';
import { parseSupabaseError } from '../lib/errors';
import { loadCustomers, saveCustomers, addActivityLog } from '../lib/storage';

export interface CustomerFilterOptions {
  search?: string;
  status?: string;
  industry?: string;
  tag?: string;
  favoriteOnly?: boolean;
  archivedOnly?: boolean;
  sortBy?: 'newest' | 'oldest' | 'a-z' | 'last_updated' | 'deal_desc';
  page?: number;
  pageSize?: number;
}

export interface CustomerQueryResult {
  customers: Customer[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export class CustomerService {
  /**
   * Fetch customers with comprehensive filtering, sorting, and pagination
   */
  static async getCustomers(options: CustomerFilterOptions = {}): Promise<CustomerQueryResult> {
    let list = loadCustomers();

    // 1. Filtering logic
    if (options.archivedOnly) {
      list = list.filter((c) => c.archived === true);
    } else {
      list = list.filter((c) => !c.archived);
    }

    if (options.favoriteOnly) {
      list = list.filter((c) => c.favorite === true);
    }

    if (options.status && options.status !== 'all') {
      list = list.filter((c) => c.status === options.status);
    }

    if (options.industry && options.industry !== 'all') {
      list = list.filter((c) => c.industry === options.industry);
    }

    if (options.tag) {
      const targetTag = options.tag.toLowerCase();
      list = list.filter((c) => c.tags.some((t) => t.toLowerCase() === targetTag));
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q))
      );
    }

    // 2. Sorting logic
    const sortBy = options.sortBy || 'newest';
    list.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'a-z':
          return a.name.localeCompare(b.name);
        case 'last_updated':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'deal_desc':
          return (b.dealValue || 0) - (a.dealValue || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const totalCount = list.length;
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // Apply pagination slice
    const startIndex = (page - 1) * pageSize;
    const paginatedCustomers = list.slice(startIndex, startIndex + pageSize);

    // If Supabase is configured, fetch from remote database
    if (isSupabaseConfigured) {
      try {
        const user = await getCurrentUser();
        if (user) {
          let query = supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('owner_id', user.id);

          if (options.archivedOnly) {
            query = query.eq('archived', true);
          } else {
            query = query.or('archived.eq.false,archived.is.null');
          }

          if (options.favoriteOnly) {
            query = query.eq('favorite', true);
          }

          if (options.status && options.status !== 'all') {
            query = query.eq('status', options.status);
          }

          if (options.industry && options.industry !== 'all') {
            query = query.eq('industry', options.industry);
          }

          if (options.search && options.search.trim()) {
            const q = `%${options.search.trim()}%`;
            query = query.or(`name.ilike.${q},email.ilike.${q},company.ilike.${q},phone.ilike.${q}`);
          }

          // Order by
          if (sortBy === 'oldest') {
            query = query.order('created_at', { ascending: true });
          } else if (sortBy === 'a-z') {
            query = query.order('name', { ascending: true });
          } else if (sortBy === 'last_updated') {
            query = query.order('updated_at', { ascending: false });
          } else if (sortBy === 'deal_desc') {
            query = query.order('deal_value', { ascending: false });
          } else {
            query = query.order('created_at', { ascending: false });
          }

          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);

          const { data, count, error } = await query;

          if (!error && data) {
            const remoteCustomers = (data as CustomerRow[]).map(mapCustomerRowToCustomer);
            return {
              customers: remoteCustomers,
              totalCount: count !== null ? count : totalCount,
              page,
              totalPages: count !== null ? Math.ceil(count / pageSize) || 1 : totalPages,
            };
          }
        }
      } catch (err) {
        console.warn('CustomerService.getCustomers remote query fallback:', err);
      }
    }

    return {
      customers: paginatedCustomers,
      totalCount,
      page,
      totalPages,
    };
  }

  /**
   * Get single customer by ID
   */
  static async getCustomerById(id: string): Promise<Customer | null> {
    const list = loadCustomers();
    const local = list.find((c) => c.id === id);
    if (local) return local;

    if (isSupabaseConfigured) {
      try {
        const user = await getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .eq('owner_id', user.id)
            .single();

          if (!error && data) {
            return mapCustomerRowToCustomer(data as CustomerRow);
          }
        }
      } catch (err) {
        console.error('CustomerService.getCustomerById error:', err);
      }
    }
    return null;
  }

  /**
   * Create a new customer record
   */
  static async createCustomer(
    input: Omit<Customer, 'id' | 'createdAt' | 'lastContactDate' | 'avatarColor'>
  ): Promise<Customer> {
    const newId = `cust_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newCustomer: Customer = {
      ...input,
      id: newId,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastContactDate: nowIso.split('T')[0],
      avatarColor: 'bg-emerald-500',
      favorite: Boolean(input.favorite),
      archived: Boolean(input.archived),
      timeline: [
        {
          id: `tl_${Date.now()}`,
          customerId: newId,
          eventType: 'created',
          title: 'Customer Record Created',
          description: `Customer account initialized for ${input.company || input.name}`,
          createdAt: nowIso,
          author: input.assignedUser || 'Owner',
        },
      ],
    };

    const currentList = loadCustomers();
    const updatedList = [newCustomer, ...currentList];
    saveCustomers(updatedList);
    addActivityLog('customer', 'Customer Created', `Added ${input.name} (${input.company || 'Client'})`);

    if (!isSupabaseConfigured) return newCustomer;

    try {
      const user = await getCurrentUser();
      if (!user) return newCustomer;

      const { data, error } = await supabase
        .from('customers')
        .insert({
          owner_id: user.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          address: input.address,
          website: input.website,
          industry: input.industry || 'General',
          source: input.source || 'Direct',
          assigned_user: input.assignedUser || 'Owner',
          status: input.status,
          deal_value: input.dealValue || 0,
          notes: input.notes,
          favorite: Boolean(input.favorite),
          archived: Boolean(input.archived),
          tags: input.tags || [],
        })
        .select()
        .single();

      if (error) throw parseSupabaseError(error);

      const created = mapCustomerRowToCustomer(data as CustomerRow);
      const refreshed = updatedList.map((c) => (c.id === newId ? created : c));
      saveCustomers(refreshed);
      return created;
    } catch (err) {
      console.error('CustomerService.createCustomer Supabase error:', err);
      return newCustomer;
    }
  }

  /**
   * Update an existing customer record
   */
  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const currentList = loadCustomers();
    const existing = currentList.find((c) => c.id === id);
    if (!existing) {
      throw new Error(`Customer with ID ${id} not found`);
    }

    const nowIso = new Date().toISOString();
    const updatedLocal: Customer = {
      ...existing,
      ...updates,
      updatedAt: nowIso,
      lastContactDate: nowIso.split('T')[0],
    };

    const newCustomersList = currentList.map((c) => (c.id === id ? updatedLocal : c));
    saveCustomers(newCustomersList);
    addActivityLog('customer', 'Customer Updated', `Updated details for ${updatedLocal.name}`);

    if (!isSupabaseConfigured) return updatedLocal;

    try {
      const user = await getCurrentUser();
      if (!user) return updatedLocal;

      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.website !== undefined) dbUpdates.website = updates.website;
      if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
      if (updates.source !== undefined) dbUpdates.source = updates.source;
      if (updates.assignedUser !== undefined) dbUpdates.assigned_user = updates.assignedUser;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.dealValue !== undefined) dbUpdates.deal_value = updates.dealValue;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
      if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      const { data, error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) throw parseSupabaseError(error);

      return mapCustomerRowToCustomer(data as CustomerRow);
    } catch (err) {
      console.error('CustomerService.updateCustomer Supabase error:', err);
      return updatedLocal;
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(id: string): Promise<Customer> {
    const list = loadCustomers();
    const cust = list.find((c) => c.id === id);
    if (!cust) throw new Error('Customer not found');

    const updated = await this.updateCustomer(id, { favorite: !cust.favorite });
    return updated;
  }

  /**
   * Archive customer
   */
  static async archiveCustomer(id: string): Promise<Customer> {
    return this.updateCustomer(id, { archived: true });
  }

  /**
   * Restore customer
   */
  static async restoreCustomer(id: string): Promise<Customer> {
    return this.updateCustomer(id, { archived: false });
  }

  /**
   * Delete a customer record permanently
   */
  static async deleteCustomer(id: string): Promise<boolean> {
    const currentList = loadCustomers();
    const customer = currentList.find((c) => c.id === id);
    const updatedList = currentList.filter((c) => c.id !== id);
    saveCustomers(updatedList);

    if (customer) {
      addActivityLog('customer', 'Customer Permanently Deleted', `Removed ${customer.name}`);
    }

    if (!isSupabaseConfigured) return true;

    try {
      const user = await getCurrentUser();
      if (!user) return true;

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('CustomerService.deleteCustomer Supabase error:', err);
      return true;
    }
  }

  /**
   * Bulk archive customers
   */
  static async bulkArchiveCustomers(ids: string[]): Promise<boolean> {
    const list = loadCustomers();
    const updated = list.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c));
    saveCustomers(updated);
    addActivityLog('customer', 'Bulk Archive', `Archived ${ids.length} customer records`);

    if (isSupabaseConfigured) {
      try {
        const user = await getCurrentUser();
        if (user) {
          await supabase
            .from('customers')
            .update({ archived: true })
            .in('id', ids)
            .eq('owner_id', user.id);
        }
      } catch (err) {
        console.error('CustomerService.bulkArchiveCustomers error:', err);
      }
    }
    return true;
  }

  /**
   * Bulk delete customers
   */
  static async bulkDeleteCustomers(ids: string[]): Promise<boolean> {
    const list = loadCustomers();
    const updated = list.filter((c) => !ids.includes(c.id));
    saveCustomers(updated);
    addActivityLog('customer', 'Bulk Delete', `Deleted ${ids.length} customer records`);

    if (isSupabaseConfigured) {
      try {
        const user = await getCurrentUser();
        if (user) {
          await supabase
            .from('customers')
            .delete()
            .in('id', ids)
            .eq('owner_id', user.id);
        }
      } catch (err) {
        console.error('CustomerService.bulkDeleteCustomers error:', err);
      }
    }
    return true;
  }

  /**
   * Bulk update status
   */
  static async bulkUpdateStatus(ids: string[], newStatus: CustomerStatus): Promise<boolean> {
    const list = loadCustomers();
    const updated = list.map((c) => (ids.includes(c.id) ? { ...c, status: newStatus } : c));
    saveCustomers(updated);
    addActivityLog('customer', 'Bulk Status Update', `Updated ${ids.length} customers to ${newStatus}`);

    if (isSupabaseConfigured) {
      try {
        const user = await getCurrentUser();
        if (user) {
          await supabase
            .from('customers')
            .update({ status: newStatus })
            .in('id', ids)
            .eq('owner_id', user.id);
        }
      } catch (err) {
        console.error('CustomerService.bulkUpdateStatus error:', err);
      }
    }
    return true;
  }

  /**
   * Import multiple customers (CSV Import)
   */
  static async importCustomers(customersList: Partial<Customer>[]): Promise<number> {
    let importedCount = 0;
    for (const item of customersList) {
      if (item.name && item.email) {
        await this.createCustomer({
          name: item.name,
          email: item.email,
          phone: item.phone || '',
          company: item.company || 'Individual',
          address: item.address,
          website: item.website,
          industry: item.industry || 'General',
          source: item.source || 'CSV Import',
          assignedUser: 'Owner',
          status: item.status || 'lead',
          dealValue: item.dealValue || 0,
          tags: item.tags || ['CSV Import'],
          notes: item.notes || 'Imported via CSV',
        });
        importedCount++;
      }
    }
    return importedCount;
  }
}
