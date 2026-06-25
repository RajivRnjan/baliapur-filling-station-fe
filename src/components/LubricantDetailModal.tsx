import React from 'react';
import type { Lubricant } from '../features/lubricants/lubricantSlice';

interface LubricantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lubricant: Lubricant | null;
}

const LubricantDetailModal: React.FC<LubricantDetailModalProps> = ({ isOpen, onClose, lubricant }) => {
  if (!isOpen || !lubricant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl my-auto border border-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-800">Lubricant Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Product Name:</span>
            <span className="font-bold text-slate-800">{lubricant.name}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Package Unit Size:</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black uppercase">
              {lubricant.qty_name}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Selling Price:</span>
            <span className="font-black text-slate-800">₹{Number(lubricant.price).toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Current Stock Count:</span>
            <span className={`font-bold font-mono ${lubricant.stock < 15 ? 'text-rose-600' : 'text-slate-800'}`}>
              {lubricant.stock} units
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Created At:</span>
            <span className="text-slate-600 font-medium">
              {lubricant.created_at ? new Date(lubricant.created_at).toLocaleString() : '-'}
            </span>
          </div>

          <div className="flex justify-between pb-2">
            <span className="text-slate-500 font-medium">Last Updated At:</span>
            <span className="text-slate-600 font-medium">
              {lubricant.updated_at ? new Date(lubricant.updated_at).toLocaleString() : '-'}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default LubricantDetailModal;
