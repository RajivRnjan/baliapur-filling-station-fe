import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addNozzle, updateNozzle } from '../features/nozzles/nozzleSlice';
import type { AppDispatch } from '../store';

interface NozzleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { id: number; nozzle_no: string; fuel_type: string; opening_reading?: number } | null;
}

const NozzleFormModal: React.FC<NozzleFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [nozzleNo, setNozzleNo] = useState('');
  const [fuelType, setFuelType] = useState('MS');
  const [openingReading, setOpeningReading] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setNozzleNo(initialData.nozzle_no);
      setFuelType(initialData.fuel_type);
      setOpeningReading(initialData.opening_reading || '');
    } else {
      setNozzleNo('');
      setFuelType('MS');
      setOpeningReading('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nozzleNo.trim()) return;

    setIsSubmitting(true);
    try {
      if (initialData) {
        // We will need updateNozzle from the slice, let's just make sure it's imported
        // Wait, I should import updateNozzle at the top.
      }
      
      const payload = { 
        nozzle_no: nozzleNo, 
        fuel_type: fuelType, 
        opening_reading: Number(openingReading) || 0 
      };

      if (initialData) {
        await dispatch(updateNozzle({ ...payload, id: initialData.id })).unwrap();
        toast.success('Nozzle updated successfully');
      } else {
        await dispatch(addNozzle(payload)).unwrap();
        toast.success('Nozzle created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Failed to add nozzle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">{initialData ? 'Edit Nozzle' : 'Add New Nozzle'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nozzle Number</label>
            <input
              type="text"
              value={nozzleNo}
              onChange={(e) => setNozzleNo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. 01"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
            >
              <option value="MS">MS (Petrol)</option>
              <option value="HSD">HSD (Diesel)</option>
              <option value="XP">XP (Extra Premium)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Opening Reading</label>
            <input
              type="number"
              step="0.01"
              value={openingReading}
              onChange={(e) => setOpeningReading(e.target.value === '' ? '' : Number(e.target.value))}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
              placeholder="e.g. 10000.00"
              required
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
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Nozzle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NozzleFormModal;
