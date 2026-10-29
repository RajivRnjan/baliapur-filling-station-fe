import React from 'react';

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: any;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({ isOpen, onClose, purchase }) => {
  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl my-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-800">Purchase Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Serial No:</span>
            <span className="font-bold text-slate-800">{purchase.sl_no || purchase.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-bold text-slate-800">{new Date(purchase.date).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">MS Quantity (Petrol):</span>
            <span className="font-mono font-bold text-blue-600">{Number(purchase.ms).toLocaleString()} L</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">HSD Quantity (Diesel):</span>
            <span className="font-mono font-bold text-cyan-600">{Number(purchase.hsd).toLocaleString()} L</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">XP Quantity (Premium):</span>
            <span className="font-mono font-bold text-purple-600">{Number(purchase.xp).toLocaleString()} L</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Type:</span>
            {purchase.is_opening == 1 ? (
              <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full">Opening Stock</span>
            ) : (
              <span className="text-slate-400 font-bold text-sm">Regular Purchase</span>
            )}
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Invoice Number:</span>
            <span className="text-slate-600 font-medium">{purchase.remarks || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Created At:</span>
            <span className="text-slate-600 font-medium">{purchase.created_at ? new Date(purchase.created_at).toLocaleString() : '-'}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-slate-500 font-medium">Updated At:</span>
            <span className="text-slate-600 font-medium">{purchase.updated_at ? new Date(purchase.updated_at).toLocaleString() : '-'}</span>
          </div>
        </div>
        <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
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

export default PurchaseDetailModal;
