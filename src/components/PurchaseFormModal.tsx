import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addPurchase, updatePurchase } from '../features/purchases/purchaseSlice';
import type { AppDispatch } from '../store';

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const parseDateToYmd = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split('T')[0];
};

const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ms, setMs] = useState<number | ''>('');
  const [hsd, setHsd] = useState<number | ''>('');
  const [xp, setXp] = useState<number | ''>('');
  const [isOpening, setIsOpening] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setDate(parseDateToYmd(initialData.date));
      setMs(initialData.ms ?? '');
      setHsd(initialData.hsd ?? '');
      setXp(initialData.xp ?? '');
      setIsOpening(!!initialData.is_opening);
      setRemarks(initialData.remarks || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setMs('');
      setHsd('');
      setXp('');
      setIsOpening(false);
      setRemarks('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setIsSubmitting(true);
    try {
      const payload = {
        date,
        ms: Number(ms) || 0,
        hsd: Number(hsd) || 0,
        xp: Number(xp) || 0,
        is_opening: isOpening ? 1 : 0,
        remarks: remarks || null
      };

      if (initialData) {
        await dispatch(updatePurchase({ ...payload, sl_no: initialData.sl_no || initialData.id })).unwrap();
        toast.success('Purchase updated successfully');
      } else {
        await dispatch(addPurchase(payload)).unwrap();
        toast.success('Purchase added successfully');
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save purchase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-fade max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">{initialData ? 'Edit Purchase' : 'Add Purchase'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">MS (Liters)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={ms}
                onChange={(e) => setMs(e.target.value === '' ? '' : Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-blue-800 font-medium placeholder-blue-300"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">HSD (Liters)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={hsd}
                onChange={(e) => setHsd(e.target.value === '' ? '' : Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-3 bg-cyan-50 border border-cyan-100 rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-transparent outline-none transition-all text-cyan-800 font-medium placeholder-cyan-300"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-purple-400 uppercase tracking-widest mb-2">XP (Liters)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={xp}
                onChange={(e) => setXp(e.target.value === '' ? '' : Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-purple-800 font-medium placeholder-purple-300"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <input
              type="checkbox"
              id="isOpening"
              checked={isOpening}
              onChange={(e) => setIsOpening(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
            />
            <label htmlFor="isOpening" className="text-sm font-bold text-amber-800 cursor-pointer select-none">
              Is Opening Stock?
            </label>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Invoice Number (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="Enter invoice number..."
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseFormModal;
