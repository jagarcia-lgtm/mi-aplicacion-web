
import React, { useState, useRef, useEffect } from 'react';
import { User, UserSettings } from '../types';
import { 
    X, User as UserIcon, Settings, CreditCard, Palette, Sidebar, Zap, 
    Bell, Lock, Shield, Upload, Trash2, CheckCircle2, AlertTriangle, 
    Smartphone, Mail, Chrome, Facebook, Apple, Calendar
} from 'lucide-react';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

type SettingsTab = 'account' | 'general' | 'subscription' | 'theme' | 'sidebar' | 'notifications' | 'productivity';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  
  // Account State
  const [name, setName] = useState(user.name);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.twoFactorEnabled || false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // General State
  const [generalSettings, setGeneralSettings] = useState<UserSettings>({
      language: user.settings?.language || 'es',
      startPage: user.settings?.startPage || 'myDay',
      timezone: user.settings?.timezone || 'Europe/Madrid',
      timeFormat: user.settings?.timeFormat || '13:00',
      dateFormat: user.settings?.dateFormat || 'DD-MM-YYYY',
      weekStart: user.settings?.weekStart || 'monday',
      nextWeekPreset: user.settings?.nextWeekPreset || 'monday',
      weekendPreset: user.settings?.weekendPreset || 'saturday'
  });
  
  // Danger Zone State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setName(user.name);
        setIs2FAEnabled(user.twoFactorEnabled || false);
        setGeneralSettings({
            language: user.settings?.language || 'es',
            startPage: user.settings?.startPage || 'myDay',
            timezone: user.settings?.timezone || 'Europe/Madrid',
            timeFormat: user.settings?.timeFormat || '13:00',
            dateFormat: user.settings?.dateFormat || 'DD-MM-YYYY',
            weekStart: user.settings?.weekStart || 'monday',
            nextWeekPreset: user.settings?.nextWeekPreset || 'monday',
            weekendPreset: user.settings?.weekendPreset || 'saturday'
        });
        setDeleteStep(0);
        setIsDeleting(false);
        setActiveTab('account');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
      setAvatarPreview(null);
  };

  const handleDeleteAccountStart = () => {
      setIsDeleting(true);
      setDeleteStep(1);
  };

  const handleDeleteConfirm = () => {
      alert("Cuenta eliminada (Simulación). Serás redirigido...");
      onClose();
      window.location.reload(); 
  };

  const handleGeneralChange = (field: keyof UserSettings, value: string) => {
      setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
      // In a real app, you would call an API here.
      // For now, we just close the modal as "saved" locally (React state resets on refresh unless persisted)
      // If we wanted to persist to the mock user object in memory:
      if (user) {
          user.settings = generalSettings;
          user.name = name;
          // save logic...
      }
      onClose();
  };

  // Helper for Sidebar Items
  const SidebarItem = ({ id, icon, label }: { id: SettingsTab; icon: React.ReactNode; label: string }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        {icon}
        {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        {/* Main Modal Container */}
        <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Sidebar (Left) */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Configuración</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     <div className="px-3 py-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={14}/>
                            <input type="text" placeholder="Buscador" className="w-full bg-white border border-gray-200 rounded-lg pl-8 py-1.5 text-sm focus:ring-2 focus:ring-[#009696] outline-none" />
                        </div>
                     </div>
                     <SidebarItem id="account" icon={<UserIcon size={18}/>} label="Cuenta" />
                     <SidebarItem id="general" icon={<Settings size={18}/>} label="General" />
                     <SidebarItem id="subscription" icon={<CreditCard size={18}/>} label="Suscripción" />
                     <SidebarItem id="theme" icon={<Palette size={18}/>} label="Tema" />
                     <SidebarItem id="sidebar" icon={<Sidebar size={18}/>} label="Barra lateral" />
                     <SidebarItem id="productivity" icon={<Zap size={18}/>} label="Productividad" />
                     <SidebarItem id="notifications" icon={<Bell size={18}/>} label="Notificaciones" />
                </div>
            </div>

            {/* Content Area (Right) */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
                    <X size={24} />
                </button>

                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'account' && (
                        <div className="max-w-2xl mx-auto space-y-10 pb-20">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-6">Cuenta</h2>

                            {/* Avatar Section */}
                            <div className="flex items-start gap-6">
                                <div className="relative group">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white font-bold overflow-hidden ${user.color || 'bg-gray-400'}`}>
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <h3 className="font-medium text-gray-900">Foto</h3>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Cambiar foto
                                        </button>
                                        <button 
                                            onClick={handleRemoveAvatar}
                                            className="px-4 py-2 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Eliminar foto
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange} 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Elige una foto de hasta 4 MB.<br/>
                                        La foto de tu avatar será pública.
                                    </p>
                                </div>
                            </div>

                            {/* Name Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-900">Nombre</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#009696] outline-none"
                                />
                                <div className="text-right text-xs text-gray-400">{name.length}/255</div>
                            </div>

                            {/* Email Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-900">Email</label>
                                <div className="text-gray-600 mb-2">{user.email}</div>
                                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors">
                                    Cambiar email
                                </button>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-900">Contraseña</label>
                                <div>
                                    <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors">
                                        Cambiar contraseña
                                    </button>
                                </div>
                            </div>

                             {/* 2FA Section */}
                             <div className="space-y-2 pt-4 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-900">Autenticación de dos factores</label>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is2FAEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        {is2FAEnabled ? 'Activado' : 'La autenticación de dos factores en tu cuenta no está habilitada.'}
                                    </span>
                                </div>
                            </div>

                            {/* Connected Accounts */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-900">Cuentas conectadas</label>
                                <p className="text-sm text-gray-500 mb-4">Puedes iniciar sesión en GestiBrok con tus cuentas de:</p>
                                
                                <div className="space-y-2">
                                    <ConnectedAccountRow icon={<Chrome size={18}/>} provider="Google" isConnected={user.connectedAccounts?.includes('google')} />
                                    <ConnectedAccountRow icon={<Apple size={18}/>} provider="Apple" isConnected={user.connectedAccounts?.includes('apple')} />
                                    <ConnectedAccountRow icon={<Facebook size={18}/>} provider="Facebook" isConnected={user.connectedAccounts?.includes('facebook')} />
                                    <ConnectedAccountRow icon={<Mail size={18}/>} provider="Outlook 365" isConnected={user.connectedAccounts?.includes('outlook')} />
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="space-y-4 pt-8 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-900">Eliminar cuenta</label>
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-red-800 font-medium">Zona de peligro</p>
                                        <p className="text-xs text-red-600 mt-1">
                                            La eliminación de tu cuenta es algo permanente. Perderás el acceso a toda tu información enseguida.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleDeleteAccountStart}
                                        className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-bold shadow-sm transition-colors"
                                    >
                                        Eliminar cuenta
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="max-w-2xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">General</h2>

                            {/* General Group */}
                            <div className="space-y-6">
                                {/* Language */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-900">Idioma</label>
                                    <select 
                                        value={generalSettings.language}
                                        onChange={(e) => handleGeneralChange('language', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none"
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>

                                {/* Start Page */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-900">Inicio</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-gray-500" size={16}/>
                                        <select 
                                            value={generalSettings.startPage}
                                            onChange={(e) => handleGeneralChange('startPage', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none appearance-none bg-white"
                                        >
                                            <option value="myDay">Hoy</option>
                                            <option value="upcoming">Próximo</option>
                                            <option value="inbox">Bandeja de entrada</option>
                                            <option value="dashboard">Dashboard</option>
                                            <option value="clients">Cartera de Clientes</option>
                                        </select>
                                        <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date and Time Group */}
                            <div className="space-y-6 pt-2">
                                <h3 className="text-sm font-bold text-gray-900">Fecha y hora</h3>

                                {/* Timezone */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500">Zona horaria</label>
                                    <select 
                                        value={generalSettings.timezone}
                                        onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none bg-white"
                                    >
                                        <option value="Europe/Madrid">(GMT+01:00) Madrid</option>
                                        <option value="Europe/London">(GMT+00:00) London</option>
                                        <option value="America/New_York">(GMT-05:00) New York</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>

                                {/* Time Format */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500">Formato de hora</label>
                                    <select 
                                        value={generalSettings.timeFormat}
                                        onChange={(e) => handleGeneralChange('timeFormat', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none bg-white"
                                    >
                                        <option value="13:00">13:00</option>
                                        <option value="1:00 PM">1:00 PM</option>
                                    </select>
                                </div>

                                {/* Date Format */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500">Formato de fecha</label>
                                    <select 
                                        value={generalSettings.dateFormat}
                                        onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none bg-white"
                                    >
                                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                        <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                {/* Week Start */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500">Inicio de la semana</label>
                                    <select 
                                        value={generalSettings.weekStart}
                                        onChange={(e) => handleGeneralChange('weekStart', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none bg-white"
                                    >
                                        <option value="monday">Lunes</option>
                                        <option value="sunday">Domingo</option>
                                    </select>
                                    <p className="text-xs text-gray-400">Comienza tu semana en este día en las vistas de Próximo y de Calendario.</p>
                                </div>

                                {/* Next Week */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500">Próxima semana</label>
                                    <select 
                                        value={generalSettings.nextWeekPreset}
                                        onChange={(e) => handleGeneralChange('nextWeekPreset', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none bg-white"
                                    >
                                        <option value="monday">Lunes</option>
                                        <option value="sunday">Domingo</option>
                                    </select>
                                    <p className="text-xs text-gray-400">Tus tareas se pospondrán para este día cuando uses "Próxima semana".</p>
                                </div>

                                {/* Weekend */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500">Fin de semana</label>
                                    <select 
                                        value={generalSettings.weekendPreset}
                                        onChange={(e) => handleGeneralChange('weekendPreset', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#009696] focus:border-[#009696] outline-none bg-white"
                                    >
                                        <option value="saturday">Sábado</option>
                                        <option value="friday">Viernes</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'account' && activeTab !== 'general' && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <Settings size={48} className="mb-4 opacity-20" />
                             <h3 className="text-lg font-medium text-gray-600">Configuración: {activeTab}</h3>
                             <p className="text-sm">Esta sección está en desarrollo.</p>
                        </div>
                    )}
                </div>

                {/* Footer for General / other tabs if needed */}
                <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3 z-10">
                     <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                     >
                        Cancelar
                     </button>
                     <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                     >
                        Actualizar
                     </button>
                </div>
            </div>

            {/* Delete Account Modal Overlay (Step 2) */}
            {isDeleting && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle size={24} />
                            <h2 className="text-xl font-bold">¿Eliminar tu cuenta?</h2>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Estás a punto de eliminar permanentemente tu cuenta y todos los datos asociados (tareas, clientes, pólizas). 
                            <br/><br/>
                            <strong>Esta acción no se puede deshacer.</strong>
                        </p>
                        
                        <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 mb-6">
                            Por seguridad, exporta tus datos antes de continuar. <a href="#" className="text-[#009696] underline">Exportar datos</a>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsDeleting(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                            >
                                Sí, eliminar mi cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const ConnectedAccountRow = ({ icon, provider, isConnected }: { icon: React.ReactNode, provider: string, isConnected?: boolean }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
            <div className="text-gray-500">{icon}</div>
            <span className="text-sm font-medium text-gray-700">{provider}</span>
        </div>
        {isConnected ? (
             <div className="flex items-center gap-2">
                 <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Conectado</span>
                 <button className="text-xs text-gray-400 hover:text-red-500 underline ml-2">Desconectar</button>
             </div>
        ) : (
            <button className="text-xs text-[#009696] font-medium hover:underline">Conectar</button>
        )}
    </div>
);

// Helper for search icon since it wasn't imported in previous files sometimes
const SearchIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
