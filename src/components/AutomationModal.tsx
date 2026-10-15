import React, { useState, useEffect } from 'react';
import { AutomationRule } from '../types';
import { X, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAutomationRules, saveAutomationRules } from '../services/firestore';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRules(getAutomationRules());
    }
  }, [isOpen]);

  const toggleRule = (id: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(updatedRules);
    saveAutomationRules(updatedRules);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b bg-[#009696]/5 rounded-t-xl">
          <div className="flex items-center gap-2 text-[#009696]">
            <Zap size={20} className="text-[#009696]" />
            <h2 className="text-lg font-bold">Automatizaciones</h2>
          </div>
          <button onClick={onClose} className="text-[#009696]/50 hover:text-[#009696]">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Activa reglas inteligentes para gestionar tus tareas automáticamente.
          </p>

          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="mr-4">
                  <h3 className="font-medium text-gray-900">{rule.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className={`flex-shrink-0 transition-colors ${rule.enabled ? 'text-[#009696]' : 'text-gray-400'}`}
                >
                  {rule.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};