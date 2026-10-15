import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Inbox, UserPlus, CalendarClock } from 'lucide-react';
import { Button } from './Button';

interface InboxViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAssignToMe: (taskId: string) => void;
  onScheduleToday: (taskId: string) => void;
  userId: string;
}

export const InboxView: React.FC<InboxViewProps> = ({ tasks, onEditTask, onAssignToMe, onScheduleToday, userId }) => {
  
  // Logic: Tasks with NO due date OR NO assignee
  const inboxTasks = useMemo(() => {
    return tasks.filter(t => 
        t.status !== TaskStatus.COMPLETED && 
        (!t.dueDate || t.assignedTo.length === 0)
    );
  }, [tasks]);

  const renderQuickActions = (task: Task) => (
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          {!task.dueDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onScheduleToday(task.id); }}
                className="text-[#009696] bg-[#009696]/5 hover:bg-[#009696]/10"
              >
                  <CalendarClock size={14} className="mr-1"/> Para Hoy
              </Button>
          )}
          {task.assignedTo.length === 0 && (
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onAssignToMe(task.id); }}
                className="text-[#FF2F76] bg-[#FF2F76]/5 hover:bg-[#FF2F76]/10"
              >
                  <UserPlus size={14} className="mr-1"/> Mío
              </Button>
          )}
      </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full mb-3">
                 <Inbox size={24} />
             </div>
             <h2 className="text-xl font-bold text-gray-900">Bandeja de Entrada</h2>
             <p className="text-gray-500 text-sm mt-1">
                 {inboxTasks.length} tareas requieren organización. Asigna una fecha o responsable para procesarlas.
             </p>
        </div>

        <div className="space-y-4">
            {inboxTasks.map(task => (
                <div key={task.id} className="relative">
                    <TaskCard 
                        task={task} 
                        onToggle={() => {}} // Disabled in inbox maybe? Or allow complete
                        onDelete={() => {}} 
                        onEdit={onEditTask} 
                        onUpdateSubtask={() => {}}
                    />
                    {/* Overlay Quick Actions */}
                    <div className="absolute bottom-2 right-2 md:bottom-auto md:top-4 md:right-4 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-gray-100">
                         {renderQuickActions(task)}
                    </div>
                </div>
            ))}
            
            {inboxTasks.length === 0 && (
                <div className="text-center py-12 opacity-50">
                    <p>¡Todo limpio! No tienes tareas sin procesar.</p>
                </div>
            )}
        </div>
    </div>
  );
};