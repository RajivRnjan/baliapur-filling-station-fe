import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchCreditors,
  deleteCreditor,
  fetchLedger,
  deleteTransaction,
  clearSelectedLedger,
  type Creditor,
} from '../features/creditors/creditorSlice';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CreditorFormModal from '../components/CreditorFormModal';
import TransactionFormModal from '../components/TransactionFormModal';
import CreditorDetailModal from '../components/CreditorDetailModal';
import api from '../utils/api';

const CreditorsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: creditors,
    selectedCreditor,
    selectedLedger,
    status,
    ledgerStatus,
    pagination,
  } = useSelector((state: RootState) => state.creditors);
  const { user } = useSelector((state: RootState) => state.auth);

  // Search, Pagination & Modals State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [isCreditorModalOpen, setIsCreditorModalOpen] = useState(false);
  const [editingCreditor, setEditingCreditor] = useState<Creditor | null>(null);

  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<any | null>(null);

  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Creditor | null>(null);

  // Role Checks
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role?.toUpperCase() === 'SUPER ADMIN';

  useEffect(() => {
    dispatch(fetchCreditors({
      page,
      per_page: perPage,
    }));
  }, [dispatch, page, perPage]);

  // Handle Creditor Deletion
  const handleDeleteCreditor = (id: number, name: string) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can delete creditor accounts');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-bold text-slate-800">Confirm Account Deletion</p>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{name}</span>?
            <br />
            <span className="text-rose-600 font-bold">WARNING: This will permanently delete all associated ledger transactions!</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteCreditor(id)).unwrap();
                toast.success('Creditor account deleted successfully');
              } catch (e: any) {
                toast.error(e || 'Failed to delete creditor account');
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
      duration: 7000,
      style: {
        background: '#fff',
        color: '#334155',
        border: '1px solid #e2e8f0',
      }
    });
  };

  // Handle Transaction Deletion
  const handleDeleteTransaction = (txnId: number, creditorId: number) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can delete ledger rows');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-bold text-slate-800">Confirm Ledger Row Deletion</p>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete this transaction from the ledger? The running balances will automatically recalculate.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteTransaction({ creditorId, transactionId: txnId })).unwrap();
                toast.success('Transaction deleted from ledger');
              } catch (e: any) {
                toast.error(e || 'Failed to delete transaction');
              }
            }}
          >
            Delete Row
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

  // Filter Creditors
  const filteredCreditors = creditors.filter(creditor => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (creditor.name && creditor.name.toLowerCase().includes(term)) ||
      (creditor.phone && creditor.phone.toLowerCase().includes(term)) ||
      (creditor.email && creditor.email.toLowerCase().includes(term)) ||
      (creditor.opening_balance && String(creditor.opening_balance).includes(term)) ||
      (creditor.current_balance && String(creditor.current_balance).includes(term))
    );
  });

  // Compute Outstanding stats
  const totalOutstanding = creditors.reduce((sum, curr) => sum + (Number(curr.current_balance) || 0), 0);
  const highestBalanceCreditor = creditors.reduce(
    (max, curr) => (Number(curr.current_balance) > Number(max?.current_balance || 0) ? curr : max),
    null as Creditor | null
  );

  // View modes: list or single-creditor ledger sheet
  if (selectedCreditor) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Ledger Detail View Header */}
            <header className="mb-10 animate-fade flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <button
                  onClick={() => dispatch(clearSelectedLedger())}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Accounts
                </button>
                <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                  Running <span className="text-blue-600">Ledger</span>
                </h1>
                <p className="text-slate-500 font-medium">
                  {selectedCreditor.name} • Detailed Statement & Running Balance
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <button
                  onClick={async () => {
                    try {
                      const response = await api.get(`/creditors/${selectedCreditor.id}/ledger/export`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${selectedCreditor.name.replace(/\s+/g, '_')}_ledger.csv`);
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode?.removeChild(link);
                    } catch(e) {
                      toast.error('Failed to export Excel');
                    }
                  }}
                  className="px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md text-sm active:scale-95 flex items-center gap-2"
                >
                  ↓ Excel
                </button>

                <button
                  onClick={async () => {
                    try {
                      const response = await api.get(`/creditors/${selectedCreditor.id}/ledger/export/pdf`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${selectedCreditor.name.replace(/\s+/g, '_')}_ledger.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode?.removeChild(link);
                    } catch(e) {
                      toast.error('Failed to export PDF');
                    }
                  }}
                  className="px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md text-sm active:scale-95 flex items-center gap-2"
                >
                  ↓ PDF
                </button>
                <button
                  onClick={() => {
                    setEditingCreditor(selectedCreditor);
                    setIsCreditorModalOpen(true);
                  }}
                  className={`px-5 py-3 rounded-xl font-bold text-sm border transition-all flex items-center gap-2 ${
                    isSuperAdmin
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={isSuperAdmin ? 'Edit Profile' : 'Super Admin Only'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  Edit Profile {!isSuperAdmin && '🔒'}
                </button>

                <button
                  onClick={() => {
                    setEditingTxn(null);
                    setIsTxnModalOpen(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/15 text-sm active:scale-95 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                  Post Transaction
                </button>
              </div>
            </header>

            {/* Creditor Details Sleek Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade">
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 text-[10rem] font-black text-slate-800/20 translate-x-12 translate-y-12 select-none">
                  ₹
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Outstanding</span>
                  <div className="text-3xl font-black mt-2 tracking-tight text-blue-400">
                    ₹{Number(selectedCreditor.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-4">
                  Opening Balance: ₹{Number(selectedCreditor.opening_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Information</span>
                  <div className="text-lg font-black text-slate-800 mt-2 truncate">
                    {selectedCreditor.phone || 'No Phone Registered'}
                  </div>
                  <div className="text-sm text-slate-500 font-medium mt-1 truncate">
                    {selectedCreditor.email || 'No Email Registered'}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-4 font-semibold">
                  Account ID: #{selectedCreditor.id}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Statement Format</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-wide">
                  Excel Replica Grid
                </div>
                <p className="text-[11px] text-slate-400 mt-2 max-w-[200px]">
                  Showing chronological ledger entries with active running balances.
                </p>
              </div>
            </div>

            {/* Excel Ledger Replica Grid */}
            <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-fade">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Ledger Statement</h3>
                <span className="text-xs font-bold text-slate-400">Chronological Order</span>
              </div>

              {ledgerStatus === 'loading' ? (
                <div className="py-20 text-center text-slate-500 font-semibold">Loading statement logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Date</th>
                        <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Credit Amount (₹)</th>
                        <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Payment Amount (₹)</th>
                        <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Running Balance (₹)</th>
                        <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-6">Remark / Particulars</th>
                        <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLedger.map((row) => {
                        const isOp = row.is_opening;
                        return (
                          <tr
                            key={isOp ? 'opening' : row.id}
                            className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${
                              isOp ? 'bg-slate-50/40 font-semibold' : ''
                            }`}
                          >
                            {/* Date */}
                            <td className="py-4 pl-4 text-sm font-black text-slate-700">
                              {isOp ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-blue-50 text-blue-600">
                                  {row.date}
                                </span>
                              ) : (
                                row.date
                              )}
                            </td>

                            {/* Credit Amount */}
                            <td className="py-4 text-sm font-bold text-slate-700 text-right">
                              {isOp || Number(row.credit_amount) === 0 ? (
                                <span className="text-slate-300">-</span>
                              ) : (
                                <span className="text-rose-600 font-bold">
                                  +₹{Number(row.credit_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>

                            {/* Payment Amount */}
                            <td className="py-4 text-sm font-bold text-slate-700 text-right">
                              {isOp || Number(row.payment_amount) === 0 ? (
                                <span className="text-slate-300">-</span>
                              ) : (
                                <span className="text-emerald-600 font-bold">
                                  -₹{Number(row.payment_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>

                            {/* Running Balance */}
                            <td className="py-4 text-sm font-black text-slate-800 text-right">
                              ₹{Number(row.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Remark */}
                            <td className="py-4 text-sm text-slate-500 font-medium pl-6 max-w-xs truncate">
                              {row.remark || <span className="text-slate-300 italic">No remark</span>}
                            </td>

                            {/* Actions */}
                            <td className="py-4 text-right pr-4">
                              {isOp ? (
                                <span className="text-[10px] text-slate-400 font-semibold">System Root</span>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      if (!isSuperAdmin) {
                                        toast.error('Only Super Admins can edit ledger rows');
                                        return;
                                      }
                                      setEditingTxn(row);
                                      setIsTxnModalOpen(true);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 ${
                                      isSuperAdmin
                                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                    title={isSuperAdmin ? 'Edit Row' : 'Super Admin Only'}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTransaction(row.id!, selectedCreditor.id)}
                                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 ${
                                      isSuperAdmin
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                    title={isSuperAdmin ? 'Delete Row' : 'Super Admin Only'}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <CreditorFormModal
          isOpen={isCreditorModalOpen}
          onClose={() => {
            setIsCreditorModalOpen(false);
            setEditingCreditor(null);
          }}
          initialData={editingCreditor}
        />

        <TransactionFormModal
          isOpen={isTxnModalOpen}
          onClose={() => {
            setIsTxnModalOpen(false);
            setEditingTxn(null);
          }}
          creditorId={selectedCreditor.id}
          initialData={editingTxn}
        />
      </Layout>
    );
  }

  // DEFAULT VIEW: LIST CREDITORS
  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-12 animate-fade flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                Creditors & <span className="text-blue-600">Ledger</span>
              </h1>
              <p className="text-slate-500 font-medium">
                Manage credit accounts, repayments, and detailed running balance statements
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCreditor(null);
                setIsCreditorModalOpen(true);
              }}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/15 text-sm active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
              Add Creditor Account
            </button>
          </header>

          {/* Quick Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Custom Credit</span>
              <div className="text-4xl font-black text-slate-800 tracking-tighter mt-2">
                ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-slate-400 text-xs mt-2 font-medium">Sum of all outstanding bills</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Accounts</span>
              <div className="text-4xl font-black text-slate-800 tracking-tighter mt-2">
                {creditors.length}
              </div>
              <p className="text-slate-400 text-xs mt-2 font-medium">Profiles registered</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Creditor</span>
              <div className="text-2xl font-black text-blue-600 truncate mt-2">
                {highestBalanceCreditor ? highestBalanceCreditor.name : 'None'}
              </div>
              <p className="text-slate-400 text-xs mt-1 font-medium truncate">
                {highestBalanceCreditor
                  ? `Owing ₹${Number(highestBalanceCreditor.current_balance).toLocaleString('en-IN')}`
                  : 'Zero outstanding'}
              </p>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 mb-8 animate-fade">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search creditors by name, contact phone, or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-slate-700 font-medium placeholder-slate-400 focus:outline-none text-sm"
            />
          </div>

          {/* Creditors List Card Grid */}
          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-fade">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black text-slate-800">Accounts Registry</h4>
              <span className="text-xs font-bold text-slate-400">Alphabetical Index</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Creditor / Group</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-6">Contact details</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">Opening Balance</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right px-4">Current Outstanding</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCreditors.map((creditor, index) => (
                    <tr key={creditor.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      {/* Name */}
                      <td className="py-4 pl-4 text-sm font-black text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center font-black text-sm">
                            {(page - 1) * perPage + index + 1}
                          </div>
                          <div>
                            <span className="group-hover:text-blue-600 transition-colors cursor-pointer block" onClick={() => dispatch(fetchLedger(creditor.id))}>
                              {creditor.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-4 pl-6 text-sm text-slate-500 font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{creditor.phone || <span className="text-slate-300 italic font-normal">No Phone</span>}</span>
                          <span className="text-xs text-slate-400">{creditor.email || ''}</span>
                        </div>
                      </td>

                      {/* Opening Balance */}
                      <td className="py-4 text-sm font-bold text-slate-500 text-right px-4 font-mono">
                        ₹{Number(creditor.opening_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Current Balance */}
                      <td className="py-4 text-right px-4">
                        <span className={`text-base font-black font-mono ${Number(creditor.current_balance) > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          ₹{Number(creditor.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>



                      {/* Actions */}
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              setViewingProfile(creditor);
                              setIsProfileDetailOpen(true);
                            }}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-750 transition-colors"
                            title="View Profile Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          <button
                            onClick={() => dispatch(fetchLedger(creditor.id))}
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                            title="View Ledger Statement"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            Ledger
                          </button>

                          <button
                            onClick={() => {
                              if (!isSuperAdmin) {
                                toast.error('Only Super Admins can update creditor accounts');
                                  return;
                              }
                              setEditingCreditor(creditor);
                              setIsCreditorModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                              isSuperAdmin
                                ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            title={isSuperAdmin ? 'Edit Profile' : 'Super Admin Only'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteCreditor(creditor.id, creditor.name)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                              isSuperAdmin
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            title={isSuperAdmin ? 'Delete Account' : 'Super Admin Only'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCreditors.length === 0 && status !== 'loading' && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">No creditor accounts registered matching your search query.</span>
                        </div>
                      </td>
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

      <CreditorFormModal
        isOpen={isCreditorModalOpen}
        onClose={() => {
          setIsCreditorModalOpen(false);
          setEditingCreditor(null);
        }}
        initialData={editingCreditor}
      />

      <CreditorDetailModal
        isOpen={isProfileDetailOpen}
        onClose={() => {
          setIsProfileDetailOpen(false);
          setViewingProfile(null);
        }}
        creditor={viewingProfile}
      />
    </Layout>
  );
};

export default CreditorsPage;
