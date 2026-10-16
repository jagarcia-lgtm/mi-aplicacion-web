import React from 'react';
import { ArrowUpRight, Check, FileText, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export interface WhatsAppDraft { phone: string; message: string }
export function WhatsAppPanel({ draft, onChange, clientName, taskTitle }: { draft: WhatsAppDraft; onChange: (value: WhatsAppDraft) => void; clientName: string; taskTitle: string }) {
  const digits = draft.phone.replace(/\D/g, '').replace(/^00/, '');
  const validPhone = /^\+?[\d\s().-]+$/.test(draft.phone.trim()) && /^[1-9]\d{7,14}$/.test(digits);
  const greeting = clientName ? `Hola, ${clientName}.` : 'Hola.';
  const templates = [
    { name: 'Documentación', icon: FileText, message: `${greeting} Necesitamos la documentación pendiente para continuar con tu trámite. ¿Puedes enviárnosla? Gracias.` },
    { name: 'Seguimiento', icon: MessageCircle, message: `${greeting} Te contactamos para hacer seguimiento de tu trámite. ¿Necesitas ayuda?` },
    { name: 'Renovación', icon: RefreshCw, message: `${greeting} Tu póliza está próxima a renovarse. ¿Cuándo podemos revisar las coberturas contigo?` },
  ];
  const href = `https://wa.me/${digits}${draft.message ? `?text=${encodeURIComponent(draft.message)}` : ''}`;
  return <section className="wa-panel" aria-label="Preparar mensaje de WhatsApp">
    <header className="wa-heading"><span className="wa-icon"><MessageCircle size={24} /></span><div><h3>WhatsApp</h3><p>Una conversación, fuera de GestiBrok.</p></div><span className="wa-status">Sin sincronización</span></header>
    <div className="wa-context"><span>CONTACTO DEL TRÁMITE</span><strong>{clientName || 'Sin cliente vinculado'}</strong><p>{taskTitle || 'Nuevo trámite'}</p></div>
    <div className="wa-body">
      <label className="wa-label">Teléfono con prefijo internacional<input aria-label="Teléfono de WhatsApp" type="tel" inputMode="tel" value={draft.phone} onChange={event => onChange({ ...draft, phone: event.target.value })} placeholder="Ej. +34 600 123 456" /></label>
      {draft.phone && !validPhone && <p className="wa-validation">Revisa el número e incluye el prefijo del país, por ejemplo +34.</p>}
      <div className="wa-templates"><p>Empieza con una plantilla</p><div>{templates.map(template => <button type="button" key={template.name} onClick={() => onChange({ ...draft, message: template.message })}><template.icon size={13} />{template.name}</button>)}</div></div>
      <label className="wa-label">Mensaje<textarea aria-label="Mensaje de WhatsApp" value={draft.message} maxLength={2000} onChange={event => onChange({ ...draft, message: event.target.value })} placeholder="Escribe el mensaje que quieres preparar…" rows={5} /></label>
      <div className="wa-draft-meta"><span><Check size={12} />El borrador se conserva al guardar la tarea.</span><span>{draft.message.length}/2000</span></div>
      <div className="wa-next-step"><ShieldCheck size={17} /><p>El siguiente paso abre WhatsApp con el mensaje preparado. Podrás revisarlo y enviarlo allí; no se envía automáticamente.</p></div>
      <div className="wa-actions">{validPhone ? <a href={href} target="_blank" rel="noopener noreferrer">Continuar en WhatsApp<ArrowUpRight size={16} /></a> : <button type="button" disabled>Continuar en WhatsApp<ArrowUpRight size={16} /></button>}</div>
    </div>
    <footer className="wa-footer"><MessageCircle size={18} /><div><strong>Las conversaciones se consultan en WhatsApp</strong><p>GestiBrok todavía no recibe respuestas ni confirma el envío o la lectura de mensajes.</p></div></footer>
  </section>;
}
