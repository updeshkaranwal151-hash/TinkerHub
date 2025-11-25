import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase.ts';
import { Component, Project, ProjectStatus } from './types.ts';
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import * as firestoreService from './services/firestoreService.ts';
import AILabAssistantModal from './components/AILabAssistantModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AdminModeSelection from './components/AdminModeSelection.tsx';
import AdminControlPanel from './components/AdminControlPanel.tsx';
import { imageLibrary as defaultImageLibrary, ImageData } from './components/imageLibrary.ts';
import * as localStorageService from './services/localStorageService.ts'; // Keep for non-data services
import ImportCSVModal from './components/ImportCSVModal.tsx';
import MaintenanceModal from './components/MaintenanceModal.tsx';
import LandingPage from './components/LandingPage.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import SmartScannerModal from './components/SmartScannerModal.tsx';
import AIComponentScanResultModal from './components/AIComponentScanResultModal.tsx';
import StudentPanel from './components/StudentPanel.tsx';
import { AIAssistantIcon } from './components/Icons.tsx';
import Login from './components/Login.tsx';


// Helper to merge default and custom image libraries
const getMergedImageLibrary = (): Record<string, ImageData[]> => {
  const customLibrary = localStorageService.getCustomImageLibrary();
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
  
  // --- New Firebase Auth State ---
  const [authUser, setAuthUser] = useState<User | null | 'loading'>('loading');
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

  // --- Role derivation from Auth User ---
  const isAdmin = useMemo(() => authUser && authUser !== 'loading' && authUser.email === 'admin@tinkerhub.com', [authUser]);
  const isStudent = useMemo(() => authUser && authUser !== 'loading' && !isAdmin, [authUser]);
  const currentStudentName = useMemo(() => {
    if (isStudent && authUser && authUser.email) {
      // Derive name from email, e.g., "jane.doe" from "jane.doe@example.com"
      const emailName = authUser.email.split('@')[0];
      return emailName.replace(/[\._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    }
    return '';
  }, [authUser, isStudent]);


  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user) {
        localStorageService.trackSuccessfulLogin();
      }
    });
    return () => unsubscribe();
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
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [componentData, projectData] = await Promise.all([
                firestoreService.getComponents(),
                firestoreService.getProjects()
            ]);
            setComponents(componentData);
            setProjects(projectData);
            setImageLibrary(getMergedImageLibrary());
        } catch (err) {
            console.error("Error fetching data from Firestore:", err);
            alert("Could not connect to the database. Please check your internet connection and refresh.");
        } finally {
            setIsLoading(false);
        }
    };

    if (authUser && authUser !== 'loading') {
        fetchData();
    } else {
        setComponents([]);
        setProjects([]);
        setImageLibrary(getMergedImageLibrary());
    }
}, [authUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminViewMode('selection'); // Reset admin view on logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
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


  const handleAddComponent = async (newComponentData: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>) => {
    try {
        const componentToAdd: Omit<Component, 'id' | 'createdAt'> = {
            ...newComponentData,
            isUnderMaintenance: false,
            maintenanceLog: [],
        };
        const addedComponent = await firestoreService.addComponent(componentToAdd);
        setComponents(prev => [addedComponent, ...prev]);
        setIsAddModalOpen(false);
        setIsScanResultModalOpen(false);
        setScannedImageData(null);
    } catch (err) {
        alert("Error adding component. Please try again.");
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
        await firestoreService.deleteComponent(id);
        setComponents(prev => prev.filter(c => c.id !== id));
    }
  };
  
  const handleOpenEditModal = (component: Component) => {
    setComponentToEdit(component);
    setIsEditModalOpen(true);
  };

  const handleUpdateComponent = async (updatedComponent: Component) => {
    await firestoreService.updateComponent(updatedComponent);
    setComponents(prev =>
        prev.map(c => (c.id === updatedComponent.id ? updatedComponent : c))
    );
    setIsEditModalOpen(false);
    setComponentToEdit(null);
  };

  const handleConfirmIssue = async (componentId: string, studentName: string, quantity: number) => {
    const updatedComponent = await firestoreService.issueComponent(componentId, studentName, quantity);
     setComponents(prev => 
        prev.map(c => 
            c.id === componentId ? updatedComponent : c
        )
    );
    setIsIssueModalOpen(false);
    setComponentToIssue(null);
  };

  const handleReturnIssue = async (componentId: string, issueId: string) => {
     const updatedComponent = await firestoreService.returnIssue(componentId, issueId);
    setComponents(prev =>
        prev.map(c =>
            c.id === componentId ? updatedComponent : c
        )
    );
  };
  
  const handleToggleAvailability = async (component: Component) => {
    const updatedComponent = await firestoreService.toggleAvailability(component);
     setComponents(prev =>
        prev.map(c => (c.id === component.id ? updatedComponent : c))
    );
  };

  const handleOpenMaintenanceModal = (component: Component) => {
      setComponentForMaintenance(component);
      setIsMaintenanceModalOpen(true);
  };
  
  const handleToggleMaintenance = async (componentId: string) => {
      const updatedComponent = await firestoreService.toggleMaintenanceStatus(componentId);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(prev => (prev && prev.id === componentId ? updatedComponent : prev));
  };
  
  const handleAddMaintenanceLog = async (componentId: string, notes: string) => {
      const updatedComponent = await firestoreService.addMaintenanceLog(componentId, notes);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(prev => (prev && prev.id === componentId ? updatedComponent : prev));
  };
  
  const handleDeleteMaintenanceLog = async (componentId: string, logId: string) => {
      const updatedComponent = await firestoreService.deleteMaintenanceLog(componentId, logId);
      setComponents(prev => prev.map(c => c.id === componentId ? updatedComponent : c));
      setComponentForMaintenance(prev => (prev && prev.id === componentId ? updatedComponent : prev));
  };
  
  const handleAddProject = async (projectData: Omit<Project, 'id' | 'submittedAt' | 'status'>) => {
      const newProject = await firestoreService.addProject(projectData);
      setProjects(prev => [newProject, ...prev]);
  };
  
  const handleUpdateProjectStatus = async (projectId: string, status: ProjectStatus, feedback?: string) => {
      const updatedProject = await firestoreService.updateProjectStatus(projectId, status, feedback);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
  };

  const handleClearAll = async () => {
    if(window.confirm('Are you sure you want to delete ALL components? This cannot be undone.')) {
        await firestoreService.clearAllComponents();
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
  
  const handleImport = async (importedComponents: Omit<Component, 'id' | 'createdAt'>[]) => {
    try {
        const addPromises = importedComponents.map(comp => firestoreService.addComponent(comp));
        const newComponents = await Promise.all(addPromises);
        setComponents(prev => [...newComponents, ...prev]);
        setIsImportModalOpen(false);
    } catch (error) {
        alert("Error importing components. Please check the console for details.");
        console.error("Bulk import error:", error);
    }
  };


  if (showSplashScreen || authUser === 'loading') {
    return <SplashScreen onFinished={() => setShowSplashScreen(false)} />;
  }

  if (showLandingPage && (!authUser || authUser === 'loading')) {
    return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
  }
  
  if (!authUser) {
    return <Login />;
  }

  // Admin Flow
  if (isAdmin) {
    const renderAdminContent = () => {
        if (adminViewMode === 'selection') {
            return <AdminModeSelection onSelect={setAdminViewMode} onLogout={handleLogout} />;
        }
        
        if (adminViewMode === 'analytics') {
            return (
                <AdminPanel 
                    onExit={handleLogout}
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
                    onLogout={handleLogout}
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
  if (isStudent) {
    return (
      <>
        <StudentPanel
            studentName={currentStudentName}
            components={components}
            projects={projects}
            onLogout={handleLogout}
            onIssueComponent={handleConfirmIssue}
            onReturnComponent={handleReturnIssue}
            onAddProject={handleAddProject}
            isLightMode={isLightMode}
            onToggleLightMode={() => setIsLightMode(prev => !prev)}
        />
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
  }

  // Fallback for unknown user roles, though should not be reached with current logic
  return <Login />;
};

export default App;
