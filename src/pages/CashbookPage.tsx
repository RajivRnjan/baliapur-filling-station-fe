import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

import DateRangeDropdown from '../components/DateRangeDropdown';
import api from '../utils/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface CashbookRecord {
  id: number;
  date: string;
  type: 'receipt' | 'payment';
  particulars: string;
  cash_amount: number;
  bank_amount: number;
  remark?: string;
}

const CashbookPage: React.FC = () => {
  const [records, setRecords] = useState<CashbookRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CashbookRecord | null>(null);
  const [totals, setTotals] = useState<any>(null);
  
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('');
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
  };

  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<'receipt' | 'payment'>('receipt');
  const [formParticulars, setFormParticulars] = useState('');
  const [formCash, setFormCash] = useState<number | string>('');
  const [formBank, setFormBank] = useState<number | string>('');
  const [formRemark, setFormRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      if (filterType) params.append('type', filterType);

      const response = await api.get(`/cashbooks?${params.toString()}`);
      setRecords(response.data.cashbooks?.data || response.data.data || []);
      setTotals(response.data.totals || null);
    } catch (e) {
      toast.error('Failed to fetch cashbook records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [startDate, endDate, filterType]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      
      const response = await api.get(`/cashbooks/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cashbook_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export cashbook report');
    }
  };

  const handleExportPdf = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDateForApi(startDate));
      if (endDate) params.append('end_date', formatDateForApi(endDate));
      
      const response = await api.get(`/cashbooks/export/pdf?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cashbook_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export cashbook report as PDF');
    }
  };

  const openModal = (record?: CashbookRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormDate(record.date.split('T')[0] || record.date.split(' ')[0]);
      setFormType(record.type);
      setFormParticulars(record.particulars);
      setFormCash(record.cash_amount);
      setFormBank(record.bank_amount);
      setFormRemark(record.remark || '');
    } else {
      setEditingRecord(null);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormType('receipt');
      setFormParticulars('');
      setFormCash('');
      setFormBank('');
      setFormRemark('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        date: formDate, // Send native YYYY-MM-DD for POST/PUT
        type: formType,
        particulars: formParticulars,
        cash_amount: Number(formCash) || 0,
        bank_amount: Number(formBank) || 0,
        remark: formRemark
      };

      if (editingRecord) {
        await api.put(`/cashbooks/${editingRecord.id}`, payload);
        toast.success('Cashbook record updated');
      } else {
        await api.post('/cashbooks', payload);
        toast.success('Cashbook record added');
      }
      setIsModalOpen(false);
      fetchRecords();
    } catch (err) {
      toast.error('Failed to save cashbook record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/cashbooks/${id}`);
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (e) {
      toast.error('Failed to delete record');
    }
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const formattedDate = record.date ? record.date.split('T')[0].split('-').reverse().join('-') : '';
    return (
      formattedDate.includes(term) ||
      (record.type && record.type.toLowerCase().includes(term)) ||
      (record.particulars && record.particulars.toLowerCase().includes(term)) ||
      (record.cash_amount && String(record.cash_amount).includes(term)) ||
      (record.bank_amount && String(record.bank_amount).includes(term)) ||
      (record.remark && record.remark.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 md:p-8 animate-fade max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Cashbook</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Manage receipts and payments
          </p>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h4 className="text-xl font-black text-slate-800">Cashbook Records</h4>
              <div className="flex gap-3">
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
                {isSuperAdmin && (
                  <button 
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    + Add Record
                  </button>
                )}
              </div>
            </div>

            {/* Minimal Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-all w-full sm:w-auto"
              />
              <select
                value={presetRange}
                onChange={(e) => handlePresetRange(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-all w-full sm:w-auto"
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
              
              <div className="z-10 relative w-full sm:w-auto">
                <DateRangeDropdown
                  startDate={startDate}
                  endDate={endDate}
                  onChange={({ startDate: s, endDate: e }) => { 
                    setStartDate(s || ''); 
                    setEndDate(e || ''); 
                    setPresetRange('');
                  }}
                  placeholder="Select date range"
                  inputClassName="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-all w-full sm:w-auto"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-all w-full sm:w-auto"
              >
                <option value="">All Types</option>
                <option value="receipt">Receipt</option>
                <option value="payment">Payment</option>
              </select>

              <button
                onClick={() => {
                  setPresetRange('');
                  setStartDate('');
                  setEndDate('');
                  setFilterType('');
                  setSearchTerm('');
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-black transition-colors shrink-0"
              >
                Reset
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Particulars</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cash Amount</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Bank Amount</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Remark</th>
                    {isSuperAdmin && <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-600">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center">Loading...</td></tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-400">No records found.</td></tr>
                  ) : filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-slate-800">{record.date.split('T')[0].split('-').reverse().join('-')}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${record.type === 'receipt' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">{record.particulars}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(record.cash_amount)}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(record.bank_amount)}</td>
                      <td className="py-4 px-4 text-slate-500">{record.remark || '-'}</td>
                      {isSuperAdmin && (
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => openModal(record)}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Record"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(record.id)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  
                  {totals && filteredRecords.length > 0 && (
                    <tr className="bg-slate-100/80 border-t-2 border-slate-300">
                      <td colSpan={3} className="py-4 px-4 text-right">
                        <div className="text-sm font-black text-slate-800 uppercase tracking-wider">TOTAL</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`text-sm font-black ${
                          (filterType === 'receipt' ? totals.receipts_cash : (filterType === 'payment' ? totals.payments_cash : totals.receipts_cash - totals.payments_cash)) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {formatCurrency(filterType === 'receipt' ? totals.receipts_cash : (filterType === 'payment' ? totals.payments_cash : totals.receipts_cash - totals.payments_cash))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`text-sm font-black ${
                          (filterType === 'receipt' ? totals.receipts_bank : (filterType === 'payment' ? totals.payments_bank : totals.receipts_bank - totals.payments_bank)) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {formatCurrency(filterType === 'receipt' ? totals.receipts_bank : (filterType === 'payment' ? totals.payments_bank : totals.receipts_bank - totals.payments_bank))}
                        </div>
                      </td>
                      <td className="py-4 px-4"></td>
                      {isSuperAdmin && <td></td>}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-6">{editingRecord ? 'Edit Record' : 'Add Record'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'receipt' | 'payment')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-800"
                >
                  <option value="receipt">Receipt</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Particulars</label>
                <input
                  type="text"
                  value={formParticulars}
                  onChange={(e) => setFormParticulars(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cash Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCash}
                    onChange={(e) => setFormCash(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remark</label>
                <input
                  type="text"
                  value={formRemark}
                  onChange={(e) => setFormRemark(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-800"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbookPage;
