
import React from 'react';

interface HeaderProps {
    onAddComponent: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddComponent }) => {
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
      </div>
    </header>
  );
};

export default Header;
