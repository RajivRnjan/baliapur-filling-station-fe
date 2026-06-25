import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetError } from '../features/auth/authSlice';
import type { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { Typewriter } from 'react-simple-typewriter';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('ADMIN');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password, role }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dispatch(loginUser({ email, password, role }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-outfit bg-white relative">
      
      {/* Top Left Card (Logo) - Moved to top level for mobile */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-sm px-4 py-3 lg:py-4 flex flex-col items-center z-30">
        <img 
          src="/indianoil-logo.svg" 
          alt="Indian Oil Logo" 
          className="h-14 lg:h-24 w-auto object-contain"
        />
      </div>

      {/* LEFT COLUMN: Solid grayish-blue background */}
      <div className="flex order-2 lg:order-1 w-full lg:w-1/2 relative bg-[#7B859C] flex-col items-center justify-center p-8 overflow-hidden py-16 lg:py-8 min-h-[400px] lg:min-h-0">

        {/* Mascot Image Center with Overlay */}
        <div className="w-full max-w-[450px] z-10 flex flex-col items-center gap-4">
          
          {/* Canopy Sign - above image */}
          <div className="w-[90%] max-w-[380px] bg-gradient-to-r from-orange-500 to-orange-600 rounded-full py-2 px-4 shadow-xl border-4 border-white flex items-center gap-3 animate-fade-in-up">
            <img 
              src="/indianoil-logo.svg" 
              alt="Indian Oil" 
              className="h-8 w-auto bg-white rounded-full p-1 flex-shrink-0"
            />
            <div className="text-white font-black text-[15px] sm:text-[17px] tracking-wide">
              <Typewriter
                words={['Welcome', 'Baliapur Filling Station']}
                loop={true}
                cursor
                cursorStyle='|'
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={3000}
              />
            </div>
          </div>

          <img 
            src="/rhino_notext.png" 
            alt="Indian Oil Mascot" 
            className="w-full h-auto object-contain rounded-3xl"
          />
        </div>

        {/* Footer Text */}
        <div className="absolute bottom-6 w-full text-center z-10 px-8">
          <p className="text-[11px] text-[#D1D5DB]">Copyright @ {new Date().getFullYear()} Baliapur Filling Station.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: White background, form */}
      <div className="flex order-1 lg:order-2 w-full lg:w-1/2 flex-col items-center justify-center relative px-6 pt-32 pb-12 lg:p-8">
        
        {/* Header Titles */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] sm:text-[26px] font-black text-[#334155] tracking-tight mb-1">
            Baliapur Filling Station Automation System
          </h1>
          <p className="text-[14px] font-bold text-[#64748B] mt-1">
            - Dudhiya, Baliapur Dhanbad
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[400px] bg-[#F0F3F8] rounded-[32px] pt-10 pb-8 px-8 relative">
          
          {/* Top Login Pill */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-8 py-2 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-[#EA580C] font-black text-[15px] tracking-wide border border-white">
            Login
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* User Type Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#64748B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (error) dispatch(resetError());
                }}
                className="w-full bg-white border border-[#E2E8F0] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] rounded-full pl-12 pr-10 py-3.5 text-[13px] font-bold text-[#334155] outline-none transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#94A3B8]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#64748B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) dispatch(resetError());
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter Email ID"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#EA580C] focus:bg-white focus:ring-1 focus:ring-[#EA580C] rounded-full pl-12 pr-5 py-3.5 text-[13px] font-bold text-[#334155] placeholder:text-[#94A3B8] outline-none transition-all shadow-sm"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#64748B]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) dispatch(resetError());
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Password"
                  className={`w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#EA580C] focus:bg-white focus:ring-1 focus:ring-[#EA580C] rounded-full pl-12 pr-12 py-3.5 text-[13px] font-bold text-[#334155] placeholder:text-[#94A3B8] outline-none transition-all shadow-sm ${!showPassword ? 'tracking-[0.2em]' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-[#64748B] hover:text-[#334155]"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {/* Forgot Password Link */}
              <div className="text-right pr-4">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-[11px] font-bold py-2 px-4 rounded-full text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Next Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full rounded-full bg-[#EA580C] hover:bg-[#D4500B] font-bold text-[15px] text-white py-3.5 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </>
                ) : 'Login Here'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Right Column (Removed Developed By as requested) */}
        <div className="absolute bottom-6 w-full text-center px-4">
        </div>

      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;
