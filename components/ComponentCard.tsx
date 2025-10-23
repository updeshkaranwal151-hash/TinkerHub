import React from 'react';
import { Component, IssueRecord } from '../types';
import { EditIcon, MinusIcon, ReturnIcon, TrashIcon } from './Icons';

interface ComponentCardProps {
  component: Component;
  onOpenIssueModal: (component: Component) => void;
  onReturnIssue: (componentId: string, issueId: string) => void;
  onDelete: (id: string) => void;
  onOpenEditModal: (component: Component) => void;
  onToggleAvailability: (component: Component) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, onOpenIssueModal, onReturnIssue, onDelete, onOpenEditModal, onToggleAvailability }) => {
  const availableQuantity = component.totalQuantity - component.issuedTo.length;
  const availabilityPercentage = component.totalQuantity > 0 ? (availableQuantity / component.totalQuantity) * 100 : 0;
  
  let progressBarColor = 'bg-green-500';
  if (availabilityPercentage < 50) progressBarColor = 'bg-yellow-500';
  if (availabilityPercentage < 25) progressBarColor = 'bg-red-500';

  const isAvailable = component.isAvailable;

  return (
    <div className={`relative group bg-slate-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out flex flex-col ${!isAvailable ? 'opacity-60 filter grayscale' : ''}`}>
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
          <p className="text-slate-400 text-sm mt-2 h-20 overflow-y-auto">{component.description}</p>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>Available</span>
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
            <button 
                onClick={() => onOpenIssueModal(component)}
                disabled={availableQuantity <= 0 || !isAvailable}
                className="w-full flex items-center justify-center gap-1 text-sm bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition duration-200"
                aria-label={`Issue ${component.name}`}
            >
                <MinusIcon /> Issue
            </button>
            
            <div className="flex gap-2">
                <button
                    onClick={() => onOpenEditModal(component)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-200"
                >
                    <EditIcon /> Edit
                </button>
                <button
                    onClick={() => onToggleAvailability(component)}
                    className={`flex-1 flex items-center justify-center gap-1 text-sm ${isAvailable ? 'bg-red-800 hover:bg-red-900' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 px-3 rounded-lg transition duration-200`}
                >
                    {isAvailable ? 'Not Available' : 'Make Available'}
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