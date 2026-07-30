import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDailySale, fetchDailySales, updateDailySale } from '../features/dailySales/dailySalesSlice';
import { fetchLubricants } from '../features/lubricants/lubricantSlice';
import { fetchCreditors } from '../features/creditors/creditorSlice';
import { fetchAdmins } from '../features/admins/adminSlice';
import type { AppDispatch, RootState } from '../store';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface DailySaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSaleId?: number | null;
}

interface ReadingInput {
  nozzle_id: number;
  nozzle_no: string;
  fuel_type: string;
  previous_closing_reading: number;
  closing_reading: number | string;
  testing_qty?: number | string;
}

const InputField = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onWheel={(e) => e.currentTarget.blur()}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium text-sm"
      placeholder="0.00"
    />
  </div>
);

const DailySaleFormModal: React.FC<DailySaleFormModalProps> = ({ isOpen, onClose, editingSaleId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [rateMs, setRateMs] = useState<string | number>(98.17);
  const [rateHsd, setRateHsd] = useState<string | number>(92.93);
  const [rateXp, setRateXp] = useState<string | number>(107.05);
  const [lubricantSale, setLubricantSale] = useState<string | number>('');
  const [density, setDensity] = useState<string | number>('');
  
  // Reconciliation Data
  const [creditPayments, setCreditPayments] = useState<{creditor_id: number|string, amount: number|string}[]>([]);
  const [creditGivens, setCreditGivens] = useState<{creditor_id: number|string, amount: number|string, remark?: string}[]>([]);
  const [onlinePayments, setOnlinePayments] = useState<{name: string, amount: number|string}[]>([]);
  const [staffPayouts, setStaffPayouts] = useState<{name: string, user_id?: number, amount: number|string, salary_month?: number, salary_year?: number}[]>([]);
  const [pumpExpenses, setPumpExpenses] = useState<{amount: number|string, remark?: string}[]>([]);
  const [expenseNames, setExpenseNames] = useState<string[]>([]);
  
  const [acTransfer, setAcTransfer] = useState<string | number>('');
  const [ownerPayouts, setOwnerPayouts] = useState<{owner_name: string, amount: number|string}[]>([]);
  const [cashCollection, setCashCollection] = useState<string | number>('');
  const [coin, setCoin] = useState<string | number>('');
  const [miss, setMiss] = useState<string | number>('');
  const [balanceInPump, setBalanceInPump] = useState<string | number>('');
  
  const [readings, setReadings] = useState<ReadingInput[]>([]);
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lubricant States
  const { items: allLubricants } = useSelector((state: RootState) => state.lubricants);
  const [selectedLubricants, setSelectedLubricants] = useState<any[]>([]);
  const [currLubricantId, setCurrLubricantId] = useState<number | string>('');
  const [currLubricantQty, setCurrLubricantQty] = useState<number | string>(1);
  const [currLubricantPrice, setCurrLubricantPrice] = useState<number | string>('');

  // Creditor States
  const { items: allCreditors = [] } = useSelector((state: RootState) => state.creditors);

  // Admin/Staff States
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { items: allAdmins = [] } = useSelector((state: RootState) => state.admins);
  const staffMembers = allAdmins.filter(a => a.role === 'STAFF');

  const onlinePlatforms = ['PhonePe', 'Paytm', 'Google Pay', 'Bank Transfer', 'Card', 'Other'];

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchLubricants({ per_page: 100 }));
      dispatch(fetchCreditors({ per_page: 100 }));
      if (isSuperAdmin) {
        dispatch(fetchAdmins());
      }
      if (editingSaleId) {
        loadExistingSale(editingSaleId);
      } else {
        // Reset to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        setRateMs(98.17);
        setRateHsd(92.93);
        setRateXp(107.05);
        setLubricantSale('');
        setDensity('');
        setCreditPayments([]);
        setCreditGivens([]);
        setOnlinePayments([]);
        setStaffPayouts([]);
        setPumpExpenses([]);
        setAcTransfer('');
        setOwnerPayouts([]);
        setCashCollection('');
        setCoin('');
        setMiss('');
        setBalanceInPump('');
        setSelectedLubricants([]);
        setCurrLubricantId('');
        setCurrLubricantQty(1);
        setCurrLubricantPrice('');
        loadPreviousReadings(today);
      }
    }
  }, [isOpen, editingSaleId]);

  const parseDateToYmd = (dateStr: string) => {
    if (!dateStr) return '';
    const datePart = dateStr.split(' ')[0].split('T')[0];
    if (datePart.includes('/')) {
      const parts = datePart.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    if (datePart.includes('-')) {
      const parts = datePart.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return datePart;
        } else {
          // If format is dd-mm-yyyy
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    return datePart;
  };

  const loadExistingSale = async (id: number) => {
    setIsLoadingReadings(true);
    try {
      const response = await api.get(`/daily-sales/${id}`);
      const report = response.data.report;
      
      setDate(parseDateToYmd(report.date));
      setRateMs(report.rate_ms ?? report.rates?.MS ?? 98.17);
      setRateHsd(report.rate_hsd ?? report.rates?.HSD ?? 92.93);
      setRateXp(report.rate_xp ?? report.rates?.XP ?? 107.05);
      
      setLubricantSale(report.lubricant_sale ?? report.totals?.lubricant_sale ?? '');
      setDensity(report.density ?? '');
      
      const rec = report.reconciliation || {};
      
      setCreditPayments(report.credit_payments || rec.credit_payments || []);
      setCreditGivens(report.credit_givens || rec.credit_givens || []);
      setOnlinePayments(report.online_payments || rec.online_payments || []);
      setStaffPayouts(report.staff_payouts || rec.staff_payouts || []);
      setPumpExpenses(report.pump_expenses || rec.pump_expenses || []);
      
      setAcTransfer(report.ac_transfer ?? rec.ac_transfer ?? '');
      
      const o1 = report.owner_1 ?? rec.owner_1 ?? 0;
      const o2 = report.owner_2 ?? rec.owner_2 ?? 0;
      const loadedOwnerPayouts = [];
      if (Number(o1) > 0) loadedOwnerPayouts.push({ owner_name: 'Umesh', amount: Number(o1) });
      if (Number(o2) > 0) loadedOwnerPayouts.push({ owner_name: 'Saket', amount: Number(o2) });
      setOwnerPayouts(loadedOwnerPayouts);
      setCashCollection(report.cash_collection ?? rec.cash_collection ?? '');
      setCoin(report.coin ?? rec.coin ?? '');
      setMiss(report.miss ?? rec.miss ?? '');
      setBalanceInPump(report.actual_balance_in_pump ?? rec.actual_balance_in_pump ?? '');
      
      const loadedReadings = (report.nozzle_readings || []).map((nr: any) => ({
        nozzle_id: nr.nozzle_id,
        nozzle_no: nr.nozzle_no,
        fuel_type: nr.fuel_type,
        previous_closing_reading: Number(nr.previous_closing_reading) || 0,
        closing_reading: nr.closing_reading ?? '',
        testing_qty: nr.testing_qty ?? ''
      }));
      setReadings(loadedReadings);

      // Load itemized lubricants
      const loadedLubricants = (report.lubricants || []).map((lub: any) => ({
        lubricant_id: lub.lubricant_id ?? lub.id,
        name: lub.name ?? 'Lubricant',
        quantity: lub.pivot?.quantity ?? lub.quantity ?? 0,
        price: lub.pivot?.price ?? lub.price ?? 0
      }));
      setSelectedLubricants(loadedLubricants);
    } catch (err: any) {
      toast.error('Failed to load daily sale details');
      console.error(err);
      onClose();
    } finally {
      setIsLoadingReadings(false);
    }
  };

  // Keep lubricant aggregate sales in sync with itemized additions
  useEffect(() => {
    const total = selectedLubricants.reduce((acc, lub) => acc + (lub.quantity * Number(lub.price || 0)), 0);
    setLubricantSale(total || 0);
  }, [selectedLubricants]);

  useEffect(() => {
    if (isOpen) {
      api.get('/pump-expenses/names').then(res => {
        if(res.data.success) {
          setExpenseNames(res.data.names);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleAddLubricant = () => {
    if (!currLubricantId) {
      toast.error('Please select a lubricant');
      return;
    }
    const qty = Number(currLubricantQty);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    const price = Number(currLubricantPrice);
    if (price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const item = allLubricants.find(l => l.id === Number(currLubricantId));
    if (!item) return;

    const existingIdx = selectedLubricants.findIndex(l => l.lubricant_id === Number(currLubricantId));
    if (existingIdx > -1) {
      const updated = [...selectedLubricants];
      updated[existingIdx].quantity += qty;
      updated[existingIdx].price = price;
      setSelectedLubricants(updated);
    } else {
      setSelectedLubricants(prev => [...prev, {
        lubricant_id: Number(currLubricantId),
        name: item.name,
        quantity: qty,
        price: price
      }]);
    }

    // Reset inputs
    setCurrLubricantId('');
    setCurrLubricantQty(1);
    setCurrLubricantPrice('');
  };

  const handleRemoveLubricant = (idx: number) => {
    setSelectedLubricants(prev => prev.filter((_, i) => i !== idx));
  };

  const loadPreviousReadings = async (selectedDate: string) => {
    setIsLoadingReadings(true);
    try {
      const response = await api.get(`/daily-sales/previous-readings?date=${selectedDate}`);
      const prevReadings = response.data.previous_readings || [];
      const latestRates = response.data.latest_rates;

      if (latestRates) {
        setRateMs(latestRates.ms ?? 98.17);
        setRateHsd(latestRates.hsd ?? 92.93);
        setRateXp(latestRates.xp ?? 107.05);
      }

      setReadings(prevReadings.map((pr: any) => ({
        ...pr,
        closing_reading: '',
        testing_qty: ''
      })));
    } catch (err: any) {
      console.error('Failed to load previous readings:', err);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  const handleReadingChange = (nozzleId: number, value: string) => {
    setReadings(prev => prev.map(r => 
      r.nozzle_id === nozzleId ? { ...r, closing_reading: value } : r
    ));
  };

  const handleTestingChange = (nozzleId: number, value: string) => {
    setReadings(prev => prev.map(r => 
      r.nozzle_id === nozzleId ? { ...r, testing_qty: value } : r
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const formattedReadings = readings.map(r => ({
      nozzle_id: r.nozzle_id,
      closing_reading: Number(r.closing_reading),
      testing_qty: r.testing_qty !== '' && r.testing_qty !== undefined ? Number(r.testing_qty) : 0
    }));

    setIsSubmitting(true);
    try {
      const owner1Sum = ownerPayouts.filter(p => p.owner_name === 'Umesh').reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const owner2Sum = ownerPayouts.filter(p => p.owner_name === 'Saket').reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const payload = {
        date,
        rate_ms: Number(rateMs) || 0,
        rate_hsd: Number(rateHsd) || 0,
        rate_xp: Number(rateXp) || 0,
        lubricant_sale: Number(lubricantSale) || 0,
        density: Number(density) || 0,
        credit_payments: creditPayments.map((p: any) => ({ creditor_id: Number(p.creditor_id), amount: Number(p.amount) })),
        credit_givens: creditGivens.map((p: any) => ({ creditor_id: Number(p.creditor_id), amount: Number(p.amount), remark: p.remark || undefined })),
        online_payments: onlinePayments.map((p: any) => ({ name: p.name, amount: Number(p.amount) })),
        staff_payouts: staffPayouts.map((p: any) => ({ name: p.name, user_id: p.user_id ? Number(p.user_id) : undefined, amount: Number(p.amount), salary_month: p.salary_month ? Number(p.salary_month) : undefined, salary_year: p.salary_year ? Number(p.salary_year) : undefined })),
        pump_expenses: pumpExpenses.map((p: any) => ({ amount: Number(p.amount), remark: p.remark || undefined })),
        ac_transfer: Number(acTransfer) || 0,
        owner_1: owner1Sum,
        owner_2: owner2Sum,
        cash_collection: Number(cashCollection) || 0,
        coin: Number(coin) || 0,
        miss: Number(miss) || 0,
        balance_in_pump: Number(balanceInPump) || 0,
        readings: formattedReadings,
        lubricants: selectedLubricants.map(lub => ({
          lubricant_id: lub.lubricant_id,
          quantity: Number(lub.quantity) || 0,
          price: Number(lub.price) || 0
        }))
      };

      if (editingSaleId) {
        await dispatch(updateDailySale({ id: editingSaleId, payload })).unwrap();
        toast.success('Record updated successfully');
      } else {
        await dispatch(addDailySale(payload)).unwrap();
        toast.success('Record created successfully');
      }
      
      dispatch(fetchDailySales({}));
      onClose();
    } catch (err: any) {
      console.error('Failed to save daily sale:', err);
      toast.error(err || 'Failed to save daily sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;



  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto py-10"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-5xl shadow-2xl animate-fade my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">{editingSaleId ? 'Edit Daily Sales' : 'Record Daily Sales'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
            <h3 className="font-black text-blue-800 mb-4 text-sm uppercase tracking-widest">Base Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (!editingSaleId) {
                      loadPreviousReadings(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium text-sm"
                  required
                />
              </div>
              <InputField label="Rate MS" value={rateMs} onChange={setRateMs} />
              <InputField label="Rate HSD" value={rateHsd} onChange={setRateHsd} />
              <InputField label="Rate XP" value={rateXp} onChange={setRateXp} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest flex justify-between">
                <span>Nozzle Readings</span>
                {isLoadingReadings && <span className="text-blue-500 animate-pulse text-xs">Loading...</span>}
              </h3>
              
              <div className="space-y-3">
                {readings.map((reading) => (
                  <div key={reading.nozzle_id} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <div className="font-bold text-slate-800 text-[11px] truncate">{reading.nozzle_no}</div>
                      <div className="text-[9px] font-bold text-blue-600 uppercase truncate">{reading.fuel_type}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Prev</div>
                      <div className="font-mono bg-slate-50 px-1 py-0.5 rounded text-slate-600 border border-slate-100 text-[10px] truncate">
                        {(Number(reading.previous_closing_reading) || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-1">Closing</div>
                      <input
                        type="number"
                        step="0.01"
                        value={reading.closing_reading}
                        onChange={(e) => handleReadingChange(reading.nozzle_id, e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full px-1.5 py-0.5 bg-slate-50 border border-blue-200 rounded focus:ring-1 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-800 font-mono text-[10px]"
                        required
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Testing</div>
                      <input
                        type="number"
                        step="0.01"
                        value={reading.testing_qty ?? ''}
                        onChange={(e) => handleTestingChange(reading.nozzle_id, e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full px-1.5 py-0.5 bg-slate-50 border border-emerald-200 rounded focus:ring-1 focus:ring-emerald-600 focus:border-transparent outline-none transition-all text-slate-800 font-mono text-[10px]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Reconciliation & Cash Flow</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <InputField label="Density" value={density} onChange={setDensity} />
                
                {/* Credit Received */}
                <div className="col-span-2 flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Credit Payments</label>
                    <button type="button" onClick={() => setCreditPayments([...creditPayments, {creditor_id: '', amount: ''}])} className="text-[9px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded hover:bg-blue-600 transition-colors">+ Add</button>
                  </div>
                  {creditPayments.map((p, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <select value={p.creditor_id} onChange={(e) => { const n = [...creditPayments]; n[i].creditor_id = e.target.value; setCreditPayments(n); }} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all cursor-pointer">
                        <option value="">Creditor...</option>
                        {allCreditors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input type="number" step="0.01" value={p.amount} onChange={(e) => { const n = [...creditPayments]; n[i].amount = e.target.value; setCreditPayments(n); }} onWheel={(e) => e.currentTarget.blur()} className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="₹" />
                      <button type="button" onClick={() => { const n = [...creditPayments]; n.splice(i, 1); setCreditPayments(n); }} className="text-rose-500 hover:text-rose-700 font-black px-1">×</button>
                    </div>
                  ))}
                </div>

                <InputField label="A/C Transfer" value={acTransfer} onChange={setAcTransfer} />
                
                {/* Online Payments */}
                <div className="col-span-2 flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Online Payments</label>
                    <button type="button" onClick={() => setOnlinePayments([...onlinePayments, {name: '', amount: ''}])} className="text-[9px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded hover:bg-blue-600 transition-colors">+ Add</button>
                  </div>
                  {onlinePayments.map((p, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <select value={p.name} onChange={(e) => { const n = [...onlinePayments]; n[i].name = e.target.value; setOnlinePayments(n); }} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all cursor-pointer">
                        <option value="">Platform...</option>
                        {onlinePlatforms.map((plat) => <option key={plat} value={plat}>{plat}</option>)}
                      </select>
                      <input type="number" step="0.01" value={p.amount} onChange={(e) => { const n = [...onlinePayments]; n[i].amount = e.target.value; setOnlinePayments(n); }} onWheel={(e) => e.currentTarget.blur()} className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="₹" />
                      <button type="button" onClick={() => { const n = [...onlinePayments]; n.splice(i, 1); setOnlinePayments(n); }} className="text-rose-500 hover:text-rose-700 font-black px-1">×</button>
                    </div>
                  ))}
                </div>

                {/* Credit Given */}
                <div className="col-span-2 flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Credit Given</label>
                    <button type="button" onClick={() => setCreditGivens([...creditGivens, {creditor_id: '', amount: '', remark: ''}])} className="text-[9px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded hover:bg-rose-600 transition-colors">+ Add</button>
                  </div>
                  {creditGivens.map((p, i) => (
                    <div key={i} className="flex flex-col gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <select value={p.creditor_id} onChange={(e) => { const n = [...creditGivens]; n[i].creditor_id = e.target.value; setCreditGivens(n); }} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all cursor-pointer">
                          <option value="">Creditor...</option>
                          {allCreditors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" step="0.01" value={p.amount} onChange={(e) => { const n = [...creditGivens]; n[i].amount = e.target.value; setCreditGivens(n); }} onWheel={(e) => e.currentTarget.blur()} className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" placeholder="₹" />
                        <button type="button" onClick={() => { const n = [...creditGivens]; n.splice(i, 1); setCreditGivens(n); }} className="text-rose-500 hover:text-rose-700 font-black px-1">×</button>
                      </div>
                      <input
                        type="text"
                        value={(p as any).remark || ''}
                        onChange={(e) => { const n = [...creditGivens]; (n[i] as any).remark = e.target.value; setCreditGivens(n); }}
                        className="w-full px-2 py-1.5 bg-white border border-rose-100 rounded text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all placeholder-slate-300"
                        placeholder="Remark / Particulars (optional)"
                      />
                    </div>
                  ))}
                </div>

                {/* Pump Expenses */}
                <datalist id="expense-names">
                  {expenseNames.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <div className="col-span-2 flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pump Expenses</label>
                    <button type="button" onClick={() => setPumpExpenses([...pumpExpenses, {amount: '', remark: ''}])} className="text-[9px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded hover:bg-amber-600 transition-colors">+ Add</button>
                  </div>
                  {pumpExpenses.map((p, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <input type="text" list="expense-names" value={p.remark || ''} onChange={(e) => { const n = [...pumpExpenses]; n[i].remark = e.target.value; setPumpExpenses(n); }} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all" placeholder="Select or type a name/remark" />
                      <input type="number" step="0.01" value={p.amount} onChange={(e) => { const n = [...pumpExpenses]; n[i].amount = e.target.value; setPumpExpenses(n); }} onWheel={(e) => e.currentTarget.blur()} className="w-full sm:w-32 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all" placeholder="₹ Amount" />
                      <button type="button" onClick={() => { const n = [...pumpExpenses]; n.splice(i, 1); setPumpExpenses(n); }} className="text-rose-500 hover:text-rose-700 font-black px-1">×</button>
                    </div>
                  ))}
                </div>
                
                {/* Staff Payouts */}
                <div className="col-span-2 flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Staff Payouts</label>
                    <button type="button" onClick={() => {
                      const d = new Date(date || new Date());
                      setStaffPayouts([...staffPayouts, {name: '', user_id: undefined, amount: '', salary_month: d.getMonth() + 1, salary_year: d.getFullYear()}]);
                    }} className="text-[9px] font-bold text-white bg-purple-500 px-2 py-0.5 rounded hover:bg-purple-600 transition-colors">+ Add</button>
                  </div>
                  {staffPayouts.map((p, i) => (
                    <div key={i} className="flex flex-col gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <select 
                          value={p.user_id || ''} 
                          onChange={(e) => { 
                            const n = [...staffPayouts]; 
                            const selectedStaff = staffMembers.find(s => s.id === Number(e.target.value));
                            n[i].user_id = selectedStaff ? selectedStaff.id : undefined; 
                            n[i].name = selectedStaff ? selectedStaff.name : '';
                            setStaffPayouts(n); 
                          }} 
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
                        >
                          <option value="">Select Staff...</option>
                          {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input type="number" step="0.01" value={p.amount} onChange={(e) => { const n = [...staffPayouts]; n[i].amount = e.target.value; setStaffPayouts(n); }} onWheel={(e) => e.currentTarget.blur()} className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all" placeholder="₹" />
                        <button type="button" onClick={() => { const n = [...staffPayouts]; n.splice(i, 1); setStaffPayouts(n); }} className="text-rose-500 hover:text-rose-700 font-black px-1">×</button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider whitespace-nowrap">For Salary Month:</span>
                        <select
                          value={p.salary_month || ''}
                          onChange={(e) => { const n = [...staffPayouts]; n[i].salary_month = Number(e.target.value); setStaffPayouts(n); }}
                          className="flex-1 px-2 py-1 bg-white border border-purple-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
                        >
                          <option value="">Month...</option>
                          {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, idx) => (
                            <option key={idx+1} value={idx+1}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={p.salary_year || ''}
                          onChange={(e) => { const n = [...staffPayouts]; n[i].salary_year = Number(e.target.value); setStaffPayouts(n); }}
                          className="w-20 px-2 py-1 bg-white border border-purple-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
                        >
                          <option value="">Year...</option>
                          {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Owner Payouts */}
                <div className="col-span-2 flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Owner Payouts</label>
                    <button type="button" onClick={() => setOwnerPayouts([...ownerPayouts, {owner_name: '', amount: ''}])} className="text-[9px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded hover:bg-indigo-600 transition-colors">+ Add</button>
                  </div>
                  {ownerPayouts.map((p, i) => (
                    <div key={i} className="flex flex-col gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <select 
                          value={p.owner_name} 
                          onChange={(e) => { const n = [...ownerPayouts]; n[i].owner_name = e.target.value; setOwnerPayouts(n); }} 
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all cursor-pointer"
                        >
                          <option value="">Select Owner...</option>
                          <option value="Umesh">Owner 1 (Umesh)</option>
                          <option value="Saket">Owner 2 (Saket)</option>
                        </select>
                        <input type="number" step="0.01" value={p.amount} onChange={(e) => { const n = [...ownerPayouts]; n[i].amount = e.target.value; setOwnerPayouts(n); }} onWheel={(e) => e.currentTarget.blur()} className="w-full sm:w-32 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all" placeholder="₹ Amount" />
                        <button type="button" onClick={() => { const n = [...ownerPayouts]; n.splice(i, 1); setOwnerPayouts(n); }} className="text-rose-500 hover:text-rose-700 font-black px-1">×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <InputField label="Cash Collection" value={cashCollection} onChange={setCashCollection} />
                <InputField label="Coins" value={coin} onChange={setCoin} />
                <InputField label="Missing / Short" value={miss} onChange={setMiss} />
                <InputField label="Balance In Pump" value={balanceInPump} onChange={setBalanceInPump} />
              </div>
            </div>
          </div>

          {/* Itemized Lubricants Sold Today Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
            <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Itemized Lubricants Sold Today</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Optional
              </span>
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-end bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lubricant Product</label>
                <select
                  value={currLubricantId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setCurrLubricantId(id);
                    const selected = allLubricants.find(l => l.id === id);
                    if (selected) {
                      setCurrLubricantPrice(selected.price);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                >
                  <option value="">Select Lubricant...</option>
                  {allLubricants.filter(l => l.stock > 0).map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.qty_name}) - Stock: {l.stock}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty Sold</label>
                <input
                  type="number"
                  min="1"
                  value={currLubricantQty}
                  onChange={(e) => setCurrLubricantQty(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="1"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={currLubricantPrice}
                  onChange={(e) => setCurrLubricantPrice(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLubricant}
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors h-[38px] flex items-center justify-center gap-1.5 shrink-0"
              >
                + Add Item
              </button>
            </div>

            {/* List of currently added lubricants */}
            {selectedLubricants.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold">
                No itemized lubricants added yet. Select one above.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Product Name</th>
                      <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Quantity</th>
                      <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Price per unit</th>
                      <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Subtotal</th>
                      <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-600">
                    {selectedLubricants.map((lub, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                        <td className="py-2.5 px-4 text-slate-800 font-bold">{lub.name}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{lub.quantity}</td>
                        <td className="py-2.5 px-4 text-right font-mono">₹{Number(lub.price).toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800 font-bold">₹{(lub.quantity * lub.price).toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLubricant(idx)}
                            className="text-red-500 hover:text-red-700 transition-colors font-bold text-[10px] uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingReadings || readings.length === 0}
              className="flex-1 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Computing & Saving...' : editingSaleId ? 'Update & Recalculate' : 'Save & Calculate Day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailySaleFormModal;
