import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, ShareIcon, ImportIcon, ExportIcon, SunIcon, MoonIcon, MoreIcon, ScanIcon, DatabaseIcon, ProjectIcon } from './Icons.tsx';
import { Logo } from './Logo.tsx';

interface HeaderProps {
    onAddComponent: () => void;
    onOpenScanner: () => void;
    onClearAll: () => void;
    onOpenShareModal: () => void;
    onOpenImportModal: () => void;
    onExport: () => void;
    isLightMode: boolean;
    onToggleLightMode: () => void;
    currentView: 'inventory' | 'projects';
    onSetView: (view: 'inventory' | 'projects') => void;
}

const ViewSwitcher: React.FC<{ currentView: 'inventory' | 'projects'; onSetView: (view: 'inventory' | 'projects') => void; }> = ({ currentView, onSetView }) => (
    <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
        <button
            onClick={() => onSetView('inventory')}
            className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${currentView === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
            <DatabaseIcon className="h-4 w-4" /> Inventory
        </button>
        <button
            onClick={() => onSetView('projects')}
            className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${currentView === 'projects' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
            <ProjectIcon className="h-4 w-4" /> Project Hub
        </button>
    </div>
);


const Header: React.FC<HeaderProps> = ({ 
    onAddComponent, onClearAll, onOpenShareModal, 
    onOpenImportModal, onExport, isLightMode, onToggleLightMode, onOpenScanner,
    currentView, onSetView
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode; }> = ({ onClick, children }) => (
      <button
          onClick={onClick}
          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
      >
          {children}
      </button>
  );


  return (
    <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-slate-700/50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10 sm:h-12 sm:w-12" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                TinkerHub
              </span>
            </h1>
            <p className="hidden sm:block text-sm text-slate-400">The ATL Lab Inventory Manager</p>
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
            <ViewSwitcher currentView={currentView} onSetView={onSetView} />

            {currentView === 'inventory' && (
              <>
                <button
                    onClick={onOpenScanner}
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition duration-300 shadow-lg shadow-sky-600/30"
                    title="Scan Component with AI"
                >
                    <ScanIcon />
                    <span className="hidden sm:inline">Scan</span>
                </button>
                <button
                  onClick={onAddComponent}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
                >
                  <PlusIcon />
                  <span className="hidden sm:inline">Add</span>
                  <span className="hidden lg:inline"> Component</span>
                </button>
              </>
            )}
          
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
                onClick={onOpenImportModal}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                aria-label="Import from CSV"
            >
                <ImportIcon />
                <span className="hidden lg:inline">Import</span>
            </button>
            <button
                onClick={onExport}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                aria-label="Export to CSV"
            >
                <ExportIcon />
                <span className="hidden lg:inline">Export</span>
            </button>
             <button
              onClick={onOpenShareModal}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition"
              aria-label="Share this app"
            >
              <ShareIcon />
              <span className="hidden lg:inline">Share</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-red-800/30"
              aria-label="Clear all components"
            >
              <TrashIcon />
              <span className="hidden lg:inline">Clear All</span>
            </button>
          </div>

          {/* Mobile Dropdown */}
          <div ref={menuRef} className="relative md:hidden">
              <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition duration-300" aria-label="More options">
                  <MoreIcon />
              </button>
              {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30">
                      <div className="py-1">
                          <MenuButton onClick={() => { onSetView('inventory'); setIsMenuOpen(false); }}>
                              <DatabaseIcon className="h-4 w-4" /> Inventory
                          </MenuButton>
                          <MenuButton onClick={() => { onSetView('projects'); setIsMenuOpen(false); }}>
                              <ProjectIcon className="h-4 w-4" /> Project Hub
                          </MenuButton>
                          <div className="my-1 border-t border-slate-700" />
                          <MenuButton onClick={() => { onOpenShareModal(); setIsMenuOpen(false); }}>
                              <ShareIcon /> Share App
                          </MenuButton>
                          <div className="my-1 border-t border-slate-700" />
                          <MenuButton onClick={() => { onOpenImportModal(); setIsMenuOpen(false); }}>
                              <ImportIcon /> Import CSV
                          </MenuButton>
                          <MenuButton onClick={() => { onExport(); setIsMenuOpen(false); }}>
                              <ExportIcon /> Export CSV
                          </MenuButton>
                          <div className="my-1 border-t border-slate-700" />
                          <MenuButton onClick={() => { onClearAll(); setIsMenuOpen(false); }}>
                              <TrashIcon /> Clear All
                          </MenuButton>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;