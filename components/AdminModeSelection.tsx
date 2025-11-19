
import React from 'react';
import { DatabaseIcon, EyeIcon, UserIcon } from './Icons.tsx';
import { Logo } from './Logo.tsx';

interface AdminModeSelectionProps {
    onSelect: (mode: 'control' | 'analytics') => void;
    onLogout: () => void;
}

const AdminModeSelection: React.FC<AdminModeSelectionProps> = ({ onSelect, onLogout }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 text-center mb-10">
                <div className="flex justify-center mb-4">
                    <Logo className="h-20 w-20" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Select an interface to proceed</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 z-10 w-full max-w-4xl">
                {/* Control Panel Option */}
                <button 
                    onClick={() => onSelect('control')}
                    className="flex-1 group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/20 text-left"
                >
                    <div className="absolute top-4 right-4 p-2 bg-slate-700/50 rounded-lg group-hover:bg-sky-500/20 transition-colors">
                        <DatabaseIcon className="h-6 w-6 text-slate-400 group-hover:text-sky-400" />
                    </div>
                    <div className="mt-4">
                        <div className="w-16 h-16 bg-sky-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <DatabaseIcon className="h-8 w-8 text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Control Panel</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Access the visual inventory manager. View components as cards, issue items, manage maintenance, and edit details directly.
                        </p>
                        <p className="mt-4 text-sky-400 text-sm font-semibold group-hover:translate-x-2 transition-transform flex items-center gap-1">
                            Open Panel &rarr;
                        </p>
                    </div>
                </button>

                {/* Analytics Panel Option */}
                <button 
                    onClick={() => onSelect('analytics')}
                    className="flex-1 group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 text-left"
                >
                    <div className="absolute top-4 right-4 p-2 bg-slate-700/50 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                        <EyeIcon className="h-6 w-6 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <div className="mt-4">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <EyeIcon className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Analytics Panel</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            View detailed statistics, usage reports, student issue logs, project submissions, and administrative settings.
                        </p>
                        <p className="mt-4 text-indigo-400 text-sm font-semibold group-hover:translate-x-2 transition-transform flex items-center gap-1">
                            View Analytics &rarr;
                        </p>
                    </div>
                </button>
            </div>

            <button 
                onClick={onLogout}
                className="mt-12 text-slate-500 hover:text-white transition-colors flex items-center gap-2"
            >
                <UserIcon className="h-4 w-4" /> Logout
            </button>
        </div>
    );
};

export default AdminModeSelection;
