import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface DailySaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number | null;
}

const displayDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
    }
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
};

const DailySaleDetailModal: React.FC<DailySaleDetailModalProps> = ({ isOpen, onClose, saleId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && saleId) {
      loadReportDetails(saleId);
    }
  }, [isOpen, saleId]);

  const loadReportDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/daily-sales/${id}`);
      setReport(response.data.report);
    } catch (err: any) {
      toast.error('Failed to load report details');
      console.error(err);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto py-10">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-5xl shadow-2xl animate-fade my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Daily Sales Report Details
            </h2>
            {report && (
              <p className="text-sm font-bold text-blue-600 mt-1">
                Date: {displayDate(report.date)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="py-20 text-center text-slate-400 font-bold animate-pulse">
            Fetching detailed calculations...
          </div>
        )}

        {!isLoading && report && (() => {
          const rates = {
            MS: report.rate_ms ?? report.rates?.MS ?? 0,
            HSD: report.rate_hsd ?? report.rates?.HSD ?? 0,
            XP: report.rate_xp ?? report.rates?.XP ?? 0,
          };
          const lubricantSale = report.lubricant_sale ?? report.totals?.lubricant_sale ?? 0;
          const density = report.density ?? 0;
          const totalFuelAmount = report.total_fuel_amount ?? report.totals?.total_fuel_amount ?? 0;
          const grandTotalAmount = report.grand_total_amount ?? report.totals?.grand_total_sale_amount ?? 0;
          const finalSaleAmount = report.final_sale_amount ?? report.totals?.final_sale_amount ?? 0;
          const totalFuelQty = report.total_fuel_qty ?? report.totals?.total_fuel_qty ?? (Object.values(report.fuel_summaries || {}).reduce((acc: number, curr: any) => acc + (curr.total_qty || 0), 0) as number);
          const msQty = report.ms_qty ?? report.totals?.ms_qty ?? 0;
          const hsdQty = report.hsd_qty ?? report.totals?.hsd_qty ?? 0;
          const xpQty = report.xp_qty ?? report.totals?.xp_qty ?? 0;
          const msAmount = report.ms_amount ?? report.totals?.ms_amount ?? (msQty * rates.MS);
          const hsdAmount = report.hsd_amount ?? report.totals?.hsd_amount ?? (hsdQty * rates.HSD);
          const xpAmount = report.xp_amount ?? report.totals?.xp_amount ?? (xpQty * rates.XP);
          const totalAmount = report.total_amount ?? report.totals?.total_amount ?? finalSaleAmount;

          const creditPaymentReceived = report.credit_payment_received ?? report.reconciliation?.credit_payment_received ?? (Array.isArray(report.credit_payments) ? report.credit_payments.reduce((a:number, c:any)=>a+Number(c.amount||0),0) : 0);
          const acTransfer = report.ac_transfer ?? report.reconciliation?.ac_transfer ?? 0;
          const online = report.online ?? report.reconciliation?.online ?? (Array.isArray(report.online_payments) ? report.online_payments.reduce((a:number, c:any)=>a+Number(c.amount||0),0) : 0);
          const creditor = report.creditor ?? report.reconciliation?.creditor ?? (Array.isArray(report.credit_givens) ? report.credit_givens.reduce((a:number, c:any)=>a+Number(c.amount||0),0) : 0);
          const expense = report.expense ?? report.reconciliation?.expense ?? 0;
          const staff = report.staff ?? report.reconciliation?.staff ?? (Array.isArray(report.staff_payouts) ? report.staff_payouts.reduce((a:number, c:any)=>a+Number(c.amount||0),0) : 0);
          const owner_1 = report.owner_1 ?? report.reconciliation?.owner_1 ?? 0;
          const owner_2 = report.owner_2 ?? report.reconciliation?.owner_2 ?? 0;
          const cashToBeCollected = report.cash_to_be_collected ?? report.reconciliation?.cash_to_be_collected ?? 0;
          const previousPumpBalance = report.previous_pump_balance ?? report.reconciliation?.previous_pump_balance ?? 0;
          const cashCollection = report.cash_collection ?? report.reconciliation?.cash_collection ?? 0;
          const coin = report.coin ?? report.reconciliation?.coin ?? 0;
          const miss = report.miss ?? report.reconciliation?.miss ?? 0;
          const expectedBalance = report.expected_balance ?? report.reconciliation?.expected_balance ?? 0;
          const actualBalanceInPump = report.actual_balance_in_pump ?? report.reconciliation?.actual_balance_in_pump ?? 0;

          return (
            <div className="space-y-8">
              {/* Rates & Base Data */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Rate MS (Petrol)</div>
                  <div className="text-lg font-black text-slate-800">{formatCurrency(rates.MS)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Rate HSD (Diesel)</div>
                  <div className="text-lg font-black text-slate-800">{formatCurrency(rates.HSD)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Rate XP (Premium)</div>
                  <div className="text-lg font-black text-slate-800">{formatCurrency(rates.XP)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Lubricant Sale</div>
                  <div className="text-lg font-black text-slate-800">{formatCurrency(lubricantSale)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Density</div>
                  <div className="text-lg font-black text-slate-800">{density}</div>
                </div>
              </div>

              {/* Nozzle Readings Table */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Nozzle Meter Readings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Nozzle No</th>
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Fuel Type</th>
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Previous Reading</th>
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Closing Reading</th>
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Testing (Ltr)</th>
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Sale Qty (Ltr)</th>
                        <th className="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-slate-600">
                      {!report.nozzle_readings || report.nozzle_readings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-400">
                            Nozzle readings not available for this record.
                          </td>
                        </tr>
                      ) : (
                        report.nozzle_readings.map((nr: any, index: number) => (
                          <tr key={index} className="border-b border-slate-100 last:border-0">
                            <td className="py-3 font-bold text-slate-800">{nr.nozzle_no}</td>
                            <td className="py-3 text-xs font-bold text-blue-600">{nr.fuel_type}</td>
                            <td className="py-3 text-right font-mono text-xs">{nr.previous_closing_reading?.toFixed(2)}</td>
                            <td className="py-3 text-right font-mono text-xs">{nr.closing_reading?.toFixed(2)}</td>
                            <td className="py-3 text-right font-mono text-xs text-emerald-600 font-semibold">{nr.testing_qty ? `${Number(nr.testing_qty).toFixed(2)} L` : '-'}</td>
                            <td className="py-3 text-right font-black text-slate-800">{nr.sale_qty?.toFixed(2)} L</td>
                            <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(nr.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reconciliation and Testing details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Summaries & Totals */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-200 pb-2">Sales & Testing Summaries</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">MS / HSD / XP Qty:</span>
                      <span className="font-bold text-slate-800">
                        {msQty.toFixed(2)} / {hsdQty.toFixed(2)} / {xpQty.toFixed(2)} L
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-100 pb-2 mb-2">
                      <span className="text-slate-500 font-medium">Total Fuel Sales Qty:</span>
                      <span className="font-black text-slate-800">
                        {totalFuelQty.toFixed(2)} L
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">MS Amount:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(msAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">HSD Amount:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(hsdAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-100 pb-2 mb-2">
                      <span className="text-slate-500 font-medium">XP Amount:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(xpAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Fuel Amount:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(totalFuelAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Lubricant Sale Extra:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(lubricantSale)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Grand Total Sales:</span>
                      <span className="font-black text-slate-800">{formatCurrency(grandTotalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black border-t border-slate-200 pt-2 text-blue-700">
                      <span>Total Sales Amount:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Cash Reconciliation */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-200 pb-2">Cash Flow & Reconciliation</h3>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credit Recovered Received:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(creditPaymentReceived)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank A/C Direct Transfer:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(acTransfer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Online UPI / Paytm:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(online)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">New Credit Given (Creditor):</span>
                      <span className="font-bold text-slate-800">{formatCurrency(creditor)}</span>
                    </div>
                    {(!report.pump_expenses && (!report.reconciliation || !report.reconciliation.pump_expenses) || (report.pump_expenses || report.reconciliation?.pump_expenses || []).length === 0) ? (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pump Daily Expenses:</span>
                        <span className="font-bold text-slate-800">{formatCurrency(expense)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col pb-1">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-slate-500">Pump Daily Expenses:</span>
                          <span className="font-bold text-slate-800">{formatCurrency(expense)}</span>
                        </div>
                        <div className="flex flex-col gap-1 pl-3 border-l-2 border-amber-200 ml-1">
                          {(report.pump_expenses || report.reconciliation?.pump_expenses || []).map((pe: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[10px] text-slate-600 font-medium">
                              <span className="truncate pr-2 text-slate-500">- {pe.remark || 'Unspecified Expense'}</span>
                              <span className="font-mono text-slate-700">{formatCurrency(pe.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Staff Salary Payout:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(staff)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Owners Draw (Owner 1 / 2):</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(owner_1)} / {formatCurrency(owner_2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-700">Expected Physical Cash Collection:</span>
                      <span className="text-slate-800">{formatCurrency(cashToBeCollected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Actual Cash Physically Collected:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(cashCollection)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coins Value:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(coin)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Deficit Missing / Shortage:</span>
                      <span className="font-bold">{formatCurrency(miss)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-500">Previous Pump Balance Cash:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(previousPumpBalance)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 text-sm">
                      <span>Expected Pump Balance Cash:</span>
                      <span>{formatCurrency(expectedBalance)}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-800 text-sm">
                      <span>Actual Closing Balance In Pump:</span>
                      <span>{formatCurrency(actualBalanceInPump)}</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex gap-4 pt-6 border-t border-slate-100 mt-8 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailySaleDetailModal;
