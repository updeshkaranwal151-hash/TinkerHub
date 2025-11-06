

import React from 'react';
import { Component, LinkType } from '../types.ts';
import { MinusIcon, WarningIcon, DatasheetIcon, TutorialIcon, LinkIcon, ProjectIcon, MaintenanceIcon } from './Icons.tsx';

interface PublicComponentViewModalProps {
  component: Component | null;
  onClose: () => void;
  onOpenIssueModal: (component: Component) => void;
}

const LinkTypeIcon: React.FC<{type: LinkType}> = ({ type }) => {
    switch(type) {
        case LinkType.DATASHEET: return <DatasheetIcon />;
        case LinkType.TUTORIAL: return <TutorialIcon />;
        case LinkType.PROJECT: return <ProjectIcon />;
        default: return <LinkIcon />;
    }
};

const PublicComponentViewModal: React.FC<PublicComponentViewModalProps> = ({ component, onClose, onOpenIssueModal }) => {
  if (!component) return null;

  const availableQuantity = component.totalQuantity - (component.issuedTo || []).reduce((acc, issue) => acc + (issue.quantity || 1), 0);
  const isAvailableForIssue = component.isAvailable && availableQuantity > 0 && !component.isUnderMaintenance;
  const isLowStock = component.lowStockThreshold != null && availableQuantity <= component.lowStockThreshold;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        
        <img
            className="w-full h-48 object-contain rounded-lg bg-slate-700/50 mb-4"
            src={component.imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image'}
            alt={component.name}
        />

        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">{component.category}</p>
        <h2 className="text-3xl font-bold mt-1 text-sky-400">{component.name}</h2>
        <p className="text-slate-400 text-sm mt-2 max-h-24 overflow-y-auto">{component.description}</p>
        
        {component.links && component.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
                {component.links.map((link, i) => (
                    <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1 px-2.5 rounded-full transition-colors"
                        title={link.type}
                    >
                        <LinkTypeIcon type={link.type} />
                        {link.type}
                    </a>
                ))}
            </div>
        )}

        {component.isUnderMaintenance && (
          <div className="mt-4 p-3 bg-orange-900/50 border border-orange-700 rounded-lg flex items-center gap-3">
            <MaintenanceIcon />
            <div>
              <h3 className="font-bold text-orange-300">Under Maintenance</h3>
              <p className="text-sm text-orange-400">This component is currently unavailable for issue.</p>
            </div>
          </div>
        )}

        <div className="mt-6 py-4 border-y border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
                <span>Total Quantity:</span>
                <span className="font-bold text-white">{component.totalQuantity}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
                 <span className="flex items-center gap-1.5">
                    {isLowStock && !component.isUnderMaintenance && <WarningIcon className="text-yellow-400 animate-pulse" />}
                    Available for Issue:
                </span>
                <span className="font-bold text-white">{availableQuantity}</span>
            </div>
             <div className="flex justify-between items-center text-slate-300">
                <span>Status:</span>
                <span className={`font-bold ${component.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {component.isAvailable ? 'Available' : 'Temporarily Unavailable'}
                </span>
            </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => onOpenIssueModal(component)}
            disabled={!isAvailableForIssue}
            className="w-full flex items-center justify-center gap-2 text-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-yellow-600/30"
          >
            <MinusIcon /> Issue This Component
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicComponentViewModal;