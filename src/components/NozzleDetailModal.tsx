import React from 'react';

interface NozzleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nozzle: any;
}

const NozzleDetailModal: React.FC<NozzleDetailModalProps> = ({ isOpen, onClose, nozzle }) => {
  if (!isOpen || !nozzle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl my-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-800">Nozzle Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Nozzle Number:</span>
            <span className="font-bold text-slate-800">{nozzle.nozzle_no}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Fuel Type:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              nozzle.fuel_type === 'MS' ? 'bg-orange-50 text-orange-600' :
              nozzle.fuel_type === 'HSD' ? 'bg-cyan-50 text-cyan-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              {nozzle.fuel_type}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Opening Reading:</span>
            <span className="font-mono font-bold text-slate-800">{Number(nozzle.opening_reading).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Created At:</span>
            <span className="text-slate-600 font-medium">{nozzle.created_at ? new Date(nozzle.created_at).toLocaleString() : '-'}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-slate-500 font-medium">Updated At:</span>
            <span className="text-slate-600 font-medium">{nozzle.updated_at ? new Date(nozzle.updated_at).toLocaleString() : '-'}</span>
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

export default NozzleDetailModal;
