import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { fetchDashboardStats, fetchDashboardSales } from './features/dashboard/dashboardSlice';
import LoginPage from './pages/LoginPage';
import NozzlesPage from './pages/NozzlesPage';
import PurchasesPage from './pages/PurchasesPage';
import AdminsPage from './pages/AdminsPage';
import DailySalesPage from './pages/DailySalesPage';
import LubricantsPage from './pages/LubricantsPage';
import CreditorsPage from './pages/CreditorsPage';
import CashbookPage from './pages/CashbookPage';
import StaffSalaryReportPage from './pages/StaffSalaryReportPage';
import OwnerPayoutsPage from './pages/OwnerPayoutsPage';
import PumpExpensesPage from './pages/PumpExpensesPage';
import CashBalancePage from './pages/CashBalancePage';
import StaffDashboard from './pages/StaffDashboard';
import Layout from './components/Layout';
import './App.css';

interface ChartDataPoint {
  period: string;
  fuel_sales: number;
  lubricant_sales: number;
  total_sales: number;
  credit_sales: number;
  cash_collected: number;
}

const SalesTrendChart = ({ data }: { data: ChartDataPoint[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  if (!data || data.length === 0) return null;

  const maxTotal = Math.max(...data.map(d => Number(d.total_sales) || 0), 10000);
  
  const svgWidth = 600;
  const svgHeight = 260;
  const paddingLeft = 72;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 80;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + ((index + 0.5) / data.length) * chartWidth;
    const y = paddingTop + chartHeight - ((Number(d.total_sales) || 0) / maxTotal) * chartHeight;
    return { x, y, data: d };
  });

  let lineD = '';
  let areaD = '';

  if (points.length > 0) {
    lineD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaD = `${lineD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  const formatCurrencyAbbrev = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-visible mt-6 mb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Revenue Sales Chart</h4>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Interactive visual representation of total earnings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
            <span className="text-slate-500">Total Sales</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl items-center gap-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const ratio = i / 4;
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const val = ratio * maxTotal;
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={svgWidth - paddingRight} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-[9px] font-black fill-slate-400"
                >
                  {formatCurrencyAbbrev(val)}
                </text>
              </g>
            );
          })}

          {/* Render Area */}
          {chartType === 'line' && areaD && (
            <path 
              d={areaD} 
              fill="url(#chartGradient)" 
              className="transition-all duration-300"
            />
          )}

          {/* Render Line */}
          {chartType === 'line' && lineD && (
            <path 
              d={lineD} 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Render Interactive Dots */}
          {chartType === 'line' && points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                className="fill-blue-600 stroke-white stroke-2 cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* X Axis labels */}
              <text
                x={p.x}
                y={svgHeight - 65}
                transform={`rotate(-60 ${p.x} ${svgHeight - 65})`}
                textAnchor="end"
                className="text-[9px] font-black fill-slate-400"
              >
                {p.data.period}
              </text>
            </g>
          ))}

          {/* Render Bars */}
          {chartType === 'bar' && points.map((p, idx) => {
            const barWidth = Math.max(10, Math.min(32, chartWidth / data.length - 8));
            const x = p.x - barWidth / 2;
            const barHeight = chartHeight - (p.y - paddingTop);
            const y = p.y;

            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Background Shadow Bar */}
                <rect
                  x={x}
                  y={paddingTop}
                  width={barWidth}
                  height={chartHeight}
                  fill="#f8fafc"
                  rx="4"
                  className="transition-all duration-300"
                />

                {/* Actual Sales Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  rx="4"
                  className="transition-all duration-300"
                />

                {/* X Axis labels */}
                <text
                  x={p.x}
                  y={svgHeight - 65}
                  transform={`rotate(-60 ${p.x} ${svgHeight - 65})`}
                  textAnchor="end"
                  className="text-[9px] font-black fill-slate-400"
                >
                  {p.data.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
            className="absolute z-10 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-xl pointer-events-none transition-all duration-150 text-xs"
            style={{
              left: `${Math.min(
                80,
                Math.max(10, ((points[hoveredIndex].x - paddingLeft) / chartWidth) * 100)
              )}%`,
              top: '10px',
            }}
          >
            <p className="font-black text-blue-400 mb-2 border-b border-slate-800 pb-1">
              Period: {points[hoveredIndex].data.period}
            </p>
            <div className="space-y-1 font-bold text-[11px]">
              <div className="flex justify-between gap-8">
                <span className="text-slate-400">Total Sales:</span>
                <span className="text-white">
                  ₹{Number(points[hoveredIndex].data.total_sales).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-slate-400">Fuel Sales:</span>
                <span className="text-white">
                  ₹{Number(points[hoveredIndex].data.fuel_sales).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-slate-400">Lubricants:</span>
                <span className="text-white">
                  ₹{Number(points[hoveredIndex].data.lubricant_sales).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between gap-8 border-t border-slate-800 pt-1 mt-1">
                <span className="text-slate-400">Cash Collected:</span>
                <span className="text-emerald-400">
                  ₹{Number(points[hoveredIndex].data.cash_collected).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-slate-400">Credit Sales:</span>
                <span className="text-rose-400">
                  ₹{Number(points[hoveredIndex].data.credit_sales).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FuelInventoryBarChart = ({ fuelData }: { 
  fuelData: {
    MS?: number;
    NS?: number;
    HSD: number;
    XP: number;
    total: number;
  } 
}) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const msVal = fuelData.MS ?? fuelData.NS ?? 0;
  const categories = [
    { key: 'MS', label: 'MS (Petrol)', value: msVal, color: '#2563eb', hoverColor: '#1d4ed8', capacity: 20000 },
    { key: 'HSD', label: 'HSD (Diesel)', value: fuelData.HSD, color: '#06b6d4', hoverColor: '#0891b2', capacity: 20000 },
    { key: 'XP', label: 'XP Premium', value: fuelData.XP, color: '#a855f7', hoverColor: '#9333ea', capacity: 20000 },
  ];

  const svgWidth = 500;
  const svgHeight = 220;
  const paddingTop = 20;
  const paddingBottom = 40;
  const paddingLeft = 60;
  const paddingRight = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...categories.map(c => c.value), 10000);

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-visible mt-6 mb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Fuel Storage Remaining Bar Chart</h4>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Interactive visual breakdown of fuel inventory remaining in active tanks</p>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Y Axis Gridlines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const ratio = i / 4;
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const val = ratio * maxVal;
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={svgWidth - paddingRight} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-[9px] font-black fill-slate-400"
                >
                  {val.toLocaleString(undefined, { maximumFractionDigits: 0 })} L
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {categories.map((c, idx) => {
            const barWidth = 45;
            const gap = (chartWidth - barWidth * categories.length) / (categories.length + 1);
            const x = paddingLeft + gap + idx * (barWidth + gap);
            const barHeight = (c.value / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;
            const percentFilled = ((c.value / c.capacity) * 100).toFixed(1);

            return (
              <g 
                key={c.key}
                onMouseEnter={() => setHoveredBar(c.key)}
                onMouseLeave={() => setHoveredBar(null)}
                className="cursor-pointer"
              >
                {/* Background Shadow Bar */}
                <rect
                  x={x}
                  y={paddingTop}
                  width={barWidth}
                  height={chartHeight}
                  fill="#f8fafc"
                  rx="6"
                  className="transition-all duration-300"
                />

                {/* Actual Data Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={hoveredBar === c.key ? c.hoverColor : c.color}
                  rx="6"
                  className="transition-all duration-300"
                />

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 15}
                  textAnchor="middle"
                  className="text-[9px] font-black fill-slate-400"
                >
                  {c.label}
                </text>

                {/* Value percentage above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className={`text-[9px] font-black ${hoveredBar === c.key ? 'fill-slate-800' : 'fill-slate-400'} transition-colors duration-150`}
                >
                  {percentFilled}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredBar && (
          (() => {
            const activeCategory = categories.find(c => c.key === hoveredBar);
            if (!activeCategory) return null;
            const idx = categories.indexOf(activeCategory);
            const barWidth = 45;
            const gap = (chartWidth - barWidth * categories.length) / (categories.length + 1);
            const xPosPercent = ((paddingLeft + gap + idx * (barWidth + gap) + barWidth/2 - paddingLeft) / chartWidth) * 100;

            return (
              <div 
                className="absolute z-10 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-xl pointer-events-none transition-all duration-150 text-xs"
                style={{
                  left: `${Math.min(80, Math.max(10, xPosPercent))}%`,
                  top: '10px',
                }}
              >
                <p className="font-black text-blue-400 mb-2 border-b border-slate-800 pb-1">
                  {activeCategory.label}
                </p>
                <div className="space-y-1 font-bold text-[11px]">
                  <div className="flex justify-between gap-8">
                    <span className="text-slate-400">Remaining:</span>
                    <span className="text-white">{activeCategory.value.toLocaleString()} Ltrs</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-slate-400">Total Tank Capacity:</span>
                    <span className="text-white">{activeCategory.capacity.toLocaleString()} Ltrs</span>
                  </div>
                  <div className="flex justify-between gap-8 border-t border-slate-800 pt-1 mt-1">
                    <span className="text-slate-400">Tank Capacity Filled:</span>
                    <span className="text-emerald-400">{((activeCategory.value / activeCategory.capacity) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const LubricantsBarChart = ({ stockData }: { stockData: any[] }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!stockData || stockData.length === 0) return null;

  const maxStock = Math.max(...stockData.map(d => Number(d.stock) || 0), 100);
  
  const svgWidth = 600;
  const rowHeight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const paddingLeft = 160; 
  const paddingRight = 40;
  
  const chartHeight = stockData.length * rowHeight;
  const svgHeight = chartHeight + paddingTop + paddingBottom;
  const chartWidth = svgWidth - paddingLeft - paddingRight;

  return (
    <div className="mb-10 bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-visible">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            🧴 Lubricants Inventory Stock Bar Chart
          </h4>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Visual representation of current stock levels across all registered products</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
          {stockData.length} Products Tracked
        </span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="lubricantBarGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="lubricantBarGradientLow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>

          {Array.from({ length: 5 }).map((_, i) => {
            const ratio = i / 4;
            const x = paddingLeft + ratio * chartWidth;
            const val = ratio * maxStock;
            return (
              <g key={`grid-${i}`} className="opacity-40">
                <line 
                  x1={x} y1={paddingTop} 
                  x2={x} y2={paddingTop + chartHeight} 
                  stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4"
                />
                <text 
                  x={x} y={paddingTop + chartHeight + 15} 
                  textAnchor="middle" className="text-[9px] font-black fill-slate-400"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {stockData.map((item, idx) => {
            const y = paddingTop + idx * rowHeight;
            const barHeight = 16;
            const stockVal = Number(item.stock) || 0;
            const barWidth = Math.max(2, (stockVal / maxStock) * chartWidth);
            const isLow = stockVal <= 5;
            
            const displayName = item.name.length > 25 ? item.name.substring(0, 23) + '...' : item.name;

            return (
              <g 
                key={item.id} 
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <text 
                  x={paddingLeft - 10} 
                  y={y + barHeight / 2 + 3} 
                  textAnchor="end" 
                  className={`text-[9px] font-black transition-colors ${hoveredIdx === idx ? (isLow ? 'fill-rose-600' : 'fill-blue-600') : 'fill-slate-600'}`}
                >
                  {displayName}
                </text>

                <rect 
                  x={paddingLeft} 
                  y={y} 
                  width={chartWidth} 
                  height={barHeight} 
                  fill="#f8fafc" 
                  rx="4"
                />

                <rect 
                  x={paddingLeft} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill={isLow ? 'url(#lubricantBarGradientLow)' : 'url(#lubricantBarGradient)'}
                  rx="4"
                  className={`transition-all duration-300 ${hoveredIdx === idx ? 'opacity-80' : 'opacity-100'}`}
                />

                <text 
                  x={paddingLeft + barWidth + 6} 
                  y={y + barHeight / 2 + 3} 
                  className={`text-[9px] font-black ${isLow ? 'fill-rose-500' : 'fill-slate-500'}`}
                >
                  {stockVal}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && stockData[hoveredIdx] && (
          <div 
            className="absolute z-10 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-xl pointer-events-none transition-all duration-150 text-xs"
            style={{
              left: `${Math.min(80, Math.max(20, ((paddingLeft + ((Number(stockData[hoveredIdx].stock) || 0) / maxStock) * chartWidth) / svgWidth) * 100))}%`,
              top: `${((paddingTop + hoveredIdx * rowHeight) / svgHeight) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <p className="font-black text-blue-400 mb-2 border-b border-slate-800 pb-1">
              {stockData[hoveredIdx].name}
            </p>
            <div className="space-y-1 font-bold text-[11px]">
              <div className="flex justify-between gap-8">
                <span className="text-slate-400">Unit Size:</span>
                <span className="text-white">{stockData[hoveredIdx].qty_name}</span>
              </div>
              <div className="flex justify-between gap-8 border-t border-slate-800 pt-1 mt-1">
                <span className="text-slate-400">Current Stock:</span>
                <span className={(Number(stockData[hoveredIdx].stock) || 0) <= 5 ? 'text-rose-400' : 'text-emerald-400'}>
                  {stockData[hoveredIdx].stock} units
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SalesFinancialPieChart = ({ data }: { data: any }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const metrics = [
    { label: "Today's Sales", value: Number(data?.today_sales) || 0, color: '#3b82f6', sub: '▲ 4% vs yesterday' },
    { label: "Weekly Target", value: Number(data?.this_week_sales) || 0, color: '#0ea5e9', sub: 'Rolling 7-day total' },
    { label: "This Quarter", value: Number(data?.this_quarter_sales) || 0, color: '#6366f1', sub: 'Quarterly Actual Sales' },
    { label: "Total Accumulated", value: Number(data?.grand_total_sales || (data?.today_sales * 100)) || 0, color: '#10b981', sub: 'Grand Total System Sales' },
  ];

  const total = metrics.reduce((sum, m) => sum + m.value, 0);
  
  let currentAngle = 0;

  return (
    <div className="mb-10 bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8">Sales Financial Overview</h3>
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/3 flex justify-center relative">
          <svg viewBox="0 0 200 200" className="w-64 h-64 transform -rotate-90 filter drop-shadow-md">
            {total > 0 ? metrics.map((m, i) => {
              if (m.value === 0) return null;
              const percentage = m.value / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 100 + 100 * Math.cos((Math.PI * (startAngle + angle)) / 180);
              const y2 = 100 + 100 * Math.sin((Math.PI * (startAngle + angle)) / 180);
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              if (percentage === 1) {
                return (
                  <circle 
                    key={i} 
                    cx="100" cy="100" r="100" fill={m.color} 
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  />
                );
              }

              return (
                <path
                  key={i}
                  d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={m.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer stroke-white stroke-2"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            }) : (
              <circle cx="100" cy="100" r="100" fill="#f1f5f9" />
            )}
            <circle cx="100" cy="100" r="60" fill="white" className="pointer-events-none" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hoveredIdx !== null ? (
              <div className="animate-fade-in flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-6 leading-tight mb-0.5">
                  {metrics[hoveredIdx].label}
                </span>
                <span className="text-sm font-black tracking-tight" style={{ color: metrics[hoveredIdx].color }}>
                  {formatCurrency(metrics[hoveredIdx].value)}
                </span>
                <span className="text-[8px] font-bold text-slate-400 mt-0.5 bg-slate-50 px-2 py-0.5 rounded-full">
                  {((metrics[hoveredIdx].value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ) : (
              <div className="animate-fade-in flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aggregate</span>
                <span className="text-sm font-black text-slate-800">{formatCurrency(total)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all hover:border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: m.color }}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
              </div>
              <div className={`text-2xl font-black tracking-tight ${i === 3 ? 'text-blue-600' : 'text-slate-800'}`}>
                {formatCurrency(m.value)}
              </div>
              <p className={`text-[10px] font-bold mt-2 ${i === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {m.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Business Dashboard for Baliapur Filling Station
const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { 
    stats, 
    statsStatus, 
    sales, 
    salesStatus, 
    pagination 
  } = useSelector((state: RootState) => state.dashboard);

  // Filter & Pagination States
  const [activeGroupBy, setActiveGroupBy] = useState<'day' | 'week' | 'quarter'>('day');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(31);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const getTodayLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [statsDate, setStatsDate] = useState(getTodayLocalDate());

  // Format date helper: yyyy-mm-dd to dd/mm/yyyy
  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    dispatch(fetchDashboardStats(statsDate ? formatDateForApi(statsDate) : undefined));
  }, [dispatch, statsDate]);

  useEffect(() => {
    dispatch(fetchDashboardSales({
      group_by: activeGroupBy,
      page,
      per_page: perPage,
      start_date: startDate ? formatDateForApi(startDate) : undefined,
      end_date: endDate ? formatDateForApi(endDate) : undefined,
    }));
  }, [dispatch, activeGroupBy, page, perPage, startDate, endDate]);




  const formatCurrencyDecimals = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(amount) || 0);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8 animate-fade border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
                Hello, <span className="text-blue-600">{user?.name || 'Manager'}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {user?.role || 'Staff'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• BALIAPUR FILLING STATION - Dudhiya, Baliapur Dhanbad</span>
              </div>
            </div>

            {stats && (
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-6">
                <div className="text-left sm:text-right">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Fuel Storage Remaining</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Calculated as: Opening Fuel + Purchases - Daily Sales</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">As Of Date:</span>
                  <input
                    type="date"
                    value={statsDate}
                    onChange={(e) => setStatsDate(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-bold"
                  />
                  {statsDate && (
                    <button
                      onClick={() => setStatsDate('')}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-wider transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* statsStatus Loading indicator */}
          {statsStatus === 'loading' && !stats && (
            <div className="py-20 text-center text-slate-500 font-semibold">Loading system metrics...</div>
          )}

          {stats && (
            <div className="animate-fade">
              {/* Core Fuel Capacities */}
              {/* Core Fuel Capacities */}
              {(() => {
                const petrolVal = stats.fuel_remaining?.MS ?? (stats.fuel_remaining as any)?.NS ?? 0;
                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {/* MS Capacity */}
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">MS (Petrol)</span>
                            <span className="text-xs font-bold text-slate-400">Active Tank</span>
                          </div>
                          <div className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                            {petrolVal.toLocaleString()} <span className="text-lg font-bold text-slate-400">Ltrs</span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                              style={{ width: `${Math.min(100, (petrolVal / 20000) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2">
                            <span>0 L</span>
                            <span>Capacity: 20k L</span>
                          </div>
                        </div>
                      </div>

                      {/* HSD Capacity */}
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">HSD (Diesel)</span>
                            <span className="text-xs font-bold text-slate-400">Active Tank</span>
                          </div>
                          <div className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                            {(stats.fuel_remaining?.HSD || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400">Ltrs</span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${Math.min(100, ((stats.fuel_remaining?.HSD || 0) / 20000) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2">
                            <span>0 L</span>
                            <span>Capacity: 20k L</span>
                          </div>
                        </div>
                      </div>

                      {/* XP Capacity */}
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">XP Premium</span>
                            <span className="text-xs font-bold text-slate-400">Premium Tank</span>
                          </div>
                          <div className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                            {(stats.fuel_remaining?.XP || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400">Ltrs</span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${Math.min(100, ((stats.fuel_remaining?.XP || 0) / 20000) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2">
                            <span>0 L</span>
                            <span>Capacity: 20k L</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fuel Inventory Bar Chart Visualizer */}
                    <FuelInventoryBarChart fuelData={stats.fuel_remaining} />
                  </>
                );
              })()}

              <SalesFinancialPieChart data={stats.sales_overview} />

              {/* Lubricants Alert & Stock Status Section */}
              {stats.lubricant_stock && stats.lubricant_stock.length > 0 && (
                <LubricantsBarChart stockData={stats.lubricant_stock} />
              )}
            </div>
          )}

          {/* Dashboard Sales Filters */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mt-12 mb-8 animate-fade">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div>
                <h4 className="text-xl font-black text-slate-800">Sales Analytics</h4>
                <p className="text-xs font-semibold text-slate-400 mt-1">Filter charts and aggregates by date and grouping</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                {/* Group By Tabs */}
                <div className="flex bg-slate-50 p-1 rounded-xl items-center gap-1 border border-slate-100">
                  {(['day', 'week', 'quarter'] as const).map((group) => (
                    <button
                      key={group}
                      onClick={() => { setActiveGroupBy(group); setPage(1); }}
                      className={`px-4 py-2 text-xs font-black rounded-lg transition-all capitalize ${
                        activeGroupBy === group
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                      title="Start Date"
                      className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="text-slate-400 font-bold text-[10px] uppercase">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                      title="End Date"
                      className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setPage(1);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Graph Chart section */}
          {sales && sales.length > 0 && (
            <SalesTrendChart data={[...sales].reverse()} />
          )}

          {/* Interactive Sales Aggregates Table */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mt-12 animate-fade">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-xl font-black text-slate-800">Sales Aggregates</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Consolidated ledger summaries</p>
                </div>
              </div>
            </div>

            {salesStatus === 'loading' && (
              <div className="py-20 text-center text-slate-500 font-semibold">Gathering sales records...</div>
            )}

            {salesStatus !== 'loading' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Period</th>
                      <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Fuel Sales</th>
                      <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Lubricants Sales</th>
                      <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Credit Sales</th>
                      <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cash Collected</th>
                      <th className="pb-4 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-4 text-sm font-black text-slate-800">
                          {row.period}
                        </td>
                        <td className="py-4 text-sm font-bold text-right text-slate-600">
                          {formatCurrencyDecimals(row.fuel_sales)}
                        </td>
                        <td className="py-4 text-sm font-bold text-right text-slate-600">
                          {formatCurrencyDecimals(row.lubricant_sales)}
                        </td>
                        <td className="py-4 text-sm font-bold text-right text-rose-600">
                          {formatCurrencyDecimals(row.credit_sales)}
                        </td>
                        <td className="py-4 text-sm font-bold text-right text-emerald-600">
                          {formatCurrencyDecimals(row.cash_collected)}
                        </td>
                        <td className="py-4 text-sm font-black text-right text-slate-900 pr-4">
                          {formatCurrencyDecimals(row.total_sales)}
                        </td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                          No aggregates available for this period selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Sales Pagination */}
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
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardOrRedirect = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user?.role === 'ADMIN') {
    return <Navigate to="/daily-sales" replace />;
  }
  if (user?.role === 'STAFF') {
    return <Navigate to="/staff-dashboard" replace />;
  }
  return <Dashboard />;
};

function App() {
  // Global Enter-to-Tab functionality for fast data entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        
        // Apply only to inputs (avoid textareas, buttons, or submit inputs)
        if (
          target.tagName.toLowerCase() === 'input' && 
          target.getAttribute('type') !== 'submit' &&
          target.getAttribute('type') !== 'button'
        ) {
          e.preventDefault(); // Prevent form submission
          
          // Find all focusable elements in the document
          const focusableSelectors = 'input:not([disabled]):not([type="hidden"]), select:not([disabled]), button:not([disabled]):not([type="button"])';
          const focusableElements = Array.from(document.querySelectorAll(focusableSelectors)) as HTMLElement[];
          
          const currentIndex = focusableElements.indexOf(target);
          if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
            focusableElements[currentIndex + 1].focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-outfit text-sm font-bold',
          style: {
            borderRadius: '16px',
            background: '#334155',
            color: '#fff',
          },
        }} 
      />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardOrRedirect />
              </ProtectedRoute>
            }
          />
        <Route 
          path="/nozzles" 
          element={
            <ProtectedRoute>
              <NozzlesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/purchases" 
          element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admins" 
          element={
            <ProtectedRoute>
              <AdminsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/daily-sales" 
          element={
            <ProtectedRoute>
              <DailySalesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lubricants" 
          element={
            <ProtectedRoute>
              <LubricantsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/creditors" element={
          <ProtectedRoute>
            <CreditorsPage />
          </ProtectedRoute>
        } />
        <Route path="/cashbooks" element={
          <ProtectedRoute>
            <Layout>
              <CashbookPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/staff-salaries" element={
          <ProtectedRoute>
            <Layout>
              <StaffSalaryReportPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/owner-payouts" element={
          <ProtectedRoute>
            <Layout>
              <OwnerPayoutsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/pump-expenses" element={
          <ProtectedRoute>
            <Layout>
              <PumpExpensesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/cash-balance" element={
          <ProtectedRoute>
            <Layout>
              <CashBalancePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/staff-dashboard" element={
          <ProtectedRoute>
            <Layout>
              <StaffDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
