
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Priority, TaskStatus, Subtask, InsuranceBranch, TaskType, ProcessStatus, Client, Policy, TaskModule, Attachment, WhatsAppMessage, EmailMessage, TASK_MODULES_MAP, AuditLogEntry, EnergyLevel, SignatureRequest, InternalMessage, RecurrenceConfig } from '../types';
import { Button } from './Button';
import { UserAvatar } from './UserAvatar';
import { TaskDetailsSidebar } from './TaskDetailsSidebar';
import { WhatsAppPanel, WhatsAppDraft } from './WhatsAppPanel';
import { X, Plus, Hash, CheckSquare, Trash2, Users, MessageSquare, Send, AlignLeft, Shield, FileText, User as UserIcon, BookTemplate, Activity, History, Zap, Search, Paperclip, ImageIcon, Bell, Calendar, Flag, Tag, MapPin, Check, CheckCircle2, Circle, Eye, Download, ChevronRight, MessageCircle, Mail, Phone, MoreVertical, Reply, ReplyAll, Forward, PenTool, UploadCloud, Clock, UserCheck, CalendarDays, Building2, FileCheck, Mic, StopCircle, Timer, Battery, BatteryCharging, BatteryLow, Copy, Maximize2, Minimize2, Sparkles, Loader2, AlertCircle, Share2, MousePointer2, Bot } from 'lucide-react';
import { getCurrentUser } from '../services/auth';
import { addComment, getClients, getPolicies, getEmailMessages, sendSignatureRequest, INSURANCE_TAGS } from '../services/firestore';


interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>) => void;
  initialData?: Task | null;
  allTasks?: Task[];
}

type Tab = 'activity' | 'comments' | 'whatsapp' | 'email' | 'signature' | 'chat_equipo';

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, initialData, allTasks = [] }) => {
  const [footerTab, setFooterTab] = useState<Tab>('activity');

  const liveTask = useMemo(() => {
    if (initialData?.id) {
        return allTasks.find(t => t.id === initialData.id) || initialData;
    }
    return initialData;
  }, [initialData, allTasks, isOpen]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', body: '' });
  const [whatsAppDraft, setWhatsAppDraft] = useState<WhatsAppDraft>({ phone: '', message: '' });
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [energy, setEnergy] = useState<EnergyLevel>(EnergyLevel.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [myDayDate, setMyDayDate] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mobileSection, setMobileSection] = useState<'task' | 'details'>('task');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [currentSubtask, setCurrentSubtask] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [supervisorId, setSupervisorId] = useState<string>('');
  const [module, setModule] = useState<TaskModule>('General');
  const [taskType, setTaskType] = useState<TaskType | ''>('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [insurer, setInsurer] = useState('');
  const [branch, setBranch] = useState<InsuranceBranch | ''>('');
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('En curso');
  const [isUrgent, setIsUrgent] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({ type: 'none' });

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [manualSessionMinutes, setManualSessionMinutes] = useState(0);

  const [newComment, setNewComment] = useState('');
  const [newInternalMsg, setNewInternalMsg] = useState('');
  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>([]);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [availablePolicies, setAvailablePolicies] = useState<Policy[]>([]);
  const [isSendingSig, setIsSendingSig] = useState(false);

  // IA State
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowTimeModal(false); setSessionSeconds(0); setManualSessionMinutes(0);
      setFooterTab('activity'); setNewComment(''); setNewInternalMsg('');
      setShowAI(false); setAiInput(''); setAiResponse(''); setMobileSection('task');
      setReminderDate(initialData?.reminderDate || '');
      setWhatsAppDraft(initialData?.whatsAppDraft || { phone: initialData?.clientPhone || '', message: '' });
      setEmailDraft(initialData?.emailDraft || { to: initialData?.clientEmail || '', subject: initialData?.title || '', body: '' });
    }
    if (isOpen && initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setDueDate(initialData.dueDate || '');
        setDate(initialData.date || '');
        setPriority(initialData.priority || Priority.MEDIUM);
        setEnergy(initialData.energy || EnergyLevel.MEDIUM);
        setStatus(initialData.status || TaskStatus.TODO);
        setMyDayDate(initialData.myDayDate);
        setTags(initialData.tags || []);
        setLocation(initialData.location || '');
        setSubtasks(initialData.subtasks || []);
        setAssignedTo(initialData.assignedTo || []);
        setSupervisorId(initialData.supervisorId || '');
        setModule(initialData.module || 'General');
        setTaskType(initialData.taskType || '');
        setClientId(initialData.clientId || '');
        setClientName(initialData.clientName || '');
        setClientPhone(initialData.clientPhone || '');
        setClientEmail(initialData.clientEmail || '');
        setPolicyId(initialData.policyId || '');
        setPolicyNumber(initialData.policyNumber || '');
        setInsurer(initialData.insurer || '');
        setBranch(initialData.branch || '');
        setProcessStatus(initialData.processStatus || 'En curso');
        setIsUrgent(initialData.isUrgent || false);
        setTotalTimeSpent(initialData.totalTimeSpent || 0);
        setInternalMessages(initialData.internalMessages || []);
        setRecurrence(initialData.recurrence || { type: 'none' });

        if (initialData.id) {
            setEmailMessages(getEmailMessages(initialData.id));
        }
    } else if (isOpen) {
        resetForm();
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    let interval: any;
    if (isOpen && !showTimeModal) {
        interval = setInterval(() => {
            setSessionSeconds(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, showTimeModal]);

  useEffect(() => {
      if (isOpen) setClients(getClients());
  }, [isOpen]);

  useEffect(() => {
    if (clientId) setAvailablePolicies(getPolicies(clientId));
    else setAvailablePolicies([]);
  }, [clientId]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setDueDate(new Date().toISOString().split('T')[0]); setDate('');
    setPriority(Priority.MEDIUM); setEnergy(EnergyLevel.MEDIUM); setStatus(TaskStatus.TODO);
    setTags([]); setLocation(''); setSubtasks([]); setAssignedTo([]); setSupervisorId('');
    setModule('General'); setTaskType(''); setClientId(''); setPolicyId(''); setTotalTimeSpent(0);
    setClientName(''); setClientPhone(''); setClientEmail(''); setPolicyNumber('');
    setInsurer(''); setBranch(''); setProcessStatus('En curso'); setIsUrgent(false);
    setEmailMessages([]);
    setSessionSeconds(0); setInternalMessages([]);
    setShowAI(false); setAiInput(''); setAiResponse('');
    setRecurrence({ type: 'none' });
  };

  const handleAttemptClose = () => {
    if (!title.trim()) { alert("Introduce un título."); return; }
    const calculatedMinutes = Math.ceil(sessionSeconds / 60);
    setManualSessionMinutes(calculatedMinutes === 0 ? 1 : calculatedMinutes);
    setShowTimeModal(true);
  };

  const handleConfirmTimeAndClose = (saveTime: boolean) => {
    const timeToAdd = saveTime ? manualSessionMinutes : 0;
    const finalTotalTime = (initialData?.totalTimeSpent || 0) + timeToAdd;
    let newAuditLog = [...(initialData?.auditLog || [])];
    if (saveTime && timeToAdd > 0) {
        newAuditLog.push({
            id: `log_${Date.now()}`,
            timestamp: Date.now(),
            userId: getCurrentUser()?.id || 'unknown',
            action: 'Tiempo registrado',
            details: `${timeToAdd} min`
        });
    }
    onSave({ title, description, dueDate, date, reminderDate, emailDraft, whatsAppDraft, priority, status, tags, location, subtasks, assignedTo, supervisorId, myDayDate, module, taskType: taskType as TaskType || undefined, clientId: clientId || undefined, clientName, clientPhone, clientEmail, policyId: policyId || undefined, policyNumber, insurer, branch: branch as InsuranceBranch || undefined, processStatus, isUrgent, totalTimeSpent: finalTotalTime, auditLog: newAuditLog, energy, internalMessages, recurrence });
    setShowTimeModal(false);
    setSessionSeconds(0);
    onClose();
  };

  const handleSendSignature = async () => {
    if (!liveTask?.id) return;
    setIsSendingSig(true);
    await new Promise(r => setTimeout(r, 1500));
    const mockFile = new File([""], "Solicitud_Firma.pdf", { type: "application/pdf" });
    await sendSignatureRequest(liveTask.id, mockFile, clientEmail || 'cliente@ejemplo.com');
    setIsSendingSig(false);
  };

  const handleSendInternalMessage = () => {
    if (!newInternalMsg.trim()) return;
    const user = getCurrentUser();
    const msg: InternalMessage = {
      id: Date.now().toString(),
      taskId: liveTask?.id || 'new',
      userId: user?.id || 'unknown',
      userName: user?.name || 'Usuario',
      text: newInternalMsg,
      timestamp: Date.now()
    };
    setInternalMessages([...internalMessages, msg]);
    setNewInternalMsg('');
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setAiResponse('El asistente IA no está conectado en esta demo. Para activarlo se necesita un servicio de servidor; no introduzcas claves API en el navegador.');
  };

  const handleDetailsChange = (patch: Partial<Task>) => {
    if ('clientId' in patch) setClientId(patch.clientId || '');
    if ('clientName' in patch) setClientName(patch.clientName || '');
    if ('clientPhone' in patch) {
      setClientPhone(patch.clientPhone || '');
      setWhatsAppDraft(value => !value.phone || value.phone === clientPhone ? { ...value, phone: patch.clientPhone || '' } : value);
    }
    if ('clientEmail' in patch) setClientEmail(patch.clientEmail || '');
    if ('policyId' in patch) setPolicyId(patch.policyId || '');
    if ('policyNumber' in patch) setPolicyNumber(patch.policyNumber || '');
    if ('insurer' in patch) setInsurer(patch.insurer || '');
    if ('branch' in patch) setBranch(patch.branch || '');
    if ('module' in patch) setModule(patch.module || 'General');
    if ('taskType' in patch) setTaskType(patch.taskType || '');
    if ('priority' in patch && patch.priority) setPriority(patch.priority);
    if ('energy' in patch && patch.energy) setEnergy(patch.energy);
    if ('supervisorId' in patch) setSupervisorId(patch.supervisorId || '');
    if ('assignedTo' in patch) setAssignedTo(patch.assignedTo || []);
    if ('date' in patch) setDate(patch.date || '');
    if ('dueDate' in patch) setDueDate(patch.dueDate || '');
    if ('recurrence' in patch) setRecurrence(patch.recurrence || { type: 'none' });
    if ('reminderDate' in patch) setReminderDate(patch.reminderDate || '');
    if ('tags' in patch) setTags(patch.tags || []);
    if ('location' in patch) setLocation(patch.location || '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div data-mobile-section={mobileSection} className="task-form-shell bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[96vh] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200 relative">

        {showTimeModal && (
            <div className="absolute inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
                    <div className="flex items-center gap-3 text-gray-800 mb-4"><div className="p-2 bg-[#009696]/10 rounded-full text-[#009696]"><Timer size={24} /></div><h3 className="text-lg font-bold">Registro de Tiempo</h3></div>
                    <p className="text-sm text-gray-600 mb-4">Has dedicado <span className="font-bold text-gray-900">{Math.floor(sessionSeconds/60)}m {sessionSeconds%60}s</span> a este trámite.</p>
                    <div className="flex items-center gap-2 mb-6"><input type="number" min="0" value={manualSessionMinutes} onChange={(e) => setManualSessionMinutes(Math.max(0, parseInt(e.target.value) || 0))} className="w-24 text-center font-bold text-xl border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-[#009696] outline-none" /><span className="text-gray-500">minutos</span></div>
                    <div className="flex flex-col gap-2"><Button onClick={() => handleConfirmTimeAndClose(true)} className="w-full">Guardar y Cerrar</Button><button onClick={() => handleConfirmTimeAndClose(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">Descartar tiempo y Cerrar</button></div>
                </div>
            </div>
        )}

        {/* CONTENIDO PRINCIPAL (Izquierda) */}
        <div className="task-form-main flex-1 flex flex-col h-full overflow-hidden border-r border-gray-100">
             <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-white z-10 flex-shrink-0">
                <select aria-label="Estado del trámite" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="appearance-none text-xs font-bold px-3 py-1.5 rounded-full border-none focus:ring-0 cursor-pointer bg-gray-100 text-gray-700">
                    <option value={TaskStatus.TODO}>POR HACER</option>
                    <option value={TaskStatus.IN_PROGRESS}>EN CURSO</option>
                    <option value={TaskStatus.IN_REVIEW}>REVISIÓN</option>
                    <option value={TaskStatus.BLOCKED}>BLOQUEADO</option>
                    <option value={TaskStatus.COMPLETED}>COMPLETADO</option>
                </select>
                <div className="flex items-center gap-2">
                    <button type="button" className="md:hidden text-xs font-semibold px-2 py-2 rounded border text-[#009696]" onClick={() => setMobileSection(value => value === 'task' ? 'details' : 'task')}>{mobileSection === 'task' ? 'Organización' : 'Volver a la tarea'}</button>
                    <div className="hidden sm:flex items-center gap-2 bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg border border-gray-100"><Clock size={14} className="text-[#009696]" /><span className="text-xs font-mono font-bold w-10 text-center">{Math.floor(sessionSeconds/60)}:{(sessionSeconds%60).toString().padStart(2,'0')}</span></div>
                    <Button type="button" onClick={handleAttemptClose} size="sm"><Check size={18} className="mr-1" /> Guardar</Button>
                    <button aria-label="Cerrar trámite" onClick={onClose} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del trámite..." className="w-full text-3xl font-bold text-gray-900 placeholder-gray-200 outline-none bg-transparent border-none p-0 mb-6 focus:ring-0" />
                    <div className="flex items-start gap-4 mb-8">
                        <AlignLeft size={20} className="text-gray-400 mt-1" />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent border-none p-0 resize-none min-h-[80px] focus:ring-0 leading-relaxed" placeholder="Añadir una descripción detallada..." rows={3} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-2"><CheckSquare size={16} /> Lista de Control</div>
                        <div className="space-y-2 pl-8">
                            {subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-3 group py-1.5 hover:bg-gray-50 rounded-lg px-2 -ml-2 transition-colors">
                                    <input type="checkbox" checked={st.completed} onChange={() => setSubtasks(subtasks.map(s => s.id === st.id ? {...s, completed: !s.completed} : s))} className="w-5 h-5 text-[#009696] rounded border-gray-300 focus:ring-[#009696] cursor-pointer" />
                                    <span className={`flex-1 text-sm font-medium ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{st.text}</span>
                                    <button type="button" onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"><X size={16} /></button>
                                </div>
                            ))}
                            <div className="flex items-center gap-3 text-gray-400 focus-within:text-[#009696] py-1.5 pl-2"><Plus size={18} /><input type="text" value={currentSubtask} onChange={(e) => setCurrentSubtask(e.target.value)} onKeyDown={e => { if(e.key==='Enter') { setSubtasks([...subtasks, { id: Date.now().toString(), text: currentSubtask, completed: false }]); setCurrentSubtask(''); } }} className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 p-0" placeholder="Añadir paso..." /></div>
                        </div>
                    </div>
                </div>

                {/* CENTRO DE OPERACIONES: PESTAÑAS INFERIORES */}
                <div className="bg-gray-50/50 min-h-[400px] border-t border-gray-100">
                    <div className="flex border-b border-gray-200 bg-white px-6 sticky top-0 z-10 overflow-x-auto hide-scrollbar">
                        {[
                            { id: 'activity', label: 'Actividad', icon: <History size={14} /> },
                            { id: 'comments', label: 'Comentarios', icon: <MessageSquare size={14} /> },
                            { id: 'chat_equipo', label: 'Chat Equipo', icon: <Users size={14} />, color: 'text-indigo-600' },
                            { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={14} />, color: 'text-green-600' },
                            { id: 'email', label: 'Email', icon: <Mail size={14} />, color: 'text-blue-600' },
                            { id: 'signature', label: 'Firmas', icon: <PenTool size={14} />, color: 'text-purple-600' }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setFooterTab(tab.id as Tab)} className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${footerTab === tab.id ? 'border-[#009696] text-[#009696] bg-[#009696]/5' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                                <span className={tab.color}>{tab.icon}</span>
                                {tab.label}
                                {tab.id === 'chat_equipo' && internalMessages.length > 0 && <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded-full text-[10px]">{internalMessages.length}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* TAB: ACTIVIDAD */}
                        {footerTab === 'activity' && (
                            <div className="space-y-6">
                                {/* Botón Agente IA */}
                                <div className="mb-6">
                                    {!showAI ? (
                                        <button
                                            onClick={() => setShowAI(true)}
                                            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#009696]/30 rounded-2xl bg-[#009696]/5 text-[#009696] hover:bg-[#009696]/10 transition-all font-bold text-sm group"
                                        >
                                            <Bot size={20} className="group-hover:scale-110 transition-transform" />
                                            AGENTE IA: CONSULTAR SOBRE ESTE TRÁMITE
                                        </button>
                                    ) : (
                                        <div className="bg-white border-2 border-[#009696]/20 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-300">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2 text-[#009696] font-black uppercase text-[10px] tracking-widest">
                                                    <Sparkles size={14} /> Agente Inteligente
                                                </div>
                                                <button onClick={() => setShowAI(false)} className="text-gray-300 hover:text-gray-500"><X size={16} /></button>
                                            </div>

                                            {aiResponse && (
                                                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                                                    <div className="flex gap-3 items-start">
                                                        <div className="bg-[#009696] text-white p-2 rounded-lg shrink-0">
                                                            <Bot size={14} />
                                                        </div>
                                                        <div>{aiResponse}</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={aiInput}
                                                    onChange={(e) => setAiInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && askAI()}
                                                    placeholder="Pregúntame algo sobre este trámite..."
                                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#009696]"
                                                />
                                                <button
                                                    onClick={askAI}
                                                    disabled={isAILoading || !aiInput.trim()}
                                                    className="p-2.5 bg-[#009696] text-white rounded-xl hover:bg-[#007a7a] disabled:opacity-50 transition-colors shadow-lg"
                                                >
                                                    {isAILoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-3 italic">El agente procesa chats, emails, comentarios y logs para responderte.</p>
                                        </div>
                                    )}
                                </div>

                                {(liveTask?.auditLog || []).length === 0 && <p className="text-gray-400 text-xs italic text-center py-20">Sin actividad registrada.</p>}
                                {liveTask?.auditLog?.slice().reverse().map(log => (
                                    <div key={log.id} className="flex gap-4 text-sm items-start group">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#009696] shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform"><Activity size={14} /></div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-0.5"><span className="font-bold text-gray-700">{log.action}</span><span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span></div>
                                            <p className="text-gray-500 text-xs">{log.details || 'Acción automática del sistema'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB: COMENTARIOS */}
                        {footerTab === 'comments' && (
                            <div className="space-y-6">
                                {liveTask?.comments?.map(c => (
                                    <div key={c.id} className="flex gap-4 text-sm animate-in fade-in"><UserAvatar userId={c.userId} size="sm" /><div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative"><div className="flex justify-between mb-2"><span className="font-bold text-gray-800">{c.userName}</span><span className="text-[10px] text-gray-400 font-mono">{new Date(c.timestamp).toLocaleString()}</span></div><p className="text-gray-600 leading-relaxed">{c.text}</p></div></div>
                                ))}
                                <div className="flex gap-4 mt-8"><UserAvatar userId={getCurrentUser()?.id || 'u1'} size="sm" /><div className="flex-1 relative"><textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#009696] outline-none min-h-[100px] resize-none shadow-sm transition-all" placeholder="Escribe un comentario público..." /><button disabled={!newComment.trim()} onClick={async () => { if(newComment.trim() && liveTask?.id) { await addComment(liveTask.id, newComment); setNewComment(''); } }} className="absolute bottom-4 right-4 p-3 bg-[#009696] text-white rounded-xl hover:bg-[#007a7a] transition-colors shadow-lg"><Send size={18} /></button></div></div>
                            </div>
                        )}

                        {/* TAB: CHAT EQUIPO */}
                        {footerTab === 'chat_equipo' && (
                            <div className="flex flex-col h-[500px]">
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {internalMessages.length === 0 && (
                                      <div className="text-center py-20 opacity-50 flex flex-col items-center gap-4">
                                        <Users size={48} className="text-indigo-200" />
                                        <p className="text-sm">Inicia una conversación interna con los responsables de la tarea.</p>
                                      </div>
                                    )}
                                    {internalMessages.map(msg => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.userId === getCurrentUser()?.id ? 'flex-row-reverse' : ''}`}>
                                            <UserAvatar userId={msg.userId} size="sm" />
                                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${msg.userId === getCurrentUser()?.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100'}`}>
                                                <div className={`text-[10px] font-bold mb-1 ${msg.userId === getCurrentUser()?.id ? 'text-indigo-200' : 'text-gray-400'}`}>{msg.userName}</div>
                                                <p className="text-sm">{msg.text}</p>
                                                <div className={`text-[9px] text-right mt-1 opacity-60 ${msg.userId === getCurrentUser()?.id ? 'text-white' : 'text-gray-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex gap-3 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                    <input type="text" value={newInternalMsg} onChange={e => setNewInternalMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendInternalMessage()} placeholder="Escribe un mensaje privado para el equipo..." className="flex-1 bg-transparent border-none text-sm px-4 focus:ring-0" />
                                    <button onClick={handleSendInternalMessage} disabled={!newInternalMsg.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"><Send size={18} /></button>
                                </div>
                            </div>
                        )}

                        {/* OTROS TABS (WA, EMAIL, FIRMAS)... */}
                        {footerTab === 'whatsapp' && <WhatsAppPanel draft={whatsAppDraft} onChange={setWhatsAppDraft} clientName={clientName} taskTitle={title} />}

                        {footerTab === 'email' && (
                            <div className="space-y-6">
                                <section className="border rounded-xl p-4 space-y-3 bg-white" aria-label="Borrador de email">
                                    <p className="text-xs text-gray-600">Prepara el correo y guárdalo con la tarea. Abrir en mi correo inicia tu aplicación de correo para que revises y envíes el mensaje. GestiBrok no envía ni sincroniza correos.</p>
                                    <label className="block text-xs font-semibold">Para<input aria-label="Destinatario del email" type="email" value={emailDraft.to} onChange={e => setEmailDraft({ ...emailDraft, to: e.target.value })} className="mt-1 block w-full border rounded p-2 text-sm" /></label>
                                    <label className="block text-xs font-semibold">Asunto<input aria-label="Asunto del email" value={emailDraft.subject} onChange={e => setEmailDraft({ ...emailDraft, subject: e.target.value })} className="mt-1 block w-full border rounded p-2 text-sm" /></label>
                                    <label className="block text-xs font-semibold">Mensaje<textarea aria-label="Mensaje del email" rows={5} value={emailDraft.body} onChange={e => setEmailDraft({ ...emailDraft, body: e.target.value })} className="mt-1 block w-full border rounded p-2 text-sm" /></label>
                                    {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDraft.to.trim()) ? <a className="inline-flex rounded bg-[#009696] text-white px-3 py-2 text-sm" href={`mailto:${encodeURIComponent(emailDraft.to.trim())}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`}>Abrir en mi correo</a> : <p className="text-xs text-gray-500">Introduce un destinatario válido para abrir el correo.</p>}
                                </section>
                                {emailMessages.map(email => (
                                    <div key={email.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
                                        <div className="p-5 border-b border-gray-50 flex items-start gap-4 bg-gray-50/50">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between mb-1.5"><span className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{email.subject}</span><span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{new Date(email.timestamp).toLocaleDateString()}</span></div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500"><span>De: <span className="text-gray-900">{email.from.name}</span></span><span>Para: <span className="text-gray-900">{email.to[0].name}</span></span></div>
                                            </div>
                                        </div>
                                        <div className="p-6 text-sm text-gray-700 bg-white leading-relaxed whitespace-pre-wrap">{email.body}</div>
                                        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-4"><button className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 hover:text-blue-600"><Reply size={14}/> Responder</button><button className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 hover:text-blue-600"><Forward size={14}/> Reenviar</button></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {footerTab === 'signature' && (
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 shadow-inner"><PenTool size={36} /></div>
                                    <h3 className="font-black text-xl text-gray-900 mb-3 tracking-tight">Solicitar Firma Electrónica</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">Envía documentos para firma biométrica o con certificado digital. El cliente recibirá un aviso por email y SMS.</p>
                                    <Button disabled={isSendingSig} onClick={handleSendSignature} className="bg-purple-600 hover:bg-purple-700 h-12 px-8 rounded-2xl shadow-xl shadow-purple-100 font-black tracking-widest text-xs">
                                        {isSendingSig ? <><Loader2 size={18} className="animate-spin mr-3"/> PROCESANDO...</> : <><Plus size={18} className="mr-3"/> NUEVA SOLICITUD DE FIRMA</>}
                                    </Button>
                                </div>

                                {(liveTask?.signatureRequests || []).length > 0 && (
                                    <div className="space-y-3 pt-6 border-t border-gray-100">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Registro de envíos</h4>
                                        {liveTask?.signatureRequests?.map(req => (
                                            <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><FileCheck size={20} /></div>
                                                    <div><p className="text-sm font-black text-gray-900 tracking-tight">{req.documentName}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{req.recipientEmail} • {new Date(req.sentAt).toLocaleDateString()}</p></div>
                                                </div>
                                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border tracking-widest ${req.status === 'Firmado' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{req.status.toUpperCase()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>

        <TaskDetailsSidebar
          key={`${initialData?.id || 'new'}-${isOpen}`}
          task={{ clientId, clientName, policyId, policyNumber, module, taskType: taskType || undefined, priority, energy, supervisorId, assignedTo, date, dueDate, recurrence, reminderDate, tags, location, totalTimeSpent }}
          clients={clients} policies={availablePolicies} availableTags={INSURANCE_TAGS}
          onChange={handleDetailsChange}
        />
      </div>
    </div>
  );
};
