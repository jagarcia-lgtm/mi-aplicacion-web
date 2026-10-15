
import { Task, Priority, TaskStatus } from '../types';

const STORAGE_KEY = 'my_task_manager_v1';

const MOCK_DATA: Task[] = [
  {
    id: '1',
    title: 'Comprar comida para la semana',
    description: 'Necesitamos leche, pan, huevos y verduras.',
    dueDate: new Date().toISOString().split('T')[0],
    priority: Priority.HIGH,
    status: TaskStatus.TODO,
    // Removed non-existent project and projectId properties
    createdAt: Date.now(),
    tags: ['compras', 'urgente'],
    subtasks: [
      { id: '1-1', text: 'Leche', completed: false },
      { id: '1-2', text: 'Pan', completed: true },
      { id: '1-3', text: 'Huevos', completed: false }
    ],
    createdBy: 'u1',
    assignedTo: ['u1'],
    comments: []
  },
  {
    id: '2',
    title: 'Terminar reporte mensual',
    description: 'Revisar las métricas de ventas del Q3.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // +2 days
    priority: Priority.MEDIUM,
    status: TaskStatus.TODO,
    // Removed non-existent project and projectId properties
    createdAt: Date.now() - 1000,
    tags: ['oficina'],
    subtasks: [],
    createdBy: 'u1',
    assignedTo: ['u2'],
    comments: []
  },
  {
    id: '3',
    title: 'Renovar suscripción del gimnasio',
    description: 'Ir presencialmente a la sucursal.',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
    priority: Priority.LOW,
    status: TaskStatus.COMPLETED,
    // Removed non-existent project and projectId properties
    createdAt: Date.now() - 2000,
    tags: [],
    subtasks: [],
    createdBy: 'u1',
    assignedTo: ['u1'],
    comments: []
  }
];

export const getTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Initialize with some data if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
      return MOCK_DATA;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks", error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks", error);
  }
};
