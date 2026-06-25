import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addLubricant, updateLubricant, type Lubricant } from '../features/lubricants/lubricantSlice';
import type { AppDispatch } from '../store';

interface LubricantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Lubricant | null;
}

const LubricantFormModal: React.FC<LubricantFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [qtyName, setQtyName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQtyName(initialData.qty_name);
      setPrice(Number(initialData.price) || 0);
      setStock(initialData.stock || 0);
    } else {
      setName('');
      setQtyName('');
      setPrice('');
      setStock('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !qtyName.trim() || price === '') return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        qty_name: qtyName.trim(),
        price: Number(price),
        stock: stock !== '' ? Number(stock) : 0,
      };

      if (initialData) {
        await dispatch(updateLubricant({ ...payload, id: initialData.id })).unwrap();
        toast.success('Lubricant updated successfully');
      } else {
        await dispatch(addLubricant(payload)).unwrap();
        toast.success('Lubricant added successfully');
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save lubricant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-fade border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {initialData ? 'Edit Lubricant Item' : 'Add New Lubricant'}
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
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. Super Servo 20W40 MG"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Package Quantity Descriptor
            </label>
            <input
              type="text"
              value={qtyName}
              onChange={(e) => setQtyName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. 1 lt, 500Ml, 20Lt, 900ml"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                placeholder="e.g. 350.00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Initial Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                placeholder="e.g. 100"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LubricantFormModal;
