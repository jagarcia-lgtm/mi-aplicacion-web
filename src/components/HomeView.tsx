
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskModule, TASK_MODULES_MAP, User } from '../types';
import { 
  Home, Calendar, AlertCircle, CheckCircle2, Clock, 
  BarChart3, Filter, ChevronDown, Check, Users, Activity
} from 'lucide-react';
import { MOCK_USERS } from '../services/auth';
import { UserAvatar } from './UserAvatar';

interface HomeViewProps {
  tasks: Task[];
  user: User;
  onNavigate: (view: string, filterVal?: string) => void;
}

type TimePeriod = 'today' | 'week' | 'month';

export const HomeView: React.FC<HomeViewProps> = ({ tasks, user, onNavigate }) => {
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [selectedModules, setSelectedModules] = useState<TaskModule[]>([]);

  // Get all available modules from config
  const allModules = Object.keys(TASK_MODULES_MAP) as TaskModule[];

  const toggleModule = (mod: TaskModule) => {
    if (selectedModules.includes(mod)) {
      setSelectedModules(selectedModules.filter(m => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  // --- Calculations ---
  const metrics = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate week range
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startWeekStr = startOfWeek.toISOString().split('T')[0];
    const endWeekStr = endOfWeek.toISOString().split('T')[0];

    // Calculate month range
    const startMonthStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endMonthStr = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    // Future Dates for Upcoming
    const next48h = new Date(today);
    next48h.setDate(today.getDate() + 2);
    const next48hStr = next48h.toISOString().split('T')[0];

    const next7d = new Date(today);
    next7d.setDate(today.getDate() + 7);
    const next7dStr = next7d.toISOString().split('T')[0];

    // Filter by Module first
    const moduleFiltered = selectedModules.length > 0 
      ? tasks.filter(t => t.module && selectedModules.includes(t.module))
      : tasks;

    // --- Helper Filter Functions ---
    const isOverdue = (t: Task) => t.dueDate && t.dueDate < todayStr && t.status !== TaskStatus.COMPLETED;
    
    const isInPeriod = (t: Task) => {
        if (!t.dueDate) return false;
        if (period === 'today') return t.dueDate === todayStr;
        if (period === 'week') return t.dueDate >= startWeekStr && t.dueDate <= endWeekStr;
        if (period === 'month') return t.dueDate >= startMonthStr && t.dueDate <= endMonthStr;
        return false;
    };

    // --- Core Metrics ---
    const activeInPeriod = moduleFiltered.filter(t => 
      t.status !== TaskStatus.COMPLETED && (isInPeriod(t) || isOverdue(t))
    );

    const completedInPeriod = moduleFiltered.filter(t => 
      t.status === TaskStatus.COMPLETED && isInPeriod(t)
    );

    const overdueTotal = moduleFiltered.filter(isOverdue);

    // --- Upcoming Metrics ---
    const upcoming48h = moduleFiltered.filter(t => 
      t.status !== TaskStatus.COMPLETED && t.dueDate > todayStr && t.dueDate <= next48hStr
    );

    const upcoming7d = moduleFiltered.filter(t => 
      t.status !== TaskStatus.COMPLETED && t.dueDate > todayStr && t.dueDate <= next7dStr
    );

    // --- Module Distribution ---
    const totalActiveTasksGlobal = tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
    const distribution = allModules.map(mod => {
       const count = tasks.filter(t => t.module === mod && t.status !== TaskStatus.COMPLETED).length;
       return { name: mod, count };
    }).sort((a,b) => b.count - a.count);

    // --- Workload (Cargas de Trabajo) - PERIOD SENSITIVE ---
    // Here we use the calculated activeInPeriod to determine the current load of each user
    const totalInPeriod = activeInPeriod.length;
    const workloads = MOCK_USERS.map(u => {
      const userTasksInPeriod = activeInPeriod.filter(t => t.assignedTo.includes(u.id));
      return {
        userId: u.id,
        userName: u.name,
        count: userTasksInPeriod.length,
        percentage: totalInPeriod > 0 ? (userTasksInPeriod.length / totalInPeriod) * 100 : 0
      };
    }).sort((a, b) => b.count - a.count);

    return {
        activeCount: activeInPeriod.length,
        completedCount: completedInPeriod.length,
        overdueCount: overdueTotal.length,
        upcoming48hCount: upcoming48h.length,
        upcoming7dCount: upcoming7d.length,
        distribution,
        workloads,
        totalActiveGlobal: totalActiveTasksGlobal,
        totalInPeriod
    };
  }, [tasks, period, selectedModules]);

  const isAdmin = user.id === 'u1'; // Admin Usuario en MOCK_USERS

  const periodLabel = period === 'today' ? 'hoy' : period === 'week' ? 'esta semana' : 'este mes';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Home className="text-[#009696]" /> Inicio
            </h1>
            <p className="text-gray-500 text-sm mt-1">
                Bienvenido, {user.name.split(' ')[0]}. Aquí tienes el resumen de tu actividad.
            </p>
        </div>

        {/* Period Filter */}
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
            <button 
                onClick={() => setPeriod('today')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'today' ? 'bg-[#009696] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Hoy
            </button>
            <button 
                onClick={() => setPeriod('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'week' ? 'bg-[#009696] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Esta Semana
            </button>
            <button 
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'month' ? 'bg-[#009696] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Este Mes
            </button>
        </div>
      </div>

      {/* Module Filter Bar */}
      <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <Filter size={12} /> Filtrar por módulo
          </div>
          <div className="flex flex-wrap gap-2">
              {allModules.map(mod => {
                  const isSelected = selectedModules.includes(mod);
                  return (
                      <button
                        key={mod}
                        onClick={() => toggleModule(mod)}
                        className={`
                            px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5
                            ${isSelected 
                                ? 'bg-[#009696]/10 text-[#009696] border-[#009696]' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                      >
                          {isSelected && <Check size={12} />}
                          {mod}
                      </button>
                  );
              })}
              {selectedModules.length > 0 && (
                  <button onClick={() => setSelectedModules([])} className="text-xs text-gray-400 hover:text-red-500 underline ml-2">
                      Limpiar
                  </button>
              )}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Tasks Card */}
          <button 
            onClick={() => onNavigate('home_active', period)}
            className="text-left bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-[#009696] hover:shadow-md transition-all"
          >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BarChart3 size={64} className="text-[#009696]" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Activas ({period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'})</h3>
              </div>
              <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{metrics.activeCount}</span>
                  <span className="text-sm text-gray-500 ml-2">tareas</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                  Incluye tareas vencidas y programadas para este periodo.
              </p>
          </button>

          {/* Overdue Card */}
          <button 
            onClick={() => onNavigate('home_overdue')}
            className="text-left bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-red-500 hover:shadow-md transition-all"
          >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AlertCircle size={64} className="text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <AlertCircle size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Vencidas</h3>
              </div>
              <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{metrics.overdueCount}</span>
                  <span className="text-sm text-gray-500 ml-2">tareas</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                  Tareas con fecha límite pasada que requieren atención inmediata.
              </p>
          </button>

          {/* Completed Card */}
          <button 
            onClick={() => onNavigate('home_completed', period)}
            className="text-left bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-green-500 hover:shadow-md transition-all"
          >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 size={64} className="text-green-500" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CheckCircle2 size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Completadas</h3>
              </div>
              <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{metrics.completedCount}</span>
                  <span className="text-sm text-gray-500 ml-2">tareas</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                  Tareas finalizadas dentro del periodo seleccionado.
              </p>
          </button>
      </div>

      {/* ADMIN ONLY: Cargas de Trabajo Section */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#009696]/10 text-[#009696] rounded-lg">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Cargas de Trabajo</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            Auditando periodo: <span className="text-[#009696]">{periodLabel}</span>
                        </p>
                    </div>
                </div>
                <div className="text-[10px] uppercase font-black tracking-widest text-[#009696] bg-[#009696]/10 px-2 py-0.5 rounded-full border border-[#009696]/20">
                    Solo Administrador
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {metrics.workloads.map((wl) => (
                    <div key={wl.userId} className="space-y-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                            <UserAvatar userId={wl.userId} size="md" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{wl.userName}</p>
                                <p className="text-xs text-gray-500">{wl.count} tareas {period === 'today' ? 'para hoy' : 'en este periodo'}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase">Volumen Relativo</span>
                                <span className={wl.count > 5 ? 'text-red-500' : wl.count > 2 ? 'text-orange-500' : 'text-green-500'}>
                                    {Math.round(wl.percentage)}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out shadow-sm ${wl.count > 5 ? 'bg-red-500' : wl.count > 2 ? 'bg-orange-500' : 'bg-[#009696]'}`}
                                    style={{ width: `${wl.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {metrics.totalInPeriod === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-xl">
                        No hay carga de trabajo asignada para {periodLabel}.
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Second Row: Upcoming & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-[#009696]" /> Próximas Tareas
              </h3>
              
              <div className="space-y-4">
                  <button 
                    onClick={() => onNavigate('home_upcoming_48h')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#009696] hover:bg-white transition-all text-left"
                  >
                      <div>
                          <p className="text-sm font-semibold text-gray-700">Próximas 48h</p>
                          <p className="text-xs text-gray-500">Vencimiento inminente</p>
                      </div>
                      <span className="text-xl font-bold text-[#009696]">{metrics.upcoming48hCount}</span>
                  </button>

                  <button 
                    onClick={() => onNavigate('home_upcoming_7d')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#009696] hover:bg-white transition-all text-left"
                  >
                      <div>
                          <p className="text-sm font-semibold text-gray-700">Próximos 7 días</p>
                          <p className="text-xs text-gray-500">Vista semanal</p>
                      </div>
                      <span className="text-xl font-bold text-gray-600">{metrics.upcoming7dCount}</span>
                  </button>
              </div>
          </div>

          {/* Module Distribution Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#009696]" /> Distribución por Módulo (Activas)
              </h3>
              
              <div className="space-y-4">
                  {metrics.distribution.map((item) => (
                      <button 
                        key={item.name} 
                        onClick={() => onNavigate(`module_${item.name}`, item.name)}
                        className="w-full flex items-center gap-4 group text-left"
                      >
                          <div className="w-32 text-xs font-medium text-gray-600 truncate text-right group-hover:text-[#009696] transition-colors">
                              {item.name}
                          </div>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                  className="h-full bg-[#009696] rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                                  style={{ width: `${(item.count / (metrics.totalActiveGlobal || 1)) * 100}%` }}
                              />
                          </div>
                          <div className="w-8 text-xs font-bold text-gray-900 text-right">
                              {item.count}
                          </div>
                      </button>
                  ))}
                  {metrics.totalActiveGlobal === 0 && (
                      <p className="text-center text-gray-400 text-sm italic py-4">No hay tareas activas para mostrar distribución.</p>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
