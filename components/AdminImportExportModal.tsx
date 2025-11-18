import React, { useState } from 'react';
// FIX: Import `Project` type to be used in the `AllAppData` interface.
import { Component, Category, Project } from '../types.ts';
import { ImageData } from './imageLibrary.ts';
import * as localStorageService from '../services/localStorageService.ts';
import { ImportIcon, ExportIcon } from './Icons.tsx';

interface AdminImportExportModalProps {
  onClose: () => void;
  components: Component[];
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  setCustomImageLibrary: React.Dispatch<React.SetStateAction<Record<string, ImageData[]>>>;
  setAnalyticsData: React.Dispatch<React.SetStateAction<any>>; // AnalyticsData type
  onLibraryUpdate: () => void;
}

interface AllAppData {
    components: Component[];
    // FIX: Added 'projects' property to match the type definition used by the import/export service.
    projects: Project[];
    imageLibrary: Record<string, ImageData[]>;
    analytics: any; // AnalyticsData type
    adminPassword: string | null;
    userPassword: string | null;
}

const AdminImportExportModal: React.FC<AdminImportExportModalProps> = ({
  onClose,
  components,
  setComponents,
  setCustomImageLibrary,
  setAnalyticsData,
  onLibraryUpdate,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExportData = () => {
    try {
      const dataToExport = localStorageService.exportAllAppData();
      const filename = `tinkerhub_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('All data exported successfully!');
    } catch (err) {
      setError('Failed to export data.');
      console.error('Export failed:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
        setError('Please upload a valid .json file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleImportData = () => {
    if (!file) {
      setError('Please select a JSON file to import.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const importedData: AllAppData = JSON.parse(text);

        // Basic validation for critical keys
        if (!importedData.components || !importedData.projects || !importedData.imageLibrary || !importedData.analytics) {
            throw new Error("Invalid backup file structure. Missing core data.");
        }

        // Confirm overwrite
        if (!window.confirm("Importing will OVERWRITE all existing data. Are you sure you want to proceed?")) {
            setIsLoading(false);
            return;
        }

        localStorageService.importAllAppData(importedData);

        // Update React states in App.tsx via props
        setComponents(importedData.components);
        setCustomImageLibrary(importedData.imageLibrary);
        setAnalyticsData(importedData.analytics);
        onLibraryUpdate(); // Trigger refresh for image library in App.tsx

        setSuccess('Data imported successfully! The app will reload to ensure all data is consistent.');
        setTimeout(() => window.location.reload(), 1500); // Force reload to ensure all states and contexts are fresh

      } catch (err: any) {
        setError(`Error importing data: ${err.message}`);
        console.error('Import failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-sky-400">Import / Export All Data</h2>
        
        {success && <p className="text-green-400 text-sm bg-green-900/30 p-3 rounded-md mb-4">{success}</p>}
        {error && <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}

        <div className="flex-grow space-y-6">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                <h3 className="font-semibold text-slate-200 mb-2">Export Data</h3>
                <p className="text-sm text-slate-400 mb-4">Download a JSON backup of all your app data (components, images, analytics, and passwords).</p>
                <button
                    onClick={handleExportData}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                    <ExportIcon /> Export All Data
                </button>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                <h3 className="font-semibold text-slate-200 mb-2">Import Data</h3>
                <p className="text-sm text-slate-400 mb-4">Upload a JSON backup file to restore your app data. This will OVERWRITE existing data.</p>
                <input
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer mb-4"
                />
                <button
                    onClick={handleImportData}
                    disabled={!file || isLoading}
                    className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ImportIcon /> {isLoading ? 'Importing...' : 'Import Data'}
                </button>
            </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="py-2 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminImportExportModal;
