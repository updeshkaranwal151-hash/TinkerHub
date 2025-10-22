
import React, { useState } from 'react';
import { Component } from '../types';

interface IssueComponentModalProps {
  component: Component | null;
  onClose: () => void;
  onIssue: (componentId: string, studentName: string) => void;
}

const IssueComponentModal: React.FC<IssueComponentModalProps> = ({ component, onClose, onIssue }) => {
  const [studentName, setStudentName] = useState('');

  if (!component) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
        alert("Please enter the student's name.");
        return;
    }
    onIssue(component.id, studentName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
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
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Jane Doe"
              autoFocus
            />
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
