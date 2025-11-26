
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Component, IssueRecord, Category, AISuggestions, Project, ProjectStatus } from './types.ts';
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import PasswordProtection from './components/PasswordProtection.tsx';
import * as localStorageService from './services/localStorageService.ts';
import AILabAssistantModal from './components/AILabAssistantModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AdminModeSelection from './components/AdminModeSelection.tsx';
import AdminControlPanel from './components/AdminControlPanel.tsx';
import { imageLibrary as defaultImageLibrary, ImageData } from './components/imageLibrary.ts';
import ImportCSVModal from './components/ImportCSVModal.tsx';
import MaintenanceModal from './components/MaintenanceModal.tsx';
import LandingPage from './components/LandingPage.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import SmartScannerModal from './components/SmartScannerModal.tsx';
import AIComponentScanResultModal from './components/AIComponentScanResultModal.tsx';
import StudentLogin from './components/StudentLogin.tsx';
import StudentPanel from './components/StudentPanel.tsx';
import { AIAssistantIcon } from './components/Icons.tsx';


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
  
  // Auth & Role State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [currentStudentName, setCurrentStudentName] = useState('');
  const [adminViewMode, setAdminViewMode] = useState<'selection' | 'analytics' | 'control'>('selection');
  
  // App State
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
  const [componentForMaintenance, setComponentForMaintenance] = useState<Component | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
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
  
  const handleAuthSuccess = () => {
      setIsAuthenticated(true);
  };
  
  const handleStudentLogin = (name: string) => {
    setCurrentStudentName(name);
    setIsStudentLoggedIn(true);
    localStorageService.trackSuccessfulLogin();
  };
  
  const handleStudentLogout = () => {
    setIsStudentLoggedIn(false);
    setCurrentStudentName('');
  };

  const handleGoBack = () => {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAdminViewMode('selection');
      handleStudentLogout();
  };

  const handleOpenScanner = () => {
      setIsScannerModalOpen(true);
  };

  const handleImageScanned = (imageDataUrl: string) => {
      setIsScannerModalOpen(false);
      setScannedImageData(imageDataUrl);
      setIsScanResultModalOpen(true);
  };

  const handleOpenIssueModal = (component: Component) => {
    setComponentToIssue(component);
    setIsIssueModalOpen(true);
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
  
  const handleToggleAvailability = (component: Component) => {
    const updatedComponent = localStorageService.toggleAvailability(component);
     setComponents(prev =>
        prev.map(c => (c.id === component.id ? updatedComponent : c))
    );
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
  
  const handleAddProject = (projectData: Omit<Project, 'id' | 'submittedAt' | 'status'>) => {
      const newProject = localStorageService.addProject(projectData);
      setProjects(prev => [newProject, ...prev]);
  };
  
  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus, feedback?: string) => {
      const updatedProject = localStorageService.updateProjectStatus(projectId, status, feedback);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
  };

  const handleClearAll = () => {
    if(window.confirm('Are you sure you want to delete ALL components? This cannot be undone.')) {
        localStorageService.clearAllComponents();
        setComponents([]);
    }
  };

  const handleExport = () => {
      const headers = ["name", "description", "category", "totalQuantity", "issuedTo", "isAvailable", "imageUrl", "lowStockThreshold", "links", "isUnderMaintenance", "maintenanceLog"];
      const csvContent = [
          headers.join(','),
          ...components.map(c => {
             const linksJson = JSON.stringify(c.links || []).replace(/"/g, '""');
             const maintenanceJson = JSON.stringify(c.maintenanceLog || []).replace(/"/g, '""');
             const issuedToJson = JSON.stringify(c.issuedTo || []).replace(/"/g, '""');

             return [
                 `"${c.name.replace(/"/g, '""')}"`,
                 `"${c.description.replace(/"/g, '""')}"`,
                 c.category,
                 c.totalQuantity,
                 `"${issuedToJson}"`,
                 c.isAvailable,
                 `"${c.imageUrl || ''}"`,
                 c.lowStockThreshold || '',
                 `"${linksJson}"`,
                 c.isUnderMaintenance,
                 `"${maintenanceJson}"`
             ].join(',')
          })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "inventory.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleImport = (importedComponents: Omit<Component, 'id' | 'createdAt'>[]) => {
    const newComponents = localStorageService.addMultipleComponents(importedComponents);
    setComponents(prev => [...newComponents, ...prev]);
    setIsImportModalOpen(false);
  };


  if (showSplashScreen) {
    return <SplashScreen onFinished={() => setShowSplashScreen(false)} />;
  }

  if (showLandingPage) {
    return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
  }

  if (!isAuthenticated) {
    return <PasswordProtection 
        onUserLogin={handleAuthSuccess}
        onAdminSuccess={() => { setIsAuthenticated(true); setIsAdmin(true); localStorageService.trackSuccessfulLogin(); }}
    />;
  }

  // Admin Flow
  if (isAdmin) {
    const renderAdminContent = () => {
        if (adminViewMode === 'selection') {
            return <AdminModeSelection onSelect={setAdminViewMode} onLogout={handleGoBack} />;
        }
        
        if (adminViewMode === 'analytics') {
            return (
                <AdminPanel 
                    onExit={handleGoBack} // Acts as exit for the whole admin session, or could trigger view change
                    onLibraryUpdate={() => setImageLibrary(getMergedImageLibrary())}
                    components={components}
                    setComponents={setComponents}
                    projects={projects}
                    onUpdateProjectStatus={handleUpdateProjectStatus}
                    imageLibrary={imageLibrary}
                    isLightMode={isLightMode}
                    onToggleLightMode={() => setIsLightMode(prev => !prev)}
                    onOpenEditModal={handleOpenEditModal}
                    onOpenMaintenanceModal={handleOpenMaintenanceModal}
                    onToggleMaintenance={handleToggleMaintenance}
                    onDeleteComponent={handleDeleteComponent}
                    onBack={() => setAdminViewMode('selection')}
                />
            );
        }

        if (adminViewMode === 'control') {
            return (
                <AdminControlPanel 
                    components={components}
                    imageLibrary={imageLibrary}
                    onLogout={handleGoBack}
                    onBack={() => setAdminViewMode('selection')}
                    onAddComponent={() => setIsAddModalOpen(true)}
                    onOpenScanner={handleOpenScanner}
                    onClearAll={handleClearAll}
                    onOpenShareModal={() => setIsShareModalOpen(true)}
                    onOpenImportModal={() => setIsImportModalOpen(true)}
                    onExport={handleExport}
                    isLightMode={isLightMode}
                    onToggleLightMode={() => setIsLightMode(prev => !prev)}
                    onOpenEditModal={handleOpenEditModal}
                    onOpenIssueModal={handleOpenIssueModal}
                    onReturnIssue={handleReturnIssue}
                    onDelete={handleDeleteComponent}
                    onToggleAvailability={handleToggleAvailability}
                    onOpenMaintenanceModal={handleOpenMaintenanceModal}
                />
            );
        }
    };

    return (
      <>
        {renderAdminContent()}

        {/* Shared Modals for Admin */}
        {isAddModalOpen && <AddComponentModal onClose={() => setIsAddModalOpen(false)} onAddComponent={handleAddComponent} imageLibrary={imageLibrary} />}
        {isEditModalOpen && <EditComponentModal component={componentToEdit} onClose={() => setIsEditModalOpen(false)} onUpdateComponent={handleUpdateComponent} imageLibrary={imageLibrary} />}
        {isMaintenanceModalOpen && <MaintenanceModal component={componentForMaintenance} onClose={() => setIsMaintenanceModalOpen(false)} onToggleMaintenance={handleToggleMaintenance} onAddLog={handleAddMaintenanceLog} onDeleteLog={handleDeleteMaintenanceLog} />}
        {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
        {isImportModalOpen && <ImportCSVModal onClose={() => setIsImportModalOpen(false)} onImport={handleImport} />}
        {isScannerModalOpen && <SmartScannerModal onClose={() => setIsScannerModalOpen(false)} onImageScanned={handleImageScanned} />}
        {isScanResultModalOpen && scannedImageData && <AIComponentScanResultModal imageDataUrl={scannedImageData} onClose={() => { setIsScanResultModalOpen(false); setScannedImageData(null); }} onAddComponent={handleAddComponent} />}
        {isIssueModalOpen && <IssueComponentModal component={componentToIssue} onClose={() => setIsIssueModalOpen(false)} onIssue={handleConfirmIssue} />}
      </>
    );
  }

  // Student Flow
  if (!isStudentLoggedIn) {
      return <StudentLogin onStudentLogin={handleStudentLogin} onBack={handleGoBack} />;
  }
  
  return (
    <>
      <StudentPanel
          studentName={currentStudentName}
          components={components}
          projects={projects}
          onLogout={handleStudentLogout}
          onIssueComponent={handleConfirmIssue}
          onReturnComponent={handleReturnIssue}
          onAddProject={handleAddProject}
          isLightMode={isLightMode}
          onToggleLightMode={() => setIsLightMode(prev => !prev)}
      />

      {/* Global Modals can be placed here, e.g., AI Assistant */}
      {isAssistantModalOpen && (
        <AILabAssistantModal 
          onClose={() => setIsAssistantModalOpen(false)}
          components={components}
        />
      )}
       <button
        onClick={() => setIsAssistantModalOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/50 hover:scale-110 transform transition-transform duration-300 z-30 animate-pulse hover:animate-none"
        aria-label="Open AI Lab Assistant"
      >
        <AIAssistantIcon />
      </button>
    </>
  );
};

export default App;
