
import React from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { Circle, Activity, Eye, Lock, CheckCircle2 } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string; icon: React.ReactNode; color: string; bgHeader: string }[] = [
  { id: TaskStatus.TODO, label: 'Por hacer', icon: <Circle size={16} />, color: 'text-gray-600', bgHeader: 'bg-gray-50' },
  { id: TaskStatus.IN_PROGRESS, label: 'En curso', icon: <Activity size={16} />, color: 'text-blue-600', bgHeader: 'bg-blue-50' },
  { id: TaskStatus.IN_REVIEW, label: 'En revisión', icon: <Eye size={16} />, color: 'text-purple-600', bgHeader: 'bg-purple-50' },
  { id: TaskStatus.BLOCKED, label: 'Bloqueado', icon: <Lock size={16} />, color: 'text-red-600', bgHeader: 'bg-red-50' },
  { id: TaskStatus.COMPLETED, label: 'Completado', icon: <CheckCircle2 size={16} />, color: 'text-green-600', bgHeader: 'bg-green-50' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({ tasks, onMoveStatus, onEditTask }) => {
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        onMoveStatus(taskId, status);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-x-auto gap-4 pb-4 animate-in fade-in zoom-in duration-300">
      {COLUMNS.map(col => {
        // Filter tasks by status. 
        // Note: We show COMPLETED tasks in the Completed column now, unlike the previous filtering.
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id}
            className="flex-shrink-0 w-80 bg-gray-100 rounded-xl flex flex-col max-h-full border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className={`p-3 rounded-t-xl font-semibold text-sm flex items-center justify-between sticky top-0 z-10 border-b border-gray-200 ${col.bgHeader}`}>
                <div className={`flex items-center gap-2 ${col.color}`}>
                    <span>{col.icon}</span>
                    <span className="text-gray-800">{col.label}</span>
                </div>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                    {colTasks.length}
                </span>
            </div>

            {/* Tasks Area */}
            <div className="p-2 flex-1 overflow-y-auto space-y-3 hide-scrollbar">
                {colTasks.map(task => (
                    <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        {/* Mini Task Card for Kanban */}
                        <div 
                            className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group ${task.status === TaskStatus.COMPLETED ? 'opacity-60' : ''}`}
                            onClick={() => onEditTask(task)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{task.taskType || 'General'}</span>
                                {task.priority === Priority.HIGH && task.status !== TaskStatus.COMPLETED && <div className="w-2 h-2 rounded-full bg-[#FF2F76]"></div>}
                            </div>
                            <h4 className={`text-sm font-medium text-gray-800 line-clamp-2 mb-2 ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>{task.title}</h4>
                            
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-gray-500">
                                    {task.clientName && <span className="block truncate max-w-[120px]">{task.clientName}</span>}
                                </div>
                                {task.assignedTo.length > 0 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                        {task.assignedTo.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {colTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg">
                        Sin tareas
                    </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
