import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, TaskStatus, TaskModule, TASK_MODULES_MAP, RecurrenceConfig } from '../types';
import { Bell, Inbox } from 'lucide-react';
import { getCurrentUser } from '../services/auth';
import { DatePicker } from './DatePicker';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>();
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [module, setModule] = useState<TaskModule>('General');
  const [reminderDate, setReminderDate] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(''); setDescription(''); setDueDate(''); setRecurrence(undefined);
    setPriority(Priority.MEDIUM); setModule('General'); setReminderDate(''); setShowReminder(false);
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description, dueDate, reminderDate, recurrence, priority, module,
      status: TaskStatus.TODO, tags: [], subtasks: [], assignedTo: [getCurrentUser()?.id || 'u1'] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 sm:pt-28 px-3 bg-black/40 backdrop-blur-[1px]" onClick={onClose}>
      <div role="dialog" aria-label="Añadir tarea" className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80dvh] overflow-y-auto" onClick={event => event.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 space-y-3">
            <input ref={inputRef} aria-label="Nombre de la tarea" value={title} onChange={event => setTitle(event.target.value)} placeholder="Nombre de la tarea" className="w-full text-lg font-semibold outline-none text-gray-900" autoFocus required />
            <textarea aria-label="Descripción" value={description} onChange={event => setDescription(event.target.value)} placeholder="Descripción" className="w-full text-sm outline-none text-gray-600 resize-y" rows={2} />
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker label="Fecha límite" value={dueDate} recurrence={recurrence} placeholder="Fecha límite" onChange={(date, nextRecurrence) => { setDueDate(date); setRecurrence(nextRecurrence); }} />
              <label className="text-xs text-gray-600">Prioridad
                <select aria-label="Prioridad de la tarea" className="ml-2 border rounded-md p-2 bg-white" value={priority} onChange={event => setPriority(event.target.value as Priority)}>
                  {Object.values(Priority).map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
              <button type="button" aria-expanded={showReminder} onClick={() => setShowReminder(value => !value)} className="flex items-center gap-1.5 px-2 py-2 rounded border text-xs text-gray-600 hover:bg-gray-50"><Bell size={14} />Recordatorios{reminderDate && ' ✓'}</button>
            </div>
            {showReminder && <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
              <label className="block text-xs font-semibold text-gray-600">Fecha y hora del recordatorio
                <input type="datetime-local" value={reminderDate} onChange={event => setReminderDate(event.target.value)} className="block w-full mt-2 rounded border p-2 bg-white text-sm" />
              </label>
              <p className="text-xs text-gray-500">Aviso dentro de GestiBrok cuando la aplicación esté abierta. No envía email ni notificaciones con la aplicación cerrada.</p>
              {reminderDate && <button type="button" className="text-xs text-red-600" onClick={() => setReminderDate('')}>Quitar recordatorio</button>}
            </div>}
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-between px-4 py-3 border-t bg-gray-50/50">
            <label className="flex gap-2 items-center text-xs font-semibold text-gray-600"><Inbox size={14} /><span className="sr-only">Contexto</span>
              <select aria-label="Contexto" value={module} onChange={event => setModule(event.target.value as TaskModule)} className="bg-white border rounded p-2 max-w-[190px]">
                {(Object.keys(TASK_MODULES_MAP) as TaskModule[]).map(value => <option key={value} value={value}>{value === 'General' ? 'Bandeja de entrada / General' : value}</option>)}
              </select>
            </label>
            <div className="flex gap-3"><button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-200">Cancelar</button><button type="submit" disabled={!title.trim()} className="px-4 py-1.5 bg-[#009696] text-white text-sm font-bold rounded-md disabled:opacity-50">Añadir tarea</button></div>
          </div>
        </form>
      </div>
    </div>
  );
};
