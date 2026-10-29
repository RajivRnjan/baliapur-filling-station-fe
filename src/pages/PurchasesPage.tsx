import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchPurchases, deletePurchase } from '../features/purchases/purchaseSlice';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import PurchaseFormModal from '../components/PurchaseFormModal';
import PurchaseDetailModal from '../components/PurchaseDetailModal';
import DateRangeDropdown from '../components/DateRangeDropdown';
import api from '../utils/api';

const PurchasesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: purchases, status: purchaseStatus, pagination, totals } = useSelector((state: RootState) => state.purchases);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isOpening, setIsOpening] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Format date helper: converts yyyy-mm-dd (from input) to dd/mm/yyyy (required by API)
  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      if (isOpening !== '') params.append('is_opening', isOpening === 'true' ? '1' : '0');
      
      const response = await api.get(`/purchases/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'purchases_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export purchases report');
    }
  };

  const handleExportPdf = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      if (isOpening !== '') params.append('is_opening', isOpening === 'true' ? '1' : '0');
      
      const response = await api.get(`/purchases/export/pdf?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'purchases_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export purchases report as PDF');
    }
  };

  useEffect(() => {
    dispatch(fetchPurchases({
      page,
      per_page: perPage,
      is_opening: isOpening === '' ? undefined : isOpening === 'true' ? 1 : 0,
      start_date: startDate ? formatDateForApi(startDate) : undefined,
      end_date: endDate ? formatDateForApi(endDate) : undefined,
    }));
  }, [dispatch, page, perPage, isOpening, startDate, endDate]);


  const totalStockMS = purchases.reduce((acc, curr) => acc + (Number(curr.ms) || 0), 0);
  const totalStockHSD = purchases.reduce((acc, curr) => acc + (Number(curr.hsd) || 0), 0);
  const totalStockXP = purchases.reduce((acc, curr) => acc + (Number(curr.xp) || 0), 0);

  const filteredPurchases = purchases.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.date && p.date.toLowerCase().includes(term)) ||
      (p.remarks && p.remarks.toLowerCase().includes(term)) ||
      (p.ms && String(p.ms).includes(term)) ||
      (p.hsd && String(p.hsd).includes(term)) ||
      (p.xp && String(p.xp).includes(term))
    );
  });

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 animate-fade flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                Fuel <span className="text-blue-600">Purchases</span>
              </h1>
              <p className="text-slate-500 font-medium">Complete stock book and inventory history</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total MS</div>
                <div className="text-xl font-black text-blue-700">{totalStockMS.toLocaleString()} L</div>
              </div>
              <div className="bg-cyan-50 px-6 py-3 rounded-xl border border-cyan-100">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Total HSD</div>
                <div className="text-xl font-black text-cyan-700">{totalStockHSD.toLocaleString()} L</div>
              </div>
              <div className="bg-purple-50 px-6 py-3 rounded-xl border border-purple-100">
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Total XP</div>
                <div className="text-xl font-black text-purple-700">{totalStockXP.toLocaleString()} L</div>
              </div>
            </div>
          </header>

          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h4 className="text-xl font-black text-slate-800">Full Stock Book</h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleExportCsv}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                  >
                    ↓ Export CSV
                  </button>
                  <button 
                    onClick={handleExportPdf}
                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm text-sm"
                  >
                    ↓ Export PDF
                  </button>
                  <button 
                    onClick={() => {
                      setEditingPurchase(null);
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    + Add Purchase
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Search</label>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="w-full px-4 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stock Type</label>
                  <select
                    value={isOpening}
                    onChange={(e) => { setIsOpening(e.target.value); setPage(1); }}
                    className="w-full px-4 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Purchases</option>
                    <option value="false">Regular Purchases</option>
                    <option value="true">Opening Stocks</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 z-10 relative w-full sm:w-64">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date Range</label>
                  <DateRangeDropdown
                    startDate={startDate}
                    endDate={endDate}
                    onChange={({ startDate: s, endDate: e }) => { 
                      setStartDate(s || ''); 
                      setEndDate(e || ''); 
                      setPage(1); 
                    }}
                    placeholder="Select date range"
                    className="w-full"
                    inputClassName="w-full px-4 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 invisible">Reset</label>
                  <button
                    onClick={() => {
                      setIsOpening('');
                      setStartDate('');
                      setEndDate('');
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white border border-slate-800 rounded-xl text-xs font-black transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Sl. No</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">MS (L)</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">HSD (L)</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">XP (L)</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Is Opening</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Invoice Number</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Created At</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Updated At</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((p, index) => (
                    <tr key={p.id || p.sl_no} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-5 pl-4 text-sm font-bold text-slate-600">{(page - 1) * perPage + index + 1}</td>
                      <td className="py-5 text-sm font-bold text-slate-600">{p.date}</td>
                      <td className="py-5 text-sm font-black text-blue-600 text-right">{Number(p.ms).toLocaleString()}</td>
                      <td className="py-5 text-sm font-black text-cyan-600 text-right">{Number(p.hsd).toLocaleString()}</td>
                      <td className="py-5 text-sm font-black text-purple-600 text-right">{Number(p.xp).toLocaleString()}</td>
                      <td className="py-5 text-sm font-medium text-slate-500 text-center">
                        {p.is_opening == 1 ? (
                          <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full">Opening</span>
                        ) : (
                          <span className="text-slate-400 font-bold">0</span>
                        )}
                      </td>
                      <td className="py-5 text-xs font-medium text-slate-400 text-left">
                        {p.remarks || '-'}
                      </td>
                      <td className="py-5 text-[11px] font-medium text-slate-400 text-right">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-5 text-[11px] font-medium text-slate-400 text-right">
                        {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-5 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setViewingPurchase(p);
                              setIsDetailOpen(true);
                            }}
                            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button 
                            onClick={() => {
                              setEditingPurchase(p);
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          {!isAdmin && (
                            <button 
                              onClick={async () => {
                                toast.dismiss();
                                try {
                                  await dispatch(deletePurchase(p.id || p.sl_no as number)).unwrap();
                                  toast.success('Purchase deleted successfully');
                                } catch (e) {
                                  // Handled
                                }
                              }}
                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredPurchases.length > 0 && totals && (
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={2} className="py-5 px-4 text-sm font-black text-slate-800 text-right uppercase tracking-wider">TOTAL</td>
                      <td className="py-5 pr-2 text-sm font-black text-blue-600 text-right">{Number(totals.ms).toLocaleString()}</td>
                      <td className="py-5 pr-2 text-sm font-black text-cyan-600 text-right">{Number(totals.hsd).toLocaleString()}</td>
                      <td className="py-5 pr-2 text-sm font-black text-purple-600 text-right">{Number(totals.xp).toLocaleString()}</td>
                      <td colSpan={5}></td>
                    </tr>
                  )}
                  
                  {filteredPurchases.length === 0 && purchaseStatus !== 'loading' && (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-slate-400 font-medium">No purchase history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500">
                  Showing <span className="text-slate-800">{Math.min(pagination.total, (page - 1) * perPage + 1)}</span> to{' '}
                  <span className="text-slate-800">{Math.min(pagination.total, page * perPage)}</span> of{' '}
                  <span className="text-slate-800">{pagination.total}</span> entries
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
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
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
                      onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                      disabled={page === pagination.last_page}
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
      </div>
      <PurchaseFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingPurchase}
      />
      <PurchaseDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        purchase={viewingPurchase}
      />
    </Layout>
  );
};

export default PurchasesPage;
