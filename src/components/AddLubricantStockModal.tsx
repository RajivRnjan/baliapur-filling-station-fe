import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { AppDispatch } from '../store';
import { addLubricantStock, type Lubricant } from '../features/lubricants/lubricantSlice';

interface AddLubricantStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lubricant: Lubricant | null;
}

const AddLubricantStockModal: React.FC<AddLubricantStockModalProps> = ({ isOpen, onClose, lubricant }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lubricant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(addLubricantStock({ id: lubricant.id, quantity })).unwrap();
      toast.success('Stock added successfully');
      onClose();
      setQuantity(1);
    } catch (err: any) {
      toast.error(err || 'Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Add Stock</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{lubricant.name} ({lubricant.qty_name})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                Quantity to Add
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-slate-800"
                placeholder="Enter quantity"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Current Stock: <span className="font-bold text-slate-800">{lubricant.stock}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLubricantStockModal;
