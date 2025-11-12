import React, { useState, useMemo } from 'react';
import { Project, Component } from '../types.ts';
import { PlusIcon, ProjectIcon, SearchIcon } from './Icons.tsx';
import ProjectDashboard from './ProjectDashboard.tsx';

interface ProjectHubProps {
  projects: Project[];
  inventoryComponents: Component[];
  onOpenProjectModal: () => void;
  onEditProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({ projects, inventoryComponents, onOpenProjectModal, onEditProject, onUpdateProject, onDeleteProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);
  
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);
  
  // Auto-select the first project if none is selected and projects exist
  useState(() => {
      if (!selectedProjectId && filteredProjects.length > 0) {
          setSelectedProjectId(filteredProjects[0].id);
      }
  });


  const handleUpdateProjectAndKeepSelection = (updatedProject: Project) => {
      onUpdateProject(updatedProject);
  };
  
  const handleDeleteProjectAndClearSelection = (projectId: string) => {
      onDeleteProject(projectId);
      if(selectedProjectId === projectId){
          setSelectedProjectId(filteredProjects.length > 1 ? filteredProjects.find(p => p.id !== projectId)!.id : null);
      }
  };


  return (
    <div className="flex-grow flex -mx-4 -mb-8 md:-mx-8 md:-mb-8">
      {/* Sidebar */}
      <aside className="project-hub-sidebar w-full max-w-xs flex-shrink-0 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Project Hub</h2>
            <button onClick={onOpenProjectModal} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition" aria-label="Create New Project">
              <PlusIcon />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
        </div>
        <nav className="flex-grow overflow-y-auto p-2 custom-scrollbar">
          <ul>
            {filteredProjects.map(project => (
              <li key={project.id}>
                <button
                  onClick={() => setSelectedProjectId(project.id)}
                  aria-selected={selectedProjectId === project.id}
                  className="w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors duration-200 border-2 border-transparent hover:bg-slate-700/50 aria-selected:bg-slate-700 aria-selected:border-indigo-500"
                >
                  <img src={project.projectLogoUrl || 'https://placehold.co/100x100/1e293b/94a3b8/png?text=Logo'} alt="logo" className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-slate-600"/>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-200 truncate">{project.name}</p>
                    <p className="text-xs text-slate-400 truncate">{project.teamName}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow bg-slate-900/50 overflow-y-auto custom-scrollbar">
        {selectedProject ? (
          <ProjectDashboard 
            key={selectedProject.id}
            project={selectedProject}
            inventoryComponents={inventoryComponents}
            onEdit={onEditProject}
            onUpdate={handleUpdateProjectAndKeepSelection}
            onDelete={handleDeleteProjectAndClearSelection}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
             <div className="flex justify-center mb-4 text-sky-500/50">
                <ProjectIcon className="h-24 w-24" />
             </div>
             <h3 className="text-2xl font-bold text-slate-200">
                {projects.length > 0 ? "Select a project" : "No projects yet!"}
             </h3>
             <p className="text-slate-400 mt-2 max-w-sm">
                {projects.length > 0 ? "Choose a project from the list to view its details." : "Create your first project to get started and bring your ideas to life."}
             </p>
             <button
                onClick={onOpenProjectModal}
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/30 transform hover:scale-105"
             >
                <PlusIcon />
                Create Your First Project
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectHub;