import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addCreditor, updateCreditor, type Creditor } from '../features/creditors/creditorSlice';
import type { AppDispatch } from '../store';

interface CreditorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Creditor | null;
}

const CreditorFormModal: React.FC<CreditorFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setOpeningBalance(Number(initialData.opening_balance) || 0);
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
    } else {
      setName('');
      setOpeningBalance('');
      setPhone('');
      setEmail('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        opening_balance: openingBalance !== '' ? Number(openingBalance) : 0,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };

      if (initialData) {
        await dispatch(updateCreditor({ ...payload, id: initialData.id })).unwrap();
        toast.success('Creditor profile updated successfully');
      } else {
        await dispatch(addCreditor(payload)).unwrap();
        toast.success('Creditor profile added successfully');
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save creditor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-fade border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {initialData ? 'Edit Creditor Profile' : 'Add New Creditor'}
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
              Creditor Name / Company Group
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. Jivanta Group"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value === '' ? '' : Number(e.target.value))}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={!!initialData}
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium ${
                initialData ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              placeholder="e.g. 250000.00"
            />
            {initialData && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Opening balance cannot be modified once set. Adjust via ledger transactions instead.
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. contact@jivanta.com"
            />
          </div>

          <div className="flex gap-4 pt-4">
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
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditorFormModal;
