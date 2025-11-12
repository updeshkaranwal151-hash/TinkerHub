
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Component, Project, ProjectStatus } from '../types.ts';
import * as localStorageService from '../services/localStorageService.ts';
import { UploadIcon, TrashIcon, EditIcon, EyeIcon, UserIcon, CheckCircleIcon, DatabaseIcon, MaintenanceIcon, WarningIcon, PlusIcon, ProjectIcon, ArrowUpIcon, ArrowDownIcon, SearchIcon, LinkIcon, MoonIcon, SunIcon } from './Icons.tsx'; // Updated imports for new icons
import EditImageModal from './EditImageModal.tsx';
import ConfirmDialog from './ConfirmDialog.tsx';
import EditComponentModal from './EditComponentModal.tsx';
import MaintenanceModal from './MaintenanceModal.tsx';
import ProjectModal from './ProjectModal.tsx';
import AdminImportExportModal from './AdminImportExportModal.tsx';
import { ImageData } from './imageLibrary.ts'; // Corrected import path for ImageData

interface AdminPanelProps {
  onExit: () => void;
  onLibraryUpdate: () => void;
  components: Component[];
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  imageLibrary: Record<string, ImageData[]>;
  isLightMode: boolean;
  onToggleLightMode: () => void;
  // Pass through handlers for modals
  onOpenEditModal: (component: Component) => void;
  onOpenMaintenanceModal: (component: Component) => void;
  onToggleMaintenance: (componentId: string) => void;
  onDeleteComponent: (id: string) => void;
  onOpenEditProjectModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (project: Project) => void;
  onOpenProjectModal: () => void; // For adding new projects from admin
}

type AdminTab = 'analytics' | 'inventory' | 'projects' | 'image-library' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onExit, onLibraryUpdate, components, setComponents, projects, setProjects, 
    imageLibrary, isLightMode, onToggleLightMode,
    onOpenEditModal, onOpenMaintenanceModal, onToggleMaintenance, onDeleteComponent,
    onOpenEditProjectModal, onDeleteProject, onUpdateProject, onOpenProjectModal
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [customLibrary, setCustomLibrary] = useState<Record<string, ImageData[]>>({});
  const [analyticsData, setAnalyticsData] = useState(localStorageService.getAnalyticsData());
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.MICROCONTROLLER);
  
  const [newImageName, setNewImageName] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [imageToEdit, setImageToEdit] = useState<ImageData | null>(null);
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);

  // Inventory Management states
  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; payload?: any } | null>(null);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<Category | 'all'>('all');
  const [inventorySortConfig, setInventorySortConfig] = useState<{ key: 'name' | 'category' | 'quantity' | 'available' | 'maintenance' | 'default', direction: 'ascending' | 'descending' }>({ key: 'default', direction: 'ascending' });
  const [bulkChangeCategory, setBulkChangeCategory] = useState<Category>(Category.GENERAL);

  // Project Management states
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [projectSortConfig, setProjectSortConfig] = useState<{ key: 'name' | 'team' | 'date' | 'status' | 'default', direction: 'ascending' | 'descending' }>({ key: 'default', direction: 'ascending' });

  // Settings states
  // Removed password related states:
  // const [adminPassword, setAdminPassword] = useState('');
  // const [userPassword, setUserPassword] = useState('');
  // const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  // const [currentUserPassword, setCurrentUserPassword] = useState('');
  // const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);


  // Fetch initial data
  useEffect(() => {
    setCustomLibrary(localStorageService.getCustomImageLibrary());
    setAnalyticsData(localStorageService.getAnalyticsData());
    // Removed password initialization:
    // setAdminPassword(localStorageService.getAdminPassword() || '');
    // setUserPassword(localStorageService.getUserPassword() || '');
  }, [components, projects, imageLibrary]); // Re-run if data in App.tsx changes

  // Analytics calculations
  const totalAvailableComponents = useMemo(() => {
    return components.reduce((sum, c) => sum + (c.totalQuantity - (c.issuedTo || []).reduce((acc, issue) => acc + (issue.quantity || 1), 0)), 0);
  }, [components]);

  const componentsUnderMaintenance = useMemo(() => {
    return components.filter(c => c.isUnderMaintenance).length;
  }, [components]);

  const componentsLowStock = useMemo(() => {
    return components.filter(c => {
      const available = c.totalQuantity - (c.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
      return c.lowStockThreshold != null && available <= c.lowStockThreshold && !c.isUnderMaintenance;
    }).length;
  }, [components]);

  const topIssuedComponents = useMemo(() => {
    const issuedCounts = new Map<string, number>();
    components.forEach(comp => {
      const totalIssued = (comp.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
      if (totalIssued > 0) {
        issuedCounts.set(comp.name, totalIssued);
      }
    });
    return Array.from(issuedCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [components]);

  const leastIssuedComponents = useMemo(() => {
    const issuedCounts = new Map<string, number>();
    components.forEach(comp => {
      const totalIssued = (comp.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
      issuedCounts.set(comp.name, totalIssued);
    });
    return Array.from(issuedCounts.entries())
      .sort(([, a], [, b]) => a - b)
      .filter(([, count]) => count === 0) // Only show items never issued
      .slice(0, 5);
  }, [components]);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!newImageName) {
        setNewImageName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAddImage = async () => {
    if (!newImageFile || !newImageName.trim()) {
      alert('Please provide an image and a name.');
      return;
    }
    setIsUploading(true);
    try {
      const base64Url = await convertFileToBase64(newImageFile);
      const newImage: ImageData = { name: newImageName.trim(), url: base64Url };

      const updatedLibrary = { ...customLibrary };
      const categoryImages = updatedLibrary[selectedCategory] || [];
      updatedLibrary[selectedCategory] = [newImage, ...categoryImages];

      localStorageService.saveCustomImageLibrary(updatedLibrary);
      setCustomLibrary(updatedLibrary);
      onLibraryUpdate(); // Notify App.tsx to update its imageLibrary state

      setNewImageName('');
      setNewImageFile(null);
      setPreviewUrl(null);
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('There was an error uploading the image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (category: Category, urlToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this custom image?')) {
        localStorageService.deleteCustomImage(category, urlToDelete);
        const updatedLibrary = localStorageService.getCustomImageLibrary();
        setCustomLibrary(updatedLibrary);
        onLibraryUpdate(); // Notify App.tsx
    }
  };

  const handleOpenEditImageModal = (image: ImageData) => {
    setImageToEdit(image);
    setIsEditImageModalOpen(true);
  };

  const handleSaveImageName = (newName: string) => {
    if (imageToEdit) {
      localStorageService.updateCustomImageName(selectedCategory, imageToEdit.url, newName);
      const updatedLibrary = localStorageService.getCustomImageLibrary();
      setCustomLibrary(updatedLibrary);
      onLibraryUpdate(); // Notify App.tsx
      setIsEditImageModalOpen(false);
      setImageToEdit(null);
    }
  };

  const currentCustomImages = useMemo(() => customLibrary[selectedCategory] || [], [customLibrary, selectedCategory]);

  // Inventory table logic
  const filteredAndSortedComponents = useMemo(() => {
    let filtered = components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(inventorySearchQuery.toLowerCase());
      const matchesCategory = inventoryCategoryFilter === 'all' || component.category === inventoryCategoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (inventorySortConfig.key !== 'default') {
      filtered.sort((a, b) => {
        let valA: any, valB: any;
        switch (inventorySortConfig.key) {
          case 'name':
            valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
            break;
          case 'category':
            valA = a.category.toLowerCase(); valB = b.category.toLowerCase();
            break;
          case 'quantity':
            valA = a.totalQuantity; valB = b.totalQuantity;
            break;
          case 'available':
            valA = a.totalQuantity - (a.issuedTo?.length || 0);
            valB = b.totalQuantity - (b.issuedTo?.length || 0);
            break;
          case 'maintenance':
            valA = a.isUnderMaintenance ? 1 : 0; valB = b.isUnderMaintenance ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (valA < valB) return inventorySortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return inventorySortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [components, inventorySearchQuery, inventoryCategoryFilter, inventorySortConfig]);

  const handleSelectAllComponents = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedComponentIds(new Set(filteredAndSortedComponents.map(c => c.id)));
    } else {
      setSelectedComponentIds(new Set());
    }
  };

  const handleSelectComponent = (id: string, isChecked: boolean) => {
    setSelectedComponentIds(prev => {
      const newSelection = new Set(prev);
      if (isChecked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return newSelection;
    });
  };

  const executeBulkAction = (type: string, payload?: any) => {
    if (selectedComponentIds.size === 0) {
      alert('Please select at least one component.');
      return;
    }

    setConfirmAction({ type, payload });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    const { type, payload } = confirmAction;
    let updatedComponents = [...components];
    let alertMessage = '';

    switch (type) {
      case 'delete-selected-components':
        selectedComponentIds.forEach(id => {
          localStorageService.deleteComponent(id);
        });
        updatedComponents = components.filter(c => !selectedComponentIds.has(c.id));
        alertMessage = `${selectedComponentIds.size} components deleted.`;
        break;
      case 'set-maintenance-status':
        selectedComponentIds.forEach(id => {
          const component = components.find(c => c.id === id);
          if (component) {
            updatedComponents = updatedComponents.map(c => 
              c.id === id ? { ...c, isUnderMaintenance: payload } : c
            );
            localStorageService.updateComponent({ ...component, isUnderMaintenance: payload });
          }
        });
        alertMessage = `${selectedComponentIds.size} components set to ${payload ? 'under maintenance' : 'available'}.`;
        break;
      case 'change-category':
        selectedComponentIds.forEach(id => {
          const component = components.find(c => c.id === id);
          if (component) {
            updatedComponents = updatedComponents.map(c => 
              c.id === id ? { ...c, category: payload } : c
            );
            localStorageService.updateComponent({ ...component, category: payload });
          }
        });
        alertMessage = `${selectedComponentIds.size} components moved to category "${payload}".`;
        break;
      case 'clear-all-data':
        localStorageService.clearAllAppData();
        setComponents([]);
        setProjects([]);
        setCustomLibrary({});
        setAnalyticsData(localStorageService.getAnalyticsData());
        // Removed password state updates:
        // setAdminPassword('');
        // setUserPassword('');
        alertMessage = "All application data has been cleared.";
        onExit(); // Exit admin view after clearing all data
        break;
      case 'delete-selected-projects':
        selectedProjectIds.forEach(id => {
          localStorageService.deleteProject(id);
        });
        setProjects(prev => prev.filter(p => !selectedProjectIds.has(p.id)));
        alertMessage = `${selectedProjectIds.size} projects deleted.`;
        setSelectedProjectIds(new Set()); // Clear selection
        break;
      default:
        break;
    }
    
    setComponents(updatedComponents);
    setSelectedComponentIds(new Set()); // Clear selection after action
    setShowConfirmDialog(false);
    setConfirmAction(null);
    if (alertMessage) alert(alertMessage);
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Project table logic
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
                            project.teamName.toLowerCase().includes(projectSearchQuery.toLowerCase());
      const matchesStatus = projectStatusFilter === 'all' || project.status === projectStatusFilter;
      return matchesSearch && matchesStatus;
    });

    if (projectSortConfig.key !== 'default') {
      filtered.sort((a, b) => {
        let valA: any, valB: any;
        switch (projectSortConfig.key) {
          case 'name':
            valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
            break;
          case 'team':
            valA = a.teamName.toLowerCase(); valB = b.teamName.toLowerCase();
            break;
          case 'date':
            valA = new Date(a.projectDate).getTime(); valB = new Date(b.projectDate).getTime();
            break;
          case 'status':
            valA = a.status.toLowerCase(); valB = b.status.toLowerCase();
            break;
          default:
            return 0;
        }

        if (valA < valB) return projectSortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return projectSortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [projects, projectSearchQuery, projectStatusFilter, projectSortConfig]);

  const handleSelectAllProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedProjectIds(new Set(filteredAndSortedProjects.map(p => p.id)));
    } else {
      setSelectedProjectIds(new Set());
    }
  };

  const handleSelectProject = (id: string, isChecked: boolean) => {
    setSelectedProjectIds(prev => {
      const newSelection = new Set(prev);
      if (isChecked) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return newSelection;
    });
  };

  // Removed password change logic:
  // const handleChangePassword = (role: 'admin' | 'user') => {
  //   setPasswordChangeError(null);
  //   const currentStoredPass = role === 'admin' ? localStorageService.getAdminPassword() : localStorageService.getUserPassword();
  //   const newPass = role === 'admin' ? adminPassword : userPassword;
  //   const currentInputPass = role === 'admin' ? currentAdminPassword : currentUserPassword;

  //   if (!newPass.trim()) {
  //     setPasswordChangeError('New password cannot be empty.');
  //     return;
  //   }
  //   if (currentInputPass !== currentStoredPass) {
  //     setPasswordChangeError('Current password is incorrect.');
  //     return;
  //   }

  //   if (role === 'admin') {
  //     localStorageService.setAdminPassword(newPass);
  //   } else {
  //     localStorageService.setUserPassword(newPass);
  //   }
  //   alert(`${role.charAt(0).toUpperCase() + role.slice(1)} password updated successfully!`);
  //   setPasswordChangeError(null);
  //   setCurrentAdminPassword('');
  //   setCurrentUserPassword('');
  // };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
        <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-slate-700/50">
          <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Comprehensive Management</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                  onClick={onToggleLightMode}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition duration-300"
                  aria-label={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                  {isLightMode ? <MoonIcon /> : <SunIcon />}
              </button>
              <button onClick={onExit} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-300">
                Exit Admin View
              </button>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8 flex-grow">
          <div className="flex-shrink-0 flex justify-center mb-6 border-b border-slate-700/50">
            {['analytics', 'inventory', 'projects', 'image-library', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as AdminTab)}
                className={`py-3 px-4 text-base font-semibold transition-colors duration-300 rounded-t-lg ${activeTab === tab ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          <div className="admin-panel">
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="p-6 bg-slate-800/70 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-bold text-sky-400 mb-4">Analytics Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <EyeIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Total Visits</h3>
                        <p className="text-3xl font-bold">{analyticsData.totalVisits}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <UserIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Unique Visitors</h3>
                        <p className="text-3xl font-bold">{analyticsData.uniqueVisitors}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <CheckCircleIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Successful Logins</h3>
                        <p className="text-3xl font-bold">{analyticsData.successfulLogins}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <DatabaseIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Total Components</h3>
                        <p className="text-3xl font-bold">{components.length}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <ProjectIcon className="h-5 w-5" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Total Projects</h3>
                        <p className="text-3xl font-bold">{projects.length}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <LinkIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Total Qty Available</h3>
                        <p className="text-3xl font-bold">{totalAvailableComponents}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <MaintenanceIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Under Maintenance</h3>
                        <p className="text-3xl font-bold">{componentsUnderMaintenance}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <WarningIcon />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Low Stock Alerts</h3>
                        <p className="text-3xl font-bold">{componentsLowStock}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-sky-400 mb-4">Top 5 Issued Components</h3>
                    {topIssuedComponents.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {topIssuedComponents.map(([name, count]) => (
                          <li key={name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                            <span>{name}</span>
                            <span className="font-bold text-indigo-400">{count} issues</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-slate-500 italic">No components have been issued yet.</p>}
                  </div>

                  <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-sky-400 mb-4">Top 5 Least Issued / Never Issued Components</h3>
                    {leastIssuedComponents.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {leastIssuedComponents.map(([name, count]) => (
                          <li key={name} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                            <span>{name}</span>
                            <span className="font-bold text-green-400">{count} issues</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-slate-500 italic">All components have been issued at least once or there are less than 5 components.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-sky-400 mb-4">Manage Inventory</h2>
                {/* Inventory Filter Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-grow">
                      <div className="relative flex-grow">
                          <input
                              type="text"
                              placeholder="Search by component name..."
                              value={inventorySearchQuery}
                              onChange={e => setInventorySearchQuery(e.target.value)}
                              className="w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              aria-label="Search components"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SearchIcon />
                          </div>
                      </div>
                      <select
                          value={inventoryCategoryFilter}
                          onChange={e => setInventoryCategoryFilter(e.target.value as Category | 'all')}
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
                            value={inventorySortConfig.key}
                            onChange={e => setInventorySortConfig({ ...inventorySortConfig, key: e.target.value as any })}
                            className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Sort by"
                        >
                            <option value="default">Default Sort</option>
                            <option value="name">Name</option>
                            <option value="category">Category</option>
                            <option value="quantity">Total Quantity</option>
                            <option value="available">Available Quantity</option>
                            <option value="maintenance">Maintenance Status</option>
                        </select>
                        <button
                            onClick={() => setInventorySortConfig({ ...inventorySortConfig, direction: inventorySortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
                            disabled={inventorySortConfig.key === 'default'}
                            className="p-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            aria-label={`Sort ${inventorySortConfig.direction === 'ascending' ? 'descending' : 'ascending'}`}
                        >
                            {inventorySortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                  <span className="text-slate-300 font-semibold">Bulk Actions ({selectedComponentIds.size} selected):</span>
                  <button
                    onClick={() => executeBulkAction('delete-selected-components')}
                    disabled={selectedComponentIds.size === 0}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    <TrashIcon className="inline-block h-4 w-4 mr-1" /> Delete Selected
                  </button>
                  <button
                    onClick={() => executeBulkAction('set-maintenance-status', true)}
                    disabled={selectedComponentIds.size === 0}
                    className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    <MaintenanceIcon className="inline-block h-4 w-4 mr-1" /> Set to Maintenance
                  </button>
                  <button
                    onClick={() => executeBulkAction('set-maintenance-status', false)}
                    disabled={selectedComponentIds.size === 0}
                    className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    <CheckCircleIcon className="inline-block h-4 w-4 mr-1" /> Set to Available
                  </button>
                  <div className="flex items-center gap-2">
                    <select
                      value={bulkChangeCategory}
                      onChange={e => setBulkChangeCategory(e.target.value as Category)}
                      className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Bulk change category to"
                    >
                      {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => executeBulkAction('change-category', bulkChangeCategory)}
                      disabled={selectedComponentIds.size === 0}
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      Change Category
                    </button>
                  </div>
                </div>

                {/* Components Table */}
                <div className="bg-slate-800/70 border border-slate-700 rounded-lg overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left table-auto">
                    <thead className="sticky top-0 bg-slate-700/90 border-b border-slate-600">
                      <tr>
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-600"
                            onChange={handleSelectAllComponents}
                            checked={selectedComponentIds.size === filteredAndSortedComponents.length && filteredAndSortedComponents.length > 0}
                            aria-label="Select all components"
                          />
                        </th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-center">Total Qty</th>
                        <th className="p-3 text-center">Available</th>
                        <th className="p-3 text-center">Issued</th>
                        <th className="p-3 text-center">Maintenance</th>
                        <th className="p-3 text-center w-36">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedComponents.length > 0 ? (
                        filteredAndSortedComponents.map(component => {
                          const available = component.totalQuantity - (component.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
                          const issuedCount = (component.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
                          return (
                            <tr key={component.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-700/50">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-600"
                                  checked={selectedComponentIds.has(component.id)}
                                  onChange={e => handleSelectComponent(component.id, e.target.checked)}
                                  aria-label={`Select ${component.name}`}
                                />
                              </td>
                              <td className="p-3 font-medium text-white">{component.name}</td>
                              <td className="p-3 text-slate-300">{component.category}</td>
                              <td className="p-3 text-center text-slate-300">{component.totalQuantity}</td>
                              <td className="p-3 text-center text-green-400 font-semibold">{available}</td>
                              <td className="p-3 text-center text-yellow-400">{issuedCount}</td>
                              <td className="p-3 text-center">
                                <label htmlFor={`admin-maintenance-toggle-${component.id}`} className="flex items-center justify-center cursor-pointer">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      id={`admin-maintenance-toggle-${component.id}`}
                                      className="sr-only"
                                      checked={component.isUnderMaintenance}
                                      onChange={() => onToggleMaintenance(component.id)}
                                    />
                                    <div className="block bg-slate-600 w-10 h-6 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${component.isUnderMaintenance ? 'translate-x-4 bg-orange-400' : 'bg-green-400'}`}></div>
                                  </div>
                                </label>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => onOpenEditModal(component)} className="p-2 bg-slate-600 hover:bg-sky-600 rounded-md text-white" title="Edit Component"><EditIcon /></button>
                                  <button onClick={() => onOpenMaintenanceModal(component)} className="p-2 bg-slate-600 hover:bg-orange-600 rounded-md text-white" title="Manage Maintenance"><MaintenanceIcon /></button>
                                  <button onClick={() => onDeleteComponent(component.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-md text-white" title="Delete Component"><TrashIcon /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-4 text-center text-slate-500">No components match your criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-sky-400 mb-4">Manage Projects</h2>
                 {/* Project Filter Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-grow">
                      <div className="relative flex-grow">
                          <input
                              type="text"
                              placeholder="Search by project name or team..."
                              value={projectSearchQuery}
                              onChange={e => setProjectSearchQuery(e.target.value)}
                              className="w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              aria-label="Search projects"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SearchIcon />
                          </div>
                      </div>
                      <select
                          value={projectStatusFilter}
                          onChange={e => setProjectStatusFilter(e.target.value as ProjectStatus | 'all')}
                          className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label="Filter by status"
                      >
                          <option value="all">All Statuses</option>
                          {Object.values(ProjectStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                          ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                        <select
                            value={projectSortConfig.key}
                            onChange={e => setProjectSortConfig({ ...projectSortConfig, key: e.target.value as any })}
                            className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Sort by"
                        >
                            <option value="default">Default Sort</option>
                            <option value="name">Name</option>
                            <option value="team">Team Name</option>
                            <option value="date">Project Date</option>
                            <option value="status">Status</option>
                        </select>
                        <button
                            onClick={() => setProjectSortConfig({ ...projectSortConfig, direction: projectSortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
                            disabled={projectSortConfig.key === 'default'}
                            className="p-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            aria-label={`Sort ${projectSortConfig.direction === 'ascending' ? 'descending' : 'ascending'}`}
                        >
                            {projectSortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </button>
                    </div>
                </div>

                {/* Bulk Project Actions */}
                <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                  <span className="text-slate-300 font-semibold">Bulk Actions ({selectedProjectIds.size} selected):</span>
                  <button
                    onClick={() => executeBulkAction('delete-selected-projects')}
                    disabled={selectedProjectIds.size === 0}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    <TrashIcon className="inline-block h-4 w-4 mr-1" /> Delete Selected
                  </button>
                  <button
                    onClick={onOpenProjectModal} // Directly opens add project modal
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                  >
                    <PlusIcon className="inline-block h-4 w-4 mr-1" /> Add New Project
                  </button>
                </div>

                {/* Projects Table */}
                <div className="bg-slate-800/70 border border-slate-700 rounded-lg overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left table-auto">
                    <thead className="sticky top-0 bg-slate-700/90 border-b border-slate-600">
                      <tr>
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-600"
                            onChange={handleSelectAllProjects}
                            checked={selectedProjectIds.size === filteredAndSortedProjects.length && filteredAndSortedProjects.length > 0}
                            aria-label="Select all projects"
                          />
                        </th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Team</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center w-36">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedProjects.length > 0 ? (
                        filteredAndSortedProjects.map(project => (
                          <tr key={project.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-700/50">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-600"
                                checked={selectedProjectIds.has(project.id)}
                                onChange={e => handleSelectProject(project.id, e.target.checked)}
                                aria-label={`Select ${project.name}`}
                              />
                            </td>
                            <td className="p-3 font-medium text-white">{project.name}</td>
                            <td className="p-3 text-slate-300">{project.teamName}</td>
                            <td className="p-3 text-slate-300">{new Date(project.projectDate).toLocaleDateString()}</td>
                            <td className="p-3 text-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border 
                                    ${project.status === ProjectStatus.IN_PROGRESS ? "bg-sky-500/30 text-sky-300 border-sky-500/50" : ""}
                                    ${project.status === ProjectStatus.COMPLETED ? "bg-green-500/30 text-green-300 border-green-500/50" : ""}
                                    ${project.status === ProjectStatus.ON_HOLD ? "bg-yellow-500/30 text-yellow-300 border-yellow-500/50" : ""}
                                `}>
                                    {project.status}
                                </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => onOpenEditProjectModal(project)} className="p-2 bg-slate-600 hover:bg-sky-600 rounded-md text-white" title="Edit Project"><EditIcon /></button>
                                <button onClick={() => onDeleteProject(project.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-md text-white" title="Delete Project"><TrashIcon /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500">No projects match your criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'image-library' && (
              <div className="grid grid-cols-1 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                       <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                          <h2 className="text-xl font-bold text-sky-400 mb-4">1. Select Category to Manage</h2>
                          <select
                              value={selectedCategory}
                              onChange={e => setSelectedCategory(e.target.value as Category)}
                              className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                              {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                      </div>
                      <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                          <h2 className="text-xl font-bold text-sky-400 mb-4">2. Add New Image</h2>
                          <div className="space-y-4">
                              <div>
                                   <label htmlFor="imageName" className="block text-sm font-medium text-slate-300 mb-1">Image Name</label>
                                   <input type="text" id="imageName" value={newImageName} onChange={e => setNewImageName(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white"/>
                              </div>
                              <div>
                                  <label htmlFor="imageFile" className="block text-sm font-medium text-slate-300 mb-1">Image File</label>
                                  <input type="file" id="imageFile" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"/>
                              </div>
                              {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 rounded-md max-h-32 w-auto mx-auto bg-slate-700 p-1" />}
                              <button onClick={handleAddImage} disabled={isUploading || !newImageFile} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                  <UploadIcon /> {isUploading ? 'Uploading...' : 'Add Image'}
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2 bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                      <h2 className="text-xl font-bold text-sky-400 mb-4">Images for <span className="text-white">{selectedCategory}</span></h2>
                      
                      <div>
                          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-600 pb-2 mb-4">Custom Uploaded Images ({currentCustomImages.length})</h3>
                          {currentCustomImages.length > 0 ? (
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                  {currentCustomImages.map(img => (
                                      <div key={img.url} className="relative group aspect-square">
                                          <img src={img.url} alt={img.name} title={img.name} className="w-full h-full object-contain bg-slate-700 rounded-md p-1"/>
                                          <div className="absolute top-1 right-1 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEditImageModal(img)} className="p-1.5 bg-sky-600/80 text-white rounded-full backdrop-blur-sm">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleDeleteImage(selectedCategory, img.url)} className="p-1.5 bg-red-600/80 text-white rounded-full backdrop-blur-sm">
                                                <TrashIcon />
                                            </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : <p className="text-slate-500 italic">No custom images uploaded for this category yet.</p>}
                      </div>
                  </div>
              </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8">
                    <h2 className="text-xl font-bold text-sky-400 mb-4">Application Settings</h2>
                    
                    {/* Removed Password Management Section
                    <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-bold text-sky-400 mb-4">Password Management</h3>
                        {passwordChangeError && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{passwordChangeError}</p>}
                        
                        <div className="space-y-6">
                            {/* Admin Password 
                            <div>
                                <h4 className="text-lg font-semibold text-slate-300 mb-2">Change Admin Password</h4>
                                <div className="space-y-2">
                                    <div>
                                        <label htmlFor="currentAdminPass" className="block text-sm font-medium text-slate-400">Current Admin Password</label>
                                        <input type="password" id="currentAdminPass" value={currentAdminPassword} onChange={e => setCurrentAdminPassword(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="newAdminPass" className="block text-sm font-medium text-slate-400">New Admin Password</label>
                                        <input type="password" id="newAdminPass" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                                    </div>
                                    <button onClick={() => handleChangePassword('admin')} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition">Update Admin Password</button>
                                </div>
                            </div>

                            {/* User Password 
                            <div>
                                <h4 className="text-lg font-semibold text-slate-300 mb-2">Change User Password</h4>
                                <div className="space-y-2">
                                    <div>
                                        <label htmlFor="currentUserPass" className="block text-sm font-medium text-slate-400">Current User Password</label>
                                        <input type="password" id="currentUserPass" value={currentUserPassword} onChange={e => setCurrentUserPassword(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="newUserPass" className="block text-sm font-medium text-slate-400">New User Password</label>
                                        <input type="password" id="newUserPass" value={userPassword} onChange={e => setUserPassword(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white" />
                                    </div>
                                    <button onClick={() => handleChangePassword('user')} className="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition">Update User Password</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}

                    <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-bold text-sky-400 mb-4">Data Management</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setIsImportExportModalOpen(true)}
                                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition"
                            >
                                Import / Export All Data
                            </button>
                            <button
                                onClick={() => executeBulkAction('clear-all-data')}
                                className="flex-1 py-3 px-6 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-800/30 transition"
                            >
                                Clear All App Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </main>
      </div>
      
      {isEditImageModalOpen && (
        <EditImageModal
          image={imageToEdit}
          onClose={() => setIsEditImageModalOpen(false)}
          onSave={handleSaveImageName}
        />
      )}
      
      {showConfirmDialog && confirmAction && (
        <ConfirmDialog
          message={
            confirmAction.type === 'delete-selected-components' ? `Are you sure you want to delete ${selectedComponentIds.size} selected components? This cannot be undone.` :
            confirmAction.type === 'set-maintenance-status' && confirmAction.payload === true ? `Are you sure you want to set ${selectedComponentIds.size} components to 'Under Maintenance'?` :
            confirmAction.type === 'set-maintenance-status' && confirmAction.payload === false ? `Are you sure you want to set ${selectedComponentIds.size} components to 'Available'?` :
            confirmAction.type === 'change-category' ? `Are you sure you want to change the category of ${selectedComponentIds.size} components to "${confirmAction.payload}"?` :
            confirmAction.type === 'clear-all-data' ? `WARNING: This will delete ALL data (components, projects, images, analytics, and passwords). This action cannot be undone. Are you absolutely sure?` :
            confirmAction.type === 'delete-selected-projects' ? `Are you sure you want to delete ${selectedProjectIds.size} selected projects? This cannot be undone.` :
            "Are you sure you want to perform this action?"
          }
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
          confirmButtonClass={confirmAction.type === 'clear-all-data' || confirmAction.type.startsWith('delete') ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
        />
      )}

      {isImportExportModalOpen && (
        <AdminImportExportModal
          onClose={() => setIsImportExportModalOpen(false)}
          components={components}
          setComponents={setComponents}
          projects={projects}
          setProjects={setProjects}
          // FIX: Pass the correct setter function for customImageLibrary
          setCustomImageLibrary={setCustomLibrary}
          setAnalyticsData={setAnalyticsData}
          onLibraryUpdate={onLibraryUpdate}
        />
      )}

    </>
  );
};

export default AdminPanel;