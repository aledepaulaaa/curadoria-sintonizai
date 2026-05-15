'use client';

import React from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarMultiPickerProps {
  selectedDates: string[]; // ISO format YYYY-MM-DD
  onDatesChange: (dates: string[]) => void;
  recorrente?: boolean;
}

export default function CalendarMultiPicker({ selectedDates, onDatesChange, recorrente }: CalendarMultiPickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const onDateClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter(d => d !== dateStr));
    } else {
      onDatesChange([...selectedDates, dateStr]);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon size={14} className="text-purple-600" />
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <button 
            type="button" 
            onClick={prevMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            type="button" 
            onClick={nextMonth}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, idx) => (
          <div key={idx} className="text-center text-[10px] font-black text-zinc-400 uppercase">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateStr = format(cloneDay, 'yyyy-MM-dd');
        const isSelected = selectedDates.includes(dateStr);
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isCurrentDay = isToday(cloneDay);

        days.push(
          <button
            key={day.toString()}
            type="button"
            onClick={() => onDateClick(cloneDay)}
            className={`
              aspect-square flex items-center justify-center text-[11px] font-bold rounded-xl border transition-all relative
              ${isSelected 
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20 z-10 scale-105' 
                : isCurrentMonth 
                  ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-purple-300' 
                  : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-transparent text-zinc-300 dark:text-zinc-700 pointer-events-none'}
            `}
          >
            {isCurrentDay && !isSelected && (
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-purple-500" />
            )}
            {format(cloneDay, 'd')}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1.5" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1.5">{rows}</div>;
  };

  return (
    <div className="p-5 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-600" />
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            {selectedDates.length} Selecionadas
          </span>
        </div>
        
        {recorrente !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recorrente?</span>
            <div className={`w-8 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 relative ${recorrente ? 'bg-purple-600' : ''}`}>
               <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${recorrente ? 'translate-x-4' : ''}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
