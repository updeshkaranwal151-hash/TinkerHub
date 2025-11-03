import React from 'react';
import { Project } from '../types.ts';
import { EditIcon, TrashIcon, ProjectIcon, TeamIcon, FileIcon } from './Icons.tsx';
import { FaCube } from 'react-icons/fa'; // Placeholder, assuming react-icons can be used or an equivalent SVG is created.

const ComponentIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
)


interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onView: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onEdit, onDelete, onView }) => {
  return (
    <div 
      className="group bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out flex flex-col border border-slate-700 card-enter-animation hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="flex-grow p-5">
        <div className="flex items-start gap-4">
          <button onClick={() => onView(project)} className="flex-shrink-0">
            <img 
              src={project.projectLogoUrl || 'https://placehold.co/100x100/1e293b/94a3b8/png?text=Logo'} 
              alt={`${project.name} Logo`}
              className="w-20 h-20 rounded-lg object-cover bg-slate-700 border-2 border-slate-600 group-hover:border-indigo-500 transition-colors"
            />
          </button>
          <div className="flex-grow">
            <button onClick={() => onView(project)} className="text-left w-full">
                <h3 className="text-xl font-bold text-white truncate group-hover:text-sky-400 transition-colors">{project.name}</h3>
                <p className="text-sm text-slate-400 truncate">{project.teamName}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(project.projectDate).toLocaleDateString()}</p>
            </button>
          </div>
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="p-2 bg-slate-700/80 rounded-full text-slate-300 hover:bg-sky-600 hover:text-white"
              aria-label={`Edit ${project.name}`}
            >
              <EditIcon />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              className="p-2 bg-slate-700/80 rounded-full text-slate-300 hover:bg-red-600 hover:text-white"
              aria-label={`Delete ${project.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-3 h-10 overflow-hidden text-ellipsis">
          {project.description || 'No description available.'}
        </p>
      </div>
      <div className="px-5 py-3 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-end gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Team Members">
              <TeamIcon className="h-4 w-4" />
              <span>{project.teamMembers.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Required Components">
              <ComponentIcon className="h-4 w-4" />
              <span>{project.requiredComponents.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Attachments">
              <FileIcon className="h-4 w-4" />
              <span>{project.attachments.length}</span>
          </div>
      </div>
    </div>
  );
};

export default ProjectCard;