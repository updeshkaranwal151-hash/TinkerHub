import React, { useState, useEffect } from 'react';
import { Component } from '../types.ts';

interface IssueComponentModalProps {
  component: Component | null;
  onClose: () => void;
  onIssue: (componentId: string, studentName: string, quantity: number) => void;
  studentName?: string;
}

const IssueComponentModal: React.FC<IssueComponentModalProps> = ({ component, onClose, onIssue, studentName: prefilledStudentName }) => {
  const [studentName, setStudentName] = useState(prefilledStudentName || '');
  const [quantity, setQuantity] = useState('1');
  
  useEffect(() => {
    if (prefilledStudentName) {
      setStudentName(prefilledStudentName);
    }
  }, [prefilledStudentName]);

  if (!component) return null;

  const availableQuantity = component.totalQuantity - (component.issuedTo || []).reduce((acc, issue) => acc + (issue.quantity || 1), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
        alert("Please enter the student's name.");
        return;
    }
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0 || numQuantity > availableQuantity) {
        alert(`Please enter a valid quantity between 1 and ${availableQuantity}.`);
        return;
    }
    onIssue(component.id, studentName.trim(), numQuantity);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-sky-400">Issue Component</h2>
        <p className="text-slate-300 mb-6">Component: <span className="font-semibold text-white">{component.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-slate-300">Student Name</label>
            <input 
              type="text" 
              id="studentName" 
              value={studentName} 
              onChange={e => setStudentName(e.target.value)} 
              required
              readOnly={!!prefilledStudentName}
              className={`mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${!!prefilledStudentName ? 'bg-slate-800 cursor-not-allowed' : ''}`}
              placeholder="e.g., Jane Doe"
              autoFocus={!prefilledStudentName}
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-300">Quantity to Issue</label>
            <input 
              type="number" 
              id="quantity" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              required 
              min="1"
              max={availableQuantity}
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus={!!prefilledStudentName}
            />
            <p className="text-xs text-slate-400 mt-1">Available: {availableQuantity}</p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-lg shadow-yellow-600/30 transition duration-300">Issue Component</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueComponentModal;
