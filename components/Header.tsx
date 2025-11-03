
import React from 'react';
import { PlusIcon, TrashIcon, ShareIcon, ImportIcon, ExportIcon, SunIcon, MoonIcon } from './Icons.tsx';
import { Logo } from './Logo.tsx';

interface HeaderProps {
    onAddComponent: () => void;
    onAddProject: () => void;
    onClearAll: () => void;
    onOpenShareModal: () => void;
    onOpenImportModal: () => void;
    onExport: () => void;
    viewMode: 'inventory' | 'projects';
    isLightMode: boolean;
    onToggleLightMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onAddComponent, onAddProject, onClearAll, onOpenShareModal, viewMode, 
    onOpenImportModal, onExport, isLightMode, onToggleLightMode
}) => {
  const isInventoryView = viewMode === 'inventory';

  return (
    <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-slate-700/50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                TinkerHub
              </span>
            </h1>
            <p className="text-sm text-slate-400">The ATL Lab Inventory Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
            <button
                onClick={onToggleLightMode}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition duration-300"
                aria-label={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
                {isLightMode ? <MoonIcon /> : <SunIcon />}
            </button>
          <button
            onClick={isInventoryView ? onAddComponent : onAddProject}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
          >
            <PlusIcon />
            <span className="hidden sm:inline">{isInventoryView ? 'Add Component' : 'Add Project'}</span>
          </button>
          <div className="hidden md:flex items-center gap-2">
            <button
                onClick={onOpenImportModal}
                disabled={!isInventoryView}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Import from CSV"
            >
                <ImportIcon />
                <span>Import</span>
            </button>
            <button
                onClick={onExport}
                disabled={!isInventoryView}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export to CSV"
            >
                <ExportIcon />
                <span>Export</span>
            </button>
          </div>
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-sky-600/30"
            aria-label="Share this app"
          >
            <ShareIcon />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={onClearAll}
            disabled={!isInventoryView}
            className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-red-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear all components"
          >
            <TrashIcon />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;