import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import type { RootState } from '../store';

const StaffDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  // Prevent non-STAFF from accessing this
  if (user?.role !== 'STAFF') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchSalary = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/staff-salaries?month=${month}&year=${year}`);
      // As a staff member, it should return an array with just their own report
      if (response.data.reports && response.data.reports.length > 0) {
        setReport(response.data.reports[0]);
      } else {
        setReport(null);
      }
    } catch (error) {
      toast.error('Failed to load salary details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, [month, year]);

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
    <div className="p-4 md:p-8 animate-fade max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Welcome, {user.name}</h1>
        <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
          Here is your salary and payout overview.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
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

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-3xl h-64 animate-pulse shadow-sm"></div>
      ) : report ? (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100/50">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Monthly Salary</div>
              <div className="text-3xl font-black text-blue-600">{formatCurrency(report.salary)}</div>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100/50">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Paid This Month</div>
              <div className="text-3xl font-black text-emerald-600">{formatCurrency(report.total_paid)}</div>
            </div>

            <div className={`p-6 rounded-2xl border ${report.remaining < 0 ? 'bg-rose-50 border-rose-100/50' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${report.remaining < 0 ? 'text-rose-400' : 'text-slate-400'}`}>Remaining Balance</div>
              <div className={`text-3xl font-black ${report.remaining < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {formatCurrency(report.remaining)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">Payout History</h3>
            {report.payouts && report.payouts.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {report.payouts.map((payout: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl hover:border-blue-200 transition-colors">
                    <span className="font-bold text-slate-700">{payout.date}</span>
                    <span className="font-black text-lg text-emerald-600">+{formatCurrency(payout.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-base font-semibold text-slate-400 italic bg-slate-50 border border-slate-100 p-8 rounded-xl text-center">
                No payouts recorded for this month.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500 font-bold">No salary data found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
