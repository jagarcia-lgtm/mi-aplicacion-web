
import React from 'react';
import { MOCK_USERS } from '../services/auth';
import { UserAvatar } from './UserAvatar';
import { Lock, ShieldCheck, ChevronRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (userId: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Elementos Decorativos de Fondo (Mesh Gradient) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#009696]/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF2F76]/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-[#009696]/5 blur-[80px] pointer-events-none"></div>

      {/* Grid de puntos sutil para textura profesional */}
      {/* Fix: Removed invalid 'size' property from style object which caused TypeScript error */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#009696 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Icono Principal */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#009696] blur-2xl opacity-20 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-[#009696] to-[#007a7a] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-6 transition-transform duration-500 cursor-default">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Gesti<span className="text-[#009696]">Brok</span></h1>
          <p className="text-gray-500 mt-3 font-medium">Gestión Inteligente para Corredurías</p>
        </div>

        {/* Tarjeta de Acceso */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white p-8 animate-in fade-in zoom-in duration-500">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">Bienvenido de nuevo</h2>
            <p className="text-sm text-gray-500 mt-1">Selecciona un perfil de demostración para acceder al panel.</p>
          </div>

          <div className="space-y-4">
            {MOCK_USERS.map((user, idx) => (
              <button
                key={user.id}
                onClick={() => onLogin(user.id)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#009696] hover:bg-[#009696]/5 hover:shadow-md transition-all group text-left animate-in fade-in slide-in-from-right-4"
              >
                <div className="relative">
                  <UserAvatar userId={user.id} size="lg" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#009696] transition-colors">{user.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#009696] group-hover:translate-x-1 transition-all" size={20} />
              </button>
            ))}
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            <div className="h-px w-8 bg-gray-100"></div>
            <span>Demostración · Sin autenticación real</span>
            <div className="h-px w-8 bg-gray-100"></div>
          </div>
        </div>

        {/* Footer simple */}
        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} GestiBrok v1.3.0
        </p>
      </div>
    </div>
  );
};
