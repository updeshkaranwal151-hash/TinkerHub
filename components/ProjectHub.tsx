import React, { useState, useMemo } from 'react';
import { Project, Component, ProjectStatus, ProjectTask } from '../types.ts';
import ProjectDashboard from './ProjectDashboard.tsx';
import ProjectModal from './ProjectModal.tsx';
import { PlusIcon, ProjectIcon, SearchIcon } from './Icons.tsx';

type NewProjectData = Omit<Project, 'id' | 'createdAt' | 'attachments' | 'requiredComponents'>;

interface ProjectHubProps {
  projects: Project[];
  inventoryComponents: Component[];
  onAddProject: (projectData: NewProjectData) => void;
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({ projects, inventoryComponents, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const selectedProject = useMemo(() => {
    const findProject = (id: string | null) => projects.find(p => p.id === id);
    let project = findProject(selectedProjectId);

    if (!project && filteredProjects.length > 0) {
      project = filteredProjects[0];
      if (project) {
        setSelectedProjectId(project.id);
      }
    }
    
    if (selectedProjectId && !filteredProjects.some(p => p.id === selectedProjectId)) {
        setSelectedProjectId(null);
        project = filteredProjects.length > 0 ? filteredProjects[0] : undefined;
        if(project) setSelectedProjectId(project.id);
    }

    return project;
  }, [projects, selectedProjectId, filteredProjects]);
  
  const handleSaveProject = (projectData: NewProjectData) => {
      onAddProject(projectData);
      setIsModalOpen(false);
  };

  return (
    <>
      <main className="flex-grow flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="project-hub-sidebar w-full md:w-80 lg:w-96 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-sky-400">Projects</h2>
            <div className="relative mt-3">
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border-slate-700 rounded-md py-2 px-4 pl-9 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredProjects.map(project => {
                const totalTasks = project.tasks.length;
                const completedTasks = project.tasks.filter(t => t.isCompleted).length;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    aria-selected={selectedProject?.id === project.id}
                    className="w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors duration-200 border border-transparent hover:bg-slate-700/50 aria-selected:bg-slate-700 aria-selected:border-indigo-500/50"
                  >
                    <img src={project.coverImageUrl} alt={project.title} className="w-12 h-12 rounded-md object-cover bg-slate-700 flex-shrink-0" />
                    <div className="flex-grow overflow-hidden">
                        <p className="font-semibold text-slate-100 truncate">{project.title}</p>
                        <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                  </button>
                )
            })}
          </div>
          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
            >
              <PlusIcon /> New Project
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow bg-slate-900/50 overflow-y-auto custom-scrollbar">
          {selectedProject ? (
            <ProjectDashboard
              key={selectedProject.id} // Force re-mount on project change
              project={selectedProject}
              inventoryComponents={inventoryComponents}
              onUpdateProject={onUpdateProject}
              onDeleteProject={onDeleteProject}
            />
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8">
                <div className="text-indigo-400/50 mb-4">
                    <ProjectIcon className="h-24 w-24" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200">Welcome to the Project Hub</h3>
                {projects.length > 0 ? (
                     <p className="text-slate-400 mt-2 max-w-sm">Select a project from the sidebar to view its dashboard, track tasks, and manage components.</p>
                ) : (
                    <>
                        <p className="text-slate-400 mt-2 max-w-sm">This is your space to innovate. Let's bring your first idea to life by creating a new project.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/30 transform hover:scale-105"
                        >
                            <PlusIcon /> Create Your First Project
                        </button>
                    </>
                )}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <ProjectModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProject}
        />
      )}
    </>
  );
};

export default ProjectHub;