import React from 'react';
import { Project } from '../types.ts';
import { EditIcon, TrashIcon, ProjectIcon } from './Icons.tsx';

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onEdit, onDelete }) => {
  return (
    <div 
      className="relative group bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out flex flex-col border border-slate-700 card-enter-animation hover:border-indigo-500/50 hover:shadow-indigo-500/10"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">
              {project.studentName}
            </p>
            <h3 className="text-xl font-bold text-white mt-1">{project.name}</h3>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(project)}
              className="p-2 bg-slate-700/80 rounded-full text-slate-300 hover:bg-sky-600 hover:text-white"
              aria-label={`Edit ${project.name}`}
            >
              <EditIcon />
            </button>
            <button 
              onClick={() => onDelete(project.id)}
              className="p-2 bg-slate-700/80 rounded-full text-slate-300 hover:bg-red-600 hover:text-white"
              aria-label={`Delete ${project.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-sm mt-2 flex-grow h-16 overflow-y-auto pr-2">
          {project.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Required Components ({project.requiredComponents.length})</h4>
          {project.requiredComponents.length > 0 ? (
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
              {project.requiredComponents.map((req) => (
                <div key={req.componentId} className="flex items-center text-sm text-slate-300 bg-slate-700/50 p-1.5 rounded-md">
                  <span>- {req.componentName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No components have been added to this project yet.</p>
          )}
        </div>
        <div className="text-right text-xs text-slate-500 mt-4">
          Created on {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
