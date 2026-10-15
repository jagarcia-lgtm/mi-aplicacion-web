
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Task, TaskModule, TaskStatus, Priority, EnergyLevel, TASK_MODULES_MAP } from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  Search, Inbox, Calendar, CalendarDays, Hash, Filter, 
  ChevronDown, ChevronRight, LogOut, Settings, Activity, 
  Plus, UserPlus, Users, X, 
  Briefcase, Shield, AlertTriangle, Wallet, Layout, Layers, Circle,
  Battery, BatteryCharging, BatteryLow, Zap, Home, Sparkles, Tag, UserCheck, Info, Printer, Trash2, Download
} from 'lucide-react';

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onCloseMobile: () => void;
  currentView: string;
  onNavigate: (view: string, filterVal?: string) => void;
  tasks: Task[];
  onLogout: () => void;
  availableTags: string[];
  onSearch: (query: string) => void;
  searchQuery: string;
  onQuickAdd: () => void;
  onOpenSettings: () => void;
  onEditTask: (task: Task) => void;
  onAddTag: (name: string) => void;
  onDeleteTag: (name: string) => void;
}

const MODULE_CONFIG: Record<TaskModule, { icon: React.ReactNode, color: string }> = {
  'Comercial': { icon: <Briefcase size={16} />, color: 'text-blue-500' },
  'Contratación': { icon: <Shield size={16} />, color: 'text-indigo-500' },
  'Siniestros': { icon: <AlertTriangle size={16} />, color: 'text-red-500' },
  'Recibos': { icon: <Wallet size={16} />, color: 'text-green-500' },
  'Administración': { icon: <Layout size={16} />, color: 'text-orange-500' },
  'General': { icon: <Layers size={16} />, color: 'text-gray-500' },
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, isOpen, onCloseMobile, currentView, onNavigate, 
  tasks, onLogout, availableTags, onSearch, searchQuery, onQuickAdd, onOpenSettings, onEditTask,
  onAddTag, onDeleteTag
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const counts = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      inbox: activeTasks.filter(t => !t.dueDate || t.assignedTo.length === 0).length,
      today: activeTasks.filter(t => t.myDayDate === todayStr || t.dueDate === todayStr || (t.dueDate && t.dueDate < todayStr)).length,
      upcoming: activeTasks.filter(t => t.dueDate && t.dueDate > todayStr).length,
      assignedMe: activeTasks.filter(t => t.assignedTo.includes(user.id) || t.assignedTo.length === 0).length,
      supervisedByMe: activeTasks.filter(t => t.supervisorId === user.id).length,
      urgent: activeTasks.filter(t => t.priority === Priority.VERY_HIGH || t.priority === Priority.HIGH).length,
      byModule: (module: TaskModule) => activeTasks.filter(t => t.module === module).length,
      byTag: (tag: string) => activeTasks.filter(t => t.tags.includes(tag)).length
    };
  }, [tasks, user.id]);
  
  const handleNav = (view: string, filterVal?: string) => {
    onNavigate(view, filterVal);
    setIsSearchFocused(false);
    if (window.innerWidth < 768) onCloseMobile();
  };

  const handleAddTagPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt("Nombre de la nueva etiqueta:");
    if (name && name.trim()) {
      onAddTag(name.trim());
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onCloseMobile} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#FAFAFA] border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-full flex items-center gap-2 p-2 hover:bg-gray-200 rounded-lg transition-colors text-left"><UserAvatar userId={user.id} size="sm" /><span className="font-semibold text-sm text-gray-800 flex-1 truncate">{user.name}</span><ChevronDown size={14} className="text-gray-500" /></button>
            {isUserMenuOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                <button onClick={() => { setIsUserMenuOpen(false); onOpenSettings(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Settings size={14} /> Configuración</button>
                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={14} /> Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="mb-2"><button onClick={onQuickAdd} className="w-full flex items-center gap-2 text-[#009696] font-bold text-sm px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors group"><div className="w-6 h-6 rounded-full bg-[#009696] text-white flex items-center justify-center shadow-sm"><Plus size={16} strokeWidth={3} /></div>Añadir tarea</button></div>
          <div className="mb-4 relative" ref={searchContainerRef}><Search size={16} className="absolute left-3 top-2.5 text-gray-400" /><input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => { onSearch(e.target.value); setIsSearchFocused(true); }} className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#009696] focus:border-transparent transition-shadow" /></div>
          
          <NavItem icon={<Home size={18} className="text-gray-600" />} label="Inicio" active={currentView === 'home'} onClick={() => handleNav('home')} />
          <NavItem icon={<Inbox size={18} className="text-blue-500" />} label="Buzón" count={counts.inbox} active={currentView === 'inbox'} onClick={() => handleNav('inbox')} />
          <NavItem icon={<Calendar size={18} className="text-[#009696]" />} label="Hoy" count={counts.today} active={currentView === 'myDay'} onClick={() => handleNav('myDay')} />
          <NavItem icon={<CalendarDays size={18} className="text-purple-500" />} label="Próximo" count={counts.upcoming} active={currentView === 'upcoming'} onClick={() => handleNav('upcoming')} />
          <NavItem icon={<Users size={18} className="text-[#009696]" />} label="Clientes 360°" active={currentView === 'clients'} onClick={() => handleNav('clients')} />
          <NavItem icon={<Shield size={18} className="text-[#009696]" />} label="Panel de seguros" active={currentView === 'dashboard'} onClick={() => handleNav('dashboard')} />
          
          <div className="pt-4 pb-2"></div>
          
          {/* CONTEXTOS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer group" onClick={() => setIsContextOpen(!isContextOpen)}><div className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider">{isContextOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}Contextos</div></div>
            {isContextOpen && (
              <div className="pl-2 space-y-0.5">
                {(Object.keys(TASK_MODULES_MAP) as TaskModule[]).map(module => (
                  <button key={module} onClick={() => handleNav(`module_${module}`, module)} className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-lg transition-colors ${currentView === `module_${module}` ? 'bg-[#009696]/10 text-[#009696] font-medium' : 'text-gray-700 hover:bg-gray-100'}`}><div className="flex items-center gap-3 truncate"><span className={MODULE_CONFIG[module].color}>{MODULE_CONFIG[module].icon}</span><span className="truncate">{module}</span></div>{counts.byModule(module) > 0 && <span className={`text-xs ${currentView === `module_${module}` ? 'text-[#009696]' : 'text-gray-400'}`}>{counts.byModule(module)}</span>}</button>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-2"></div>
          
          {/* FILTROS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer group" onClick={() => setIsFiltersOpen(!isFiltersOpen)}><div className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider">{isFiltersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}Filtros</div></div>
            {isFiltersOpen && (
              <div className="pl-2 space-y-0.5">
                <NavItem icon={<UserPlus size={16} className="text-gray-400" />} label="Asignado a mí" count={counts.assignedMe} active={currentView === 'assigned_me'} onClick={() => handleNav('assigned_me')} compact />
                <NavItem icon={<UserCheck size={16} className="text-gray-400" />} label="Supervisado por mí" count={counts.supervisedByMe} active={currentView === 'supervisor_me'} onClick={() => handleNav('supervisor_me')} compact />
                <NavItem icon={<Activity size={16} className="text-red-500" />} label="Prioridad Crítica" count={counts.urgent} active={currentView === 'priority_high'} onClick={() => handleNav('priority_high')} compact />
              </div>
            )}
          </div>

          <div className="pt-2"></div>

          {/* ETIQUETAS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer group" onClick={() => setIsTagsOpen(!isTagsOpen)}>
                <div className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider">
                    {isTagsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Etiquetas
                </div>
                <button 
                  onClick={handleAddTagPrompt}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded text-[#009696] transition-all"
                  title="Nueva etiqueta"
                >
                    <Plus size={14} strokeWidth={3} />
                </button>
            </div>
            {isTagsOpen && (
              <div className="pl-2 space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {availableTags.map(tag => (
                  <div key={tag} className="group relative">
                    <button 
                      onClick={() => handleNav(`tag_${tag}`, tag)} 
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-lg transition-colors ${currentView === `tag_${tag}` ? 'bg-[#009696]/10 text-[#009696] font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center gap-3 truncate pr-4">
                        <Tag size={14} className={currentView === `tag_${tag}` ? 'text-[#009696]' : 'text-gray-400'} />
                        <span className="truncate">{tag}</span>
                      </div>
                      {counts.byTag(tag) > 0 && <span className={`text-xs ${currentView === `tag_${tag}` ? 'text-[#009696]' : 'text-gray-400'}`}>{counts.byTag(tag)}</span>}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteTag(tag); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                      title="Eliminar etiqueta"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {availableTags.length === 0 && (
                    <p className="text-[10px] text-gray-400 italic px-3 py-2">Sin etiquetas globales</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2">
          <a 
            href={`${import.meta.env.BASE_URL}gestibrok_portable.zip`}
            download="gestibrok_portable.zip" 
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#009696] hover:bg-[#007f7f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all text-center"
            title="Descargar todos los archivos del proyecto comprimidos en ZIP"
          >
            <Download size={14} />
            <span>Descargar Código (ZIP)</span>
          </a>
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span>GestiBrok v1.3</span>
            <Info size={12} />
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; count?: number; active?: boolean; onClick: () => void; compact?: boolean; }> = ({ icon, label, count, active, onClick, compact }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-3 rounded-lg transition-colors ${compact ? 'py-1.5 text-sm' : 'py-2 text-sm'} ${active ? 'bg-[#009696]/10 text-[#009696] font-medium' : 'text-gray-700 hover:bg-gray-100'}`}><div className="flex items-center gap-3 truncate">{icon}<span className="truncate">{label}</span></div>{count !== undefined && count > 0 && <span className={`text-xs ${active ? 'text-[#009696]' : 'text-gray-400'}`}>{count}</span>}</button>
);
