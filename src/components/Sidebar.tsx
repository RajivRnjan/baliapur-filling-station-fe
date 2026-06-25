import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  return (
    <div className={`fixed inset-y-0 left-0 h-screen bg-slate-900 text-white flex flex-col transition-transform duration-300 z-20
      ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64 
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:block absolute -right-3 top-8 bg-slate-800 border border-slate-700 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors z-30"
        title="Toggle Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* Mobile Close Button */}
      <button
        onClick={() => setIsMobileOpen?.(false)}
        className="md:hidden absolute right-3 top-5 text-white bg-slate-800 p-1.5 rounded-full hover:bg-slate-700 transition-colors z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className={`p-6 pr-12 md:pr-6 flex items-center ${isCollapsed ? 'md:justify-center px-6 md:px-0 md:pr-0' : ''}`}>
        {isCollapsed ? (
          <h2 className="text-xl font-black text-blue-400 tracking-tighter hidden md:block">B<span className="text-white">FS</span></h2>
        ) : null}
        <div className={`flex flex-col ${isCollapsed ? 'md:hidden' : ''}`}>
          <h2 className="text-xl font-black text-blue-400 tracking-tighter leading-tight">
            BALIAPUR  FILLING<br />
            <span className="text-white">STATION</span>
          </h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
            Dudhiya, Baliapur Dhanbad
          </p>
        </div>
      </div>

      <nav className={`flex-1 mt-8 space-y-2 overflow-y-auto overflow-x-hidden dark-scrollbar ${isCollapsed ? 'px-4 md:px-2' : 'px-4'}`}>
        {isStaff && (
          <NavLink
            to="/staff-dashboard"
            title="My Dashboard"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">My Dashboard</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isAdmin && !isStaff && (
          <NavLink
            to="/"
            title="Dashboard"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Dashboard</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isAdmin && !isStaff && (
          <NavLink
            to="/nozzles"
            title="Nozzles"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              <path d="m11.5 12.5-4 4" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Nozzles</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isAdmin && !isStaff && (
          <NavLink
            to="/purchases"
            title="Purchases"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h12" />
              <path d="M4 14h9" />
              <path d="M19 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-2-2Z" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Purchases</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isAdmin && (
          <NavLink
            to="/admins"
            title="Staff / Admins"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Staff / Admins</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        <NavLink
          to="/daily-sales"
          title="Daily Sales"
          onClick={() => setIsMobileOpen?.(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20v-6M6 20V10M18 20V4" />
          </svg>
          {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Daily Sales</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
        </NavLink>

        {!isStaff && (
          <NavLink
            to="/pump-expenses"
            title="Pump Expenses"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Pump Expenses</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isStaff && (
          <NavLink
            to="/cash-balance"
            title="Cash Balance Report"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Cash Balance Report</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isStaff && (
          <NavLink
            to="/staff-salaries"
            title="Staff Salaries"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Staff Salaries</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isStaff && (
          <NavLink
            to="/owner-payouts"
            title="Owner Payouts"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Owner Payouts</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isAdmin && !isStaff && (
          <NavLink
            to="/lubricants"
            title="Lubricants"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Lubricants</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isAdmin && !isStaff && (
          <NavLink
            to="/creditors"
            title="Creditors Ledger"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10M6 10h10" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Creditors Ledger</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}

        {!isStaff && (
          <NavLink
            to="/cashbooks"
            title="Cashbook"
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'px-4'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
            {!isCollapsed ? <span className="font-bold text-sm whitespace-nowrap">Cashbook</span> : <span className="font-bold text-sm whitespace-nowrap md:hidden"></span>}
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
