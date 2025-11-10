import React, { useState, useEffect, useMemo } from 'react';
import { Component, IssueRecord, Category, Project, MaintenanceRecord, AISuggestions, ImageData } from './types.ts';
import Header from './components/Header.tsx';
import ComponentCard from './components/ComponentCard.tsx';
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import { PlusIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, AIAssistantIcon, EmptyStateIcon, ProjectIcon, WarningIcon } from './components/Icons.tsx';
import PasswordProtection from './components/PasswordProtection.tsx';
import * as localStorageService from './services/localStorageService.ts'; // Changed from apiService
import AILabAssistantModal from './components/AILabAssistantModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { imageLibrary as defaultImageLibrary } from './components/imageLibrary.ts';
import ProjectCard from './components/ProjectCard.tsx';
import ProjectModal from './components/ProjectModal.tsx';
import ImportCSVModal from './components/ImportCSVModal.tsx';
import MaintenanceModal from './components/MaintenanceModal.tsx';
import ProjectDetailView from './components/ProjectDetailView.tsx';
import LandingPage from './components/LandingPage.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import SmartScannerModal from './components/SmartScannerModal.tsx';
import * as customImageService from './services/customImageService';


type SortKey = 'default' | 'name' | 'category' | 'availability';
type SortDirection = 'ascending' | 'descending';
type ViewMode = 'inventory' | 'projects';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// Helper to merge default and custom image libraries
const getMergedImageLibrary = (): Record<string, ImageData[]> => {
  const customLibrary = customImageService.getCustomImageLibrary(); // Custom images are still local
  const mergedLibrary = { ...defaultImageLibrary };

  for (const category in customLibrary) {
    const customImages = customLibrary[category] || [];
    const defaultImages = mergedLibrary[category] || [];
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
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
  const [componentForMaintenance, setComponentForMaintenance] = useState<Component | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'default', direction: 'ascending' });
  const [viewMode, setViewMode] = useState<ViewMode>('inventory');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const [imageForAssistant, setImageForAssistant] = useState<string | null>(null);
  
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    localStorageService.trackVisit();
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [componentsData, projectsData] = await Promise.all([
            localStorageService.getComponents(),
            localStorageService.getProjects(),
        ]);
        setComponents(componentsData);
        setProjects(projectsData);
    } catch (err) {
        console.error("Error fetching data from local storage:", err);
        alert("Could not load data. Please try again.");
    } finally {
        setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
        loadData();
    } else if (isAdmin) {
        setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, dataVersion]);

  const handleOpenScanner = () => {
      setIsScannerModalOpen(true);
  };

  const handleImageScanned = (imageDataUrl: string) => {
      setIsScannerModalOpen(false);
      setImageForAssistant(imageDataUrl);
      setIsAssistantModalOpen(true);
  };

  // FIX: Added default values for isUnderMaintenance and maintenanceLog to match the expected type for localStorageService.addComponent.
  const handleAddComponent = async (newComponent: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>) => {
    try {
        const componentToAdd: Omit<Component, 'id' | 'createdAt'> = {
            ...newComponent,
            isUnderMaintenance: false,
            maintenanceLog: [],
        };
        const addedComponent = await localStorageService.addComponent(componentToAdd);
        setComponents(prev => [addedComponent, ...prev]);
        setIsAddModalOpen(false);
    } catch (err) {
        alert("Error adding component. Please try again.");
    }
  };
  
  const handleAddMultipleComponents = async (componentsToAdd: Omit<Component, 'id' | 'createdAt'>[]) => {
    try {
        const addedComponents = await localStorageService.addMultipleComponents(componentsToAdd);
        setComponents(prev => [...addedComponents, ...prev]);
        setIsAssistantModalOpen(false); // Close AI modal on success
    } catch (err) {
        alert("Error adding components. Please try again.");
    }
  };


  const handleDeleteComponent = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
        try {
            await localStorageService.deleteComponent(id);
            setComponents(prev => prev.filter(c => c.id !== id));
        } catch(err) {
            alert("Failed to delete component.");
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

  const handleUpdateComponent = async (updatedComponent: Component) => {
    try {
        const returnedComponent = await localStorageService.updateComponent(updatedComponent);
        setComponents(prev =>
            prev.map(c => (c.id === returnedComponent.id ? returnedComponent : c))
        );
        setIsEditModalOpen(false);
        setComponentToEdit(null);
    } catch (err) {
        alert("Failed to update component.");
    }
  };

  const handleToggleAvailability = async (component: Component) => {
    const updatedComponent = { ...component, isAvailable: !component.isAvailable };
    await handleUpdateComponent(updatedComponent);
  };

  const handleConfirmIssue = async (componentId: string, studentName: string, quantity: number) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    const newIssue: IssueRecord = {
      id: crypto.randomUUID(),
      studentName,
      quantity,
      issuedDate: new Date().toISOString(),
    };
    
    const updatedComponent = {
        ...component,
        issuedTo: [...component.issuedTo, newIssue],
    };
    
    await handleUpdateComponent(updatedComponent);
    setIsIssueModalOpen(false);
    setComponentToIssue(null);
  };

  const handleReturnIssue = async (componentId: string, issueId: string) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    const updatedComponent = {
        ...component,
        issuedTo: component.issuedTo.filter(issue => issue.id !== issueId),
    };

    await handleUpdateComponent(updatedComponent);
  };

  const handleClearAllComponents = async () => {
    if (window.confirm('Are you sure you want to delete ALL components? This action cannot be undone.')) {
        try {
            await localStorageService.clearAllComponents();
            setComponents([]);
        } catch (err) {
            alert("Failed to clear components.");
        }
    }
  };

  const handleClearAllProjects = async () => {
    if (window.confirm('Are you sure you want to delete ALL projects? This action cannot be undone.')) {
        try {
            await localStorageService.clearAllProjects();
            setProjects([]);
            if (viewMode === 'projects') {
              setSelectedProject(null);
            }
        } catch (err) {
            alert("Failed to clear projects.");
        }
    }
  };
  
  const handleOpenMaintenanceModal = (component: Component) => {
      setComponentForMaintenance(component);
      setIsMaintenanceModalOpen(true);
  };
  
  const handleToggleMaintenance = async (componentId: string) => {
      const component = components.find(c => c.id === componentId);
      if(!component) return;
      const updatedComponent = { ...component, isUnderMaintenance: !component.isUnderMaintenance };
      const returnedComponent = await localStorageService.updateComponent(updatedComponent);
      setComponents(prev => prev.map(c => c.id === componentId ? returnedComponent : c));
      setComponentForMaintenance(returnedComponent);
  };
  
  const handleAddMaintenanceLog = async (componentId: string, notes: string) => {
      const component = components.find(c => c.id === componentId);
      if(!component) return;
      const newLog: MaintenanceRecord = { id: crypto.randomUUID(), date: new Date().toISOString(), notes };
      const updatedComponent = { ...component, maintenanceLog: [newLog, ...component.maintenanceLog] };
      const returnedComponent = await localStorageService.updateComponent(updatedComponent);
      setComponents(prev => prev.map(c => c.id === componentId ? returnedComponent : c));
      setComponentForMaintenance(returnedComponent);
  };
  
  const handleDeleteMaintenanceLog = async (componentId: string, logId: string) => {
      const component = components.find(c => c.id === componentId);
      if(!component) return;
      const updatedComponent = { ...component, maintenanceLog: component.maintenanceLog.filter(log => log.id !== logId) };
      const returnedComponent = await localStorageService.updateComponent(updatedComponent);
      setComponents(prev => prev.map(c => c.id === componentId ? returnedComponent : c));
      setComponentForMaintenance(returnedComponent);
  };

  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'createdAt'>) => {
      try {
          const newProject = await localStorageService.addProject(newProjectData);
          setProjects(prev => [newProject, ...prev]);
          setIsProjectModalOpen(false);
      } catch (err) {
          alert("Failed to add project.");
      }
  };

  const handleUpdateProject = async (updatedProjectData: Project) => {
      try {
          const returnedProject = await localStorageService.updateProject(updatedProjectData);
          setProjects(projects.map(p => p.id === returnedProject.id ? returnedProject : p));
          if(selectedProject?.id === returnedProject.id) {
            setSelectedProject(returnedProject);
          }
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
      } catch (err) {
          alert("Failed to update project.");
      }
  };

  const handleDeleteProject = async (projectId: string) => {
      if (window.confirm('Are you sure you want to delete this project?')) {
          try {
              await localStorageService.deleteProject(projectId);
              setProjects(prev => prev.filter(p => p.id !== projectId));
              setSelectedProject(null);
          } catch (err) {
              alert("Failed to delete project.");
          }
      }
  };
  
  const handleOpenEditProjectModal = (project: Project) => {
      setProjectToEdit(project);
      setIsProjectModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
      setSelectedProject(project);
  };
  
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
    const headers = ["name", "description", "category", "totalQuantity", "imageUrl", "lowStockThreshold", "links", "isUnderMaintenance", "maintenanceLog"];
    const csvRows = [headers.join(',')];
    for (const component of components) {
        const linksJson = component.links ? JSON.stringify(component.links) : '';
        const maintenanceLogJson = component.maintenanceLog ? JSON.stringify(component.maintenanceLog) : '';
        const values = [
            formatCsvField(component.name),
            formatCsvField(component.description),
            formatCsvField(component.category),
            component.totalQuantity,
            formatCsvField(component.imageUrl),
            component.lowStockThreshold ?? '',
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

  const handleImportComponents = async (importedComponents: Omit<Component, 'id' | 'createdAt'>[]): Promise<void> => {
      try {
          const newComponents = await localStorageService.addMultipleComponents(importedComponents);
          setComponents(prev => [...newComponents, ...prev]);
          setIsImportModalOpen(false);
          alert(`${newComponents.length} components were successfully imported!`);
      } catch (err) {
          alert("Failed to import components.");
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
            const aAvailable = a.totalQuantity - (a.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
            const bAvailable = b.totalQuantity - (b.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
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
      const available = c.totalQuantity - (c.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
      return c.lowStockThreshold != null && available <= c.lowStockThreshold && !c.isUnderMaintenance;
    });
  }, [components]);

  if (showSplashScreen) {
    return <SplashScreen onFinished={() => setShowSplashScreen(false)} />;
  }

  if (showLandingPage) {
    return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
  }

  const handleLogin = (isAdminLogin: boolean) => {
      localStorageService.trackLogin();
      setIsAuthenticated(true);
      if(isAdminLogin) {
          setIsAdmin(true);
      }
  };

  if (!isAuthenticated) {
    return <PasswordProtection 
        onSuccess={() => handleLogin(false)}
        onAdminSuccess={() => handleLogin(true)}
    />;
  }

  if (isAdmin) {
    return <AdminPanel 
        onExit={() => setIsAdmin(false)} 
        onLibraryUpdate={() => setImageLibrary(getMergedImageLibrary())}
        onClearAllComponents={handleClearAllComponents}
        onClearAllProjects={handleClearAllProjects}
        onDataRestored={() => setDataVersion(v => v + 1)}
    />
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
      <Header 
        onAddComponent={() => setIsAddModalOpen(true)}
        onAddProject={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}
        onOpenScanner={handleOpenScanner}
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
                      The following components are running low: {lowStockComponents.map(c => `${c.name} (${c.totalQuantity - (c.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0)} left)`).join(', ')}. Consider re-stocking soon.
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
                          className="w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label="Search components"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <SearchIcon />
                      </div>
                  </div>
                  <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
                      className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="p-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        aria-label={`Sort ${sortConfig.direction === 'ascending' ? 'descending' : 'ascending'}`}
                    >
                        {sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-300 animate-pulse">Loading Inventory...</h3>
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
                        className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/30 transform hover:scale-105"
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
                          className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/30 transform hover:scale-105"
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
          onClose={() => {
              setIsAssistantModalOpen(false);
              setImageForAssistant(null);
          }}
          components={components}
          initialImageURL={imageForAssistant}
          onAddMultipleComponents={handleAddMultipleComponents}
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
      
      {isScannerModalOpen && (
        <SmartScannerModal
            onClose={() => setIsScannerModalOpen(false)}
            onImageScanned={handleImageScanned}
        />
      )}

      <button
        onClick={() => setIsAssistantModalOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/50 hover:scale-110 transform transition-transform duration-300 z-30 animate-pulse hover:animate-none"
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