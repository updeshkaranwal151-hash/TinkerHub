
import React from 'react';
import { Component } from '../types.ts';
import { WarningIcon } from './Icons.tsx';

interface StudentComponentCardProps {
  component: Component;
}

const StudentComponentCard: React.FC<StudentComponentCardProps> = ({ component }) => {
  const availableQuantity = component.totalQuantity - (component.issuedTo || []).reduce((acc, issue) => acc + (issue.quantity || 1), 0);
  const availabilityPercentage = component.totalQuantity > 0 ? (availableQuantity / component.totalQuantity) * 100 : 0;
  
  let progressBarColor = 'bg-green-500';
  if (availabilityPercentage < 50) progressBarColor = 'bg-yellow-500';
  if (availabilityPercentage < 25) progressBarColor = 'bg-red-500';

  const isLowStock = component.lowStockThreshold != null && availableQuantity <= component.lowStockThreshold;

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-700 transition-all duration-300 hover:border-sky-500/50 hover:-translate-y-1">
      <img
        className="w-full h-40 object-cover"
        src={component.imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image'}
        alt={component.name}
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="text-xs text-indigo-400 font-semibold uppercase">{component.category}</p>
          <h3 className="text-lg font-bold text-white mt-1">{component.name}</h3>
        </div>

        <div className="mt-4 mb-2">
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              {isLowStock && <WarningIcon className="text-yellow-400" />}
              In Stock
            </span>
            <span>{availableQuantity} / {component.totalQuantity}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
            <div
              className={`${progressBarColor} h-2 rounded-full`}
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Issue button removed as per request */}
      </div>
    </div>
  );
};

export default StudentComponentCard;
