
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Navigation } from 'lucide-react';

interface LocationPickerProps {
  value?: string;
  onChange: (location: string) => void;
  align?: 'left' | 'right';
}

const MOCK_LOCATIONS = [
  "Calle Larios, Málaga, España",
  "Calle del Correo Mayor, Madrid, España",
  "Calle del Laurel, Logroño, España",
  "Calle de Arturo Soria, Madrid, España",
  "Calle de Ponzano, Madrid, España",
  "Paseo de la Castellana, Madrid, España",
  "Gran Vía, Madrid, España",
  "Avenida Diagonal, Barcelona, España",
  "Calle Betis, Sevilla, España"
];

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  value, 
  onChange,
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate position to float above everything (Portal-like behavior)
        // If it's too close to bottom, flip it up (basic logic)
        const spaceBelow = window.innerHeight - rect.bottom;
        const showAbove = spaceBelow < 300; // If less than 300px below, show above

        setCoords({
            top: showAbove ? rect.top : rect.bottom + 8, // +8 for margin
            left: rect.left, // Align left with container
            width: 320 // Fixed width for the dropdown
        });
        
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 50);
        
        // Pre-fill query
        setQuery(value || '');
    }
  }, [isOpen, value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside container OR inside the fixed dropdown
      const target = event.target as Node;
      const clickedContainer = containerRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedContainer && !clickedDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', () => setIsOpen(false), true); // Close on scroll to avoid detached popup
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, []);

  const handleSelect = (loc: string) => {
    onChange(loc);
    setIsOpen(false);
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const filteredLocations = MOCK_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
        <div className="relative w-full" ref={containerRef}>
        {/* Trigger Button - Matches other inputs */}
        <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
                group w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200
                ${isOpen ? 'bg-white border-[#009696] ring-1 ring-[#009696]' : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200'}
            `}
        >
            <div className="flex items-center gap-2.5 truncate flex-1">
                <div className={`p-1 rounded-md ${value ? 'bg-red-50 text-red-500' : 'bg-gray-200 text-gray-500'}`}>
                    <MapPin size={14} />
                </div>
                {value ? (
                    <span className="truncate text-gray-700 font-medium">{value}</span>
                ) : (
                    <span className="text-gray-400">Añadir ubicación...</span>
                )}
            </div>
            {value && (
                <div 
                    onClick={clearValue} 
                    className="p-1 -mr-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                >
                    <X size={14} />
                </div>
            )}
        </button>
        </div>

        {/* Fixed Dropdown (Portal-like) */}
        {isOpen && (
            <div 
                ref={dropdownRef}
                style={{ 
                    position: 'fixed', 
                    top: coords.top, 
                    left: align === 'right' ? (containerRef.current?.getBoundingClientRect().right || 0) - 320 : coords.left,
                    width: 320,
                    zIndex: 9999 // Always on top
                }}
                className={`
                    bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100
                    ${window.innerHeight - coords.top < 300 ? '-translate-y-full mb-2' : ''} 
                `}
            >
                {/* Search Header */}
                <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#009696]" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Escribe una calle o ciudad..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#009696]/20 focus:border-[#009696] outline-none transition-all placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[240px] overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                    {query && filteredLocations.length === 0 && (
                        <div className="py-8 text-center">
                            <Navigation size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-400">No encontramos esa dirección.</p>
                        </div>
                    )}
                    
                    {filteredLocations.map((loc, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(loc)}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-start gap-3 group transition-colors hover:bg-[#009696]/5"
                        >
                            <MapPin size={16} className="text-gray-400 mt-0.5 group-hover:text-[#009696] transition-colors shrink-0" />
                            <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-gray-800 group-hover:text-[#009696]">{loc.split(',')[0]}</span>
                                <span className="text-xs text-gray-400 mt-0.5">{loc.split(',').slice(1).join(', ')}</span>
                            </div>
                        </button>
                    ))}

                    {/* Custom Value Option */}
                    {query && !filteredLocations.includes(query) && (
                         <button
                            onClick={() => handleSelect(query)}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-3 group transition-colors hover:bg-gray-50 border-t border-gray-50 mt-1"
                        >
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0 group-hover:border-gray-400">
                                <div className="w-1.5 h-1.5 bg-transparent rounded-full group-hover:bg-gray-400"></div>
                            </div>
                            <span className="text-gray-600">Usar texto: <span className="font-semibold text-gray-900">"{query}"</span></span>
                        </button>
                    )}
                </div>
                
                {/* Footer / Attribution - Cleaned up */}
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex justify-end items-center">
                     <span className="text-[10px] text-gray-400 flex items-center gap-1 opacity-70 grayscale hover:grayscale-0 transition-all">
                         powered by 
                         <span className="text-xs font-semibold text-gray-400">Ubicaciones de ejemplo</span>
                     </span>
                </div>
            </div>
        )}
    </>
  );
};
