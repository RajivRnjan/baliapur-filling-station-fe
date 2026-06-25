import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import type { RootState } from '../store';

const StaffSalaryReportPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  // Prevent STAFF from accessing this overall report
  if (user?.role === 'STAFF') {
    return <Navigate to="/staff-dashboard" replace />;
  }

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/staff-salaries?month=${month}&year=${year}`);
      setSalaries(response.data.reports || []);
    } catch (error) {
      toast.error('Failed to load salary reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [month, year]);

  const filteredSalaries = salaries.filter(staff => {
    const term = searchTerm.toLowerCase();
    
    const matchesStaff = staff.name.toLowerCase().includes(term) || 
      (staff.phone && staff.phone.includes(term)) ||
      (staff.total_paid !== undefined && String(staff.total_paid).includes(term)) ||
      (staff.salary !== undefined && String(staff.salary).includes(term)) ||
      (staff.remaining !== undefined && String(staff.remaining).includes(term));
      
    if (matchesStaff) return true;
    
    if (staff.payouts && Array.isArray(staff.payouts)) {
      return staff.payouts.some((payout: any) => 
        (payout.amount !== undefined && String(payout.amount).includes(term)) ||
        (payout.date && payout.date.toLowerCase().includes(term)) ||
        (payout.salary_label && payout.salary_label.toLowerCase().includes(term))
      );
    }
    
    return false;
  });

  const handleExport = async () => {
    try {
      const response = await api.get(`/staff-salaries/export?month=${month}&year=${year}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `staff_salaries_${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export staff salaries');
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await api.get(`/staff-salaries/export/pdf?month=${month}&year=${year}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `staff_salaries_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Failed to export PDF');
    }
  };

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="p-4 md:p-8 animate-fade max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Staff Salaries</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Track and manage staff payouts and remaining balances.
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            ↓ CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            ↓ PDF
          </button>
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm w-full sm:w-auto"
          />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Staff Name</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Monthly Salary</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Paid This Month</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Remaining</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[250px]">Payout History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSalaries.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 align-top">
                      <div className="text-sm font-black text-slate-800 whitespace-nowrap">{staff.name}</div>
                      <div className="text-xs font-bold text-slate-400 mt-0.5">{staff.phone || 'No Phone'}</div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="text-sm font-black text-blue-600 whitespace-nowrap">{formatCurrency(staff.salary)}</div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="text-sm font-black text-emerald-600 whitespace-nowrap">{formatCurrency(staff.total_paid)}</div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className={`text-sm font-black whitespace-nowrap ${staff.remaining < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {formatCurrency(staff.remaining)}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      {(() => {
                        const term = searchTerm.toLowerCase();
                        const matchesStaff = !term || staff.name.toLowerCase().includes(term) || 
                          (staff.phone && staff.phone.includes(term)) ||
                          (staff.total_paid !== undefined && String(staff.total_paid).includes(term)) ||
                          (staff.salary !== undefined && String(staff.salary).includes(term)) ||
                          (staff.remaining !== undefined && String(staff.remaining).includes(term));
                          
                        let displayPayouts = staff.payouts || [];
                        if (!matchesStaff && term && Array.isArray(displayPayouts)) {
                          displayPayouts = displayPayouts.filter((payout: any) => 
                            (payout.amount !== undefined && String(payout.amount).includes(term)) ||
                            (payout.date && payout.date.toLowerCase().includes(term)) ||
                            (payout.salary_label && payout.salary_label.toLowerCase().includes(term))
                          );
                        }

                        return displayPayouts && displayPayouts.length > 0 ? (
                          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {displayPayouts.map((payout: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-white border border-slate-100 p-2 rounded-lg text-xs hover:border-blue-100 transition-colors">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-slate-500 whitespace-nowrap">{payout.date || '—'}</span>
                                  {payout.salary_label && (
                                    <span className="text-[10px] font-bold text-purple-600 whitespace-nowrap">
                                      Salary: {payout.salary_label}
                                    </span>
                                  )}
                                </div>
                                <span className="font-black text-emerald-600">+{formatCurrency(payout.amount)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 italic">No payouts</span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                
                {filteredSalaries.length > 0 && (
                  <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="text-sm font-black text-slate-800 uppercase tracking-wider">Total Amount</div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-black text-blue-600 whitespace-nowrap">
                        {formatCurrency(filteredSalaries.reduce((sum: number, staff: any) => sum + (staff.salary || 0), 0))}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-black text-emerald-600 whitespace-nowrap">
                        {formatCurrency(filteredSalaries.reduce((sum: number, staff: any) => sum + (staff.total_paid || 0), 0))}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-black text-slate-800 whitespace-nowrap">
                        {formatCurrency(filteredSalaries.reduce((sum: number, staff: any) => sum + (staff.remaining || 0), 0))}
                      </div>
                    </td>
                    <td className="py-4 px-6"></td>
                  </tr>
                )}

                {filteredSalaries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="text-slate-300 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-black text-slate-700">No Staff Members Found</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1">There are no staff members to display salary reports for.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSalaryReportPage;
