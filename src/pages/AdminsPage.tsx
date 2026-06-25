import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchAdmins, deleteAdmin, type Admin } from '../features/admins/adminSlice';
import Layout from '../components/Layout';
import AdminFormModal from '../components/AdminFormModal';
import toast from 'react-hot-toast';

const AdminsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: admins, status: adminStatus } = useSelector((state: RootState) => state.admins);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role?.toUpperCase() === 'SUPER ADMIN';

  useEffect(() => {
    if (adminStatus === 'idle') {
      dispatch(fetchAdmins());
    }
  }, [dispatch, adminStatus]);

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number, name: string) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can delete staff/admins');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-bold text-slate-800">Confirm Deletion</p>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{name}</span>?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteAdmin(id)).unwrap();
                toast.success('Admin deleted successfully');
              } catch (e: any) {
                toast.error(e || 'Failed to delete admin');
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

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 animate-fade flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                Staff & <span className="text-blue-600">Admins</span>
              </h1>
              <p className="text-slate-500 font-medium">Manage user access and roles for the portal</p>
            </div>
            {isSuperAdmin && (
              <button 
                onClick={() => { setEditingAdmin(null); setIsModalOpen(true); }}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/15 text-sm active:scale-95"
              >
                + Add Staff
              </button>
            )}
          </header>

          <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h4 className="text-xl font-black text-slate-800">System Users</h4>
              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Name</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Email</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Role</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest px-4 text-center">Created At</th>
                    <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id || admin.email} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pl-4 text-sm font-black text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">
                            {admin.name ? admin.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-bold text-slate-600 px-4">
                        {admin.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full ${admin.role === 'SUPER_ADMIN' ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-50 text-emerald-600'}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-500 px-4 text-center font-mono whitespace-nowrap">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              if (!isSuperAdmin) {
                                toast.error('Only Super Admins can update users');
                                return;
                              }
                              setEditingAdmin(admin);
                              setIsModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                              isSuperAdmin
                                ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            title={isSuperAdmin ? 'Edit User' : 'Super Admin Only'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                            {!isSuperAdmin && <span className="text-[9px] font-black uppercase pr-1">🔒</span>}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(admin.id, admin.name)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                              isSuperAdmin
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            title={isSuperAdmin ? 'Delete User' : 'Super Admin Only'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAdmins.length === 0 && adminStatus !== 'loading' && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="font-medium">No system users found.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <AdminFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingAdmin(null); }} 
        admin={editingAdmin} 
      />
    </Layout>
  );
};

export default AdminsPage;
