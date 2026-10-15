
import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Sun, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface MyDayViewProps {
  tasks: Task[];
  userName: string;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdateSubtask: (taskId: string, subtasks: any[]) => void;
  onToggleMyDay: (taskId: string) => void;
  onCreateInMyDay: () => void;
}

const MOTIVATIONAL_QUOTES = [
    "La mejor forma de predecir el futuro es crearlo.",
    "El éxito es la suma de pequeños esfuerzos repetidos cada día.",
    "No cuentes los días, haz que los días cuenten.",
    "La acción es la llave fundamental de todo éxito.",
    "Tu actitud, no tu aptitud, determinará tu altitud.",
    "El único lugar donde el éxito viene antes que el trabajo es en el diccionario.",
    "Cree que puedes y casi lo habrás logrado.",
    "El fracaso es una oportunidad para empezar de nuevo con más inteligencia.",
    "Haz hoy lo que otros no quieren, haz mañana lo que otros no pueden.",
    "Si no pierdes, no puedes disfrutar de las victorias.",
    "La disciplina es el puente entre metas y logros.",
    "No dejes para mañana lo que puedes hacer hoy.",
    "La calidad no es un acto, es un hábito.",
    "La perseverancia es fallar 19 veces y tener éxito en la vigésima.",
    "El secreto para salir adelante es empezar."
];

export const MyDayView: React.FC<MyDayViewProps> = ({
  tasks,
  userName,
  onToggleStatus,
  onDelete,
  onEdit,
  onUpdateSubtask,
  onToggleMyDay,
  onCreateInMyDay
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDateObj = new Date();

  // Quote logic: Change daily based on date
  const dailyQuote = useMemo(() => {
      const dayOfMonth = todayDateObj.getDate();
      const quoteIndex = dayOfMonth % MOTIVATIONAL_QUOTES.length;
      return MOTIVATIONAL_QUOTES[quoteIndex];
  }, [todayStr]);

  // 1. Filter tasks strictly in "My Day" for today
  const myDayTasks = useMemo(() => {
    return tasks.filter(t => t.myDayDate === todayStr);
  }, [tasks, todayStr]);

  const completedCount = myDayTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalCount = myDayTasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300 pb-10">
      {/* Header - Brand Gradient Teal */}
      <div className="bg-gradient-to-r from-[#009696] to-[#007a7a] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-1">Hoy</h2>
            <p className="opacity-90 text-lg mb-4">
              {todayDateObj.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm opacity-80 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                  <span>👋 ¡Buenos días, {userName.split(' ')[0]}!</span>
                  {totalCount > 0 && <span>• {completedCount}/{totalCount} completadas</span>}
                </div>
                
                {/* Daily Quote */}
                <div className="mt-2 pl-3 border-l-2 border-white/30 italic text-sm opacity-90 max-w-lg">
                    "{dailyQuote}"
                </div>
            </div>
        </div>
        {/* Decorative Background Element */}
        <Sun className="absolute -right-6 -top-6 text-white/10 w-48 h-48 pointer-events-none" />
      </div>

      {/* Success State */}
      {allCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 animate-in slide-in-from-top-2">
          <CheckCircle2 size={24} />
          <div>
            <p className="font-semibold">¡Todo listo por hoy!</p>
            <p className="text-sm opacity-80">Has completado todas las tareas de tu día.</p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {myDayTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggleStatus}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateSubtask={onUpdateSubtask}
            onToggleMyDay={onToggleMyDay}
          />
        ))}

        {/* Empty State */}
        {myDayTasks.length === 0 && !allCompleted && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <Sun className="mx-auto h-12 w-12 text-[#009696]/50 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Tu día está despejado</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-8">
              Crea una tarea nueva o asigna tareas existentes a "Mi Día" para organizarte mejor.
            </p>
            <Button onClick={onCreateInMyDay} variant="primary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Añadir tarea a hoy
            </Button>
          </div>
        )}
      </div>
      
      {/* Quick Add Button if list is not empty */}
      {myDayTasks.length > 0 && (
        <Button onClick={onCreateInMyDay} variant="ghost" className="w-full border-2 border-dashed border-gray-200 hover:border-[#009696]/30 hover:bg-[#009696]/5 text-gray-500 hover:text-[#009696] h-14">
          <Plus className="mr-2 h-5 w-5" />
          Añadir otra tarea a Hoy
        </Button>
      )}
    </div>
  );
};
