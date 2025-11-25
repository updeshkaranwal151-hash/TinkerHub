import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase.ts';
import { Component, Project, ProjectStatus, UserProfile } from './types.ts';
import * as firestoreService from './services/firestoreService.ts';
import * as localStorageService from './services/localStorageService.ts';

import SplashScreen from './components/SplashScreen.tsx';
import LandingPage from './components/LandingPage.tsx';
import Login from './components/Login.tsx';
import AdminControlPanel from './components/AdminControlPanel.tsx';
import StudentPanel from './components/StudentPanel.tsx';
import RoleSelection from './components/RoleSelection.tsx';
import LicenseKeyEntry from './components/LicenseKeyEntry.tsx';
import SchoolSelection from './components/SchoolSelection.tsx';

// Modals
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import AILabAssistantModal from './components/AILabAssistantModal.tsx';
import ImportCSVModal from './components/ImportCSVModal.tsx';
import MaintenanceModal from './components/MaintenanceModal.tsx';
import SmartScannerModal from './components/SmartScannerModal.tsx';
import AIComponentScanResultModal from './components/AIComponentScanResultModal.tsx';

import { AIAssistantIcon } from './components/Icons.tsx';
import { imageLibrary as defaultImageLibrary, ImageData } from './components/imageLibrary.ts';

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

type AppState = 'loading' | 'landing' | 'auth' | 'roleSelection' | 'licenseEntry' | 'schoolSelection' | 'dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string | null>(null);

  const [components, setComponents] = useState<Component[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [imageLibrary, setImageLibrary] = useState(getMergedImageLibrary());
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isScanResultModalOpen, setIsScanResultModalOpen] = useState(false);
  
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [componentForMaintenance, setComponentForMaintenance] = useState<Component | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
  const [scannedImageData, setScannedImageData] = useState<string | null>(null);
  const [isLightMode, setIsLightMode] = useState<boolean>(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        const profile = await firestoreService.getUserProfile(user.uid);
        setUserProfile(profile);
        if (profile) {
          if (profile.role === 'admin' && profile.schoolId) {
            setSelectedSchoolId(profile.schoolId);
            setSelectedSchoolName(profile.schoolName || 'Admin');
            setAppState('dashboard');
          } else {
            setAppState('schoolSelection');
          }
        } else {
          setAppState('roleSelection');
        }
      } else {
        setUserProfile(null);
        setSelectedSchoolId(null);
        setAppState('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [componentData, projectData] = await Promise.all([
            firestoreService.getComponents(selectedSchoolId),
            firestoreService.getProjects(selectedSchoolId)
          ]);
          setComponents(componentData);
          setProjects(projectData);
        } catch (err) {
          console.error("Error fetching school data:", err);
          alert("Could not load data for the selected school.");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else {
      setComponents([]);
      setProjects([]);
    }
  }, [selectedSchoolId]);

  useEffect(() => { document.body.classList.toggle('light-mode', isLightMode); localStorage.setItem('theme', isLightMode ? 'light' : 'dark'); }, [isLightMode]);
  
  const handleLogout = async () => { await signOut(auth); };

  const handleAddComponent = async (data: Omit<Component, 'id' | 'createdAt'>) => {
    if (!selectedSchoolId) return;
    const newComponent = await firestoreService.addComponent(selectedSchoolId, data);
    setComponents(prev => [newComponent, ...prev]);
    setIsAddModalOpen(false);
    setIsScanResultModalOpen(false);
  };
  
  const handleUpdateComponent = async (data: Component) => {
    if (!selectedSchoolId) return;
    await firestoreService.updateComponent(selectedSchoolId, data);
    setComponents(p => p.map(c => c.id === data.id ? data : c));
    setIsEditModalOpen(false);
  };
  
  const handleDeleteComponent = async (id: string) => {
    if (!selectedSchoolId || !window.confirm('Are you sure?')) return;
    await firestoreService.deleteComponent(selectedSchoolId, id);
    setComponents(p => p.filter(c => c.id !== id));
  };
  
  const handleAddProject = async (data: Omit<Project, 'id'|'submittedAt'|'status'>) => {
    if (!selectedSchoolId) return;
    const newProject = await firestoreService.addProject(selectedSchoolId, data);
    setProjects(p => [newProject, ...p]);
  };
  
  const handleUpdateProjectStatus = async (projectId: string, status: ProjectStatus, feedback?: string) => {
    if(!selectedSchoolId) return;
    const updated = await firestoreService.updateProjectStatus(selectedSchoolId, projectId, status, feedback);
    setProjects(p => p.map(proj => proj.id === projectId ? updated : proj));
  };

  const handleReturnIssue = async (componentId: string, issueId: string) => {
    if(!selectedSchoolId) return;
    const updated = await firestoreService.returnIssue(selectedSchoolId, componentId, issueId);
    setComponents(p => p.map(c => c.id === componentId ? updated : c));
  };

  const handleConfirmIssue = async (componentId: string, studentName: string, quantity: number) => {
    if(!selectedSchoolId) return;
    const updated = await firestoreService.issueComponent(selectedSchoolId, componentId, studentName, quantity);
    setComponents(p => p.map(c => c.id === componentId ? updated : c));
    setIsIssueModalOpen(false);
  };


  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <SplashScreen onFinished={() => {}} />;
      case 'landing':
        return <LandingPage onGetStarted={() => setAppState('auth')} />;
      case 'auth':
        return <Login />;
      case 'roleSelection':
        if (!authUser) return <Login />;
        return <RoleSelection user={authUser} onRoleSelected={profile => { setUserProfile(profile); setAppState(profile.role === 'admin' ? 'licenseEntry' : 'schoolSelection'); }} />;
      case 'licenseEntry':
        if (!authUser || !userProfile) return <Login />;
        return <LicenseKeyEntry user={authUser} onLicenseVerified={(schoolId, schoolName) => { setSelectedSchoolId(schoolId); setSelectedSchoolName(schoolName); setAppState('dashboard'); }} />;
      case 'schoolSelection':
        return <SchoolSelection onSchoolSelected={(id, name) => { setSelectedSchoolId(id); setSelectedSchoolName(name); setAppState('dashboard'); }} onLogout={handleLogout} />;
      case 'dashboard':
        if (!userProfile || !selectedSchoolId || !selectedSchoolName) return <SplashScreen onFinished={()=>{}}/>; // Or a loading indicator
        if (userProfile.role === 'admin') {
          return (
            <AdminControlPanel
              components={components}
              imageLibrary={imageLibrary}
              onLogout={handleLogout}
              onBack={() => setAppState('landing')} // Simple logout for now
              onAddComponent={() => setIsAddModalOpen(true)}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onClearAll={() => {}}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenImportModal={() => {}}
              onExport={() => {}}
              isLightMode={isLightMode}
              onToggleLightMode={() => setIsLightMode(p => !p)}
              onOpenEditModal={(c) => { setComponentToEdit(c); setIsEditModalOpen(true); }}
              onOpenIssueModal={(c) => { setComponentToIssue(c); setIsIssueModalOpen(true); }}
              onReturnIssue={handleReturnIssue}
              onDelete={handleDeleteComponent}
              onToggleAvailability={() => {}} // TODO: Implement
              onOpenMaintenanceModal={(c) => { setComponentForMaintenance(c); setIsMaintenanceModalOpen(true); }}
            />
          );
        }
        if (userProfile.role === 'student') {
          return (
             <StudentPanel
                studentName={authUser?.displayName || authUser?.email?.split('@')[0] || 'Student'}
                components={components}
                projects={projects}
                onLogout={handleLogout}
                onIssueComponent={handleConfirmIssue}
                onReturnComponent={handleReturnIssue}
                onAddProject={handleAddProject}
                isLightMode={isLightMode}
                onToggleLightMode={() => setIsLightMode(p => !p)}
             />
          );
        }
    }
    return <SplashScreen onFinished={() => {}} />;
  };

  return (
    <>
      {renderContent()}
      
      {/* Shared Modals */}
      {selectedSchoolId && isAddModalOpen && <AddComponentModal onClose={() => setIsAddModalOpen(false)} onAddComponent={handleAddComponent} imageLibrary={imageLibrary} />}
      {selectedSchoolId && isEditModalOpen && <EditComponentModal component={componentToEdit} onClose={() => setIsEditModalOpen(false)} onUpdateComponent={handleUpdateComponent} imageLibrary={imageLibrary} />}
      {selectedSchoolId && isIssueModalOpen && <IssueComponentModal component={componentToIssue} onClose={() => setIsIssueModalOpen(false)} onIssue={handleConfirmIssue} />}
      {selectedSchoolId && isMaintenanceModalOpen && <MaintenanceModal component={componentForMaintenance} onClose={() => setIsMaintenanceModalOpen(false)} onToggleMaintenance={()=>{}} onAddLog={()=>{}} onDeleteLog={()=>{}} />}
      
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
      {isScannerModalOpen && <SmartScannerModal onClose={() => setIsScannerModalOpen(false)} onImageScanned={(img) => { setScannedImageData(img); setIsScanResultModalOpen(true); }} />}
      {scannedImageData && isScanResultModalOpen && <AIComponentScanResultModal imageDataUrl={scannedImageData} onClose={() => setIsScanResultModalOpen(false)} onAddComponent={handleAddComponent} />}

      {appState === 'dashboard' && (
        <button onClick={() => setIsAssistantModalOpen(true)} className="fixed bottom-4 right-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/50 hover:scale-110 transform transition-transform duration-300 z-30 animate-pulse hover:animate-none">
          <AIAssistantIcon />
        </button>
      )}
      {isAssistantModalOpen && <AILabAssistantModal onClose={() => setIsAssistantModalOpen(false)} components={components} />}
    </>
  );
};

export default App;
