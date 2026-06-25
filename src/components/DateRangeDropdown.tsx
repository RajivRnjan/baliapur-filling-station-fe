import React, { useState, useRef, useEffect } from 'react';
import { DateRange, type Range } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

interface DateRangeDropdownProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (range: { startDate: string | null, endDate: string | null }) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({ 
  startDate, 
  endDate, 
  onChange,
  placeholder = "Select date range",
  className = "",
  inputClassName = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<Range[]>([
    {
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      key: 'selection'
    }
  ]);

  useEffect(() => {
    if (startDate && endDate) {
      setState([
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          key: 'selection'
        }
      ]);
    } else if (!startDate && !endDate) {
       setState([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection'
        }
      ]);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item: any) => {
    setState([item.selection]);
    
    if (item.selection.startDate && item.selection.endDate) {
      onChange({
        startDate: format(item.selection.startDate, 'yyyy-MM-dd'),
        endDate: format(item.selection.endDate, 'yyyy-MM-dd')
      });
    }
  };

  const displayText = startDate && endDate 
    ? `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`
    : '';

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <input 
        type="text" 
        readOnly 
        value={displayText}
        placeholder={placeholder}
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClassName} cursor-pointer`}
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 shadow-2xl border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={state}
            rangeColors={['#4f46e5']} // Tailwind indigo-600
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;
