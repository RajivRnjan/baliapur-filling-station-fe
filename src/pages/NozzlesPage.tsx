import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchNozzles, deleteNozzle } from '../features/nozzles/nozzleSlice';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import NozzleFormModal from '../components/NozzleFormModal';
import NozzleDetailModal from '../components/NozzleDetailModal';

const NozzlesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: nozzles, status: nozzleStatus, pagination } = useSelector((state: RootState) => state.nozzles);
  const [isNozzleModalOpen, setIsNozzleModalOpen] = useState(false);
  const [editingNozzle, setEditingNozzle] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingNozzle, setViewingNozzle] = useState<any>(null);

  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [fuelType, setFuelType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchNozzles({ fuel_type: fuelType || undefined, per_page: perPage, page }));
  }, [dispatch, fuelType, perPage, page]);

  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-bold text-slate-800">Confirm Deletion</p>
          <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this nozzle?</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteNozzle(id)).unwrap();
                toast.success('Nozzle deleted successfully');
              } catch (e) {
              }
            }}
          >
            Delete
          </button>
          <button 
            className="flex-1 bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        background: '#fff',
        color: '#334155',
        border: '1px solid #e2e8f0',
      }
    });
  };

  const filteredNozzles = nozzles.filter(nozzle => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (nozzle.nozzle_no && nozzle.nozzle_no.toLowerCase().includes(term)) ||
      (nozzle.fuel_type && nozzle.fuel_type.toLowerCase().includes(term)) ||
      (nozzle.opening_reading && String(nozzle.opening_reading).includes(term))
    );
  });

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 animate-fade">
            <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
              Nozzle <span className="text-blue-600">Inventory</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage all active nozzles at BALIAPUR FILLING STATION</p>
          </header>

          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h4 className="text-xl font-black text-slate-800">All Nozzles</h4>
                <div className="flex gap-2 mt-3 items-center flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Search:</span>
                  <input
                    type="text"
                    placeholder="Search nozzles..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 w-40 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Fuel Type:</span>
                  {['', 'MS', 'HSD', 'XP'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setFuelType(t); setPage(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        fuelType === t
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t || 'ALL'}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingNozzle(null);
                  setIsNozzleModalOpen(true);
                }} 
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                + Add New Nozzle
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Nozzle No.</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest">Fuel Type</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Opening Reading</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Created At</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Updated At</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNozzles.map((nozzle) => (
                    <tr key={nozzle.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pl-4 text-sm font-black text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">
                            {nozzle.nozzle_no.replace(/\D/g, '') || nozzle.nozzle_no.charAt(0)}
                          </div>
                          <span>{nozzle.nozzle_no}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-bold text-slate-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          nozzle.fuel_type === 'MS' ? 'bg-orange-50 text-orange-600' :
                          nozzle.fuel_type === 'HSD' ? 'bg-cyan-50 text-cyan-600' :
                          'bg-purple-50 text-purple-600'
                        }`}>
                          {nozzle.fuel_type}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-mono text-slate-600 text-right">
                        {nozzle.opening_reading !== undefined && nozzle.opening_reading !== null ? Number(nozzle.opening_reading).toFixed(2) : '-'}
                      </td>
                      <td className="py-4 text-[11px] font-medium text-slate-400 text-right">
                        {nozzle.created_at ? new Date(nozzle.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 text-[11px] font-medium text-slate-400 text-right">
                        {nozzle.updated_at ? new Date(nozzle.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setViewingNozzle(nozzle);
                              setIsDetailOpen(true);
                            }}
                            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button 
                            onClick={() => {
                              setEditingNozzle(nozzle);
                              setIsNozzleModalOpen(true);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(nozzle.id)}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredNozzles.length === 0 && nozzleStatus !== 'loading' && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span className="font-medium">No nozzles found. Add one to get started.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500">
                  Showing <span className="text-slate-800">{Math.min(pagination.total, (page - 1) * perPage + 1)}</span> to{' '}
                  <span className="text-slate-800">{Math.min(pagination.total, page * perPage)}</span> of{' '}
                  <span className="text-slate-800">{pagination.total}</span> entries
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">Show:</span>
                    <select
                      value={perPage}
                      onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                      className="px-2 py-1 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                    >
                      {[5, 10, 25, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                      disabled={page === pagination.last_page}
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <NozzleFormModal 
        isOpen={isNozzleModalOpen} 
        onClose={() => setIsNozzleModalOpen(false)} 
        initialData={editingNozzle}
      />
      <NozzleDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        nozzle={viewingNozzle}
      />
    </Layout>
  );
};

export default NozzlesPage;
