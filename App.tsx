import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Component, IssueRecord, Category, AISuggestions, Project, ProjectStatus, ProjectTask } from './types.ts';
import Header from './components/Header.tsx';
import ComponentCard from './components/ComponentCard.tsx';
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import { PlusIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon, AIAssistantIcon, EmptyStateIcon, WarningIcon } from './components/Icons.tsx';
import PasswordProtection from './components/PasswordProtection.tsx';
import * as localStorageService from './services/localStorageService.ts';
import AILabAssistantModal from './components/AILabAssistantModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { imageLibrary as defaultImageLibrary, ImageData } from './components/imageLibrary.ts';
import ImportCSVModal from './components/ImportCSVModal.tsx';
import MaintenanceModal from './components/MaintenanceModal.tsx';
import LandingPage from './components/LandingPage.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import SmartScannerModal from './components/SmartScannerModal.tsx';
import AIComponentScanResultModal from './components/AIComponentScanResultModal.tsx';
import ProjectHub from './components/ProjectHub.tsx';


type SortKey = 'default' | 'name' | 'category' | 'availability';
type SortDirection = 'ascending' | 'descending';

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
  
  // App State
  const [currentView, setCurrentView] = useState<'inventory' | 'projects'>('inventory');
  const [components, setComponents] = useState<Component[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [imageLibrary, setImageLibrary] = useState(getMergedImageLibrary());
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isScanResultModalOpen, setIsScanResultModalOpen] = useState(false);
  
  // Component-specific states
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
  const [componentForMaintenance, setComponentForMaintenance] = useState<Component | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'default', direction: 'ascending' });
  const [scannedImageData, setScannedImageData] = useState<string | null>(null);

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'light';
  });

  // Effect to set initial passwords if they don't exist
  useEffect(() => {
    if (!localStorageService.getAdminPassword()) {
      localStorageService.setAdminPassword('adminpass'); // Default admin password
    }
    if (!localStorageService.getUserPassword()) {
      localStorageService.setUserPassword('userpass'); // Default user password
    }
  }, []);

  useEffect(() => {
    localStorageService.trackVisit();
    localStorageService.trackAccess(); // Log device access
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => {
    if (isAuthenticated) {
        setIsLoading(true);
        try {
            const componentData = localStorageService.getComponents();
            const projectData = localStorageService.getProjects();
            setComponents(componentData);
            setProjects(projectData);
            setImageLibrary(getMergedImageLibrary()); // Ensure image library is up-to-date
        } catch (err) {
            console.error("Error fetching data from local storage:", err);
        } finally {
            setTimeout(() => setIsLoading(false), 300);
        }
    } else {
        // Clear data if not authenticated
        setComponents([]);
        setProjects([]);
        setImageLibrary(getMergedImageLibrary()); // Reset to default + custom only
    }
  }, [isAuthenticated]); // Only re-run when authentication status changes
  
  const handleUserLogin = (view: 'inventory' | 'projects') => {
      setIsAuthenticated(true);
      setCurrentView(view);
  };
  
  const handleGoBack = () => {
      setIsAuthenticated(false);
      setIsAdmin(false);
  };

  const handleOpenScanner = () => {
      setIsScannerModalOpen(true);
  };

  const handleImageScanned = (imageDataUrl: string) => {
      setIsScannerModalOpen(false);
      setScannedImageData(imageDataUrl);
      setIsScanResultModalOpen(true);
  };


  const handleAddComponent = (newComponent: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>) => {
    try {
        const addedComponent = localStorageService.addComponent(newComponent);
        setComponents(prev => [addedComponent, ...prev]);
        setIsAddModalOpen(false);
        setIsScanResultModalOpen(false);
        setScannedImageData(null);
    } catch (err) {
        alert("Error adding component. Please try again.");
    }
  };

  const handleDeleteComponent = (id: string) => {
    if(window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
        localStorageService.deleteComponent(id);
        setComponents(prev => prev.filter(c => c.id !== id));
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
    localStorageService.updateComponent(updatedComponent);
    setComponents(prev =>
        prev.map(c => (c.id === updatedComponent.id ? updatedComponent : c))
    );
    setIsEditModalOpen(false);
    setComponentToEdit(null);
  };

  const handleToggleAvailability = (component: Component) => {
    const updatedComponent = localStorageService.toggleAvailability(component);
    setComponents(prev =>
        prev.map(c =>
            c.id === component.id ? updatedComponent : c
        )
    );
  };

  const handleConfirmIssue = (componentId: string, studentName: string, quantity: number) => {
    const updatedComponent = localStorageService.issueComponent(componentId, studentName, quantity);
     setComponents(prev => 
        prev.map(c => 
            c.id === componentId ? updatedComponent : c
        )
    );
    setIsIssueModalOpen(false);
    setComponentToIssue(null);
  };

  const handleReturnIssue = (componentId: string, issueId: string) => {
     const updatedComponent = localStorageService.returnIssue(componentId, issueId);
    setComponents(prev =>
        prev.map(c =>
            c.id === componentId ? updatedComponent : c
        )
    );
  };

  const handleClearAllComponents = () => {
    if (window.confirm('Are you sure you want to delete ALL components? This action cannot be undone.')) {
        localStorageService.clearAllComponents();
        setComponents([]);
    }
  };
  
  const handleOpenMaintenanceModal = (component: Component) => {
      setComponentForMaintenance(component);
      setIsMaintenanceModalOpen(true);
  };
  
  const handleToggleMaintenance = (componentId: string) => {
      const updatedComponent = localStorageService.toggleMaintenanceStatus(componentId);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(updatedComponent);
  };
  
  const handleAddMaintenanceLog = (componentId: string, notes: string) => {
      const updatedComponent = localStorageService.addMaintenanceLog(componentId, notes);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(updatedComponent);
  };
  
  const handleDeleteMaintenanceLog = (componentId: string, logId: string) => {
      const updatedComponent = localStorageService.deleteMaintenanceLog(componentId, logId);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(updatedComponent);
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

  const handleImportComponents = (importedComponents: Omit<Component, 'id' | 'createdAt'>[]): void => {
      const newComponents = localStorageService.addMultipleComponents(importedComponents);
      setComponents(prev => [...newComponents, ...prev]);
      setIsImportModalOpen(false);
      alert(`${newComponents.length} components were successfully imported!`);
  };

  // Project Handlers
  const handleAddProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'attachments' | 'requiredComponents'>) => {
      const newProject = localStorageService.addProject(projectData);
      setProjects(prev => [newProject, ...prev]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
      localStorageService.updateProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
      if (window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
          localStorageService.deleteProject(projectId);
          setProjects(prev => prev.filter(p => p.id !== projectId));
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

  if (!isAuthenticated) {
    return <PasswordProtection 
        onUserLogin={handleUserLogin}
        onAdminSuccess={() => { setIsAuthenticated(true); setIsAdmin(true); }}
    />;
  }

  // Admin Panel is rendered if isAdmin is true
  if (isAdmin) {
    return (
      <AdminPanel 
          onExit={handleGoBack}
          onLibraryUpdate={() => setImageLibrary(getMergedImageLibrary())}
          components={components}
          setComponents={setComponents}
          imageLibrary={imageLibrary}
          isLightMode={isLightMode}
          onToggleLightMode={() => setIsLightMode(prev => !prev)}
          // Pass component specific handlers
          onOpenEditModal={handleOpenEditModal}
          onOpenMaintenanceModal={handleOpenMaintenanceModal}
          onToggleMaintenance={handleToggleMaintenance}
          onDeleteComponent={handleDeleteComponent}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col`}>
      <Header 
        currentView={currentView}
        onSetView={setCurrentView}
        onAddComponent={() => setIsAddModalOpen(true)}
        onOpenScanner={handleOpenScanner}
        onClearAll={handleClearAllComponents}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExport={handleExportCSV}
        isLightMode={isLightMode}
        onToggleLightMode={() => setIsLightMode(prev => !prev)}
      />
      
      {currentView === 'inventory' ? (
        <main className="container mx-auto p-4 md:p-8 flex-grow flex flex-col">
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
        </main>
      ) : (
        <ProjectHub
          projects={projects}
          inventoryComponents={components}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      )}


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
      
      {isScannerModalOpen && (
        <SmartScannerModal
            onClose={() => setIsScannerModalOpen(false)}
            onImageScanned={handleImageScanned}
        />
      )}

      {isScanResultModalOpen && scannedImageData && (
        <AIComponentScanResultModal
          imageDataUrl={scannedImageData}
          onClose={() => {
            setIsScanResultModalOpen(false);
            setScannedImageData(null);
          }}
          onAddComponent={handleAddComponent}
        />
      )}


      <button
        onClick={() => setIsAssistantModalOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/50 hover:scale-110 transform transition-transform duration-300 z-30 animate-pulse hover:animate-none"
        aria-label="Open AI Lab Assistant"
      >
        <AIAssistantIcon />
      </button>

      <footer className="text-center text-slate-500 text-sm py-4 border-t border-slate-800/50 mt-auto">
        this app is made with ❤️ by Apoorv karanwal
      </footer>
    </div>
  );
};

export default App;