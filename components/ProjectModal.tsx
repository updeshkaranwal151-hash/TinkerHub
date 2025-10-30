import React, { useState, useEffect, useMemo } from 'react';
import { Project, RequiredComponent, Component } from '../types.ts';
import { SearchIcon } from './Icons.tsx';

interface ProjectModalProps {
  onClose: () => void;
  onSave: (project: any) => void;
  existingProject?: Project | null;
  availableComponents: Component[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSave, existingProject, availableComponents }) => {
  const [name, setName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [componentSearch, setComponentSearch] = useState('');

  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setStudentName(existingProject.studentName);
      setDescription(existingProject.description);
      setSelectedComponents(new Set(existingProject.requiredComponents.map(c => c.componentId)));
    }
  }, [existingProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentName.trim()) {
      alert('Project name and your name are required.');
      return;
    }

    // FIX: Use spread syntax to convert Set to Array to ensure proper type inference.
    const requiredComponents: RequiredComponent[] = [...selectedComponents].map(id => {
      const component = availableComponents.find(c => c.id === id);
      return { componentId: id, componentName: component?.name || 'Unknown Component' };
    });

    const projectData = {
      name,
      studentName,
      description,
      requiredComponents,
    };

    if (existingProject) {
      onSave({ ...existingProject, ...projectData });
    } else {
      onSave(projectData);
    }
  };
  
  const handleComponentToggle = (componentId: string) => {
    const newSelection = new Set(selectedComponents);
    if (newSelection.has(componentId)) {
      newSelection.delete(componentId);
    } else {
      newSelection.add(componentId);
    }
    setSelectedComponents(newSelection);
  };

  const filteredComponents = useMemo(() => {
    return availableComponents.filter(c => 
      c.name.toLowerCase().includes(componentSearch.toLowerCase())
    );
  }, [availableComponents, componentSearch]);

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-sky-400">{existingProject ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto pr-2">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-300">Project Name</label>
            <input type="text" id="projectName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
          </div>

          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-slate-300">Your Name</label>
            <input type="text" id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Project Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Required Components</label>
            <div className="relative mb-2">
                <input
                    type="text"
                    placeholder="Search components..."
                    value={componentSearch}
                    onChange={e => setComponentSearch(e.target.value)}
                    className="w-full bg-slate-900 border-slate-600 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-600 rounded-lg max-h-48 overflow-y-auto p-3 space-y-2">
              {filteredComponents.length > 0 ? filteredComponents.map(component => (
                <label key={component.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedComponents.has(component.id)}
                    onChange={() => handleComponentToggle(component.id)}
                    className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-600"
                  />
                  <span className="text-slate-200">{component.name}</span>
                </label>
              )) : (
                <p className="text-slate-500 text-center text-sm p-4">No components found.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-slate-800/80 -mx-2 px-2 pb-1">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">
              {existingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
