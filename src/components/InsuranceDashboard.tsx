
import React, { useMemo } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { Shield, AlertTriangle, FileText, CheckCircle2, TrendingUp, Users, Activity, Wallet, Download, PieChart } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { Button } from './Button';
import { MOCK_USERS } from '../services/auth';

interface InsuranceDashboardProps {
  tasks: Task[];
}

export const InsuranceDashboard: React.FC<InsuranceDashboardProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    // Active tasks are anything NOT completed
    const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
    
    // Categorization Logic based on Task Type
    const siniestros = activeTasks.filter(t => t.taskType === 'Siniestro');
    const renovaciones = activeTasks.filter(t => t.taskType === 'Renovación');
    const altas = activeTasks.filter(t => t.taskType === 'Alta Póliza');
    const cobros = activeTasks.filter(t => t.taskType === 'Cobros');
    
    // Status Logic
    const siniestrosEnCurso = siniestros.filter(t => t.processStatus === 'En curso' || t.processStatus === 'Peritaje');
    const docPendiente = activeTasks.filter(t => t.processStatus === 'Pendiente doc');
    
    const urgentTasks = activeTasks.filter(t => t.isUrgent);
    
    // Due This Week
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    const dueThisWeek = activeTasks.filter(t => t.dueDate >= todayStr && t.dueDate <= nextWeekStr);

    return {
        totalActive: activeTasks.length,
        siniestrosCount: siniestrosEnCurso.length,
        renovacionesCount: renovaciones.length,
        altasCount: altas.length,
        cobrosCount: cobros.length,
        urgentCount: urgentTasks.length,
        docPendienteCount: docPendiente.length,
        dueThisWeekCount: dueThisWeek.length
    };
  }, [tasks]);

  // Team Workload Logic
  const teamWorkload = useMemo(() => {
    return MOCK_USERS.map(user => {
        const userTasks = tasks.filter(t => t.assignedTo.includes(user.id) && t.status !== TaskStatus.COMPLETED);
        const urgentCount = userTasks.filter(t => t.isUrgent).length;
        return {
            user,
            count: userTasks.length,
            urgent: urgentCount
        };
    }).sort((a, b) => b.count - a.count);
  }, [tasks]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ["ID", "Título", "Tipo", "Cliente", "Póliza", "Estado", "Prioridad", "Fecha Límite", "Asignado"];
    const rows = tasks.map(t => [
        t.id,
        `"${t.title}"`,
        t.taskType || "",
        `"${t.clientName || ""}"`,
        t.policyNumber || "",
        t.status,
        t.priority,
        t.dueDate,
        t.assignedTo.join(";")
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_correduria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Panel de Control - Correduría</h2>
                <span className="text-sm text-gray-500">Actualizado ahora mismo</span>
            </div>
            <Button onClick={handleExportCSV} variant="secondary" size="sm" className="hidden sm:flex">
                <Download size={16} className="mr-2" />
                Exportar CSV
            </Button>
        </div>

        {/* Top Cards - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Siniestros En Curso */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-[#FF2F76]/10 text-[#FF2F76] rounded-lg">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Siniestros Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.siniestrosCount}</p>
                    <p className="text-xs text-[#FF2F76] font-medium">En gestión</p>
                </div>
            </div>

            {/* Renovaciones */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-[#009696]/10 text-[#009696] rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Renovaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.renovacionesCount}</p>
                     <p className="text-xs text-[#009696] font-medium">Pendientes revisión</p>
                </div>
            </div>
            
            {/* Producción / Altas */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <Shield size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Nueva Producción</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.altasCount}</p>
                    <p className="text-xs text-green-500 font-medium">Pólizas en trámite</p>
                </div>
            </div>

            {/* Urgentes / Impagos */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-[#FF2F76]/10 text-[#FF2F76] rounded-lg">
                    <Activity size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Urgentes / Impagos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.urgentCount}</p>
                     <p className="text-xs text-[#FF2F76] font-medium">Atención inmediata</p>
                </div>
            </div>
        </div>

        {/* Detailed Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Status Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-slate-500" /> Estado Administrativo
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pendiente Documentación</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">{stats.docPendienteCount}</span>
                    </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${Math.min((stats.docPendienteCount / (stats.totalActive || 1)) * 100, 100)}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600">Vencen esta semana</span>
                         <span className="bg-[#FF2F76]/10 text-[#FF2F76] px-2 py-0.5 rounded-full text-xs font-bold">{stats.dueThisWeekCount}</span>
                    </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#FF2F76] h-1.5 rounded-full" style={{ width: `${Math.min((stats.dueThisWeekCount / (stats.totalActive || 1)) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Team Workload (New in Phase 8) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-slate-500" /> Carga del Equipo
                </h3>
                <div className="space-y-3">
                    {teamWorkload.map(({user, count, urgent}) => (
                        <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserAvatar userId={user.id} size="sm" />
                                <span className="text-sm text-gray-700">{user.name.split(' ')[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {urgent > 0 && <span className="text-xs text-[#FF2F76] font-bold">{urgent} urg.</span>}
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">{count} tareas</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Goal Banner */}
            <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-semibold mb-2">Objetivos</h3>
                    <p className="opacity-80 text-sm mb-6">Ratio de calidad y eficiencia mensual.</p>
                </div>
                <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="text-xs opacity-75 uppercase">Calidad</span>
                        <span className="block text-xl font-bold">{Math.max(0, 100 - (stats.siniestrosCount * 5))}%</span>
                    </div>
                     <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/5 flex justify-between items-center">
                         <span className="text-xs opacity-75 uppercase">Eficiencia</span>
                        <span className="block text-xl font-bold">{Math.max(0, 100 - (stats.cobrosCount * 10))}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
