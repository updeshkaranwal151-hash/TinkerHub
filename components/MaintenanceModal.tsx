import React, { useState } from 'react';
import { Component, MaintenanceRecord } from '../types.ts';
import { MaintenanceIcon, TrashIcon, PlusIcon } from './Icons.tsx';

interface MaintenanceModalProps {
  component: Component | null;
  onClose: () => void;
  onToggleMaintenance: (componentId: string) => void;
  onAddLog: (componentId: string, notes: string) => void;
  onDeleteLog: (componentId: string, logId: string) => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ component, onClose, onToggleMaintenance, onAddLog, onDeleteLog }) => {
  const [newLogNotes, setNewLogNotes] = useState('');

  if (!component) return null;

  const handleAddLog = () => {
    if (newLogNotes.trim()) {
      onAddLog(component.id, newLogNotes.trim());
      setNewLogNotes('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <div className="flex items-center gap-3 mb-4">
            <MaintenanceIcon />
            <div>
                 <h2 className="text-2xl font-bold text-sky-400">Maintenance Mode</h2>
                 <p className="text-slate-300">Component: <span className="font-semibold text-white">{component.name}</span></p>
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-200">Maintenance Status</h3>
                        <p className={`text-sm font-bold ${component.isUnderMaintenance ? 'text-orange-400' : 'text-green-400'}`}>
                            {component.isUnderMaintenance ? 'ACTIVE - Component cannot be issued' : 'INACTIVE - Component is issuable'}
                        </p>
                    </div>
                     <label htmlFor={`maintenance-toggle-${component.id}`} className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                id={`maintenance-toggle-${component.id}`} 
                                className="sr-only" 
                                checked={component.isUnderMaintenance} 
                                onChange={() => onToggleMaintenance(component.id)} 
                            />
                            <div className="block bg-slate-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${component.isUnderMaintenance ? 'translate-x-6 bg-orange-400' : 'bg-green-400'}`}></div>
                        </div>
                    </label>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-slate-200 mb-2">Add New Log Entry</h3>
                <div className="flex items-stretch gap-2">
                    <textarea 
                        value={newLogNotes}
                        onChange={(e) => setNewLogNotes(e.target.value)}
                        placeholder="e.g., Replaced the sensor head."
                        rows={2}
                        className="flex-grow bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"
                    />
                    <button onClick={handleAddLog} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md self-end">
                        <PlusIcon />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-slate-200 mb-2">Maintenance History</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {component.maintenanceLog && component.maintenanceLog.length > 0 ? (
                        component.maintenanceLog.map(log => (
                            <div key={log.id} className="bg-slate-700/50 p-3 rounded-lg flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-300">{log.notes}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(log.date).toLocaleString()}</p>
                                </div>
                                <button onClick={() => onDeleteLog(component.id, log.id)} className="p-1.5 text-slate-400 hover:text-red-500 flex-shrink-0">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-slate-500 italic py-4">No maintenance history recorded.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-700">
            <button onClick={onClose} className="py-2 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
