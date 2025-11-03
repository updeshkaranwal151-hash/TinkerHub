

import React, { useState, useEffect, useMemo } from 'react';
import { Component, IssueRecord, Category, Project, MaintenanceRecord } from './types.ts';
import Header from './components/Header.tsx';
import ComponentCard from './components/ComponentCard.tsx';
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import { PlusIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, AIAssistantIcon, EmptyStateIcon, ProjectIcon, WarningIcon } from './components/Icons.tsx';
import PasswordProtection from './components/PasswordProtection.tsx';
import * as localStorageService from './services/localStorageService.ts';
import AILabAssistantModal from './components/AILabAssistantModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { imageLibrary as defaultImageLibrary, ImageData } from './components/imageLibrary.ts';
import ProjectCard from './components/ProjectCard.tsx';
import ProjectModal from './components/ProjectModal.tsx';
import ImportCSVModal from './components/ImportCSVModal.tsx';
import MaintenanceModal from './components/MaintenanceModal.tsx';
import ProjectDetailView from './components/ProjectDetailView.tsx';
import LandingPage from './components/LandingPage.tsx';
import SplashScreen from './components/SplashScreen.tsx';


type SortKey = 'default' | 'name' | 'category' | 'availability';
type SortDirection = 'ascending' | 'descending';
type ViewMode = 'inventory' | 'projects';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// Helper to merge default and custom image libraries
const getMergedImageLibrary = (): Record<string, ImageData[]> => {
  const customLibrary = localStorageService.getCustomImageLibrary();
  const mergedLibrary = { ...defaultImageLibrary };

  for (const category in customLibrary) {
    const customImages = customLibrary[category] || [];
    const defaultImages = mergedLibrary[category] || [];
    // Combine and remove duplicates, giving preference to custom images
    const combined = [...customImages, ...defaultImages];
    mergedLibrary[category] = Array.from(new Map(combined.map(item => [item.url, item])).values());
  }
  
  return mergedLibrary;
};


const App: React.FC = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [imageLibrary, setImageLibrary] = useState(getMergedImageLibrary());
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
  const [componentForMaintenance, setComponentForMaintenance] = useState<Component | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'default', direction: 'ascending' });
  const [viewMode, setViewMode] = useState<ViewMode>('inventory');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    // Initialize from local storage, default to false (dark mode)
    return localStorage.getItem('theme') === 'light';
  });

  // Track app visit once on initial load for analytics
  useEffect(() => {
    localStorageService.trackVisit();
  }, []);

  // Apply theme to body class
  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      document.body.classList.remove('bg-slate-900', 'text-slate-100');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
      document.body.classList.add('bg-slate-900', 'text-slate-100');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  // Load components and projects from Local Storage on first load
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
        setIsLoading(true);
        try {
            const componentData = localStorageService.getComponents();
            setComponents(componentData);
            const projectData = localStorageService.getProjects();
            setProjects(projectData);
        } catch (err) {
            console.error("Error fetching data from local storage:", err);
            alert("Could not load data from local storage.");
        } finally {
            setTimeout(() => setIsLoading(false), 300);
        }
    } else if (isAdmin) {
        setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);


  const handleAddComponent = (newComponent: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>) => {
    try {
        const addedComponent = localStorageService.addComponent(newComponent);
        setComponents(prev => [addedComponent, ...prev]);
        setIsAddModalOpen(false);
    } catch (err) {
        alert("Error adding component. Please try again.");
        console.error(err);
    }
  };

  const handleDeleteComponent = (id: string) => {
    if(window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
        try {
            localStorageService.deleteComponent(id);
            setComponents(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert("Error deleting component. Please try again.");
            console.error(err);
        }
    }
  };

  const handleOpenIssueModal = (component: Component) => {
    setComponentToIssue(component);
    setIsIssueModalOpen(true);
  };
  
  const handleOpenEditModal = (component: Component) => {
    setComponentToEdit(component);
    setIsEditModalOpen(true);
  };

  const handleUpdateComponent = (updatedComponent: Component) => {
    try {
        localStorageService.updateComponent(updatedComponent);
        setComponents(prev =>
            prev.map(c => (c.id === updatedComponent.id ? updatedComponent : c))
        );
        setIsEditModalOpen(false);
        setComponentToEdit(null);
    } catch (err) {
        alert("Error updating component. Please try again.");
        console.error(err);
    }
  };

  const handleToggleAvailability = (component: Component) => {
    try {
        const updatedComponent = localStorageService.toggleAvailability(component);
        setComponents(prev =>
            prev.map(c =>
                c.id === component.id ? updatedComponent : c
            )
        );
    } catch (err) {
        alert("Error toggling availability. Please try again.");
        console.error(err);
    }
  };

  const handleConfirmIssue = (componentId: string, studentName: string) => {
    try {
        const updatedComponent = localStorageService.issueComponent(componentId, studentName);
         setComponents(prev => 
            prev.map(c => 
                c.id === componentId ? updatedComponent : c
            )
        );
        setIsIssueModalOpen(false);
        setComponentToIssue(null);
    } catch (err) {
        alert("Error issuing component. Please try again.");
        console.error(err);
    }
  };

  const handleReturnIssue = (componentId: string, issueId: string) => {
     try {
        const updatedComponent = localStorageService.returnIssue(componentId, issueId);
        setComponents(prev =>
            prev.map(c =>
                c.id === componentId ? updatedComponent : c
            )
        );
    } catch (err) {
        alert("Error returning component. Please try again.");
        console.error(err);
    }
  };

  const handleClearAllComponents = () => {
    if (window.confirm('Are you sure you want to delete ALL components? This action cannot be undone.')) {
        setIsLoading(true);
        try {
            localStorageService.clearAllComponents();
            setComponents([]);
        } catch (err) {
            alert("Error clearing data. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  // --- Maintenance Handlers ---
  const handleOpenMaintenanceModal = (component: Component) => {
      setComponentForMaintenance(component);
      setIsMaintenanceModalOpen(true);
  };
  
  const handleToggleMaintenance = (componentId: string) => {
      const updatedComponent = localStorageService.toggleMaintenanceStatus(componentId);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(updatedComponent); // Keep modal in sync
  };
  
  const handleAddMaintenanceLog = (componentId: string, notes: string) => {
      const updatedComponent = localStorageService.addMaintenanceLog(componentId, notes);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(updatedComponent); // Keep modal in sync
  };
  
  const handleDeleteMaintenanceLog = (componentId: string, logId: string) => {
      const updatedComponent = localStorageService.deleteMaintenanceLog(componentId, logId);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(updatedComponent); // Keep modal in sync
  };


  // --- Project Handlers ---
  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'createdAt'>) => {
      const newProject = localStorageService.addProject(newProjectData);
      setProjects(prev => [newProject, ...prev]);
      setIsProjectModalOpen(false);
  };

  const handleUpdateProject = (updatedProjectData: Project) => {
      localStorageService.updateProject(updatedProjectData);
      const updatedProjects = projects.map(p => p.id === updatedProjectData.id ? updatedProjectData : p);
      setProjects(updatedProjects);
      // Also update the selected project if it's the one being edited
      if(selectedProject?.id === updatedProjectData.id) {
        setSelectedProject(updatedProjectData);
      }
      setIsProjectModalOpen(false);
      setProjectToEdit(null);
  };

  const handleDeleteProject = (projectId: string) => {
      if (window.confirm('Are you sure you want to delete this project?')) {
          localStorageService.deleteProject(projectId);
          setProjects(prev => prev.filter(p => p.id !== projectId));
          setSelectedProject(null); // Close detail view if deleted
      }
  };
  
  const handleOpenEditProjectModal = (project: Project) => {
      setProjectToEdit(project);
      setIsProjectModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
      setSelectedProject(project);
  };
  
  // --- CSV Handlers ---
  const handleExportCSV = () => {
    if (components.length === 0) {
        alert("There is no inventory data to export.");
        return;
    }

    const formatCsvField = (value: any): string => {
        const str = String(value ?? '');
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headers = [
        "name", "description", "category", "totalQuantity", 
        "availableQuantity", "isAvailable", "lowStockThreshold", "imageUrl", "links",
        "isUnderMaintenance", "maintenanceLog"
    ];

    const csvRows = [headers.join(',')];

    for (const component of components) {
        const availableQuantity = component.totalQuantity - component.issuedTo.length;
        const linksJson = component.links ? JSON.stringify(component.links) : '';
        const maintenanceLogJson = component.maintenanceLog ? JSON.stringify(component.maintenanceLog) : '';

        const values = [
            formatCsvField(component.name),
            formatCsvField(component.description),
            formatCsvField(component.category),
            component.totalQuantity,
            availableQuantity,
            component.isAvailable,
            component.lowStockThreshold ?? '',
            formatCsvField(component.imageUrl),
            formatCsvField(linksJson),
            component.isUnderMaintenance,
            formatCsvField(maintenanceLogJson),
        ];
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `tinkerhub-inventory-export-${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportComponents = (importedComponents: Omit<Component, 'id' | 'createdAt'>[]): void => {
      try {
          const newComponents = localStorageService.addMultipleComponents(importedComponents);
          setComponents(prev => [...newComponents, ...prev]);
          setIsImportModalOpen(false);
          alert(`${newComponents.length} components were successfully imported!`);
      } catch (err) {
          alert("Error importing components. Please check your file and try again.");
          console.error(err);
      }
  };


  const filteredComponents = useMemo(() => components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [components, searchQuery, categoryFilter]);

  const sortedAndFilteredComponents = useMemo(() => {
    let sortableItems = [...filteredComponents];
    if (sortConfig.key !== 'default') {
      sortableItems.sort((a, b) => {
        switch (sortConfig.key) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'availability':
            const aAvailable = a.totalQuantity - a.issuedTo.length;
            const bAvailable = b.totalQuantity - b.issuedTo.length;
            return aAvailable - bAvailable;
          default:
            return 0;
        }
      });
    }
    if (sortConfig.direction === 'descending') {
      sortableItems.reverse();
    }
    return sortableItems;
  }, [filteredComponents, sortConfig]);

  const lowStockComponents = useMemo(() => {
    return components.filter(c => {
      const available = c.totalQuantity - c.issuedTo.length;
      return c.lowStockThreshold != null && available <= c.lowStockThreshold && !c.isUnderMaintenance;
    });
  }, [components]);

  if (showSplashScreen) {
    return <SplashScreen onFinished={() => setShowSplashScreen(false)} />;
  }

  if (showLandingPage) {
    return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
  }

  if (!isAuthenticated) {
    return <PasswordProtection 
        onSuccess={() => setIsAuthenticated(true)}
        onAdminSuccess={() => {
            setIsAuthenticated(true);
            setIsAdmin(true);
        }}
    />;
  }

  if (isAdmin) {
    return <AdminPanel 
        onExit={() => setIsAdmin(false)} 
        onLibraryUpdate={() => setImageLibrary(getMergedImageLibrary())}
    />
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
      <Header 
        onAddComponent={() => setIsAddModalOpen(true)}
        onAddProject={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}
        onClearAll={handleClearAllComponents}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExport={handleExportCSV}
        viewMode={viewMode}
        isLightMode={isLightMode}
        onToggleLightMode={() => setIsLightMode(prev => !prev)}
      />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="flex justify-center mb-6 border-b border-slate-700/50">
            <button
              onClick={() => { setViewMode('inventory'); setSelectedProject(null); }}
              className={`py-3 px-6 text-base font-semibold transition-colors duration-300 rounded-t-lg ${viewMode === 'inventory' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}
            >
              Inventory
            </button>
            <button
              onClick={() => setViewMode('projects')}
              className={`py-3 px-6 text-base font-semibold transition-colors duration-300 rounded-t-lg ${viewMode === 'projects' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}
            >
              Projects
            </button>
        </div>

        {viewMode === 'inventory' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-sky-400">Inventory Dashboard</h2>
            </div>

            {lowStockComponents.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg animate-pulse hover:animate-none">
                <div className="flex items-center gap-3">
                  <WarningIcon className="text-yellow-400 h-6 w-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-300">Low Stock Alert!</h3>
                    <p className="text-sm text-yellow-400">
                      The following components are running low: {lowStockComponents.map(c => `${c.name} (${c.totalQuantity - c.issuedTo.length} left)`).join(', ')}. Consider re-stocking soon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-grow">
                  <div className="relative flex-grow">
                      <input
                          type="text"
                          placeholder="Search by component name..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          aria-label="Search components"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <SearchIcon />
                      </div>
                  </div>
                  <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
                      className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      aria-label="Filter by category"
                  >
                      <option value="all">All Categories</option>
                      {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                    <select
                        value={sortConfig.key}
                        onChange={e => setSortConfig({ ...sortConfig, key: e.target.value as SortKey })}
                        className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="Sort by"
                    >
                        <option value="default">Default Sort</option>
                        <option value="name">Name</option>
                        <option value="category">Category</option>
                        <option value="availability">Availability</option>
                    </select>
                    <button
                        onClick={() => setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
                        disabled={sortConfig.key === 'default'}
                        className="p-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Sort ${sortConfig.direction === 'ascending' ? 'descending' : 'ascending'}`}
                    >
                        {sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-300 animate-pulse">Loading Inventory...</h3>
                    <p className="text-slate-500 mt-2">Please wait while we fetch the data.</p>
                </div>
            ) : components.length > 0 ? (
                sortedAndFilteredComponents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedAndFilteredComponents.map((component, index) => (
                        <ComponentCard
                        key={component.id}
                        component={component}
                        index={index}
                        onDelete={handleDeleteComponent}
                        onOpenIssueModal={handleOpenIssueModal}
                        onReturnIssue={handleReturnIssue}
                        onOpenEditModal={handleOpenEditModal}
                        onToggleAvailability={handleToggleAvailability}
                        onOpenMaintenanceModal={handleOpenMaintenanceModal}
                        />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-300">No components found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            ) : (
                <div className="text-center py-16 px-6 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700">
                    <div className="flex justify-center mb-4 text-sky-500">
                        <EmptyStateIcon />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200">Your inventory is empty!</h3>
                    <p className="text-slate-400 mt-2">Let's add your first component to get started.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-indigo-600/30 transform hover:scale-105"
                    >
                        <PlusIcon />
                        Add Your First Component
                    </button>
                </div>
            )}
          </>
        )}

        {viewMode === 'projects' && (
          selectedProject ? (
            <ProjectDetailView 
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
                onEdit={handleOpenEditProjectModal}
                onDelete={handleDeleteProject}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-sky-400">Project Hub</h2>
              </div>
              {isLoading ? (
                  <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                      <h3 className="text-xl font-semibold text-slate-300 animate-pulse">Loading Projects...</h3>
                  </div>
              ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {projects.map((project, index) => (
                          <ProjectCard 
                              key={project.id}
                              project={project}
                              index={index}
                              onEdit={handleOpenEditProjectModal}
                              onDelete={handleDeleteProject}
                              onView={handleViewProject}
                          />
                      ))}
                  </div>
              ) : (
                   <div className="text-center py-16 px-6 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700">
                      <div className="flex justify-center mb-4 text-sky-500">
                          <ProjectIcon />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-200">No projects yet!</h3>
                      <p className="text-slate-400 mt-2">Create your first project to showcase your innovation.</p>
                      <button
                          onClick={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}
                          className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-indigo-600/30 transform hover:scale-105"
                      >
                          <PlusIcon />
                          Create Your First Project
                      </button>
                  </div>
              )}
            </>
          )
        )}
      </main>

      {isAddModalOpen && (
        <AddComponentModal
          onClose={() => setIsAddModalOpen(false)}
          onAddComponent={handleAddComponent}
          imageLibrary={imageLibrary}
        />
      )}

      {isEditModalOpen && (
        <EditComponentModal
          component={componentToEdit}
          onClose={() => {
              setIsEditModalOpen(false);
              setComponentToEdit(null);
          }}
          onUpdateComponent={handleUpdateComponent}
          imageLibrary={imageLibrary}
        />
      )}

       {isProjectModalOpen && (
            <ProjectModal
                onClose={() => {
                    setIsProjectModalOpen(false);
                    setProjectToEdit(null);
                }}
                onSave={projectToEdit ? handleUpdateProject : handleAddProject}
                existingProject={projectToEdit}
                availableComponents={components}
            />
        )}


      {isIssueModalOpen && (
        <IssueComponentModal
          component={componentToIssue}
          onClose={() => setIsIssueModalOpen(false)}
          onIssue={handleConfirmIssue}
        />
      )}

      {isShareModalOpen && (
        <ShareModal onClose={() => setIsShareModalOpen(false)} />
      )}
      
      {isAssistantModalOpen && (
        <AILabAssistantModal 
          onClose={() => setIsAssistantModalOpen(false)}
          components={components}
        />
      )}

      {isImportModalOpen && (
        <ImportCSVModal
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportComponents}
        />
      )}

      {isMaintenanceModalOpen && (
        <MaintenanceModal
            component={componentForMaintenance}
            onClose={() => {
                setIsMaintenanceModalOpen(false);
                setComponentForMaintenance(null);
            }}
            onToggleMaintenance={handleToggleMaintenance}
            onAddLog={handleAddMaintenanceLog}
            onDeleteLog={handleDeleteMaintenanceLog}
        />
      )}


      <button
        onClick={() => setIsAssistantModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/50 hover:scale-110 transform transition-transform duration-300 z-30 animate-pulse hover:animate-none"
        aria-label="Open AI Lab Assistant"
      >
        <AIAssistantIcon />
      </button>

      <footer className="text-center text-slate-500 text-sm py-4 border-t border-slate-800/50 mt-8">
        this app is made with ❤️ by Apoorv karanwal
      </footer>
    </div>
  );
};

export default App;