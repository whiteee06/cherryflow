import React, { useState, useMemo } from 'react';
import { Customer, CustomerStatus } from '../../types';
import {
  Users,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Tag,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Star,
  Archive,
  RotateCcw,
  Download,
  Upload,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { ImportCSVModal } from './ImportCSVModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { generateCustomerCSV } from '../../utils/crmValidation';

interface CustomerListProps {
  customers: Customer[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAddModal: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onArchiveCustomer?: (id: string) => void;
  onRestoreCustomer?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onBulkDeleteCustomers?: (ids: string[]) => void;
  onBulkArchiveCustomers?: (ids: string[]) => void;
  onBulkUpdateStatus?: (ids: string[], newStatus: CustomerStatus) => void;
  onImportCustomers?: (imported: Partial<Customer>[]) => void;
  onAddCustomerNote?: (customerId: string, noteText: string) => void;
  currencySymbol?: string;
  isLoading?: boolean;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onEditCustomer,
  onDeleteCustomer,
  onArchiveCustomer,
  onRestoreCustomer,
  onToggleFavorite,
  onBulkDeleteCustomers,
  onBulkArchiveCustomers,
  onBulkUpdateStatus,
  onImportCustomers,
  onAddCustomerNote,
  currencySymbol = '$',
  isLoading = false,
}) => {
  // Filter States
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'last_updated' | 'deal_desc'>('newest');

  // Display Mode & Pagination
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals and Drawers State
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  // Filtered & Sorted Customer Collection
  const processedCustomers = useMemo(() => {
    let result = [...customers];

    // 1. Archive filter
    if (showArchived) {
      result = result.filter((c) => c.archived === true);
    } else {
      result = result.filter((c) => !c.archived);
    }

    // 2. Favorite filter
    if (favoriteOnly) {
      result = result.filter((c) => c.favorite === true);
    }

    // 3. Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((c) => c.status === selectedStatus);
    }

    // 4. Industry filter
    if (selectedIndustry !== 'all') {
      result = result.filter((c) => c.industry === selectedIndustry);
    }

    // 5. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 6. Sort logic
    result.sort((a, b) => {
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

    return result;
  }, [customers, showArchived, favoriteOnly, selectedStatus, selectedIndustry, searchQuery, sortBy]);

  // Pagination Math
  const totalCount = processedCustomers.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedCustomers = processedCustomers.slice(startIndex, startIndex + pageSize);

  // Total Filtered Pipeline Value
  const totalPipelineValue = processedCustomers.reduce((acc, c) => acc + (c.dealValue || 0), 0);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteTrigger = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${selectedIds.length} Customers?`,
      message: 'Are you sure you want to permanently delete these selected records? This action cannot be undone.',
      variant: 'danger',
      action: () => {
        if (onBulkDeleteCustomers) {
          onBulkDeleteCustomers(selectedIds);
        } else {
          selectedIds.forEach((id) => onDeleteCustomer(id));
        }
        setSelectedIds([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleBulkArchiveTrigger = () => {
    if (selectedIds.length === 0) return;
    if (onBulkArchiveCustomers) {
      onBulkArchiveCustomers(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportCSVTrigger = () => {
    const csvData = generateCustomerCSV(processedCustomers);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cherryflow_customers_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'vip':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            ★ VIP Client
          </span>
        );
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active Client
          </span>
        );
      case 'prospect':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Prospect
          </span>
        );
      case 'lead':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Inbound Lead
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            Inactive
          </span>
        );
    }
  };

  const hasActiveFilters =
    selectedStatus !== 'all' ||
    selectedIndustry !== 'all' ||
    favoriteOnly ||
    showArchived ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedStatus('all');
    setSelectedIndustry('all');
    setFavoriteOnly(false);
    setShowArchived(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* CRM Header & Overview Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Customer Relationship Management</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage account pipelines, record interactions, export CSV data, and organize clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Filtered Value</p>
            <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
              {currencySymbol}{totalPipelineValue.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
            title="Import Customers from CSV"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={handleExportCSVTrigger}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
            title="Export Filtered Customers to CSV"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter & Search Toolbar */}
      <div className="space-y-3">
        {/* Row 1: Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            {['all', 'vip', 'active', 'prospect', 'lead', 'inactive'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                favoriteOnly
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Star size={14} className={favoriteOnly ? 'fill-amber-500' : ''} />
              <span>Favorites</span>
            </button>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                showArchived
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Archive size={14} />
              <span>{showArchived ? 'Active Accounts' : 'Archived'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search, Industry, Sort, and View Switch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, company, email, phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            {/* Industry Filter Dropdown */}
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Services">Services</option>
              <option value="Real Estate">Real Estate</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500/50 hidden lg:block"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="a-z">Sort: A-Z Name</option>
              <option value="last_updated">Sort: Last Updated</option>
              <option value="deal_desc">Sort: Highest Deal Value</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Operations Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckSquare size={16} />
            <span>{selectedIds.length} Customers Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkArchiveTrigger}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Archive Selected
            </button>
            <button
              onClick={handleBulkDeleteTrigger}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800/60 animate-pulse" />
          ))}
        </div>
      ) : processedCustomers.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <Users size={36} className="text-zinc-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Customers Found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            No customer accounts match your search query or selected filters. Try clearing your search parameters or add a new customer.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus size={15} /> Add Customer
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer text-zinc-400 hover:text-rose-500">
                      {selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0 ? (
                        <CheckSquare size={16} className="text-rose-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Customer / Company</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Deal Value</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Industry / Source</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200 font-medium">
                {paginatedCustomers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                        isSelected ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleSelectRow(c.id)}
                          className="cursor-pointer text-zinc-400 hover:text-rose-500"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-rose-600" /> : <Square size={16} />}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${c.avatarColor || 'bg-rose-600'} text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0`}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p
                                className="font-bold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                onClick={() => setDetailCustomer(c)}
                              >
                                {c.name}
                              </p>
                              <button
                                onClick={() => onToggleFavorite && onToggleFavorite(c.id)}
                                className="text-zinc-400 hover:text-amber-500 cursor-pointer"
                              >
                                <Star size={13} className={c.favorite ? 'fill-amber-500 text-amber-500' : ''} />
                              </button>
                            </div>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <Building2 size={12} /> {c.company || 'Individual'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>

                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {currencySymbol}{(c.dealValue || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500">
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Mail size={12} className="text-zinc-400 shrink-0" /> {c.email}
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-[11px] mt-0.5">
                            <Phone size={12} className="text-zinc-400 shrink-0" /> {c.phone}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{c.industry || 'General'}</p>
                        <p className="text-zinc-400">{c.source || 'Direct'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags && c.tags.length > 0 ? (
                            c.tags.slice(0, 2).map((tg, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              >
                                #{tg}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-400 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailCustomer(c)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="View Customer Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onEditCustomer(c)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit2 size={15} />
                          </button>
                          {c.archived ? (
                            <button
                              onClick={() => onRestoreCustomer && onRestoreCustomer(c.id)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-500 transition-colors cursor-pointer"
                              title="Restore Customer"
                            >
                              <RotateCcw size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => onArchiveCustomer && onArchiveCustomer(c.id)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Archive Customer"
                            >
                              <Archive size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: `Delete ${c.name}?`,
                                message: 'Are you sure you want to delete this customer record? This cannot be undone.',
                                action: () => {
                                  onDeleteCustomer(c.id);
                                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                                },
                              });
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCustomers.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-rose-500/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl ${c.avatarColor || 'bg-rose-600'} text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-zinc-900 dark:text-white hover:text-rose-600 cursor-pointer"
                      onClick={() => setDetailCustomer(c)}
                    >
                      {c.name}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Building2 size={12} /> {c.company || 'Individual'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(c.id)}
                  className="text-zinc-400 hover:text-amber-500 cursor-pointer"
                >
                  <Star size={16} className={c.favorite ? 'fill-amber-500 text-amber-500' : ''} />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-[10px] text-zinc-400">Pipeline Status</p>
                  {getStatusBadge(c.status)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400">Deal Value</p>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    {currencySymbol}{(c.dealValue || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                <p className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-zinc-400 shrink-0" />
                  <span>{c.email}</span>
                </p>
                {c.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={13} className="text-zinc-400 shrink-0" />
                    <span>{c.phone}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <button
                  onClick={() => setDetailCustomer(c)}
                  className="font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  View Details →
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCustomer(c)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: `Delete ${c.name}?`,
                        message: 'Are you sure you want to delete this customer record?',
                        action: () => {
                          onDeleteCustomer(c.id);
                          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {processedCustomers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries per page. Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} customers.</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-semibold text-zinc-800 dark:text-zinc-200">
              Page {validCurrentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer */}
      <CustomerDetailDrawer
        customer={detailCustomer}
        isOpen={Boolean(detailCustomer)}
        onClose={() => setDetailCustomer(null)}
        onEdit={(c) => {
          setDetailCustomer(null);
          onEditCustomer(c);
        }}
        onDelete={(id) => {
          setDetailCustomer(null);
          onDeleteCustomer(id);
        }}
        onArchive={(id) => {
          if (onArchiveCustomer) onArchiveCustomer(id);
          setDetailCustomer(null);
        }}
        onRestore={(id) => {
          if (onRestoreCustomer) onRestoreCustomer(id);
          setDetailCustomer(null);
        }}
        onToggleFavorite={(id) => {
          if (onToggleFavorite) onToggleFavorite(id);
          if (detailCustomer) {
            setDetailCustomer({ ...detailCustomer, favorite: !detailCustomer.favorite });
          }
        }}
        onAddNote={(id, note) => {
          if (onAddCustomerNote) onAddCustomerNote(id, note);
        }}
        currencySymbol={currencySymbol}
      />

      {/* CSV Import Modal */}
      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(imported) => {
          if (onImportCustomers) onImportCustomers(imported);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
  );
};
