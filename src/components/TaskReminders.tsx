import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Task, TaskStatus } from '../types';

const KEY = 'gestibrok_reminders_dismissed_v1';
const reminderKey = (task: Task) => `${task.id}:${task.reminderDate}`;

export function TaskReminders({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  const [now, setNow] = useState(Date.now);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(data) ? data.filter(item => typeof item === 'string') : []; }
    catch { return []; }
  });
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  const due = tasks.filter(task => task.reminderDate && Date.parse(task.reminderDate) <= now && task.status !== TaskStatus.COMPLETED && !dismissed.includes(reminderKey(task)));
  if (!due.length) return null;
  const dismiss = (task: Task) => {
    const next = [...dismissed, reminderKey(task)];
    setDismissed(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Dismissal still works for this session. */ }
  };
  return <section aria-label="Recordatorios pendientes" aria-live="polite" className="bg-amber-50 border-b border-amber-200 px-4 py-2 max-h-40 overflow-y-auto">
    <p className="text-xs font-bold text-amber-900 flex items-center gap-2"><Bell size={14} />Recordatorios pendientes ({due.length})</p>
    {due.map(task => <div key={reminderKey(task)} className="flex items-center justify-between gap-3 mt-1 text-sm">
      <button onClick={() => onOpen(task)} aria-label={`Abrir recordatorio: ${task.title}`} className="text-amber-900 underline text-left">{task.title}</button>
      <button onClick={() => dismiss(task)} aria-label={`Descartar recordatorio: ${task.title}`} className="p-2 text-amber-800"><X size={14} /></button>
    </div>)}
  </section>;
}
