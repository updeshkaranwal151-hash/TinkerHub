

import React, { useState, useEffect, useMemo } from 'react';
import { Category } from '../types.ts';
import { ImageData, imageLibrary as defaultImageLibrary } from './imageLibrary.ts';
import * as localStorageService from '../services/localStorageService.ts';
import { UploadIcon, TrashIcon, EditIcon, EyeIcon, UsersIcon, CheckCircleIcon } from './Icons.tsx'; // Updated imports for new icons
import EditImageModal from './EditImageModal.tsx';

interface AdminPanelProps {
  onExit: () => void;
  onLibraryUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit, onLibraryUpdate }) => {
  const [customLibrary, setCustomLibrary] = useState<Record<string, ImageData[]>>({});
  const [analyticsData, setAnalyticsData] = useState({ totalVisits: 0, uniqueVisitors: 0, successfulLogins: 0 });
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.MICROCONTROLLER);
  
  const [newImageName, setNewImageName] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [imageToEdit, setImageToEdit] = useState<ImageData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setCustomLibrary(localStorageService.getCustomImageLibrary());
    setAnalyticsData(localStorageService.getAnalyticsData());
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
      onLibraryUpdate();

      setNewImageName('');
      setNewImageFile(null);
      setPreviewUrl(null);
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
        onLibraryUpdate();
    }
  };

  const handleOpenEditModal = (image: ImageData) => {
    setImageToEdit(image);
    setIsEditModalOpen(true);
  };

  const handleSaveImageName = (newName: string) => {
    if (imageToEdit) {
      localStorageService.updateCustomImageName(selectedCategory, imageToEdit.url, newName);
      const updatedLibrary = localStorageService.getCustomImageLibrary();
      setCustomLibrary(updatedLibrary);
      onLibraryUpdate();
      setIsEditModalOpen(false);
      setImageToEdit(null);
    }
  };

  const currentCustomImages = useMemo(() => customLibrary[selectedCategory] || [], [customLibrary, selectedCategory]);
  // const currentDefaultImages = useMemo(() => defaultImageLibrary[selectedCategory] || [], [selectedCategory]); // Removed

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
        <header className="bg-slate-800 shadow-lg sticky top-0 z-20 border-b border-slate-700">
          <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Manage Component Image Library</p>
            </div>
            <button onClick={onExit} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-300">
              Exit Admin View
            </button>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8 flex-grow">
          {/* Analytics Dashboard */}
          <div className="mb-8 p-6 bg-slate-800/70 rounded-lg border border-slate-700 admin-panel-analytics">
              <h2 className="text-xl font-bold text-sky-400 mb-4">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                      <EyeIcon />
                      <h3 className="text-sm font-bold text-slate-400 uppercase">Total Visits</h3>
                      <p className="text-3xl font-bold">{analyticsData.totalVisits}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                      <UsersIcon />
                      <h3 className="text-sm font-bold text-slate-400 uppercase">Unique Visitors</h3>
                      <p className="text-3xl font-bold">{analyticsData.uniqueVisitors}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                      <CheckCircleIcon />
                      <h3 className="text-sm font-bold text-slate-400 uppercase">Successful Logins</h3>
                      <p className="text-3xl font-bold">{analyticsData.successfulLogins}</p>
                  </div>
              </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 admin-panel">
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
                                        <button onClick={() => handleOpenEditModal(img)} className="p-1.5 bg-sky-600/80 text-white rounded-full backdrop-blur-sm">
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

                  {/* Removed the section for default images */}
                  {/*
                  <div className="mt-8">
                      <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-600 pb-2 mb-4">Default Library Images ({currentDefaultImages.length})</h3>
                       <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {currentDefaultImages.map(img => (
                              <div key={img.url} className="relative group aspect-square opacity-70">
                                  <img src={img.url} alt={img.name} title={img.name} className="w-full h-full object-contain bg-slate-700 rounded-md p-1"/>
                                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">DEFAULT</div>
                              </div>
                          ))}
                      </div>
                  </div>
                  */}
              </div>
          </div>
        </main>
      </div>
      
      {isEditModalOpen && (
        <EditImageModal
          image={imageToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveImageName}
        />
      )}
    </>
  );
};

export default AdminPanel;