
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Sun, ArrowRight, Ban, ChevronLeft, ChevronRight, X, RefreshCw, Clock, CalendarDays } from 'lucide-react';
import { RecurrenceConfig } from '../types';

interface DatePickerProps {
  label: string;
  value?: string; // ISO string YYYY-MM-DD
  recurrence?: RecurrenceConfig;
  onChange: (date: string, recurrence?: RecurrenceConfig) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  align?: 'left' | 'right';
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const DatePicker: React.FC<DatePickerProps> = ({ 
  label, 
  value, 
  recurrence,
  onChange, 
  icon, 
  placeholder = "Sin fecha",
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 280 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calcular posición para evitar recortes (fixed positioning)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let top = rect.bottom + 8;
      let left = align === 'right' ? rect.right - dropdownWidth : rect.left;

      // Si no cabe abajo, mostrar arriba
      if (spaceBelow < 420 && spaceAbove > spaceBelow) {
        top = rect.top - 410; // Estimación de altura máxima
      }

      // Asegurar que no se salga por los lados
      if (left < 10) left = 10;
      if (left + dropdownWidth > window.innerWidth) left = window.innerWidth - dropdownWidth - 10;

      setCoords({ top, left, width: dropdownWidth });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, align]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setIsOpen(false), true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const parseNaturalLanguage = (text: string): { date: string, recurrence?: RecurrenceConfig } | null => {
    const t = text.toLowerCase().trim();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (t === 'hoy') return { date: todayStr };
    if (t === 'mañana' || t === 'manana') {
        const d = new Date(); d.setDate(d.getDate() + 1);
        return { date: d.toISOString().split('T')[0] };
    }

    if (t === 'cada día' || t === 'diariamente' || t === 'cada dia') {
        return { date: todayStr, recurrence: { type: 'daily', intervalDays: 1, pattern: 'cada día' } };
    }

    for (let i = 0; i < DIAS_SEMANA.length; i++) {
        if (t === `cada ${DIAS_SEMANA[i]}` || t === `todos los ${DIAS_SEMANA[i]}` || (i === 0 && t === 'cada dom')) {
            const d = new Date();
            d.setDate(d.getDate() + (i + 7 - d.getDay()) % 7);
            return { 
                date: d.toISOString().split('T')[0], 
                recurrence: { type: 'weekly', dayOfWeek: i, intervalDays: 1, pattern: `cada ${DIAS_SEMANA[i]}` } 
            };
        }
    }

    const cadaXDias = t.match(/cada (\d+) d[íi]as/);
    if (cadaXDias) {
        const interval = parseInt(cadaXDias[1]);
        return { date: todayStr, recurrence: { type: 'daily', intervalDays: interval, pattern: `cada ${interval} días` } };
    }

    if (t === 'cada mes') {
        return { date: todayStr, recurrence: { type: 'monthly', intervalDays: 1, pattern: 'cada mes' } };
    }
    
    const cadaMesDia = t.match(/cada mes el d[íi]a (\d+)/);
    if (cadaMesDia) {
        const day = parseInt(cadaMesDia[1]);
        if (day >= 1 && day <= 31) {
            const d = new Date();
            if (d.getDate() > day) d.setMonth(d.getMonth() + 1);
            d.setDate(day);
            return { date: d.toISOString().split('T')[0], recurrence: { type: 'monthly', dayOfMonth: day, pattern: `cada mes el día ${day}` } };
        }
    }

    return null;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const result = parseNaturalLanguage(inputText);
        if (result) {
            onChange(result.date, result.recurrence);
            setIsOpen(false);
            setInputText('');
        }
    }
    if (e.key === 'Escape') setIsOpen(false);
  };

  const activePattern = useMemo(() => {
    if (inputText.length > 2) return parseNaturalLanguage(inputText);
    return null;
  }, [inputText]);

  const handleSelect = (dateStr: string, rec?: RecurrenceConfig) => {
    onChange(dateStr, rec);
    setIsOpen(false);
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = value === dateStr;
      const isToday = dateStr === todayStr;

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleSelect(dateStr)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isSelected ? 'bg-[#009696] text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'} ${isToday && !isSelected ? 'text-[#009696] ring-1 ring-[#009696]' : ''}`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const displayValue = useMemo(() => {
    if (recurrence && recurrence.pattern) return recurrence.pattern;
    return value ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : placeholder;
  }, [value, recurrence, placeholder]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg px-3 py-2 transition-all shadow-sm ${value ? 'text-gray-800' : 'text-gray-500'} ${recurrence?.type && recurrence.type !== 'none' ? 'text-[#009696] bg-[#009696]/5 border-[#009696]/20' : ''}`}
      >
        {recurrence?.type && recurrence.type !== 'none' ? <RefreshCw size={14} className="animate-spin-slow" /> : (icon || <Calendar size={14} />)}
        <span className="truncate max-w-[80px]">{displayValue}</span>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          style={{ 
            position: 'fixed', 
            top: coords.top, 
            left: coords.left, 
            width: coords.width,
            zIndex: 9999 
          }}
          className="bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Input Lenguaje Natural */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative flex items-center">
                <input 
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Escribe 'cada lunes'..."
                    className="w-full text-sm border-none focus:ring-0 p-0 bg-transparent text-gray-800 placeholder-gray-400 font-medium"
                />
                {inputText ? (
                    <button onClick={() => setInputText('')} className="p-1 text-gray-300 hover:text-gray-500"><X size={14} /></button>
                ) : <Clock size={14} className="text-gray-300" />}
            </div>
            
            {activePattern && (
                <div className="mt-3 flex items-center gap-2 text-[10px] bg-[#009696]/10 p-2 rounded-lg text-[#007a7a] border border-[#009696]/10 animate-in slide-in-from-top-1 font-bold uppercase tracking-wider">
                    {activePattern.recurrence ? <RefreshCw size={12} /> : <Calendar size={12}/>}
                    <span>Detectado: {activePattern.recurrence ? activePattern.recurrence.pattern : 'Fecha única'}</span>
                </div>
            )}
          </div>

          <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
            {/* Atajos Rápidos */}
            <div className="p-2 space-y-0.5 border-b border-gray-50">
                <button type="button" onClick={() => handleSelect(todayStr)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3 font-medium"><Calendar size={16} className="text-green-500"/> Hoy</div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(today)}</span>
                </button>
                <button type="button" onClick={() => {
                    const d = new Date(); d.setDate(d.getDate() + 1);
                    handleSelect(d.toISOString().split('T')[0]);
                }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3 font-medium"><Sun size={16} className="text-orange-500"/> Mañana</div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(new Date(Date.now() + 86400000))}</span>
                </button>
                <button type="button" onClick={() => handleSelect('')} className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium">
                    <Ban size={16} className="mr-3 opacity-50"/> Quitar fecha
                </button>
            </div>

            {/* Calendario Compacto */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
                    <div className="flex gap-1">
                        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><ChevronLeft size={16}/></button>
                        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><ChevronRight size={16}/></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                        <div key={d} className="text-center text-[10px] text-gray-300 font-black">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {renderCalendar()}
                </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2">
             <button 
                type="button" 
                onClick={() => setInputText('cada semana')}
                className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-tighter rounded-xl transition-all border ${recurrence?.type && recurrence.type !== 'none' ? 'bg-[#009696] text-white border-[#009696]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#009696] hover:text-[#009696]'}`}
             >
                <RefreshCw size={14}/> {recurrence?.pattern ? 'Editar Repetición' : 'Repetir'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
