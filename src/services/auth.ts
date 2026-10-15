
import { User } from '../types';

// Mock Users Data
export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Admin Usuario', 
    email: 'admin@empresa.com', 
    color: 'bg-indigo-500',
    twoFactorEnabled: true,
    connectedAccounts: ['google'],
    settings: {
        language: 'es',
        startPage: 'myDay',
        timezone: 'Europe/Madrid',
        timeFormat: '13:00',
        dateFormat: 'DD-MM-YYYY',
        weekStart: 'monday',
        nextWeekPreset: 'monday',
        weekendPreset: 'saturday'
    }
  },
  { 
    id: 'u2', 
    name: 'Juan Pérez', 
    email: 'juan@empresa.com', 
    color: 'bg-green-500',
    twoFactorEnabled: false,
    connectedAccounts: [],
    settings: {
        language: 'es',
        startPage: 'inbox',
        timezone: 'Europe/Madrid',
        timeFormat: '13:00',
        dateFormat: 'DD-MM-YYYY',
        weekStart: 'monday',
        nextWeekPreset: 'monday',
        weekendPreset: 'saturday'
    }
  },
  { 
    id: 'u3', 
    name: 'Ana García', 
    email: 'ana@empresa.com', 
    color: 'bg-pink-500',
    twoFactorEnabled: false
  },
  { 
    id: 'u4', 
    name: 'Carlos López', 
    email: 'carlos@empresa.com', 
    color: 'bg-yellow-500',
    twoFactorEnabled: true
  }
];

const AUTH_KEY = 'my_task_manager_auth_user';

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const login = (userId: string): User | null => {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  return user || null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(u => u.id === id);
};
