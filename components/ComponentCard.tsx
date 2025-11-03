

import React from 'react';
import { Component, IssueRecord, LinkType } from '../types.ts';
import { EditIcon, MinusIcon, ReturnIcon, TrashIcon, WarningIcon, DatasheetIcon, TutorialIcon, LinkIcon, ProjectIcon, MaintenanceIcon } from './Icons.tsx';

interface ComponentCardProps {
  component: Component;
  index: number;
  onOpenIssueModal: (component: Component) => void;
  onReturnIssue: (componentId: string, issueId: string) => void;
  onDelete: (id: string) => void;
  onOpenEditModal: (component: Component) => void;
  onToggleAvailability: (component: Component) => void;
  onOpenMaintenanceModal: (component: Component) => void;
}

const LinkTypeIcon: React.FC<{type: LinkType}> = ({ type }) => {
    switch(type) {
        case LinkType.DATASHEET: return <DatasheetIcon />;
        case LinkType.TUTORIAL: return <TutorialIcon />;
        case LinkType.PROJECT: return <ProjectIcon />;
        default: return <LinkIcon />;
    }
};

const ComponentCard: React.FC<ComponentCardProps> = ({ component, index, onOpenIssueModal, onReturnIssue, onDelete, onOpenEditModal, onToggleAvailability, onOpenMaintenanceModal }) => {
  const availableQuantity = component.totalQuantity - component.issuedTo.length;
  const availabilityPercentage = component.totalQuantity > 0 ? (availableQuantity / component.totalQuantity) * 100 : 0;
  
  let progressBarColor = 'bg-green-500';
  if (availabilityPercentage < 50) progressBarColor = 'bg-yellow-500';
  if (availabilityPercentage < 25) progressBarColor = 'bg-red-500';

  const isAvailable = component.isAvailable;
  const isLowStock = component.lowStockThreshold != null && availableQuantity <= component.lowStockThreshold;

  const cardClasses = [
    "relative group bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out flex flex-col border",
    "card-enter-animation hover:shadow-sky-500/10",
    component.isUnderMaintenance ? "border-orange-500/50" : "border-slate-700 hover:border-sky-500/50",
    !isAvailable ? "opacity-60 filter grayscale" : "",
  ].join(" ");

  return (
    <div 
        className={cardClasses}
        style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      {component.isUnderMaintenance && (
        <div className="absolute top-0 left-0 w-full bg-orange-500/80 text-white text-xs font-bold text-center py-1 z-10">
          UNDER MAINTENANCE
        </div>
      )}
      <button 
        onClick={() => onDelete(component.id)}
        className="absolute top-3 right-3 z-10 p-2 bg-slate-900/50 rounded-full text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
        aria-label={`Delete ${component.name}`}
      >
        <TrashIcon />
      </button>

      <img
        className="w-full h-48 object-cover"
        src={component.imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image'}
        alt={component.name}
      />
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">{component.category}</p>
          <h3 className="text-xl font-bold text-white mt-1">{component.name}</h3>
          <p className="text-slate-400 text-sm mt-2 h-16 overflow-y-auto">{component.description}</p>
        </div>

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

        <div className="mt-4">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              {isLowStock && !component.isUnderMaintenance && <WarningIcon className="text-yellow-400 animate-pulse" />}
              In Stock
            </span>
            <span>{availableQuantity} / {component.totalQuantity}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
            <div
              className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-700 flex flex-col gap-3">
            <div className="flex items-center justify-between mt-1">
                <span className={`text-sm font-medium ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {isAvailable ? 'Available for Issue' : 'Not Available'}
                </span>
                <label htmlFor={`toggle-${component.id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id={`toggle-${component.id}`} className="sr-only" checked={isAvailable} onChange={() => onToggleAvailability(component)} />
                        <div className="block bg-slate-600 w-14 h-8 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isAvailable ? 'translate-x-6 bg-green-400' : ''}`}></div>
                    </div>
                </label>
            </div>
            
            <div className="flex gap-2">
                 <button 
                    onClick={() => onOpenIssueModal(component)}
                    disabled={availableQuantity <= 0 || !isAvailable || component.isUnderMaintenance}
                    className="flex-1 flex items-center justify-center gap-1 text-sm bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition duration-200"
                    aria-label={`Issue ${component.name}`}
                >
                    <MinusIcon /> Issue
                </button>
                <button
                    onClick={() => onOpenEditModal(component)}
                    className="p-2.5 flex items-center justify-center text-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-200"
                    aria-label={`Edit ${component.name}`}
                >
                    <EditIcon />
                </button>
                <button
                    onClick={() => onOpenMaintenanceModal(component)}
                    className="p-2.5 flex items-center justify-center text-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-200"
                    aria-label={`Maintenance for ${component.name}`}
                >
                    <MaintenanceIcon />
                </button>
            </div>

            <div className="mt-2">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Issue Log</h4>
                {component.issuedTo.length > 0 ? (
                    <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
                        {component.issuedTo.map((issue) => (
                            <div key={issue.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                                <div className="text-xs">
                                    <p className="font-medium text-slate-200">{issue.studentName}</p>
                                    <p className="text-slate-400">{new Date(issue.issuedDate).toLocaleDateString()}</p>

                                </div>
                                <button
                                    onClick={() => onReturnIssue(component.id, issue.id)}
                                    className="flex items-center justify-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded-md transition duration-200"
                                    aria-label={`Return component issued to ${issue.studentName}`}
                                >
                                    <ReturnIcon /> Return
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 italic">All components are available.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;
