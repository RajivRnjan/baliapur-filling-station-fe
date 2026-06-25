import React from 'react';
import type { Creditor } from '../features/creditors/creditorSlice';

interface CreditorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditor: Creditor | null;
}

const CreditorDetailModal: React.FC<CreditorDetailModalProps> = ({ isOpen, onClose, creditor }) => {
  if (!isOpen || !creditor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl my-auto border border-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-800">Creditor Account Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Account Name:</span>
            <span className="font-bold text-slate-800">{creditor.name}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Registered Phone:</span>
            <span className="font-bold text-slate-800">{creditor.phone || <span className="text-slate-300 italic">None</span>}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Registered Email:</span>
            <span className="font-bold text-slate-800">{creditor.email || <span className="text-slate-300 italic">None</span>}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Opening Balance:</span>
            <span className="font-bold text-slate-800">₹{Number(creditor.opening_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Current Outstanding Balance:</span>
            <span className={`font-black ${Number(creditor.current_balance) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              ₹{Number(creditor.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Created At:</span>
            <span className="text-slate-600 font-medium font-mono text-sm">
              {creditor.created_at ? new Date(creditor.created_at).toLocaleString() : '-'}
            </span>
          </div>

          <div className="flex justify-between pb-2">
            <span className="text-slate-500 font-medium">Last Updated At:</span>
            <span className="text-slate-600 font-medium font-mono text-sm">
              {creditor.updated_at ? new Date(creditor.updated_at).toLocaleString() : '-'}
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

export default CreditorDetailModal;
