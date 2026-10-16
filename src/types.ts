
export enum Priority {
  VERY_HIGH = 'Muy Urgente',
  HIGH = 'Alta',
  MEDIUM = 'Media',
  LOW = 'Baja'
}

export enum EnergyLevel {
  HIGH = 'Alta',
  MEDIUM = 'Media',
  LOW = 'Baja'
}

export enum TaskStatus {
  TODO = 'Por hacer',
  IN_PROGRESS = 'En curso',
  IN_REVIEW = 'En revisión',
  BLOCKED = 'Bloqueado',
  COMPLETED = 'Completado'
}

export interface UserSettings {
  language: 'es' | 'en';
  startPage: 'myDay' | 'inbox' | 'upcoming' | 'dashboard' | 'clients';
  timezone: string;
  timeFormat: '13:00' | '1:00 PM';
  dateFormat: 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD';
  weekStart: 'monday' | 'sunday';
  nextWeekPreset: 'monday' | 'sunday' | 'next_day';
  weekendPreset: 'saturday' | 'friday';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color?: string;
  twoFactorEnabled?: boolean;
  connectedAccounts?: ('google' | 'outlook' | 'facebook' | 'apple')[];
  settings?: UserSettings;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface InternalMessage {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceConfig {
  type: RecurrenceType;
  intervalDays?: number;
  pattern?: string; // Texto original: "cada lunes"
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
}

export type InsuranceBranch = 'Auto' | 'Hogar' | 'Vida' | 'Salud' | 'Decesos' | 'RC' | 'Comercio' | 'Otros';

export type TaskModule = 'Comercial' | 'Contratación' | 'Siniestros' | 'Recibos' | 'Administración' | 'General';

export type TaskType = 
  | 'Visita presencial' | 'Llamada telefónica' | 'Videollamada' | 'Envío de propuesta' | 'Seguimiento post-propuesta' | 'Alta nuevo cliente'
  | 'Tarificación' | 'Emisión de póliza' | 'Renovación' | 'Suplemento' | 'Nombramiento' | 'Cambio de tomador' | 'Cambio de vehículo' | 'Alta Póliza'
  | 'Siniestro' | 'Apertura' | 'Revisión documentación' | 'Seguimiento' | 'Envío reparador' | 'Envío perito' | 'Solicitud de indemnización' | 'Finiquito / cierre'
  | 'Cobros' | 'Recibo devuelto' | 'Cobro físico' | 'Envío a banco' | 'Anulación por impago' | 'Cambio de forma de pago' | 'Cambio de cuenta corriente' | 'Liquidación'
  | 'Gestión' | 'General' | 'Pago de impuestos' | 'Cierre mensual' | 'Control contable' | 'Nóminas' | 'Formación' | 'Revisión de productividad'
  | 'Libre';

export const TASK_MODULES_MAP: Record<TaskModule, TaskType[]> = {
  'Comercial': [
    'Visita presencial', 'Llamada telefónica', 'Videollamada', 
    'Envío de propuesta', 'Seguimiento post-propuesta', 'Alta nuevo cliente'
  ],
  'Contratación': [
    'Tarificación', 'Emisión de póliza', 'Renovación', 
    'Suplemento', 'Nombramiento', 'Cambio de tomador', 'Cambio de vehículo', 'Alta Póliza'
  ],
  'Siniestros': [
    'Siniestro', 'Apertura', 'Revisión documentación', 'Seguimiento', 
    'Envío reparador', 'Envío perito', 'Solicitud de indemnización', 'Finiquito / cierre'
  ],
  'Recibos': [
    'Cobros', 'Recibo devuelto', 'Cobro físico', 'Envío a banco', 
    'Anulación por impago', 'Cambio de forma de pago', 'Cambio de cuenta corriente', 'Liquidación'
  ],
  'Administración': [
    'Gestión', 'General', 'Pago de impuestos', 'Cierre mensual', 'Control contable', 'Nóminas', 'Formación', 'Revisión de productividad'
  ],
  'General': ['Libre']
};

export type ProcessStatus = 'En curso' | 'Pendiente doc' | 'Enviado Cía' | 'Peritaje' | 'Finalizado' | 'Rechazado';

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'url' | 'checkbox' | 'date';
  value: string | number | boolean;
}

export interface TaskDependency {
  type: 'blocked_by' | 'related_to';
  targetTaskId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  details?: string;
}

export type ClientStatus = 'Activo' | 'Potencial' | 'Baja';

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'img' | 'doc';
  url: string;
  date: string;
}

export type PaymentFrequency = 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual';
export type PolicyStatus = 'Activa' | 'En renovación' | 'Anulada' | 'Vencida';

export interface Policy {
  id: string;
  clientId: string;
  clientName?: string;
  number: string;
  insurer: string;
  branch: InsuranceBranch;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: PolicyStatus;
  premium: number;
  paymentFrequency: PaymentFrequency;
  paymentMethod: string;
  iban?: string;
  alias?: string;
  documents: Document[];
}

export interface Client {
  id: string;
  name: string;
  idNumber?: string;
  email: string;
  phone: string;
  address?: string;
  status: ClientStatus;
  notes?: string;
  documents?: Document[];
  geo?: { lat: number; lng: number };
}

export interface WhatsAppMessage {
  id: string;
  taskId: string;
  direction: 'inbound' | 'outbound';
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  senderName: string;
}

export interface EmailMessage {
  id: string;
  taskId: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  subject: string;
  body: string;
  timestamp: number;
  hasAttachments: boolean;
  isRead: boolean;
  folder: 'inbox' | 'sent' | 'draft';
}

export type SignatureStatus = 'Pendiente' | 'Enviado' | 'Firmado' | 'Rechazado';

export interface SignatureRequest {
  id: string;
  taskId: string;
  documentName: string;
  sentAt: number;
  signedAt?: number;
  status: SignatureStatus;
  recipientEmail: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  dueDate: string;
  emailDraft?: { to: string; subject: string; body: string };
  whatsAppDraft?: { phone: string; message: string };
  reminderDate?: string; 
  priority: Priority;
  status: TaskStatus;
  createdAt: number;
  tags: string[];
  subtasks: Subtask[];
  recurrence?: RecurrenceConfig;
  lastExecution?: number;
  createdBy: string;
  assignedTo: string[];
  supervisorId?: string;
  comments: Comment[];
  internalMessages?: InternalMessage[];
  auditLog?: AuditLogEntry[];
  myDayDate?: string;
  module?: TaskModule;
  taskType?: TaskType;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  policyId?: string;
  policyNumber?: string;
  insurer?: string;
  branch?: InsuranceBranch;
  processStatus?: ProcessStatus; 
  isUrgent?: boolean;            
  customFields?: CustomField[];
  dependencies?: TaskDependency[];
  location?: string;
  signatureRequests?: SignatureRequest[];
  totalTimeSpent?: number;
  energy?: EnergyLevel;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: string;
}

export interface CommercialActivity {
  id: string;
  clientId: string;
  userId: string;
  timestamp: number;
  type: string;
  notes: string;
  location?: { lat: number; lng: number };
}

export interface TaskTemplate {
  id: string;
  name: string;
  taskType: TaskType;
  defaultTitle: string;
  defaultDescription: string;
  defaultTags: string[];
  defaultSubtasks: string[]; 
  defaultPriority: Priority;
}
