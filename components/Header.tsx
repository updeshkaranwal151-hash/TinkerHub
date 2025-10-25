
import React from 'react';
import { PlusIcon, TrashIcon, ShareIcon } from './Icons.tsx';

interface HeaderProps {
    onAddComponent: () => void;
    onClearAll: () => void;
    onOpenShareModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddComponent, onClearAll, onOpenShareModal }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-slate-700/50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
              TinkerHub
            </span>
          </h1>
          <p className="text-sm text-slate-400">The ATL Lab Inventory Manager</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onAddComponent}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add Component</span>
          </button>
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
            className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-red-800/30"
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