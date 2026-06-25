import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import DateRangeDropdown from '../components/DateRangeDropdown';

const CashBalancePage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Format date helper: yyyy-mm-dd to dd/mm/yyyy
  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchCashBalance = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));

      const response = await api.get(`/daily-sales/cash-balance?${params.toString()}`);
      
      setRecords(response.data.data.data || []);
      setTotals(response.data.totals || null);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total,
      });
    } catch (error) {
      toast.error('Failed to load cash balance report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashBalance();
  }, [page, perPage, startDate, endDate]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setPage(1);
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (record.date && record.date.toLowerCase().includes(term)) ||
      (record.coin && String(record.coin).includes(term)) ||
      (record.miss && String(record.miss).includes(term)) ||
      (record.balance_in_pump && String(record.balance_in_pump).includes(term))
    );
  });

  return (
    <div className="p-4 md:p-8 animate-fade max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Cash Balance Report</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Track day-wise coins, missing cash, and pump balance.
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
                startDate={startDate}
                endDate={endDate}
                onChange={({ startDate: s, endDate: e }) => { 
                  setStartDate(s || ''); 
                  setEndDate(e || ''); 
                  setPage(1); 
                }}
                placeholder="Select date range"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end w-full sm:w-auto sm:mb-[2px] mt-2 sm:mt-0 gap-2 sm:flex-row">
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
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Coins</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Missing / Short</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Balance in Pump</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-black text-slate-800 whitespace-nowrap">{record.date || '—'}</div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-bold text-slate-600 whitespace-nowrap">{formatCurrency(record.coin)}</div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className={`text-sm font-bold whitespace-nowrap ${record.miss < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(record.miss)}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-blue-600 whitespace-nowrap">{formatCurrency(record.balance_in_pump)}</div>
                    </td>
                  </tr>
                ))}
                
                {filteredRecords.length > 0 && totals && (
                  <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-black text-slate-800 whitespace-nowrap uppercase tracking-wider">Total</div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-slate-800 whitespace-nowrap">{formatCurrency(totals.total_coin)}</div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className={`text-sm font-black whitespace-nowrap ${totals.total_miss < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(totals.total_miss)}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-blue-600 whitespace-nowrap">{formatCurrency(totals.total_balance_in_pump)}</div>
                    </td>
                  </tr>
                )}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="text-slate-200 mb-3 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-black text-slate-700">No Records Found</h3>
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

export default CashBalancePage;
