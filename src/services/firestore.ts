
import { 
  Task, TaskStatus, Priority, EnergyLevel, RecurrenceConfig, AutomationRule, Comment, 
  AuditLogEntry, Client, CommercialActivity, Policy, Attachment, 
  WhatsAppMessage, EmailMessage, SignatureRequest 
} from '../types';
import { getCurrentUser } from './auth';

const STORAGE_KEY = 'gestibrok_mock_v11';
const CLIENTS_KEY = 'gestibrok_clients_v1';
const POLICIES_KEY = 'gestibrok_policies_v1';
const ACTIVITIES_KEY = 'gestibrok_activities_v1';
const AUTOMATION_KEY = 'gestibrok_automation_v1';
const DRAFTS_KEY = 'gestibrok_comment_drafts_v1';
const TAGS_KEY = 'gestibrok_tags_v1';

export const DEFAULT_INSURANCE_TAGS: string[] = [
  'Allianz', 'Hiscox', 'Mapfre', 'Markel', 'Mutua Tinerfeña', 
  'Patria Hispana', 'Reale', 'Previsora General', 'Sanitas', 'Surne', 
  'Adeslas', 'Zurich', 'ARAG', 'Liberty', 'Occident', 
  'Asefa', 'AXA', 'Aura', 'DKV', 'Generali', 'Helvetia'
];

export const getGlobalTags = (): string[] => {
  const stored = localStorage.getItem(TAGS_KEY);
  if (!stored) {
    localStorage.setItem(TAGS_KEY, JSON.stringify(DEFAULT_INSURANCE_TAGS));
    return DEFAULT_INSURANCE_TAGS;
  }
  return JSON.parse(stored);
};

export const addGlobalTag = (tagName: string): string[] => {
  const tags = getGlobalTags();
  if (!tags.includes(tagName)) {
    const newTags = [...tags, tagName].sort();
    localStorage.setItem(TAGS_KEY, JSON.stringify(newTags));
    return newTags;
  }
  return tags;
};

export const deleteGlobalTag = (tagName: string): string[] => {
  const tags = getGlobalTags();
  const newTags = tags.filter(t => t !== tagName);
  localStorage.setItem(TAGS_KEY, JSON.stringify(newTags));
  return newTags;
};

export const INSURANCE_TAGS = getGlobalTags();

// --- CALCULAR SIGUIENTE RECURRENCIA ---
export const calculateNextDueDate = (currentDueDate: string, config: RecurrenceConfig): string => {
  const date = new Date(currentDueDate);
  
  switch(config.type) {
    case 'daily':
      date.setDate(date.getDate() + (config.intervalDays || 1));
      break;
    case 'weekly':
      if (config.dayOfWeek !== undefined) {
        // Mover al mismo día de la semana siguiente
        date.setDate(date.getDate() + 7);
      } else {
        date.setDate(date.getDate() + 7 * (config.intervalDays || 1));
      }
      break;
    case 'monthly':
      if (config.dayOfMonth !== undefined) {
        date.setMonth(date.getMonth() + 1);
        date.setDate(config.dayOfMonth);
      } else {
        date.setMonth(date.getMonth() + 1);
      }
      break;
    default:
      date.setDate(date.getDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
};

const getLocalTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch(e) { return []; }
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  notifySubscribers(tasks);
};

type TaskListener = (tasks: Task[]) => void;
let subscribers: TaskListener[] = [];

export const subscribeToTasks = (callback: TaskListener): () => void => {
  subscribers.push(callback);
  callback(getLocalTasks());
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
};

const notifySubscribers = (tasks: Task[]) => {
  subscribers.forEach(cb => cb(tasks));
};

export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>): Promise<{ message: string; taskId: string }> => {
  const tasks = getLocalTasks();
  const currentUser = getCurrentUser();
  
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    createdAt: Date.now(),
    createdBy: currentUser?.id || 'unknown',
    comments: [],
    assignedTo: taskData.assignedTo || [],
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    totalTimeSpent: taskData.totalTimeSpent || 0,
    auditLog: [{ 
      id: `log_${Date.now()}`, 
      timestamp: Date.now(), 
      userId: currentUser?.id || 'unknown', 
      action: 'Tarea creada' 
    }, ...(taskData.auditLog || [])]
  };
  
  saveLocalTasks([newTask, ...tasks]);
  return { message: 'Tarea creada correctamente', taskId: newTask.id };
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<{ message: string }> => {
  const tasks = getLocalTasks();
  const oldTask = tasks.find(t => t.id === taskId);
  
  if (!oldTask) return { message: 'No encontrada' };

  // --- Lógica de Recurrencia al completar ---
  if (updates.status === TaskStatus.COMPLETED && oldTask.status !== TaskStatus.COMPLETED && oldTask.recurrence && oldTask.recurrence.type !== 'none') {
    const nextDate = calculateNextDueDate(oldTask.dueDate, oldTask.recurrence);
    
    // Crear nueva instancia
    const nextTask: Task = {
      ...oldTask,
      id: (Date.now() + 1).toString(),
      dueDate: nextDate,
      status: TaskStatus.TODO,
      createdAt: Date.now(),
      comments: [],
      auditLog: [{ 
        id: `log_${Date.now()}`, 
        timestamp: Date.now(), 
        userId: 'system', 
        action: 'Recurrencia automática',
        details: `Instancia generada de: ${oldTask.id}`
      }],
      subtasks: oldTask.subtasks.map(s => ({ ...s, completed: false }))
    };
    
    // Guardamos ambas (la completada y la nueva)
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    saveLocalTasks([nextTask, ...updatedTasks]);
    return { message: 'Tarea completada. Siguiente instancia programada.' };
  }

  const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
  saveLocalTasks(updatedTasks);
  return { message: 'Tarea actualizada' };
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const tasks = getLocalTasks();
  saveLocalTasks(tasks.filter(t => t.id !== taskId));
};

export const addComment = async (taskId: string, text: string, file?: File): Promise<void> => {
  const tasks = getLocalTasks();
  const currentUser = getCurrentUser();
  
  let attachments: Attachment[] = [];
  if (file) {
    attachments.push({
      id: `att_${Date.now()}`,
      name: file.name,
      type: file.type,
      url: '#', 
      size: file.size
    });
  }

  const newComment: Comment = {
    id: Date.now().toString(),
    taskId,
    userId: currentUser?.id || 'unknown',
    userName: currentUser?.name || 'Unknown',
    text,
    timestamp: Date.now(),
    attachments
  };

  const updatedTasks = tasks.map(t => {
    if (t.id === taskId) {
      return { ...t, comments: [...(t.comments || []), newComment] };
    }
    return t;
  });
  
  saveLocalTasks(updatedTasks);
};

export const getClients = (): Client[] => {
  const stored = localStorage.getItem(CLIENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getPolicies = (clientId?: string): Policy[] => {
  const stored = localStorage.getItem(POLICIES_KEY);
  const allPolicies = stored ? JSON.parse(stored) : [];
  if (clientId) return allPolicies.filter(p => p.clientId === clientId);
  return allPolicies;
};

export const getAutomationRules = (): AutomationRule[] => {
  const stored = localStorage.getItem(AUTOMATION_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveAutomationRules = (rules: AutomationRule[]) => {
  localStorage.setItem(AUTOMATION_KEY, JSON.stringify(rules));
};

export const getCommercialActivities = (): CommercialActivity[] => {
  const stored = localStorage.getItem(ACTIVITIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addCommercialActivity = async (activity: Omit<CommercialActivity, 'id' | 'userId' | 'timestamp'>) => {
  const currentUser = getCurrentUser();
  const newActivity: CommercialActivity = {
    ...activity,
    id: `act_${Date.now()}`,
    userId: currentUser?.id || 'unknown',
    timestamp: Date.now()
  };
  const activities = getCommercialActivities();
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify([newActivity, ...activities]));
};

export const getWhatsAppMessages = (taskId: string): WhatsAppMessage[] => [];
export const getEmailMessages = (taskId: string): EmailMessage[] => [];

export const sendSignatureRequest = async (taskId: string, file: File, recipientEmail: string): Promise<SignatureRequest> => {
    const newRequest: SignatureRequest = {
        id: `sig_${Date.now()}`,
        taskId,
        documentName: file.name,
        sentAt: Date.now(),
        status: 'Enviado',
        recipientEmail
    };
    return newRequest;
};
