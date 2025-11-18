import React, { useState, useMemo } from 'react';
import { Component, Category, Project } from '../types.ts';
import { Logo } from './Logo.tsx';
import { SunIcon, MoonIcon, SearchIcon, EmptyStateIcon, PlusIcon } from './Icons.tsx';
import StudentComponentCard from './StudentComponentCard.tsx';
import MyIssuedItemCard from './MyIssuedItemCard.tsx';
import IssueComponentModal from './IssueComponentModal.tsx';
import AddProjectModal from './AddProjectModal.tsx';
import MyProjectCard from './MyProjectCard.tsx';

interface StudentPanelProps {
  studentName: string;
  components: Component[];
  projects: Project[];
  onLogout: () => void;
  onIssueComponent: (componentId: string, studentName: string, quantity: number) => void;
  onReturnComponent: (componentId: string, issueId: string) => void;
  onAddProject: (projectData: Omit<Project, 'id' | 'submittedAt' | 'status'>) => void;
  isLightMode: boolean;
  onToggleLightMode: () => void;
}

const StudentPanel: React.FC<StudentPanelProps> = ({
  studentName, components, projects, onLogout, onIssueComponent, onReturnComponent, onAddProject, isLightMode, onToggleLightMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);

  const myIssuedItems = useMemo(() => {
    const items: (Component & { issueId: string, issuedQuantity: number, specificIssuedDate: string })[] = [];
    components.forEach(component => {
      (component.issuedTo || []).forEach(issue => {
        if (issue.studentName === studentName) {
          items.push({
            ...component,
            issueId: issue.id,
            issuedQuantity: issue.quantity,
            specificIssuedDate: issue.issuedDate,
          });
        }
      });
    });
    return items.sort((a, b) => new Date(b.specificIssuedDate).getTime() - new Date(a.specificIssuedDate).getTime());
  }, [components, studentName]);

  const myProjects = useMemo(() => {
    return projects.filter(p => p.submitterStudentName === studentName);
  }, [projects, studentName]);

  const availableComponents = useMemo(() => {
    return components.filter(component => {
      const availableQty = component.totalQuantity - (component.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
      const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
      return component.isAvailable && !component.isUnderMaintenance && availableQty > 0 && matchesSearch && matchesCategory;
    });
  }, [components, searchQuery, categoryFilter]);

  const handleOpenIssueModal = (component: Component) => {
    setComponentToIssue(component);
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = (componentId: string, student: string, quantity: number) => {
    onIssueComponent(componentId, student, quantity);
    setIsIssueModalOpen(false);
    setComponentToIssue(null);
  };
  
  const handleAddProject = (projectData: Omit<Project, 'id' | 'submittedAt' | 'status'>) => {
      onAddProject(projectData);
      setIsAddProjectModalOpen(false);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-900 text-slate-100">
      <header className="bg-slate-900/70 backdrop-blur-lg shadow-md sticky top-0 z-20 border-b border-slate-700/50">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {studentName}'s Hub
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleLightMode}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition"
              aria-label={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLightMode ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={onLogout} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Issued Components & Projects */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col h-1/2">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-sky-400">My Issued Components</h2>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {myIssuedItems.length > 0 ? (
                myIssuedItems.map(item => (
                  <MyIssuedItemCard
                    key={item.issueId}
                    componentName={item.name}
                    imageUrl={item.imageUrl || ''}
                    quantity={item.issuedQuantity}
                    issuedDate={item.specificIssuedDate}
                    onReturn={() => onReturnComponent(item.id, item.issueId)}
                  />
                ))
              ) : (
                <div className="text-center py-10 px-4 h-full flex items-center justify-center">
                  <p className="text-slate-500">You haven't issued any components yet.</p>
                </div>
              )}
            </div>
          </section>
          
          <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col h-1/2">
             <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-sky-400">My Projects</h2>
              <button 
                onClick={() => setIsAddProjectModalOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
              >
                <PlusIcon className="h-4 w-4" /> Add Project
              </button>
            </div>
             <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {myProjects.length > 0 ? (
                    myProjects.map(project => <MyProjectCard key={project.id} project={project} />)
                ) : (
                    <div className="text-center py-10 px-4 h-full flex items-center justify-center">
                        <p className="text-slate-500">You haven't submitted any projects yet.</p>
                    </div>
                )}
             </div>
          </section>
        </div>


        {/* Available Inventory Section */}
        <section className="lg:col-span-2 flex flex-col">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">Available Lab Inventory</h2>
          {/* Filter Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border-slate-700 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
              className="bg-slate-800 border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            >
              <option value="all">All Categories</option>
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Component Grid */}
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            {availableComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {availableComponents.map(component => (
                  <StudentComponentCard key={component.id} component={component} onIssue={handleOpenIssueModal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-center mb-4 text-sky-500"><EmptyStateIcon /></div>
                <h3 className="text-xl font-semibold text-slate-300">No components available</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search, or all components are currently issued or under maintenance.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {isIssueModalOpen && (
        <IssueComponentModal
          component={componentToIssue}
          onClose={() => setIsIssueModalOpen(false)}
          onIssue={handleConfirmIssue}
          studentName={studentName}
        />
      )}
      
      {isAddProjectModalOpen && (
        <AddProjectModal
            onClose={() => setIsAddProjectModalOpen(false)}
            onAddProject={handleAddProject}
            studentName={studentName}
            availableComponents={components}
        />
      )}
    </div>
  );
};

export default StudentPanel;