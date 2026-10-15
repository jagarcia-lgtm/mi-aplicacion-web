import React, { useState, useMemo } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, GripVertical, Plus } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newDate: string) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (date: string) => void;
}

type CalendarMode = 'month' | 'week';

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onMoveTask, onEditTask, onCreateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // --- Date Helpers ---
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // --- Navigation ---

  const nextPeriod = () => {
    if (mode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const prevPeriod = () => {
    if (mode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // --- Data Preparation ---

  const calendarDays = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (mode === 'month') {
      const daysInMonth = getDaysInMonth(year, month);
      const startDay = getFirstDayOfMonth(year, month);
      
      const prevMonthDays = getDaysInMonth(year, month - 1);
      for (let i = 0; i < startDay; i++) {
        days.push({
          date: new Date(year, month - 1, prevMonthDays - startDay + 1 + i),
          isCurrentMonth: false
        });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true
        });
      }

      const remainingCells = 42 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }
    } else {
      const start = startOfWeek(currentDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push({
          date: d,
          isCurrentMonth: true
        });
      }
    }

    return days;
  }, [currentDate, mode]);

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, dateStr);
    }
    setDraggedTaskId(null);
  };

  // --- Render Helpers ---

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH: return 'bg-[#FF2F76]/10 text-[#FF2F76] border-[#FF2F76]/20';
      case Priority.MEDIUM: return 'bg-[#009696]/10 text-[#009696] border-[#009696]/20';
      case Priority.LOW: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderTaskPill = (task: Task) => (
    <div
      key={task.id}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
      className={`
        text-xs p-1.5 rounded mb-1 cursor-grab active:cursor-grabbing border truncate shadow-sm flex items-center gap-1
        ${getPriorityColor(task.priority)}
        ${task.status === TaskStatus.COMPLETED ? 'opacity-50 line-through grayscale' : 'hover:brightness-95'}
        ${draggedTaskId === task.id ? 'opacity-20' : ''}
      `}
      title={task.title}
    >
      <GripVertical size={10} className="opacity-50 flex-shrink-0" />
      <span className="truncate font-medium">{task.title}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[800px] animate-in fade-in zoom-in duration-300">
      
      {/* Calendar Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Semana
            </button>
          </div>
          <h2 className="text-lg font-bold text-gray-900 capitalize w-48 text-center sm:text-left">
            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200">
            Hoy
          </button>
          <div className="flex items-center border rounded-lg bg-white">
            <button onClick={prevPeriod} className="p-1.5 hover:bg-gray-50 rounded-l-lg text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] h-6 bg-gray-200"></div>
            <button onClick={nextPeriod} className="p-1.5 hover:bg-gray-50 rounded-r-lg text-gray-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className={`grid ${mode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} bg-gray-50 border-b`}>
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
          <div key={i} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className={`flex-1 grid ${mode === 'month' ? 'grid-rows-6 grid-cols-7' : 'grid-cols-7 h-full'} bg-gray-200 gap-px border-b overflow-hidden`}>
        {calendarDays.map((dayObj, i) => {
          const dateStr = formatDate(dayObj.date);
          const isToday = formatDate(new Date()) === dateStr;
          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
          
          return (
            <div
              key={i}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={`
                bg-white relative flex flex-col group transition-colors min-h-[100px]
                ${!dayObj.isCurrentMonth && mode === 'month' ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday ? 'bg-[#009696]/5' : 'hover:bg-gray-50'}
              `}
            >
              {/* Day Header */}
              <div className="p-2 flex justify-between items-start">
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-[#009696] text-white' : 'text-gray-700'}
                `}>
                  {dayObj.date.getDate()}
                </span>
                
                {/* Add Task Button (visible on hover) */}
                <button 
                  onClick={() => onCreateTask(dateStr)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#009696] transition-opacity p-1"
                  title="Añadir tarea aquí"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 px-1 pb-1 overflow-y-auto hide-scrollbar space-y-1">
                {dayTasks.map(renderTaskPill)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};