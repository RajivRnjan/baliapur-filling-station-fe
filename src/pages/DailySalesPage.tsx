import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchDailySales, deleteDailySale } from '../features/dailySales/dailySalesSlice';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import DailySaleFormModal from '../components/DailySaleFormModal';
import DailySaleDetailModal from '../components/DailySaleDetailModal';
import DateRangeDropdown from '../components/DateRangeDropdown';
import api from '../utils/api';


const DailySalesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: dailySales, status, pagination } = useSelector((state: RootState) => state.dailySales);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingSaleId, setViewingSaleId] = useState<number | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [presetRange, setPresetRange] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Indian Financial Year: April 1 to March 31 (Current and Previous FY only)
  const financialYears = useMemo(() => {
    const today = new Date();
    const currentFyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return Array.from({ length: 2 }, (_, i) => {
      const startYear = currentFyStartYear - i;
      const endYear = startYear + 1;
      const shortEnd = String(endYear).slice(-2);
      const prefix = i === 0 ? 'Current FY: ' : 'Previous FY: ';
      return {
        value: `fy_${startYear}_${endYear}`,
        label: `${prefix}${startYear}-${shortEnd} (Apr - Mar)`,
        startYear,
        endYear,
      };
    });
  }, []);

  const handlePresetRange = (preset: string) => {
    setPresetRange(preset);
    if (!preset) {
      setStartDate('');
      setEndDate('');
      setSearchTerm('');
      setPage(1);
      return;
    }

    // Financial year preset (e.g. fy_2026_2027)
    if (preset.startsWith('fy_')) {
      const parts = preset.split('_');
      const startYear = parseInt(parts[1], 10);
      const endYear = parseInt(parts[2], 10);
      if (!isNaN(startYear) && !isNaN(endYear)) {
        setStartDate(`${startYear}-04-01`);
        setEndDate(`${endYear}-03-31`);
        setPage(1);
        return;
      }
    }

    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    switch (preset) {
      case 'weekly': {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        break;
      }
      case 'monthly':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarterly': {
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      }
      case 'half_yearly': {
        const half = Math.floor(today.getMonth() / 6);
        start = new Date(today.getFullYear(), half * 6, 1);
        end = new Date(today.getFullYear(), half * 6 + 6, 0);
        break;
      }
      case 'yearly':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setPage(1);
  };

  // Format date helper: converts yyyy-mm-dd (from input) to dd/mm/yyyy (required by API)
  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    dispatch(fetchDailySales({
      page,
      per_page: perPage,
      start_date: startDate ? formatDateForApi(startDate) : undefined,
      end_date: endDate ? formatDateForApi(endDate) : undefined,
    }));
  }, [dispatch, page, perPage, startDate, endDate]);

  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-bold text-slate-800">Confirm Deletion</p>
          <p className="text-xs text-slate-500 mt-1">This will trigger cascading recalculations. Are you sure?</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteDailySale(id)).unwrap();
                toast.success('Record deleted successfully');
              } catch (e) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      
      const response = await api.get(`/daily-sales/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export sales report');
    }
  };

  const handleExportPdf = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      
      const response = await api.get(`/daily-sales/export/pdf?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export sales report as PDF');
    }
  };

  const filteredSales = dailySales.filter(sale => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (sale.date && sale.date.toLowerCase().includes(term)) ||
      (sale.rate_ms && String(sale.rate_ms).includes(term)) ||
      (sale.rate_hsd && String(sale.rate_hsd).includes(term)) ||
      (sale.rate_xp && String(sale.rate_xp).includes(term)) ||
      (sale.ms_qty && String(sale.ms_qty).includes(term)) ||
      (sale.hsd_qty && String(sale.hsd_qty).includes(term)) ||
      (sale.xp_qty && String(sale.xp_qty).includes(term)) ||
      (sale.grand_total_amount && String(sale.grand_total_amount).includes(term))
    );
  });

  const totalMsQty = filteredSales.reduce((sum, sale) => sum + (sale.ms_qty || 0), 0);
  const totalHsdQty = filteredSales.reduce((sum, sale) => sum + (sale.hsd_qty || 0), 0);
  const totalXpQty = filteredSales.reduce((sum, sale) => sum + (sale.xp_qty || 0), 0);
  const totalMsAmount = filteredSales.reduce((sum, sale) => sum + (sale.ms_amount || ((sale.ms_qty || 0) * (sale.rate_ms || 0))), 0);
  const totalHsdAmount = filteredSales.reduce((sum, sale) => sum + (sale.hsd_amount || ((sale.hsd_qty || 0) * (sale.rate_hsd || 0))), 0);
  const totalXpAmount = filteredSales.reduce((sum, sale) => sum + (sale.xp_amount || ((sale.xp_qty || 0) * (sale.rate_xp || 0))), 0);

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 animate-fade flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                Daily <span className="text-blue-600">Sales</span>
              </h1>
              <p className="text-slate-500 font-medium">Manage daily fuel inventory, rates, and end-of-day calculations</p>
            </div>
            {filteredSales.length > 0 && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 px-4 text-right shadow-sm">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total MS</div>
                  <div className="font-bold text-slate-800 text-lg leading-tight">{totalMsQty.toFixed(2)} L</div>
                  <div className="text-xs font-black text-slate-500">{formatCurrency(totalMsAmount)}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 px-4 text-right shadow-sm">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total HSD</div>
                  <div className="font-bold text-slate-800 text-lg leading-tight">{totalHsdQty.toFixed(2)} L</div>
                  <div className="text-xs font-black text-slate-500">{formatCurrency(totalHsdAmount)}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 px-4 text-right shadow-sm">
                  <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Total XP</div>
                  <div className="font-bold text-slate-800 text-lg leading-tight">{totalXpQty.toFixed(2)} L</div>
                  <div className="text-xs font-black text-slate-500">{formatCurrency(totalXpAmount)}</div>
                </div>
              </div>
            )}
          </header>

          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
              {/* Minimal Date Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-32 px-3 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <select
                  value={presetRange}
                  onChange={(e) => handlePresetRange(e.target.value)}
                  className="w-56 px-3 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Custom Range</option>
                  <optgroup label="Standard Presets">
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="quarterly">This Quarter</option>
                    <option value="half_yearly">This Half Year</option>
                    <option value="yearly">This Calendar Year (Jan - Dec)</option>
                  </optgroup>
                  <optgroup label="Financial Years (Apr - Mar)">
                    {financialYears.map((fy) => (
                      <option key={fy.value} value={fy.value}>
                        {fy.label}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <div className="z-10 relative">
                  <DateRangeDropdown
                    startDate={startDate}
                    endDate={endDate}
                    onChange={({ startDate: s, endDate: e }) => { 
                      setStartDate(s || ''); 
                      setEndDate(e || ''); 
                      setPresetRange('');
                      setPage(1); 
                    }}
                    placeholder="Select date range"
                    inputClassName="w-56 px-3 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  onClick={() => {
                    setPresetRange('');
                    setStartDate('');
                    setEndDate('');
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Reset
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleExport}
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
                    setEditingSaleId(null);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                  + Record Daily Sale
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest pl-6">Date</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Rates (MS/HSD/XP)</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Fuel Qty (MS/HSD/XP)</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Grand Total (₹)</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Expected Cash (₹)</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cash Collected (₹)</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Discrepancy (₹)</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-600">
                  {status === 'loading' && (
                    <tr><td colSpan={8} className="py-8 text-center text-slate-400">Loading daily sales...</td></tr>
                  )}
                  {status === 'succeeded' && filteredSales.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-slate-400">No daily sales records found.</td></tr>
                  )}
                  {filteredSales.map((sale) => (
                    <React.Fragment key={sale.id}>
                      <tr 
                        className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedRowId === sale.id ? 'bg-blue-50/10' : ''}`}
                        onClick={() => toggleRow(sale.id)}
                      >
                        <td className="py-4 px-4 font-bold text-slate-800 pl-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-black">
                              {expandedRowId === sale.id ? '▼' : '▶'}
                            </span>
                            {sale.date}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-xs text-slate-600">
                          {sale.rate_ms} / {sale.rate_hsd} / {sale.rate_xp}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                          {sale.ms_qty?.toFixed(2) || '0.00'} / {sale.hsd_qty?.toFixed(2) || '0.00'} / {sale.xp_qty?.toFixed(2) || '0.00'} L
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-slate-700">
                          {formatCurrency(sale.grand_total_amount || 0)}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-slate-500">
                          {formatCurrency(sale.cash_to_be_collected || 0)}
                        </td>
                        <td className="py-4 px-4 text-right font-black text-emerald-600">
                          {formatCurrency(sale.cash_collection || 0)}
                        </td>
                        <td className={`py-4 px-4 text-right font-black ${Number(sale.error || 0) < 0 ? 'text-rose-600' : Number(sale.error || 0) > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                          {formatCurrency(sale.error || 0)}
                        </td>
                        <td className="py-4 px-4 text-center pr-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => {
                                setViewingSaleId(sale.id);
                                setIsDetailOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {!isAdmin && (
                              <button 
                                onClick={() => {
                                  setEditingSaleId(sale.id);
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Record"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )}
                            {!isAdmin && (
                              <button 
                                onClick={() => handleDelete(sale.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Record"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedRowId === sale.id && (
                        <tr className="bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
                          <td colSpan={8} className="p-6 border-b border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade">
                              {/* Rates & Base Data */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-3">Rates & Product Totals</h5>
                                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                                    <div className="flex justify-between"><span>Petrol (MS) Rate:</span><span className="text-slate-800">₹{sale.rate_ms}</span></div>
                                    <div className="flex justify-between"><span>Diesel (HSD) Rate:</span><span className="text-slate-800">₹{sale.rate_hsd}</span></div>
                                    <div className="flex justify-between"><span>Premium (XP) Rate:</span><span className="text-slate-800">₹{sale.rate_xp}</span></div>
                                    <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5"><span>MS Amount:</span><span className="text-slate-800">{formatCurrency(sale.ms_amount || ((sale.ms_qty || 0) * (sale.rate_ms || 0)))}</span></div>
                                    <div className="flex justify-between"><span>HSD Amount:</span><span className="text-slate-800">{formatCurrency(sale.hsd_amount || ((sale.hsd_qty || 0) * (sale.rate_hsd || 0)))}</span></div>
                                    <div className="flex justify-between"><span>XP Amount:</span><span className="text-slate-800">{formatCurrency(sale.xp_amount || ((sale.xp_qty || 0) * (sale.rate_xp || 0)))}</span></div>
                                    <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5"><span>Fuel Sale Qty:</span><span className="text-slate-800">{sale.total_fuel_qty?.toFixed(2)} L</span></div>
                                    <div className="flex justify-between"><span>Fuel Sale Amount:</span><span className="text-slate-800">{formatCurrency(sale.total_fuel_amount)}</span></div>
                                    <div className="flex justify-between"><span>Lubricant Sales:</span><span className="text-slate-800">{formatCurrency(sale.lubricant_sale)}</span></div>
                                    <div className="flex justify-between border-t border-slate-100 pt-1.5"><span>Grand Total:</span><span className="text-slate-800 font-bold">{formatCurrency(sale.grand_total_amount)}</span></div>
                                  </div>
                                </div>
                              </div>

                              {/* Testing & Net Sale */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-3">Testing & Net Sales</h5>
                                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                                    <div className="flex justify-between"><span>Density check expense:</span><span className="text-slate-800">{formatCurrency(sale.density)}</span></div>
                                    <div className="flex justify-between"><span>Total Testing deduction:</span><span className="text-rose-600 font-bold">-{formatCurrency(sale.total_testing_amount)}</span></div>
                                    <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5"><span>Final net sale:</span><span className="text-slate-800 font-black">{formatCurrency(sale.final_sale_amount)}</span></div>
                                    <div className="flex justify-between"><span>Total sales amount:</span><span className="text-slate-800">{formatCurrency(sale.total_amount)}</span></div>
                                  </div>
                                </div>
                              </div>

                              {/* Transactions Breakdown */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h5 className="text-[10px] font-black text-cyan-600 uppercase tracking-wider mb-3">Payments & Transactions</h5>
                                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                                    <div className="flex justify-between"><span>Bank direct transfer:</span><span className="text-slate-800">{formatCurrency(sale.ac_transfer)}</span></div>
                                    <div className="flex justify-between"><span>Online payments (UPI):</span><span className="text-slate-800 font-bold">{formatCurrency(sale.online)}</span></div>
                                    <div className="flex justify-between"><span>New credit sales:</span><span className="text-rose-600">{formatCurrency(sale.creditor)}</span></div>
                                    <div className="flex justify-between"><span>Credit payment received:</span><span className="text-emerald-600">{formatCurrency(sale.credit_payment_received)}</span></div>
                                  </div>
                                </div>
                              </div>

                              {/* Expenses & reconciliation */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-wider mb-3">Outflow & Withdrawals</h5>
                                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                                    <div className="flex justify-between"><span>Pump daily expenses:</span><span className="text-rose-600">{formatCurrency(sale.expense)}</span></div>
                                    <div className="flex justify-between"><span>Staff salary payout:</span><span className="text-rose-600">{formatCurrency(sale.staff)}</span></div>
                                    <div className="flex justify-between"><span>Owner 1 draw:</span><span className="text-slate-800">{formatCurrency(sale.owner_1)}</span></div>
                                    <div className="flex justify-between"><span>Owner 2 draw:</span><span className="text-slate-800">{formatCurrency(sale.owner_2)}</span></div>
                                  </div>
                                </div>
                              </div>

                              {/* Cash reconciliation metrics */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-4">
                                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-3">Full cash reconciliation details</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-600">
                                  <div className="space-y-2 border-r border-slate-100 pr-6 last:border-0">
                                    <div className="flex justify-between"><span>Expected cash collection:</span><span className="text-slate-800 font-bold">{formatCurrency(sale.cash_to_be_collected)}</span></div>
                                    <div className="flex justify-between"><span>Actual cash physically collected:</span><span className="text-slate-800 font-bold">{formatCurrency(sale.cash_collection)}</span></div>
                                    <div className="flex justify-between"><span>Coins total:</span><span className="text-slate-800">{formatCurrency(sale.coin)}</span></div>
                                    <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5"><span>Shortage (missing cash):</span><span className="text-rose-600 font-bold">{formatCurrency(sale.miss)}</span></div>
                                  </div>
                                  <div className="space-y-2 border-r border-slate-100 pr-6 last:border-0">
                                    <div className="flex justify-between"><span>Previous pump balance:</span><span className="text-slate-800">{formatCurrency(sale.previous_pump_balance)}</span></div>
                                    <div className="flex justify-between"><span>Expected pump balance:</span><span className="text-slate-800 font-bold">{formatCurrency(sale.expected_balance)}</span></div>
                                    <div className="flex justify-between"><span>Actual closing balance:</span><span className="text-slate-800 font-bold">{formatCurrency(sale.actual_balance_in_pump)}</span></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 text-center md:text-left">
                  Showing <span className="text-slate-800">{Math.min(pagination.total, (page - 1) * perPage + 1)}</span> to{' '}
                  <span className="text-slate-800">{Math.min(pagination.total, page * perPage)}</span> of{' '}
                  <span className="text-slate-800">{pagination.total}</span> entries
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Previous Page"
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>

                    {/* Mobile: compact page indicator */}
                    <div className="flex sm:hidden items-center px-3 py-1.5 text-xs font-black text-slate-700 bg-slate-50 rounded-lg">
                      Page {page} of {pagination.last_page}
                    </div>

                    {/* Tablet/Desktop: smart windowed page numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers(page, pagination.last_page).map((item, index) => {
                        if (item === '...') {
                          return (
                            <span key={`dots-${index}`} className="px-2 py-1 text-xs font-bold text-slate-400">
                              ...
                            </span>
                          );
                        }
                        const pageNum = Number(item);
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`min-w-[32px] h-8 px-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center ${
                              page === pageNum
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                      disabled={page === pagination.last_page}
                      aria-label="Next Page"
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
      <DailySaleFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingSaleId={editingSaleId}
      />
      <DailySaleDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        saleId={viewingSaleId}
      />
    </Layout>
  );
};

export default DailySalesPage;
