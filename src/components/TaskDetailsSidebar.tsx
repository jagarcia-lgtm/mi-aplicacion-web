import React, { useId, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Layers, Plus, SlidersHorizontal, Tag, Users, X } from 'lucide-react';
import { Task, Client, Policy, Priority, EnergyLevel, TaskModule, TaskType, TASK_MODULES_MAP } from '../types';
import { MOCK_USERS } from '../services/auth';
import { DatePicker } from './DatePicker';
import { UserAvatar } from './UserAvatar';

type Details = Pick<Task, 'clientId' | 'clientName' | 'policyId' | 'policyNumber' | 'module' | 'taskType' | 'priority' | 'energy' | 'supervisorId' | 'assignedTo' | 'date' | 'dueDate' | 'recurrence' | 'reminderDate' | 'tags' | 'location' | 'totalTimeSpent'>;
interface Props {
  task: Details;
  clients: Client[];
  policies: Policy[];
  availableTags: string[];
  onChange: (patch: Partial<Task>) => void;
}
const tabs = [
  { key: 'essential', label: 'Esencial', icon: Layers },
  { key: 'planning', label: 'Planificación', icon: CalendarDays },
  { key: 'details', label: 'Detalles', icon: SlidersHorizontal },
] as const;

export function TaskDetailsSidebar({ task, clients, policies, availableTags, onChange }: Props) {
  const [active, setActive] = useState<(typeof tabs)[number]['key']>('essential');
  const [tagInput, setTagInput] = useState('');
  const [tagPage, setTagPage] = useState(0);
  const id = useId();
  const page = Math.min(tagPage, Math.max(0, Math.ceil(task.tags.length / 4) - 1));
  const addTag = () => {
    const value = tagInput.trim();
    if (value && !task.tags.includes(value)) { onChange({ tags: [...task.tags, value] }); setTagPage(Math.floor(task.tags.length / 4)); }
    setTagInput('');
  };
  return <aside className="task-details-sidebar" aria-label="Organización de la tarea">
    <header className="details-heading"><span className="details-heading-icon"><SlidersHorizontal size={18} /></span><div><h2>Organización</h2><p>Los datos del trámite, a mano.</p></div></header>
    <div className="details-tabs" role="tablist" aria-label="Secciones de organización">
      {tabs.map((tab, index) => <button key={tab.key} id={`${id}-${tab.key}-tab`} type="button" role="tab" aria-selected={active === tab.key} aria-controls={`${id}-${tab.key}-panel`} tabIndex={active === tab.key ? 0 : -1} onClick={() => setActive(tab.key)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (next < 0) return;
        event.preventDefault(); setActive(tabs[next].key);
        document.getElementById(`${id}-${tabs[next].key}-tab`)?.focus();
      }}><tab.icon size={14} />{tab.label}</button>)}
    </div>
    <section className="details-panel" role="tabpanel" id={`${id}-${active}-panel`} aria-labelledby={`${id}-${active}-tab`}>
      {active === 'essential' && <div className="details-stack">
        <section className="details-group"><h3>Cliente y póliza</h3><div className="details-grid">
          <label className="details-field">Cliente<select aria-label="Cliente" value={task.clientId || ''} onChange={event => {
            const client = clients.find(item => item.id === event.target.value);
            onChange({ clientId: event.target.value, clientName: client?.name || '', clientPhone: client?.phone || '', clientEmail: client?.email || '', policyId: '', policyNumber: '', insurer: '', branch: undefined });
          }}><option value="">Sin cliente</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
          <label className="details-field">Póliza<select aria-label="Póliza" disabled={!task.clientId} value={task.policyId || ''} onChange={event => {
            const policy = policies.find(item => item.id === event.target.value);
            onChange({ policyId: event.target.value, policyNumber: policy?.number || '', insurer: policy?.insurer || '', branch: policy?.branch });
          }}><option value="">{task.clientId ? 'Sin póliza' : 'Elige un cliente'}</option>{policies.map(policy => <option key={policy.id} value={policy.id}>{policy.insurer} · {policy.number}</option>)}</select></label>
        </div></section>
        <section className="details-group"><h3>Contexto del trámite</h3><div className="details-grid">
          <label className="details-field">Contexto<select aria-label="Contexto" value={task.module || 'General'} onChange={event => onChange({ module: event.target.value as TaskModule, taskType: undefined })}>{Object.keys(TASK_MODULES_MAP).map(module => <option key={module}>{module}</option>)}</select></label>
          <label className="details-field">Tipo de trámite<select aria-label="Tipo de trámite" value={task.taskType || ''} onChange={event => onChange({ taskType: event.target.value as TaskType || undefined })}><option value="">Sin especificar</option>{TASK_MODULES_MAP[task.module || 'General'].map(type => <option key={type}>{type}</option>)}</select></label>
          <label className="details-field">Prioridad<select aria-label="Prioridad" value={task.priority} onChange={event => onChange({ priority: event.target.value as Priority })}>{Object.values(Priority).map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="details-field">Energía<select aria-label="Energía" value={task.energy || EnergyLevel.MEDIUM} onChange={event => onChange({ energy: event.target.value as EnergyLevel })}>{Object.values(EnergyLevel).map(value => <option key={value}>{value}</option>)}</select></label>
        </div></section>
        <section className="details-group"><h3><Users size={13} />Equipo</h3>
          <div className="details-assignees" role="group" aria-label="Responsables asignados">{MOCK_USERS.map(user => <button type="button" key={user.id} aria-label={`Asignar a ${user.name}`} aria-pressed={task.assignedTo.includes(user.id)} title={user.name} onClick={() => onChange({ assignedTo: task.assignedTo.includes(user.id) ? task.assignedTo.filter(id => id !== user.id) : [...task.assignedTo, user.id] })}><UserAvatar userId={user.id} size="sm" /><span>{user.name.split(' ')[0]}</span>{task.assignedTo.includes(user.id) && <Check size={12} />}</button>)}</div>
          <label className="details-field details-supervisor">Supervisor<select aria-label="Supervisor" value={task.supervisorId || ''} onChange={event => onChange({ supervisorId: event.target.value })}><option value="">Sin supervisor</option>{MOCK_USERS.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        </section>
      </div>}
      {active === 'planning' && <div className="details-stack">
        <section className="details-group"><h3>Fechas del trámite</h3>
          <div className="details-date-row"><span>Programada</span><DatePicker label="Programar" value={task.date} onChange={date => onChange({ date })} align="right" placeholder="Sin programar" /></div>
          <div className="details-date-row"><span>Fecha límite</span><DatePicker label="Vencimiento" value={task.dueDate} recurrence={task.recurrence} onChange={(dueDate, recurrence) => onChange({ dueDate, recurrence: recurrence || { type: 'none' } })} align="right" /></div>
        </section>
        <section className="details-group"><h3>Recordatorio</h3><label className="details-field">Recordatorio<input type="datetime-local" value={task.reminderDate || ''} onChange={event => onChange({ reminderDate: event.target.value })} /></label><p className="details-help">Aviso dentro de GestiBrok con la aplicación abierta.</p>{task.reminderDate && <button type="button" className="details-text-button" onClick={() => onChange({ reminderDate: '' })}>Quitar recordatorio</button>}</section>
        <section className="details-time"><Clock size={16} /><div><span>Tiempo registrado</span><strong>{task.totalTimeSpent || 0} minutos</strong></div><p>Se actualiza al guardar la tarea.</p></section>
      </div>}
      {active === 'details' && <div className="details-stack">
        <section className="details-group"><h3><Tag size={13} />Etiquetas <span className="details-count">{task.tags.length}</span></h3>
          <div className="details-add-tag"><input aria-label="Nueva etiqueta" list={`${id}-tags`} placeholder="Buscar o crear etiqueta" value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} /><button type="button" aria-label="Añadir etiqueta" disabled={!tagInput.trim()} onClick={addTag}><Plus size={15} /></button></div>
          <datalist id={`${id}-tags`}>{availableTags.filter(tag => !task.tags.includes(tag)).map(tag => <option key={tag} value={tag} />)}</datalist>
          <div className="details-tag-list">{task.tags.slice(page * 4, page * 4 + 4).map(tag => <span key={tag}><span title={tag}>{tag}</span><button type="button" aria-label={`Quitar etiqueta ${tag}`} onClick={() => onChange({ tags: task.tags.filter(value => value !== tag) })}><X size={12} /></button></span>)}{!task.tags.length && <p className="details-help">Todavía no hay etiquetas.</p>}</div>
          {task.tags.length > 4 && <div className="details-pagination"><button type="button" disabled={page === 0} aria-label="Etiquetas anteriores" onClick={() => setTagPage(page - 1)}><ChevronLeft size={14} /></button><span>{page * 4 + 1}–{Math.min((page + 1) * 4, task.tags.length)} de {task.tags.length}</span><button type="button" disabled={(page + 1) * 4 >= task.tags.length} aria-label="Más etiquetas" onClick={() => setTagPage(page + 1)}><ChevronRight size={14} /></button></div>}
        </section>
        <section className="details-group"><h3>Ubicación</h3><label className="details-field">Dirección o lugar<textarea rows={3} value={task.location || ''} onChange={event => onChange({ location: event.target.value })} placeholder="Escribe una dirección o lugar" /></label><p className="details-help">Se guarda como referencia del trámite.</p></section>
      </div>}
    </section>
    <footer className="details-footer"><Clock size={13} /><span>{task.totalTimeSpent || 0} min registrados</span><span>{task.assignedTo.length} {task.assignedTo.length === 1 ? 'responsable' : 'responsables'}</span></footer>
  </aside>;
}
