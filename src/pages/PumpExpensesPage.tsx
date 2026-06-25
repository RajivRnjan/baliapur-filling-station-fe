import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import DateRangeDropdown from '../components/DateRangeDropdown';

const PumpExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [dateValue, setDateValue] = useState<{startDate: string | null, endDate: string | null}>({
    startDate: null,
    endDate: null
  });
  const startDate = dateValue.startDate;
  const endDate = dateValue.endDate;
  const [searchTerm, setSearchTerm] = useState('');

  // Format date helper: yyyy-mm-dd to dd/mm/yyyy
  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));

      const response = await api.get(`/pump-expenses?${params.toString()}`);
      setExpenses(response.data.pump_expenses.data || []);
      setTotalAmount(response.data.total_amount || 0);
      setPagination({
        current_page: response.data.pump_expenses.current_page,
        last_page: response.data.pump_expenses.last_page,
        total: response.data.pump_expenses.total,
      });
    } catch (error) {
      toast.error('Failed to load pump expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, perPage, startDate, endDate]);

  const handleResetFilters = () => {
    setDateValue({ startDate: null, endDate: null });
    setSearchTerm('');
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      
      const response = await api.get(`/pump-expenses/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pump_expenses.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export expenses report');
    }
  };

  const handleExportPdf = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      
      const response = await api.get(`/pump-expenses/export/pdf?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pump_expenses.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export expenses as PDF');
    }
  };

  const filteredExpenses = expenses.filter((expense: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (expense.date && expense.date.toLowerCase().includes(term)) ||
      (expense.remark && expense.remark.toLowerCase().includes(term)) ||
      (expense.amount && String(expense.amount).includes(term))
    );
  });

  return (
    <div className="p-4 md:p-8 animate-fade max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Pump Expenses</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Track daily date-wise pump expenses and remarks.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Search</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto z-10 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date Range</label>
            <div className="w-full sm:w-64">
              <DateRangeDropdown
                startDate={dateValue.startDate}
                endDate={dateValue.endDate}
                onChange={(newValue) => setDateValue(newValue)}
                placeholder="Select date range"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end w-full sm:w-auto sm:mb-[2px] mt-2 sm:mt-0 gap-2 sm:flex-row">
            <button
              onClick={handleExport}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors w-full h-full sm:mt-[22px] shadow-sm text-xs whitespace-nowrap"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={handleExportPdf}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-colors w-full h-full sm:mt-[22px] shadow-sm text-xs whitespace-nowrap"
            >
              ↓ Export PDF
            </button>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl font-black transition-colors w-full h-full sm:mt-[22px]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl h-16 animate-pulse w-full"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Remark / Particulars</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense: any, index: number) => (
                  <tr key={`${expense.date}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-black text-slate-800 whitespace-nowrap">{expense.date || '—'}</div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-medium text-slate-600">
                        {expense.remark || <span className="text-slate-400 italic font-normal">Unspecified Expense</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-rose-600 whitespace-nowrap">{formatCurrency(expense.amount)}</div>
                    </td>
                  </tr>
                ))}
                
                {filteredExpenses.length > 0 && (
                  <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                    <td colSpan={2} className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-slate-800 uppercase tracking-wider">Total Amount</div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-blue-600 whitespace-nowrap">{formatCurrency(totalAmount)}</div>
                    </td>
                  </tr>
                )}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-16 text-center">
                      <div className="text-slate-200 mb-3 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-black text-slate-700">No Pump Expenses Found</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1">Try adjusting your date filters or check back later.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-slate-100 bg-slate-50/30">
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
                    className="px-2 py-1 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500 shadow-sm"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 bg-white text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-200 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => {
                    // Basic pagination logic to avoid rendering too many buttons
                    if (
                      p === 1 || 
                      p === pagination.last_page || 
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shadow-sm ${
                            page === p
                              ? 'bg-blue-600 text-white border border-blue-600'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    } else if (
                      (p === page - 2 && page > 3) || 
                      (p === page + 2 && page < pagination.last_page - 2)
                    ) {
                      return <span key={p} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={page === pagination.last_page}
                    className="p-2 bg-white text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-200 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PumpExpensesPage;
