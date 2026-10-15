
import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { Calendar, Flag, Bell, MoreHorizontal, Inbox, X, Zap } from 'lucide-react';
import { getCurrentUser } from '../services/auth';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(Priority.MEDIUM);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title, description, dueDate, priority, status: TaskStatus.TODO, tags: [], subtasks: [], assignedTo: [getCurrentUser()?.id || 'u1'], module: 'General',
    });
    onClose();
  };

  const getPriorityColor = (p: Priority) => {
      if (p === Priority.VERY_HIGH) return 'text-red-600';
      if (p === Priority.HIGH) return 'text-[#FF2F76]';
      if (p === Priority.MEDIUM) return 'text-orange-500';
      return 'text-gray-500';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 sm:pt-32 bg-black/40 backdrop-blur-[1px]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-top-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 space-y-2">
            <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de la tarea" className="w-full text-lg font-semibold placeholder-gray-400 border-none outline-none focus:ring-0 p-0 bg-transparent text-gray-900" autoFocus />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" className="w-full text-sm placeholder-gray-400 border-none outline-none focus:ring-0 p-0 bg-transparent text-gray-600 resize-none h-auto min-h-[24px]" rows={1} />
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
                <div className="relative group">
                    <button type="button" className={`flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 text-xs font-medium hover:bg-gray-50 ${dueDate ? 'text-[#009696] bg-[#009696]/5 border-[#009696]/30' : 'text-gray-500'}`}><Calendar size={14} />{dueDate ? new Date(dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short'}) : 'Fecha límite'}</button>
                    <input type="date" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setDueDate(e.target.value)}/>
                </div>
                <div className="relative group">
                    <button type="button" className={`flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 text-xs font-medium hover:bg-gray-50 ${priority !== Priority.MEDIUM ? 'bg-gray-50' : ''}`}>
                        {priority === Priority.VERY_HIGH ? <Zap size={14} className="text-red-600"/> : <Flag size={14} className={getPriorityColor(priority)} />}
                        {priority}
                    </button>
                    <select className="absolute inset-0 opacity-0 cursor-pointer" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                        <option value={Priority.VERY_HIGH}>Muy Urgente</option>
                        <option value={Priority.HIGH}>Alta</option>
                        <option value={Priority.MEDIUM}>Media</option>
                        <option value={Priority.LOW}>Baja</option>
                    </select>
                </div>
                <button type="button" className="flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50"><Bell size={14} /> Recordatorios</button>
                <button type="button" className="p-1 rounded text-gray-400 hover:bg-gray-100"><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <button type="button" className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 px-2 py-1 rounded transition-colors"><Inbox size={14} />Bandeja de entrada<span className="text-[10px] text-gray-400">▼</span></button>
            <div className="flex items-center gap-3"><button type="button" onClick={onClose} className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded transition-colors">Cancelar</button><button type="submit" disabled={!title.trim()} className="px-4 py-1.5 bg-[#009696] text-white text-sm font-bold rounded-md hover:bg-[#007a7a] disabled:opacity-50 transition-all shadow-sm">Añadir tarea</button></div>
          </div>
        </form>
      </div>
    </div>
  );
};
