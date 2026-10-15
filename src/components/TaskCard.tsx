
import React, { useState } from 'react';
import { Task, Priority, TaskStatus, Subtask } from '../types';
import { UserAvatar } from './UserAvatar';
import { Calendar, Trash2, Edit2, ChevronDown, ChevronUp, Hash, CheckCircle2, MessageSquare, Sun, Shield, User, Building2, AlertTriangle, Phone, MessageCircle, Link as LinkIcon, Lock, Bell, Circle, Activity, Eye, MapPin, History, Zap } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdateSubtask: (taskId: string, subtasks: Subtask[]) => void;
  onToggleMyDay?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit, onUpdateSubtask, onToggleMyDay }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isBlocked = task.status === TaskStatus.BLOCKED;
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const hasSubtasks = totalSubtasks > 0;
  const commentsCount = task.comments?.length || 0;

  // Check if task is in "My Day" for TODAY
  const todayStr = new Date().toISOString().split('T')[0];
  const isInMyDay = task.myDayDate === todayStr;

  // Priority Colors
  const priorityColors = {
    [Priority.VERY_HIGH]: 'border-l-red-600 bg-red-50 text-red-700 ring-1 ring-red-200 ring-inset',
    [Priority.HIGH]: 'border-l-[#FF2F76] bg-[#FF2F76]/5 text-[#FF2F76]',
    [Priority.MEDIUM]: 'border-l-[#009696] bg-[#009696]/5 text-[#009696]',
    [Priority.LOW]: 'border-l-gray-400 bg-gray-50 text-gray-600'
  };

  const handleSubtaskToggle = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateSubtask(task.id, updatedSubtasks);
  };

  // Communication Actions
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.clientPhone) window.open(`tel:${task.clientPhone}`, '_self');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.clientPhone) {
        const cleanNumber = task.clientPhone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 size={16} className="text-white" />;
    if (isBlocked) return <Lock size={14} className="text-white" />;
    return <Circle size={16} className="text-transparent" />; // Placeholder for hover
  };

  const getStatusColor = () => {
      if (isCompleted) return 'bg-[#009696] border-[#009696]';
      if (isBlocked) return 'bg-red-500 border-red-500';
      return 'bg-white border-gray-300 group-hover:border-[#009696]';
  };

  // Helper to format minutes to HM
  const formatTime = (minutes: number) => {
      if (minutes < 60) return `${minutes}m`;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  return (
    <div 
        onClick={() => onEdit(task)}
        className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer ${isCompleted ? 'opacity-75' : ''} ${task.priority === Priority.VERY_HIGH && !isCompleted ? 'ring-2 ring-red-500 ring-opacity-20' : ''}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${isCompleted ? 'bg-gray-300' : priorityColors[task.priority].split(' ')[0].replace('border-l-', 'bg-')}`} />
      
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Main Status Toggle */}
          <div className="pt-1">
             <button
                onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${getStatusColor()}`}
                title={isBlocked ? "Desbloquear" : "Completar"}
            >
                {getStatusIcon()}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5 w-full">
                
                {/* Header Row: Title & Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-gray-900 truncate ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    
                    {task.priority === Priority.VERY_HIGH && !isCompleted && (
                        <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                            <Zap size={10} fill="currentColor" /> MUY URGENTE
                        </span>
                    )}

                    {task.isUrgent && !isCompleted && task.priority !== Priority.VERY_HIGH && (
                        <span className="flex items-center gap-1 bg-[#FF2F76]/10 text-[#FF2F76] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#FF2F76]/20 uppercase tracking-wide">
                            <AlertTriangle size={10} /> Urgente
                        </span>
                    )}

                    {/* Show explicit status badge if not just TODO or COMPLETED */}
                    {!isCompleted && task.status !== TaskStatus.TODO && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${
                            task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            task.status === TaskStatus.IN_REVIEW ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-red-50 text-red-600 border-red-100' // Blocked
                        }`}>
                             {task.status === TaskStatus.IN_PROGRESS && <Activity size={10}/>}
                             {task.status === TaskStatus.IN_REVIEW && <Eye size={10}/>}
                             {task.status === TaskStatus.BLOCKED && <Lock size={10}/>}
                             {task.status === TaskStatus.IN_PROGRESS ? 'En curso' : task.status === TaskStatus.IN_REVIEW ? 'Revisión' : 'Bloqueado'}
                        </span>
                    )}
                    
                    {task.taskType && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                            {task.taskType}
                        </span>
                    )}
                </div>

                {/* Insurance Context Row */}
                {(task.clientName || task.policyNumber || task.insurer) && (
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mb-1 mt-1">
                        {task.clientName && (
                            <span className="flex items-center gap-1 font-medium"><User size={12} /> {task.clientName}</span>
                        )}
                        {task.policyNumber && (
                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 rounded"><Shield size={12} /> {task.policyNumber}</span>
                        )}
                        {task.insurer && (
                             <span className="flex items-center gap-1"><Building2 size={12} /> {task.insurer}</span>
                        )}
                        
                        {/* Quick Actions for Communication */}
                        {task.clientPhone && !isCompleted && (
                           <div className="flex items-center gap-2 ml-auto sm:ml-2">
                               <button 
                                 onClick={handleWhatsApp}
                                 className="text-green-600 bg-green-50 p-1 rounded hover:bg-green-100 transition-colors" 
                                 title="WhatsApp Cliente"
                                >
                                   <MessageCircle size={14} />
                               </button>
                               <button 
                                 onClick={handleCall}
                                 className="text-[#009696] bg-[#009696]/10 p-1 rounded hover:bg-[#009696]/20 transition-colors" 
                                 title="Llamar Cliente"
                               >
                                   <Phone size={14} />
                               </button>
                           </div>
                        )}
                    </div>
                )}
              </div>
              
              {/* Assignees Avatars */}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div className="flex -space-x-2 ml-2 flex-shrink-0">
                  {task.assignedTo.map(uid => (
                    <UserAvatar key={uid} userId={uid} size="sm" />
                  ))}
                </div>
              )}
            </div>
            
            {/* Metadata Bottom Row */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {isInMyDay && (
                <span className="flex items-center gap-1 bg-[#009696]/10 text-[#009696] px-2 py-0.5 rounded-full border border-[#009696]/20 font-medium">
                  <Sun size={10} className="fill-[#009696] text-[#009696]" />
                  Hoy
                </span>
              )}
              
              {task.dueDate && (
                 <span className={`flex items-center gap-1 ${task.dueDate < todayStr && !isCompleted ? 'text-red-600 font-bold' : ''}`}>
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                 </span>
              )}

              {/* Total Time Badge */}
              {task.totalTimeSpent && task.totalTimeSpent > 0 && (
                  <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200" title="Tiempo total invertido">
                      <History size={12} />
                      {formatTime(task.totalTimeSpent)}
                  </span>
              )}

              {/* Location */}
              {task.location && (
                  <span className="flex items-center gap-1 text-gray-600 truncate max-w-[150px]" title={task.location}>
                      <MapPin size={12} />
                      <span className="truncate">{task.location.split(',')[0]}</span>
                  </span>
              )}
              
              {/* Tags */}
              {task.tags && task.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200">
                  <Hash size={10} />
                  {tag}
                </span>
              ))}

              {/* Comment Count */}
              {commentsCount > 0 && (
                <span className="flex items-center gap-1 text-gray-400">
                  <MessageSquare size={12} />
                  {commentsCount}
                </span>
              )}
            </div>
            
            {/* Subtask Progress Indicator */}
            {hasSubtasks && (
               <div 
                 className="mt-3 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded w-fit"
                 onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
               >
                 <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[#009696] transition-all duration-300" 
                     style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                   />
                 </div>
                 {/* Fixed: Use totalSubtasks instead of undefined totalCount */}
                 <span className="text-xs text-gray-500 font-medium">
                   {completedSubtasks}/{totalSubtasks}
                 </span>
                 {isExpanded ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
               </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
            {onToggleMyDay && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMyDay(task.id); }}
                className={`p-1.5 rounded transition-colors ${isInMyDay ? 'text-[#009696] bg-[#009696]/10' : 'text-gray-400 hover:text-[#009696] hover:bg-[#009696]/10'}`}
                title={isInMyDay ? "Quitar de Hoy" : "Añadir a Hoy"}
              >
                <Sun size={16} className={isInMyDay ? "fill-[#009696]" : ""} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 text-gray-400 hover:text-[#009696] hover:bg-[#009696]/10 rounded transition-colors"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Expanded Subtasks */}
        {isExpanded && hasSubtasks && (
          <div className="mt-4 pl-9 space-y-1 animate-in fade-in slide-in-from-top-2">
            {task.subtasks.map(st => (
              <div 
                key={st.id} 
                className="flex items-center gap-2 text-sm group/subtask hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer"
                onClick={(e) => handleSubtaskToggle(e, st.id)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  st.completed ? 'bg-[#009696] border-[#009696]' : 'border-gray-300 bg-white'
                }`}>
                  {st.completed && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className={`${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {st.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
