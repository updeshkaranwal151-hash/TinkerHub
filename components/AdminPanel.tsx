import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Category } from '../types.ts';
import type { ImageData, BackupData, AnalyticsData, Component, Project } from '../types.ts';
import * as localStorageService from '../services/localStorageService.ts'; // Changed from apiService
import * as customImageService from '../services/customImageService';
import { UploadIcon, TrashIcon, EditIcon, EyeIcon, UsersIcon, CheckCircleIcon, DashboardIcon, ImageIcon, HardDriveIcon, ExportIcon, ImportIcon, ChartBarIcon, WarningIcon, ProjectIcon as ProjectIconSvg, DatabaseIcon } from './Icons.tsx';
import EditImageModal from './EditImageModal.tsx';

interface AdminPanelProps {
  onExit: () => void;
  onLibraryUpdate: () => void;
  onClearAllComponents: () => void;
  onClearAllProjects: () => void;
  onDataRestored: () => void;
}

type AdminTab = 'dashboard' | 'images' | 'data';

interface DashboardStats {
    analytics: AnalyticsData;
    totalComponentTypes: number;
    totalComponentUnits: number;
    totalProjects: number;
    lowStockCount: number;
    maintenanceCount: number;
    mostIssued: { name: string; count: number };
    categoryDistribution: Record<Category, number>;
}

const DashboardView: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [components, projects, analytics] = await Promise.all([
                    localStorageService.getComponents(), // Changed from apiService
                    localStorageService.getProjects(),   // Changed from apiService
                    localStorageService.getAnalyticsData(), // Changed from apiService
                ]);
                
                const totalComponentUnits = components.reduce((sum, c) => sum + c.totalQuantity, 0);
                const lowStockCount = components.filter(c => {
                    const available = c.totalQuantity - (c.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
                    return c.lowStockThreshold != null && available <= c.lowStockThreshold && !c.isUnderMaintenance;
                }).length;
                const maintenanceCount = components.filter(c => c.isUnderMaintenance).length;
                // FIX: Explicitly typed the initial value for reduce to ensure correct type inference for the accumulator.
                const issueCounts = components.reduce((acc, c) => {
                    const issues = (c.issuedTo || []).length;
                    if (issues > 0) acc[c.name] = (acc[c.name] || 0) + issues;
                    return acc;
                }, {} as Record<string, number>);
                const mostIssued = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0];
                // FIX: The initial value for reduce must be of type `Record<Category, number>`.
                // An empty object `{}` is not assignable, so we cast it to ensure correct type inference.
                const categoryDistribution = components.reduce((acc, c) => {
                    acc[c.category] = (acc[c.category] || 0) + 1;
                    return acc;
                }, {} as Record<Category, number>);

                setStats({
                    analytics,
                    totalComponentTypes: components.length,
                    totalComponentUnits,
                    totalProjects: projects.length,
                    lowStockCount,
                    maintenanceCount,
                    mostIssued: mostIssued ? { name: mostIssued[0], count: mostIssued[1] } : { name: 'N/A', count: 0 },
                    categoryDistribution
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                alert("Could not load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const MetricCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; className?: string }> = ({ icon, title, value, className }) => (
        <div className={`bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 border border-slate-700 ${className}`}>
            <div className="text-sky-400">{icon}</div>
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
    
    if (isLoading) {
        return <div className="text-center text-slate-300 animate-pulse">Loading Dashboard...</div>;
    }
    
    if (!stats) {
        return <div className="text-center text-red-400">Failed to load dashboard data.</div>;
    }

    // FIX: Explicitly cast the result of Object.values to number[] to satisfy Math.max.
    const maxCategoryValue = Math.max(...(Object.values(stats.categoryDistribution) as number[]), 1);

    return (
        <div className="space-y-6 admin-panel-analytics">
            <h2 className="text-2xl font-bold text-white">At a Glance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <MetricCard icon={<EyeIcon />} title="Total Visits" value={stats.analytics.totalVisits} />
                <MetricCard icon={<UsersIcon />} title="Unique Visitors" value={stats.analytics.uniqueVisitors} />
                <MetricCard icon={<CheckCircleIcon />} title="Successful Logins" value={stats.analytics.successfulLogins} />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<DatabaseIcon className="h-8 w-8"/>} title="Component Types" value={stats.totalComponentTypes} />
                <MetricCard icon={<DatabaseIcon className="h-8 w-8"/>} title="Total Component Units" value={stats.totalComponentUnits} />
                <MetricCard icon={<ProjectIconSvg className="h-8 w-8" />} title="Projects" value={stats.totalProjects} />
                <MetricCard icon={<WarningIcon />} title="Low Stock Items" value={stats.lowStockCount} className={stats.lowStockCount > 0 ? 'border-yellow-500/50 text-yellow-400' : ''} />
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-sky-400 mb-4"><ChartBarIcon /> Component Distribution</h3>
                    <div className="space-y-3 text-sm">
                        {Object.entries(stats.categoryDistribution).map(([category, count]) => (
                            <div key={category} className="grid grid-cols-3 items-center gap-2">
                                <span className="text-slate-300 truncate">{category}</span>
                                <div className="col-span-2 bg-slate-700 rounded-full h-5">
                                    <div 
                                        className="bg-gradient-to-r from-sky-500 to-indigo-500 h-5 rounded-full flex items-center justify-end px-2 text-xs font-bold" 
                                        // FIX: Cast `count` to a number for the arithmetic operation.
                                        style={{ width: `${(Number(count) / maxCategoryValue) * 100}%` }}
                                    >
                                       {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold text-sky-400 mb-4">Inventory Status</h3>
                    <div className="space-y-3">
                        <p className="text-slate-300"><strong>Most Issued:</strong> <span className="font-bold text-white">{stats.mostIssued.name}</span> ({stats.mostIssued.count} times)</p>
                        <p className="text-slate-300"><strong>Under Maintenance:</strong> <span className="font-bold text-white">{stats.maintenanceCount}</span> items</p>
                    </div>
                 </div>
             </div>
        </div>
    );
};

const ImageLibraryView: React.FC<Pick<AdminPanelProps, 'onLibraryUpdate'>> = ({ onLibraryUpdate }) => {
    const [customLibrary, setCustomLibrary] = useState<Record<string, ImageData[]>>({});
    const [selectedCategory, setSelectedCategory] = useState<Category>(Category.MICROCONTROLLER);
    
    const [newImageName, setNewImageName] = useState('');
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
  
    const [imageToEdit, setImageToEdit] = useState<ImageData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        setCustomLibrary(customImageService.getCustomImageLibrary());
    }, []);

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
    
    const handleAddImage = async () => {
        if (!newImageFile || !newImageName.trim()) return alert('Please provide an image and a name.');
        setIsUploading(true);
        try {
          const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(newImageFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
          const newImage: ImageData = { name: newImageName.trim(), url: base64Url };
    
          const updatedLibrary = { ...customLibrary };
          updatedLibrary[selectedCategory] = [newImage, ...(updatedLibrary[selectedCategory] || [])];
    
          customImageService.saveCustomImageLibrary(updatedLibrary);
          setCustomLibrary(updatedLibrary);
          onLibraryUpdate();
    
          setNewImageName('');
          setNewImageFile(null);
          setPreviewUrl(null);
        } catch (error) {
          alert('There was an error uploading the image.');
        } finally {
          setIsUploading(false);
        }
    };

    const handleDeleteImage = (category: Category, urlToDelete: string) => {
        if (window.confirm('Are you sure you want to delete this custom image?')) {
            customImageService.deleteCustomImage(category, urlToDelete);
            setCustomLibrary(customImageService.getCustomImageLibrary());
            onLibraryUpdate();
        }
    };
    
    const handleOpenEditModal = (image: ImageData) => {
        setImageToEdit(image);
        setIsEditModalOpen(true);
    };

    const handleSaveImageName = (newName: string) => {
        if (imageToEdit) {
          customImageService.updateCustomImageName(selectedCategory, imageToEdit.url, newName);
          setCustomLibrary(customImageService.getCustomImageLibrary());
          onLibraryUpdate();
          setIsEditModalOpen(false);
          setImageToEdit(null);
        }
    };
    
    const currentCustomImages = useMemo(() => customLibrary[selectedCategory] || [], [customLibrary, selectedCategory]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Image Library Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                     <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-bold text-sky-400 mb-4">1. Select Category</h2>
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
                                <input type="file" id="imageFile" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"/>
                            </div>
                            {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 rounded-md max-h-32 w-auto mx-auto bg-slate-700 p-1" />}
                            <button onClick={handleAddImage} disabled={isUploading || !newImageFile} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                <UploadIcon /> {isUploading ? 'Uploading...' : 'Add Image'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-sky-400 mb-4">Custom Images for <span className="text-white">{selectedCategory}</span></h2>
                    {currentCustomImages.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {currentCustomImages.map(img => (
                                <div key={img.url} className="relative group aspect-square">
                                    <img src={img.url} alt={img.name} title={img.name} className="w-full h-full object-contain bg-slate-700 rounded-md p-1"/>
                                    <div className="absolute top-1 right-1 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleOpenEditModal(img)} className="p-1.5 bg-sky-600/80 text-white rounded-full backdrop-blur-sm"><EditIcon /></button>
                                      <button onClick={() => handleDeleteImage(selectedCategory, img.url)} className="p-1.5 bg-red-600/80 text-white rounded-full backdrop-blur-sm"><TrashIcon /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500 italic">No custom images uploaded for this category yet.</p>}
                </div>
            </div>
            {isEditModalOpen && <EditImageModal image={imageToEdit} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveImageName} />}
        </div>
    );
};


const DataManagementView: React.FC<Pick<AdminPanelProps, 'onClearAllComponents' | 'onClearAllProjects' | 'onDataRestored' | 'onLibraryUpdate'>> = ({ onClearAllComponents, onClearAllProjects, onDataRestored, onLibraryUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            const backupData = await localStorageService.exportData(); // Changed from apiService
            const jsonData = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().slice(0, 10);
            link.download = `tinkerhub-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert("Failed to export data from local storage.");
            console.error(error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm("Are you sure you want to import this file? This will OVERWRITE all existing components and projects in local storage.")) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonString = event.target?.result as string;
                const data: BackupData = JSON.parse(jsonString);
                await localStorageService.importData(data); // Changed from apiService
                alert("Data imported successfully!");
                onDataRestored();
            } catch (error: any) {
                alert(`Import failed: ${error.message}`);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handleResetAnalytics = async () => {
        if (confirm("Are you sure you want to reset all analytics data? This cannot be undone.")) {
            try {
                await localStorageService.resetAnalyticsData(); // Changed from apiService
                onDataRestored(); // Trigger a refresh to show updated data
                alert("Analytics data has been reset.");
            } catch (error) {
                alert("Failed to reset analytics data.");
            }
        }
    };

    const handleClearImages = () => {
        if (confirm("Are you sure you want to delete ALL custom uploaded images? This cannot be undone.")) {
            customImageService.clearCustomImageLibrary();
            onLibraryUpdate();
            alert("All custom images have been deleted.");
        }
    }

    return (
         <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Data Management</h2>
            <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700">
                <h3 className="flex items-center gap-2 text-lg font-bold text-sky-400 mb-4"><HardDriveIcon /> Backup & Restore</h3>
                <p className="text-slate-400 mb-4 text-sm">Export all your app data into a single JSON file for backup, or import a file to restore your inventory.</p>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center gap-2 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition"><ExportIcon /> Export Full Backup</button>
                    <button onClick={handleImportClick} className="flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"><ImportIcon /> Import from Backup</button>
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileImport} className="hidden" />
                </div>
            </div>
            <div className="bg-red-900/30 p-6 rounded-lg border border-red-500/50">
                <h3 className="flex items-center gap-2 text-lg font-bold text-red-400 mb-4"><WarningIcon /> Danger Zone</h3>
                <p className="text-red-300/80 mb-6 text-sm">These actions are irreversible. Please be certain before proceeding.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={onClearAllComponents} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">Clear All Components</button>
                    <button onClick={onClearAllProjects} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">Clear All Projects</button>
                    <button onClick={handleClearImages} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">Clear Custom Images</button>
                    <button onClick={handleResetAnalytics} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">Reset Analytics Data</button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const TabButton: React.FC<{ tabName: AdminTab; icon: React.ReactNode; children: React.ReactNode }> = ({ tabName, icon, children }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-colors duration-200 w-full text-left ${activeTab === tabName ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
    >
        {icon}
        {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col admin-panel">
        <header className="bg-slate-800 shadow-lg sticky top-0 z-20 border-b border-slate-700">
          <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Application Management & Analytics</p>
            </div>
            <button onClick={props.onExit} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">
              Exit Admin View
            </button>
          </div>
        </header>
        <div className="container mx-auto p-4 md:p-8 flex-grow flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 flex-shrink-0">
                <nav className="flex flex-row md:flex-col gap-2 p-2 bg-slate-800/70 rounded-lg border border-slate-700">
                    <TabButton tabName="dashboard" icon={<DashboardIcon />} >Dashboard</TabButton>
                    <TabButton tabName="images" icon={<ImageIcon />} >Image Library</TabButton>
                    <TabButton tabName="data" icon={<HardDriveIcon />} >Data Management</TabButton>
                </nav>
            </aside>
            <main className="flex-grow min-w-0">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'images' && <ImageLibraryView onLibraryUpdate={props.onLibraryUpdate} />}
                {activeTab === 'data' && <DataManagementView {...props} />}
            </main>
        </div>
    </div>
  );
};

export default AdminPanel;