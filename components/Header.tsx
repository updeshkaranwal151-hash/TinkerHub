
import React from 'react';
import { PlusIcon, TrashIcon } from './Icons';

interface HeaderProps {
    onAddComponent: () => void;
    onClearAll: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddComponent, onClearAll }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Tinker
            <span className="text-sky-400">Hub</span>
          </h1>
          <p className="text-sm text-slate-400">The ATL Lab Inventory Manager</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onAddComponent}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add Component</span>
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