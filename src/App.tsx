
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, Priority, Subtask, User, Client, EnergyLevel } from './types';
import { subscribeToTasks, createTask, updateTask, deleteTask, getGlobalTags, addGlobalTag, deleteGlobalTag } from './services/firestore';
import { getCurrentUser, login, logout } from './services/auth';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { QuickAddModal } from './components/QuickAddModal';
import { CalendarView } from './components/CalendarView';
import { MyDayView } from './components/MyDayView';
import { InsuranceDashboard } from './components/InsuranceDashboard';
import { AutomationModal } from './components/AutomationModal';
import { AuthScreen } from './components/AuthScreen';
import { KanbanView } from './components/KanbanView'; 
import { InboxView } from './components/InboxView'; 
import { Client360View } from './components/Client360View';
import { ListView } from './components/ListView'; 
import { HomeView } from './components/HomeView'; 
import { Sidebar } from './components/Sidebar'; 
import { SettingsModal } from './components/SettingsModal';
import { TaskReminders } from './components/TaskReminders';
import { Loader2, X, Menu, Search, Filter, LayoutTemplate, List, KanbanSquare, Calendar as CalendarIcon, SlidersHorizontal, ArrowLeft, Sparkles, Download } from 'lucide-react';

type AppView = 'home' | 'dashboard' | 'list' | 'calendar' | 'myDay' | 'kanban' | 'inbox' | 'clients' | 'upcoming' | 'assigned_me' | 'assigned_others' | 'supervisor_me' | 'no_date' | 'priority_high' | 'search_results' | 'energy_high' | 'energy_medium' | 'energy_low' | 'home_active' | 'home_overdue' | 'home_completed' | 'home_upcoming_48h' | 'home_upcoming_7d' | string;

type ViewType = 'list' | 'board' | 'calendar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [globalTags, setGlobalTags] = useState<string[]>(getGlobalTags());
  const [appView, setAppView] = useState<AppView>('myDay'); 
  const [currentFilterVal, setCurrentFilterVal] = useState<string>(''); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('list'); 
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser?.settings?.startPage) setAppView(currentUser.settings.startPage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) setIsViewMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      const normalizedTasks = updatedTasks.map(t => ({
        ...t,
        status: t.status || TaskStatus.TODO,
        tags: t.tags || [],
        subtasks: t.subtasks || [],
        assignedTo: t.assignedTo || [],
        comments: t.comments || [],
        customFields: t.customFields || [],
        dependencies: t.dependencies || [],
        auditLog: t.auditLog || []
      }));
      setTasks(normalizedTasks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = (userId: string) => {
    const loggedUser = login(userId);
    setUser(loggedUser);
    if (loggedUser?.settings?.startPage) setAppView(loggedUser.settings.startPage);
  };

  const handleLogout = () => { logout(); setUser(null); };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>) => {
    try { const result = await createTask(newTaskData); if (result.message) showToast(result.message); } catch (e) { alert("Error al crear la tarea."); }
  };
  
  const handleCreateInMyDay = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dataWithMyDay = { ...newTaskData, myDayDate: todayStr };
    try { const result = await createTask(dataWithMyDay); if (result.message) showToast(result.message); } catch (e) { alert("Error al crear la tarea."); }
  };

  const handleUpdateTask = async (updatedData: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'comments'>) => {
    if (!editingTask) return;
    try { const result = await updateTask(editingTask.id, updatedData); setEditingTask(null); if (result.message) showToast(result.message); } catch (e) { alert("Error al actualizar la tarea"); }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este trámite?')) {
      try { await deleteTask(id); } catch (e) { alert("Error al eliminar la tarea"); }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isBlocked = task.status === TaskStatus.BLOCKED;
    if (isBlocked && !window.confirm("Esta tarea está bloqueada. ¿Quieres marcarla como completada?")) return;
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
    try { const result = await updateTask(id, { status: newStatus }); if (result.message) showToast(result.message); } catch (e) { console.error(e); }
  };

  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
     try { await updateTask(taskId, { status: newStatus }); } catch (e) { console.error(e); }
  };

  const handleUpdateSubtasks = async (taskId: string, updatedSubtasks: Subtask[]) => {
    try { await updateTask(taskId, { subtasks: updatedSubtasks }); } catch (e) { console.error(e); }
  };

  const handleMoveTask = async (taskId: string, newDate: string) => {
    try { await updateTask(taskId, { dueDate: newDate }); showToast('Tarea reprogramada'); } catch (e) { console.error(e); }
  };

  const handleToggleMyDay = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newMyDayDate = task.myDayDate === todayStr ? undefined : todayStr;
    try { await updateTask(taskId, { myDayDate: newMyDayDate }); showToast(newMyDayDate ? "Añadido a Hoy" : "Eliminado de Hoy"); } catch (e) { console.error(e); }
  };

  const handleAssignToMe = async (taskId: string) => {
      if (!user) return;
      try { await updateTask(taskId, { assignedTo: [user.id] }); showToast("Tarea asignada a ti"); } catch (e) { console.error(e); }
  };

  const handleAddGlobalTag = (name: string) => {
    const newTags = addGlobalTag(name);
    setGlobalTags(newTags);
    showToast(`Etiqueta "${name}" añadida`);
  };

  const handleDeleteGlobalTag = (name: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la etiqueta "${name}" de la lista global?`)) {
      const newTags = deleteGlobalTag(name);
      setGlobalTags(newTags);
      showToast(`Etiqueta "${name}" eliminada`);
    }
  };

  const openCreateModal = (prefillDate?: string, prefillClient?: Client) => {
    setEditingTask(prefillDate ? { dueDate: prefillDate } as any : 
                   prefillClient ? { clientId: prefillClient.id, clientName: prefillClient.name, clientPhone: prefillClient.phone, insurer: 'Desconocido' } as any : null);
    setIsFormOpen(true);
  };

  const openEditModal = (task: Task) => { setEditingTask(task); setIsFormOpen(true); };

  const handleNavigate = (view: string, filterVal?: string) => {
      setAppView(view);
      if (filterVal) setCurrentFilterVal(filterVal);
      if (view !== 'search_results') setSearchQuery('');
  };

  const handleSearch = (query: string) => { setSearchQuery(query); if (query.trim()) setAppView('search_results'); };

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    let filtered = [...tasks];
    if (appView === 'search_results' && searchQuery) {
        const q = searchQuery.toLowerCase();
        return filtered.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.clientName?.toLowerCase().includes(q) || t.policyNumber?.toLowerCase().includes(q));
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const isInPeriod = (t: Task, period: string) => {
        if (!t.dueDate) return false;
        if (period === 'today') return t.dueDate === todayStr;
        return false;
    };
    switch (appView) {
        case 'myDay': filtered = filtered.filter(t => t.myDayDate === todayStr); break;
        case 'upcoming': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate && t.dueDate > todayStr); break;
        case 'assigned_me': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && (t.assignedTo.includes(user.id) || t.assignedTo.length === 0)); break;
        case 'supervisor_me': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && t.supervisorId === user.id); break;
        case 'priority_high': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && (t.priority === Priority.VERY_HIGH || t.priority === Priority.HIGH)); break;
        case 'home_active': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && (isInPeriod(t, currentFilterVal) || (t.dueDate && t.dueDate < todayStr))); break;
        case 'home_overdue': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate && t.dueDate < todayStr); break;
        case 'home_completed': filtered = filtered.filter(t => t.status === TaskStatus.COMPLETED && isInPeriod(t, currentFilterVal)); break;
        case 'inbox': filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && (!t.dueDate || t.assignedTo.length === 0)); break;
        default: 
             if (appView.startsWith('module_')) filtered = filtered.filter(t => t.module === currentFilterVal && t.status !== TaskStatus.COMPLETED);
             else if (appView.startsWith('tag_')) filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED && t.tags.includes(currentFilterVal));
             break;
    }
    if (showFilters) {
      if (filterPriority !== 'all') filtered = filtered.filter(t => t.priority === filterPriority);
      if (filterTag !== 'all') filtered = filtered.filter(t => t.tags?.includes(filterTag));
    }
    return filtered;
  }, [tasks, appView, user, searchQuery, currentFilterVal, showFilters, filterPriority, filterTag]);

  const getViewTitle = () => {
      const periodLabel = currentFilterVal === 'today' ? 'Hoy' : 'Periodo';
      switch(appView) {
          case 'home': return 'Inicio';
          case 'home_active': return `Tareas Activas (${periodLabel})`;
          case 'home_overdue': return 'Tareas Vencidas';
          case 'home_completed': return `Tareas Completadas (${periodLabel})`;
          case 'myDay': return 'Hoy';
          case 'upcoming': return 'Próximo';
          case 'priority_high': return 'Prioridad Crítica';
          case 'search_results': return `Resultados: "${searchQuery}"`;
          case 'dashboard': return 'Dashboard';
          case 'clients': return 'Cartera de Clientes';
          default: return currentFilterVal || 'Tareas';
      }
  };

  const isFixedLayoutView = ['home', 'dashboard', 'clients'].includes(appView);
  const isFromHomeView = appView.startsWith('home_');
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
      <Sidebar 
        user={user} 
        isOpen={isSidebarOpen} 
        onCloseMobile={() => setIsSidebarOpen(false)} 
        currentView={appView} 
        onNavigate={handleNavigate} 
        tasks={tasks} 
        onLogout={handleLogout} 
        availableTags={globalTags} 
        onSearch={handleSearch} 
        searchQuery={searchQuery} 
        onQuickAdd={() => setIsQuickAddOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onEditTask={openEditModal}
        onAddTag={handleAddGlobalTag}
        onDeleteTag={handleDeleteGlobalTag}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="flex flex-col border-b border-gray-100 bg-white z-20">
            <TaskReminders tasks={tasks} onOpen={openEditModal} />
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <button aria-label="Abrir menú" onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600"><Menu size={24} /></button>
                    {isFromHomeView && (<button onClick={() => setAppView('home')} className="p-2 -ml-2 text-gray-400 hover:text-[#009696] rounded-full group"><ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /></button>)}
                    <h1 className="font-bold text-xl text-gray-800 truncate max-w-[200px] sm:max-w-md">{getViewTitle()}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <a 
                        href={`${import.meta.env.BASE_URL}gestibrok_portable.zip`}
                        download="gestibrok_portable.zip"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#009696] hover:bg-[#007f7f] rounded-md shadow-sm transition-all"
                        title="Descargar código completo del proyecto (ZIP)"
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">Descargar ZIP</span>
                    </a>
                    {!isFixedLayoutView && (
                        <div className="relative" ref={viewMenuRef}>
                            <button onClick={() => setIsViewMenuOpen(!isViewMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200"><LayoutTemplate size={16} /><span className="hidden sm:inline">Vista</span></button>
                            {isViewMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"><button onClick={() => { setViewType('list'); setIsViewMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${viewType === 'list' ? 'text-[#009696] bg-[#009696]/5' : ''}`}><List size={16} /> Lista</button><button onClick={() => { setViewType('board'); setIsViewMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${viewType === 'board' ? 'text-[#009696] bg-[#009696]/5' : ''}`}><KanbanSquare size={16} /> Panel</button><button onClick={() => { setViewType('calendar'); setIsViewMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${viewType === 'calendar' ? 'text-[#009696] bg-[#009696]/5' : ''}`}><CalendarIcon size={16} /> Calendario</button></div>
                            )}
                        </div>
                    )}
                    {!['home', 'dashboard', 'clients'].includes(appView) && (<button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-md border ${showFilters ? 'bg-[#009696]/10 text-[#009696]' : ''}`}><SlidersHorizontal size={18} /></button>)}
                </div>
            </div>
            {showFilters && (
                <div className="px-6 pb-4 flex flex-wrap items-center gap-3"><select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="text-sm border border-gray-200 rounded-md py-1.5 px-3 focus:ring-[#009696] outline-none"><option value="all">Todas las Prioridades</option><option value={Priority.VERY_HIGH}>Muy Urgente</option><option value={Priority.HIGH}>Alta</option><option value={Priority.MEDIUM}>Media</option><option value={Priority.LOW}>Baja</option></select><select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="text-sm border border-gray-200 rounded-md py-1.5 px-3 focus:ring-[#009696] outline-none"><option value="all">Todas las Etiquetas</option>{globalTags.map(tag => (<option key={tag} value={tag}>{tag}</option>))}</select></div>
            )}
        </header>
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 scroll-smooth w-full max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400"><Loader2 className="h-8 w-8 animate-spin mb-2" /><p>Sincronizando...</p></div>
          ) : (
            <>
               {appView === 'home' && <HomeView tasks={tasks} user={user} onNavigate={handleNavigate} />}
               {appView === 'dashboard' && <InsuranceDashboard tasks={tasks} />}
               {appView === 'clients' && (<Client360View tasks={tasks} onEditTask={openEditModal} onToggleStatus={handleToggleStatus} onCreateTaskForClient={(c) => openCreateModal(undefined, c)} />)}
               {!isFixedLayoutView && (
                   <>
                        {viewType === 'list' && (
                            <>
                                {appView === 'myDay' ? (<MyDayView tasks={tasks} userName={user.name} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTask} onEdit={openEditModal} onUpdateSubtask={handleUpdateSubtasks} onToggleMyDay={handleToggleMyDay} onCreateInMyDay={() => openCreateModal(new Date().toISOString().split('T')[0])} />) 
                                : appView === 'inbox' ? (<InboxView tasks={tasks} userId={user.id} onEditTask={openEditModal} onAssignToMe={handleAssignToMe} onScheduleToday={(id) => handleMoveTask(id, new Date().toISOString().split('T')[0])} />) 
                                : (<ListView tasks={filteredTasks} onEditTask={openEditModal} onToggleStatus={handleToggleStatus} onDeleteTask={handleDeleteTask} />)}
                            </>
                        )}
                        {viewType === 'board' && (<KanbanView tasks={filteredTasks} onMoveStatus={handleMoveStatus} onEditTask={openEditModal} />)}
                        {viewType === 'calendar' && (<CalendarView tasks={filteredTasks} onMoveTask={handleMoveTask} onEditTask={openEditModal} onCreateTask={(date) => openCreateModal(date)} />)}
                   </>
               )}
            </>
          )}
        </main>
      </div>
      <TaskForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={(data) => { if (appView === 'myDay' && !editingTask) handleCreateInMyDay(data); else editingTask ? handleUpdateTask(data) : handleCreateTask(data); }} initialData={editingTask} allTasks={tasks} />
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSave={handleCreateTask} />
      <AutomationModal isOpen={isAutomationOpen} onClose={() => setIsAutomationOpen(false)} />
      {user && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />}
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
              <Sparkles size={18} className="text-[#009696]"/>
              <span className="text-sm font-medium">{toastMessage}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
