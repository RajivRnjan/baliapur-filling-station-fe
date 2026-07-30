import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchLubricants, deleteLubricant, fetchLubricantSalesHistory, type Lubricant } from '../features/lubricants/lubricantSlice';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import LubricantFormModal from '../components/LubricantFormModal';
import LubricantDetailModal from '../components/LubricantDetailModal';
import AddLubricantStockModal from '../components/AddLubricantStockModal';

const LubricantsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: lubricants, status, pagination, salesHistory } = useSelector((state: RootState) => state.lubricants);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLubricant, setEditingLubricant] = useState<Lubricant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingLubricant, setViewingLubricant] = useState<Lubricant | null>(null);

  const [activeTab, setActiveTab] = useState<'inventory' | 'sales_history'>('inventory');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockLubricant, setStockLubricant] = useState<Lubricant | null>(null);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Super Admin Check
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role?.toUpperCase() === 'SUPER ADMIN';

  useEffect(() => {
    if (activeTab === 'inventory') {
      dispatch(fetchLubricants({
        page,
        per_page: perPage,
        stock_status: stockStatus || undefined,
      }));
    } else {
      dispatch(fetchLubricantSalesHistory({
        page,
        per_page: perPage,
      }));
    }
  }, [dispatch, page, perPage, stockStatus, activeTab]);

  const handleDelete = (id: number, name: string) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can delete lubricant items');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-bold text-slate-800">Confirm Deletion</p>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{name}</span>?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteLubricant(id)).unwrap();
                toast.success('Lubricant item deleted successfully');
              } catch (e: any) {
                toast.error(e || 'Failed to delete item');
              }
            }}
          >
            Delete
          </button>
          <button
            className="flex-1 bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        background: '#fff',
        color: '#334155',
        border: '1px solid #e2e8f0',
      }
    });
  };

  const filteredLubricants = lubricants.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    const formattedDate = item.created_at 
      ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase()
      : '';
      
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.qty_name && item.qty_name.toLowerCase().includes(term)) ||
      (item.price && String(item.price).includes(term)) ||
      (item.stock !== undefined && String(item.stock).includes(term)) ||
      formattedDate.includes(term)
    );
  });
  const activePagination = activeTab === 'inventory' ? pagination : salesHistory.pagination;

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-12 animate-fade flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                Lubricants <span className="text-blue-600">Inventory</span>
              </h1>
              <p className="text-slate-500 font-medium">
                Monitor and manage lubricant stock at BALIAPUR FILLING STATION
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingLubricant(null);
                setIsFormModalOpen(true);
              }}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/15 text-sm active:scale-95"
            >
              + Add Lubricant Item
            </button>
          </header>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-100">
            <button
              onClick={() => { setActiveTab('inventory'); setPage(1); }}
              className={`pb-4 px-2 text-sm font-black transition-all ${
                activeTab === 'inventory' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => { setActiveTab('sales_history'); setPage(1); }}
              className={`pb-4 px-2 text-sm font-black transition-all ${
                activeTab === 'sales_history' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sales History
            </button>
          </div>

          {activeTab === 'inventory' ? (
            <>
              {/* Search Bar & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full bg-transparent text-slate-700 font-medium placeholder-slate-400 focus:outline-none text-sm"
              />
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Stock:</span>
              <select
                value={stockStatus}
                onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
                className="w-full bg-transparent text-slate-700 text-xs font-bold focus:outline-none"
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock (≤ 5)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            
            <div className="bg-white p-4 px-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Products</span>
              <span className="text-2xl font-black text-slate-800 mt-1">{lubricants.length}</span>
            </div>

            <div className="bg-white p-4 px-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Stock Alert</span>
              <span className="text-2xl font-black text-rose-600 mt-1">
                {lubricants.filter(i => (i.stock || 0) < 15).length}
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Product Name</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">Unit Size</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">Selling Price</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">In-Stock Qty</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center px-4">Created At</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLubricants.map((item, index) => {
                    const isLow = (item.stock || 0) < 15;
                    return (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 pl-4 text-sm font-black text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center font-black text-sm">
                              {(page - 1) * perPage + index + 1}
                            </div>
                            <div>
                              <span>{item.name}</span>
                              {isLow && (
                                <span className="ml-2 inline-block px-2 py-0.5 text-[9px] font-black uppercase bg-rose-50 text-rose-600 rounded-full">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-600 text-right px-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                            {item.qty_name}
                          </span>
                        </td>
                        <td className="py-4 text-sm font-black text-slate-700 text-right px-4 font-mono">
                          ₹{Number(item.price).toFixed(2)}
                        </td>
                        <td className="py-4 text-right px-4">
                          <span className={`text-sm font-mono font-black ${isLow ? 'text-rose-600' : 'text-slate-600'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-500 text-center px-4 font-mono whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => {
                                setStockLubricant(item);
                                setIsStockModalOpen(true);
                              }}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                              title="Add Stock"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            </button>

                            <button
                              onClick={() => {
                                setViewingLubricant(item);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-750 transition-colors"
                              title="View Details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>

                            <button
                              onClick={() => {
                                if (!isSuperAdmin) {
                                  toast.error('Only Super Admins can update lubricant details');
                                  return;
                                }
                                setEditingLubricant(item);
                                setIsFormModalOpen(true);
                              }}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                                isSuperAdmin
                                  ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                              title={isSuperAdmin ? 'Edit Product' : 'Super Admin Only'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                              {!isSuperAdmin && <span className="text-[9px] font-black uppercase pr-1">🔒</span>}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                                isSuperAdmin
                                  ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                              title={isSuperAdmin ? 'Delete Product' : 'Super Admin Only'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLubricants.length === 0 && status !== 'loading' && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="font-medium">No lubricants in stock matching your query.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          ) : (
          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Date</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Item Name</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">Quantity Sold</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.items.map((dailySale: any) => (
                    <React.Fragment key={dailySale.id}>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <td colSpan={4} className="py-3 pl-4 text-sm font-black text-blue-600 tracking-wider uppercase">
                          {(() => {
                            if (!dailySale.date) return '-';
                            const [day, month, year] = dailySale.date.split('/');
                            const parsed = new Date(Number(year), Number(month) - 1, Number(day));
                            return isNaN(parsed.getTime())
                              ? '-'
                              : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                          })()}
                        </td>
                      </tr>
                      {dailySale.lubricants?.map((sale: any) => (
                        <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4 text-sm font-bold text-slate-800">
                            {/* Empty space for indentation */}
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-slate-600">
                            {sale.lubricant?.name} <span className="text-xs text-slate-400 ml-1">({sale.lubricant?.qty_name})</span>
                          </td>
                          <td className="py-4 text-right px-4 text-sm font-black text-slate-700 font-mono">
                            {sale.quantity}
                          </td>
                          <td className="py-4 text-right pr-4 text-sm font-black text-emerald-600 font-mono">
                            ₹{Number(sale.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {salesHistory.items.length === 0 && salesHistory.status !== 'loading' && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">No sales history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Pagination Controls */}
          {activePagination && activePagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-800">{Math.min(activePagination.total, (page - 1) * perPage + 1)}</span> to{' '}
                <span className="text-slate-800">{Math.min(activePagination.total, page * perPage)}</span> of{' '}
                <span className="text-slate-800">{activePagination.total}</span> entries
              </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">Show:</span>
                    <select
                      value={perPage}
                      onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                      className="px-2 py-1 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                    >
                      {[5, 10, 25, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    {Array.from({ length: activePagination.last_page }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(activePagination.last_page, p + 1))}
                      disabled={page === activePagination.last_page}
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      <LubricantFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingLubricant(null);
        }}
        initialData={editingLubricant}
      />

      <LubricantDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingLubricant(null);
        }}
        lubricant={viewingLubricant}
      />

      <AddLubricantStockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockLubricant(null);
        }}
        lubricant={stockLubricant}
      />
    </Layout>
  );
};

export default LubricantsPage;
