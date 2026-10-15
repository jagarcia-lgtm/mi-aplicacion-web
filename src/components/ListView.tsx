
import React, { useState, useMemo } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  ChevronDown, 
  ChevronUp, 
  Building2,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

type SortKey = 'id' | 'status' | 'title' | 'client' | 'priority' | 'dueDate' | 'assigned';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const ListView: React.FC<ListViewProps> = ({ tasks, onEditTask, onToggleStatus, onDeleteTask }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dueDate', direction: 'asc' });

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks];
    sorted.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'client':
          aValue = a.clientName || '';
          bValue = b.clientName || '';
          break;
        case 'priority':
          const pOrder = { [Priority.VERY_HIGH]: 4, [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
          aValue = pOrder[a.priority];
          bValue = pOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate;
          bValue = b.dueDate;
          break;
        case 'assigned':
          aValue = a.assignedTo[0] || '';
          bValue = b.assignedTo[0] || '';
          break;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [tasks, sortConfig]);

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-30 ml-1" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1 text-gray-800" /> : <ChevronDown size={12} className="ml-1 text-gray-800" />;
  };

  const renderStatusBadge = (status: TaskStatus) => {
    let styles = "";
    let label: string = status;
    switch (status) {
      case TaskStatus.COMPLETED: styles = "bg-green-100 text-green-800 border-green-200"; label = "Resuelto"; break;
      case TaskStatus.IN_PROGRESS: styles = "bg-blue-100 text-blue-800 border-blue-200"; label = "Abierto"; break;
      case TaskStatus.IN_REVIEW: styles = "bg-purple-100 text-purple-800 border-purple-200"; label = "Pendiente"; break;
      case TaskStatus.BLOCKED: styles = "bg-red-100 text-red-800 border-red-200"; break;
      default: styles = "bg-yellow-100 text-yellow-800 border-yellow-200"; label = "Nuevo"; break;
    }
    return <span className={`inline-block px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wide border ${styles}`}>{label}</span>;
  };

  const renderPriorityDot = (priority: Priority) => {
    let color = 'bg-gray-300';
    let labelColor = 'text-gray-500';
    if (priority === Priority.VERY_HIGH) { color = 'bg-red-600 animate-pulse ring-2 ring-red-200'; labelColor = 'text-red-700 font-black'; }
    else if (priority === Priority.HIGH) { color = 'bg-[#FF2F76]'; labelColor = 'text-[#FF2F76] font-semibold'; }
    else if (priority === Priority.MEDIUM) { color = 'bg-[#009696]'; labelColor = 'text-[#009696]'; }
    return (<div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-sm ${color}`}></div><span className={`text-xs ${labelColor}`}>{priority}</span></div>);
  };

  return (
    <div className="bg-white border-t border-gray-200 w-full animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
              <th className="px-4 py-3 w-10 text-center"><span aria-label="Finalización">✓</span></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 group w-32" onClick={() => handleSort('status')}><div className="flex items-center">Estado {getSortIcon('status')}</div></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('title')}><div className="flex items-center">Asunto {getSortIcon('title')}</div></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 group hidden md:table-cell" onClick={() => handleSort('client')}><div className="flex items-center">Solicitante {getSortIcon('client')}</div></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 group hidden sm:table-cell w-32" onClick={() => handleSort('priority')}><div className="flex items-center">Prioridad {getSortIcon('priority')}</div></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 group hidden sm:table-cell w-32" onClick={() => handleSort('dueDate')}><div className="flex items-center">Fecha Límite {getSortIcon('dueDate')}</div></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 group hidden lg:table-cell w-28" onClick={() => handleSort('assigned')}><div className="flex items-center">Agente {getSortIcon('assigned')}</div></th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sortedTasks.map((task) => {
              const isCompleted = task.status === TaskStatus.COMPLETED;
              return (
                <tr key={task.id} onClick={() => onEditTask(task)} className={`group hover:bg-[#f8f9fa] cursor-pointer transition-colors text-xs ${isCompleted ? 'bg-gray-50 opacity-60' : ''}`}>
                  <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}><input aria-label={`Completar ${task.title}`} type="checkbox" className="rounded border-gray-300 focus:ring-0 text-[#009696] cursor-pointer" onChange={() => onToggleStatus(task.id)} checked={isCompleted}/></td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{renderStatusBadge(task.status)}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2 max-w-md"><span className={`font-semibold text-gray-900 truncate ${isCompleted ? 'line-through' : ''}`}>{task.title}</span><span className="text-gray-400 font-mono text-[10px]">#{task.id.slice(-4)}</span></div></td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-gray-600 truncate max-w-[150px]">{task.clientName ? (<span className="font-medium text-gray-700">{task.clientName}</span>) : task.policyNumber ? (<span className="flex items-center gap-1"><Building2 size={10} /> {task.insurer}</span>) : (<span className="text-gray-400">-</span>)}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell whitespace-nowrap">{renderPriorityDot(task.priority)}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell whitespace-nowrap font-mono text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '-'}</td>
                  <td className="px-4 py-2.5 hidden lg:table-cell whitespace-nowrap"><div className="flex items-center gap-2">{task.assignedTo.length > 0 ? (<UserAvatar userId={task.assignedTo[0]} size="sm" />) : (<span className="text-gray-400 italic">-</span>)}</div></td>
                  <td className="px-4 py-2.5 text-right"><button aria-label={`Eliminar ${task.title}`} onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
