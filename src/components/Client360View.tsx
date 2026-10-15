import React, { useState, useEffect, useMemo } from 'react';
import { Client, Task, CommercialActivity, TaskStatus, Policy } from '../types';
import { getClients, getCommercialActivities, addCommercialActivity, getPolicies } from '../services/firestore';
import { TaskCard } from './TaskCard';
import { Button } from './Button';
import { Phone, Mail, MapPin, Search, Plus, Calendar, Briefcase, CheckCircle2, MessageCircle, Navigation, Shield, FileText, Download, Building2, User, CreditCard, ChevronRight, MessageSquare, History, Copy, Euro } from 'lucide-react';

interface Client360ViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleStatus: (id: string) => void;
  onCreateTaskForClient: (client: Client) => void;
}

export const Client360View: React.FC<Client360ViewProps> = ({ tasks, onEditTask, onToggleStatus, onCreateTaskForClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientPolicies, setClientPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [centralTab, setCentralTab] = useState<'tasks' | 'history'>('tasks');
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);

  useEffect(() => {
    setClients(getClients());
    setActivities(getCommercialActivities());
  }, []);

  // Fetch Policies when Client is selected
  useEffect(() => {
    if (selectedClientId) {
      const policies = getPolicies(selectedClientId);
      setClientPolicies(policies);
      setExpandedPolicyId(null);
    } else {
      setClientPolicies([]);
    }
  }, [selectedClientId]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), 
  [clients, selectedClientId]);

  const clientTasks = useMemo(() => 
    tasks.filter(t => t.clientId === selectedClientId || t.clientName === selectedClient?.name),
  [tasks, selectedClientId, selectedClient]);

  const clientActivities = useMemo(() => 
    activities.filter(a => a.clientId === selectedClientId).sort((a,b) => b.timestamp - a.timestamp),
  [activities, selectedClientId]);

  const filteredClients = useMemo(() => 
    clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [clients, searchTerm]);

  // --- Handlers ---

  const handleCheckIn = async () => {
    if (!selectedClient) return;
    setIsCheckingIn(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
         const { latitude, longitude } = position.coords;
         await addCommercialActivity({
             clientId: selectedClient.id,
             type: 'check_in',
             notes: `Visita registrada en coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
             location: { lat: latitude, lng: longitude }
         });
         setActivities(getCommercialActivities());
         setIsCheckingIn(false);
         alert("✅ Check-in realizado correctamente. Visita registrada.");
      }, (error) => {
          console.error(error);
          setIsCheckingIn(false);
          alert("No se pudo obtener la ubicación. Verifica los permisos.");
      });
    } else {
        setIsCheckingIn(false);
        alert("Geolocalización no soportada.");
    }
  };

  const handleLogCall = async () => {
    if (!selectedClient) return;
    const notes = prompt("Notas de la llamada:");
    if (notes) {
        await addCommercialActivity({
            clientId: selectedClient.id,
            type: 'call',
            notes: notes
        });
        setActivities(getCommercialActivities());
    }
  };

  const handleWhatsApp = () => {
    if (selectedClient && selectedClient.phone) {
        const cleanNumber = selectedClient.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles: ' + text);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-6 animate-in fade-in zoom-in duration-300">
        
        {/* SIDEBAR: Client Directory */}
        <div className={`w-full md:w-72 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col ${selectedClientId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b">
                <h2 className="font-bold text-gray-800 mb-2">Cartera</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar cliente..." 
                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2 text-sm outline-none focus:ring-2 focus:ring-[#009696]"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredClients.map(client => (
                    <button
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedClientId === client.id ? 'bg-[#009696]/5 border-l-4 border-l-[#009696]' : ''}`}
                    >
                        <h3 className={`font-semibold ${selectedClientId === client.id ? 'text-[#009696]' : 'text-gray-800'}`}>{client.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${client.status === 'Activo' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                            {client.status}
                        </p>
                    </button>
                ))}
            </div>
        </div>

        {/* MAIN AREA: 3-Panel View */}
        {selectedClientId && selectedClient ? (
            <div className="flex-1 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-1 lg:p-0">
                    
                    {/* PANEL 1: CLIENT PROFILE & ACTIONS (Left) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-fit lg:h-full lg:overflow-y-auto">
                        <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                             <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3">
                                {selectedClient.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                            <p className="text-sm text-gray-500 mb-1">{selectedClient.idNumber || 'Sin DNI'}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${selectedClient.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {selectedClient.status}
                            </span>
                        </div>
                        
                        <div className="p-4 space-y-4 flex-1">
                            {/* Actions Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={handleLogCall} variant="secondary" className="w-full justify-start text-xs">
                                    <Phone size={14} className="mr-2 text-gray-500"/> Llamar
                                </Button>
                                <Button onClick={handleWhatsApp} variant="secondary" className="w-full justify-start text-xs">
                                    <MessageCircle size={14} className="mr-2 text-green-500"/> WhatsApp
                                </Button>
                                <Button onClick={handleCheckIn} disabled={isCheckingIn} className="w-full col-span-2 bg-[#009696] hover:bg-[#007a7a] text-white justify-center">
                                     {isCheckingIn ? '...' : <><MapPin size={16} className="mr-2"/> Check-in Visita</>}
                                </Button>
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Mail size={16} className="text-gray-400 mt-0.5" />
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                        <p className="text-sm text-gray-800 truncate">{selectedClient.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Teléfono</p>
                                        <p className="text-sm text-gray-800">{selectedClient.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Dirección</p>
                                        <p className="text-sm text-gray-800">{selectedClient.address || 'No registrada'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-4">
                                <p className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
                                    <FileText size={12}/> Notas Internas
                                </p>
                                <p className="text-sm text-yellow-900 italic">
                                    {selectedClient.notes || "Sin notas adicionales."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* PANEL 2: ACTIVITY & TASKS (Center) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px] lg:h-full">
                        <div className="flex border-b">
                            <button 
                                onClick={() => setCentralTab('tasks')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${centralTab === 'tasks' ? 'border-[#009696] text-[#009696]' : 'border-transparent text-gray-500'}`}
                            >
                                <Briefcase size={16} className="inline mr-2"/> Tareas ({clientTasks.length})
                            </button>
                            <button 
                                onClick={() => setCentralTab('history')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${centralTab === 'history' ? 'border-[#009696] text-[#009696]' : 'border-transparent text-gray-500'}`}
                            >
                                <History size={16} className="inline mr-2"/> Historial
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
                            {centralTab === 'tasks' ? (
                                <div className="space-y-3">
                                    <Button onClick={() => onCreateTaskForClient(selectedClient)} className="w-full mb-2 bg-white text-[#009696] border border-[#009696] hover:bg-[#009696]/5 shadow-sm">
                                        <Plus size={16} className="mr-2"/> Nueva Tarea
                                    </Button>
                                    {clientTasks.map(task => (
                                        <TaskCard 
                                            key={task.id} 
                                            task={task} 
                                            onToggle={onToggleStatus} 
                                            onDelete={() => {}} 
                                            onEdit={onEditTask} 
                                            onUpdateSubtask={() => {}}
                                        />
                                    ))}
                                    {clientTasks.length === 0 && (
                                        <div className="text-center py-10 opacity-50">
                                            <CheckCircle2 size={48} className="mx-auto mb-2 text-gray-300"/>
                                            <p className="text-gray-500">No hay tareas pendientes.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {clientActivities.length === 0 && <p className="text-gray-400 text-sm text-center italic mt-10">Sin actividad registrada.</p>}
                                    {clientActivities.map(activity => (
                                        <div key={activity.id} className="relative pl-6 border-l-2 border-gray-200 pb-2">
                                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${activity.type === 'check_in' ? 'bg-[#009696]' : activity.type === 'call' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                            <div className="text-xs text-gray-500 mb-1 flex justify-between">
                                                <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-semibold text-gray-800 text-sm capitalize flex items-center gap-2">
                                                {activity.type === 'check_in' && <MapPin size={14}/>}
                                                {activity.type === 'call' && <Phone size={14}/>}
                                                {activity.type.replace('_', ' ')}
                                            </h4>
                                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm border border-gray-100 mt-2">
                                                {activity.notes}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PANEL 3: POLICIES & DOCUMENTS (Right) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-fit lg:h-full lg:overflow-y-auto">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Shield size={16} className="text-[#009696]"/> Pólizas ({clientPolicies.length})
                            </h3>
                            <button className="text-xs text-[#009696] font-medium hover:underline">+ Añadir</button>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            {clientPolicies.map(policy => (
                                <div 
                                    key={policy.id} 
                                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                                    onClick={() => setExpandedPolicyId(expandedPolicyId === policy.id ? null : policy.id)}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${policy.status === 'Activa' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    
                                    {/* Policy Header */}
                                    <div className="flex justify-between items-start mb-1 pl-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{policy.insurer}</span>
                                        <span className={`text-[10px] px-1.5 rounded ${policy.status === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{policy.status}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-sm pl-2">{policy.alias || policy.branch}</h4>
                                    <p className="text-xs text-gray-500 pl-2 mb-2 font-mono">{policy.number}</p>
                                    
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-2 pl-2">
                                        <div className="text-xs">
                                            <span className="text-gray-400">Renueva: </span>
                                            <span className="font-medium text-gray-700">{new Date(policy.renewalDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 flex items-center">{policy.premium} <Euro size={10}/></div>
                                    </div>

                                    {/* Expanded Policy Details */}
                                    {expandedPolicyId === policy.id && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 pl-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                                            
                                            {/* Payment Info */}
                                            <div className="bg-gray-50 p-2 rounded text-xs">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Pago:</span>
                                                    <span className="font-medium">{policy.paymentFrequency} ({policy.paymentMethod})</span>
                                                </div>
                                                {policy.iban && (
                                                    <div className="flex justify-between items-center group/iban">
                                                        <span className="text-gray-500">IBAN:</span>
                                                        <span className="font-mono text-gray-600">...{policy.iban.slice(-4)}</span>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(policy.iban || ''); }}
                                                            className="text-gray-400 hover:text-[#009696] p-0.5"
                                                            title="Copiar IBAN"
                                                        >
                                                            <Copy size={12}/>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Specific Policy Documents */}
                                            {policy.documents && policy.documents.length > 0 && (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Documentos Póliza</span>
                                                    {policy.documents.map(doc => (
                                                        <div key={doc.id} className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100 text-xs">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <FileText size={10} className="text-[#009696]" />
                                                                <span className="truncate max-w-[100px]">{doc.name}</span>
                                                            </div>
                                                            <Download size={12} className="text-gray-400"/>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {clientPolicies.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">Sin pólizas activas.</p>
                            )}
                        </div>

                        {/* General Documents Section */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
                             <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-sm">
                                <FileText size={16} className="text-gray-500"/> Documentación Gral.
                            </h3>
                            <div className="space-y-2">
                                {selectedClient.documents?.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="bg-red-100 text-red-600 p-1 rounded text-[10px] font-bold uppercase">{doc.type}</span>
                                            <span className="truncate max-w-[120px]">{doc.name}</span>
                                        </div>
                                        <button className="text-gray-400 hover:text-[#009696]">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(!selectedClient.documents || selectedClient.documents.length === 0) && (
                                     <p className="text-gray-400 text-xs italic">Sin documentos generales.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        ) : (
             <div className="hidden lg:flex flex-1 items-center justify-center flex-col text-gray-400 bg-gray-50 rounded-xl border border-gray-200 border-dashed m-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User size={40} className="opacity-20"/>
                </div>
                <h3 className="text-lg font-medium text-gray-600">Vista 360º del Cliente</h3>
                <p className="text-sm mt-2 max-w-xs text-center">Selecciona un cliente de la cartera para ver su perfil, tareas, historial y pólizas.</p>
            </div>
        )}
    </div>
  );
};