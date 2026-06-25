import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addTransaction, updateTransaction } from '../features/creditors/creditorSlice';
import type { AppDispatch } from '../store';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditorId: number;
  initialData?: any | null; // Selected transaction for editing, if any
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  creditorId,
  initialData,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [date, setDate] = useState('');
  const [creditAmount, setCreditAmount] = useState<number | ''>('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default values when modal opens
  React.useEffect(() => {
    if (initialData) {
      setDate(initialData.date || '');
      setCreditAmount(Number(initialData.credit_amount) || 0);
      setPaymentAmount(Number(initialData.payment_amount) || 0);
      setRemark(initialData.remark || '');
    } else {
      // Default to current date in local YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setCreditAmount('');
      setPaymentAmount('');
      setRemark('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Transaction date is required');
      return;
    }

    const credit = creditAmount !== '' ? Number(creditAmount) : 0;
    const payment = paymentAmount !== '' ? Number(paymentAmount) : 0;

    if (credit === 0 && payment === 0) {
      toast.error('Please enter either a Credit Amount or a Payment Amount');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        // Edit transaction
        await dispatch(
          updateTransaction({
            creditorId,
            transactionId: initialData.id,
            date,
            credit_amount: credit,
            payment_amount: payment,
            remark: remark.trim() || undefined,
          })
        ).unwrap();
        toast.success('Ledger transaction updated successfully');
      } else {
        // Create transaction
        await dispatch(
          addTransaction({
            creditorId,
            date,
            credit_amount: credit,
            payment_amount: payment,
            remark: remark.trim() || undefined,
          })
        ).unwrap();
        toast.success('Transaction posted to ledger successfully');
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to post transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-fade border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {initialData ? 'Edit Ledger Row' : 'Post Transaction'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Credit Purchase (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                placeholder="e.g. 50000.00"
              />
              <span className="text-[9px] text-slate-400 mt-1 block">Fuel taken on credit</span>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Payment Received (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                placeholder="e.g. 200000.00"
              />
              <span className="text-[9px] text-slate-400 mt-1 block">Repayment / billing</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Remark / Description
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium h-20 resize-none"
              placeholder="e.g. Paid via check / Bulk diesel delivery"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-600/10"
            >
              {isSubmitting ? 'Posting...' : initialData ? 'Save Changes' : 'Post Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
