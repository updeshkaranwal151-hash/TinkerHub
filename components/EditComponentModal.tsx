
import React, { useState, useEffect, useMemo } from 'react';
import { Component, Category, ComponentLink, LinkType } from '../types.ts';
import { componentLibrary } from './componentLibrary.ts';
import { ImageData } from './imageLibrary.ts';
import { PlusIcon, TrashIcon, UploadIcon, CameraIcon } from './Icons.tsx';
import CameraCaptureModal from './CameraCaptureModal.tsx';


interface EditComponentModalProps {
  onClose: () => void;
  onUpdateComponent: (component: Component) => void;
  component: Component | null;
  imageLibrary: Record<string, ImageData[]>;
}

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const EditComponentModal: React.FC<EditComponentModalProps> = ({ onClose, onUpdateComponent, component, imageLibrary }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [imageUrl, setImageUrl] = useState(''); // Stores URL from library OR Base64 from upload
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [links, setLinks] = useState<ComponentLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<LinkType>(LinkType.DATASHEET);

  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (component) {
      setName(component.name);
      setDescription(component.description);
      setCategory(component.category);
      setTotalQuantity(String(component.totalQuantity));
      
      if (component.imageUrl && (component.imageUrl.startsWith('data:image/') || component.imageUrl.startsWith('blob:'))) {
        setUploadedImagePreview(component.imageUrl);
        setUploadedImageFile(null); 
        setImageUrl(component.imageUrl);
      } else {
        setImageUrl(component.imageUrl || '');
        setUploadedImageFile(null);
        setUploadedImagePreview(null);
      }

      setLowStockThreshold(String(component.lowStockThreshold ?? ''));
      setLinks(component.links || []);
    }
  }, [component]);

  if (!component) return null;

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      try {
        new URL(newLinkUrl); // Validate URL format
        setLinks([...links, { type: newLinkType, url: newLinkUrl.trim() }]);
        setNewLinkUrl('');
      } catch (_) {
        alert('Please enter a valid URL.');
      }
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericQuantity = parseInt(totalQuantity, 10);
    const numericThreshold = lowStockThreshold ? parseInt(lowStockThreshold, 10) : undefined;
    
    if (!name || isNaN(numericQuantity) || numericQuantity < 1) {
        alert("Please provide a valid name and a quantity of at least 1.");
        return;
    }
    onUpdateComponent({
      ...component,
      name,
      description,
      category,
      totalQuantity: numericQuantity,
      imageUrl: imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image',
      lowStockThreshold: numericThreshold,
      links,
    });
  };

  const imagesToShow = useMemo(() => {
    const categoryImages = imageLibrary[category] || [];
    const generalImages = imageLibrary[Category.GENERAL] || [];
    const combined = [...categoryImages, ...generalImages];
    return Array.from(new Map(combined.map(item => [item.url, item])).values());
  }, [category, imageLibrary]);

  const handleSelectLibraryImage = (url: string) => {
    setImageUrl(url);
    setUploadedImageFile(null);
    setUploadedImagePreview(null);
    const fileInput = document.getElementById('image-upload-input-edit') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImageFile(file);
      const preview = URL.createObjectURL(file);
      setUploadedImagePreview(preview);
      const base64 = await fileToBase64(file);
      setImageUrl(base64);
    } else {
      setUploadedImageFile(null);
      setUploadedImagePreview(null);
      setImageUrl('');
      if (file) alert('Please select a valid image file (PNG, JPEG, WEBP, GIF).');
    }
  };

  const handleClearUploadedImage = () => {
    setUploadedImageFile(null);
    setUploadedImagePreview(null);
    setImageUrl('');
    const fileInput = document.getElementById('image-upload-input-edit') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleCaptureImage = (imageDataUrl: string) => {
    setImageUrl(imageDataUrl);
    setUploadedImagePreview(imageDataUrl);
    setUploadedImageFile(null);
    const fileInput = document.getElementById('image-upload-input-edit') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setIsCameraOpen(false);
  };


  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
          <h2 className="text-2xl font-bold mb-6 text-sky-400">Edit Component</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Component Name</label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                list="component-suggestions"
              />
              <datalist id="component-suggestions">
                {componentLibrary[category]?.map(componentName => (
                  <option key={componentName} value={componentName} />
                ))}
              </datalist>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
                <button type="button" onClick={() => setDescription(name)} disabled={!name} className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed">
                    Same as name
                </button>
              </div>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="totalQuantity" className="block text-sm font-medium text-slate-300">Total Quantity</label>
                <input type="number" id="totalQuantity" value={totalQuantity} onChange={e => setTotalQuantity(e.target.value)} min="1" required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-300">Low Stock Alert At</label>
                <input type="number" id="lowStockThreshold" placeholder="e.g., 5 (Optional)" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} min="0" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Reference Links (Datasheets, Tutorials, etc.)</label>
              <div className="space-y-2 mt-2">
                  {links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md">
                          <span className="text-xs font-semibold bg-slate-600 text-slate-200 px-2 py-1 rounded-md">{link.type}</span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-grow text-sm text-indigo-400 truncate hover:underline">{link.url}</a>
                          <button type="button" onClick={() => handleRemoveLink(index)} className="p-1 text-slate-400 hover:text-red-500">
                              <TrashIcon className="h-4 w-4" />
                          </button>
                      </div>
                  ))}
              </div>
              <div className="flex items-stretch gap-2 mt-2">
                  <select value={newLinkType} onChange={(e) => setNewLinkType(e.target.value as LinkType)} className="bg-slate-700 border-slate-600 rounded-md text-white text-sm focus:ring-indigo-500 focus:border-indigo-500">
                      {Object.values(LinkType).map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="flex-grow bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                  <button type="button" onClick={handleAddLink} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                      <PlusIcon/>
                  </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Component Image</label>
              <div className="mt-2 mb-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
                  <p className="text-sm font-medium text-slate-200 mb-2">Change Image</p>
                  <div className="flex items-center gap-3">
                      <label 
                          htmlFor="image-upload-input-edit" 
                          className="flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer transition duration-300"
                      >
                          <UploadIcon /> Upload
                          <input 
                              id="image-upload-input-edit"
                              type="file" 
                              accept="image/png, image/jpeg, image/webp, image/gif" 
                              onChange={handleFileUpload} 
                              className="sr-only" 
                          />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="flex items-center gap-2 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg cursor-pointer transition duration-300"
                      >
                        <CameraIcon /> Capture
                      </button>
                      {uploadedImagePreview && (
                          <div className="relative">
                              <img 
                                  src={uploadedImagePreview} 
                                  alt="Uploaded Preview" 
                                  className="h-16 w-16 object-cover rounded-md border border-slate-500" 
                              />
                              <button 
                                  type="button"
                                  onClick={handleClearUploadedImage}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs leading-none"
                                  aria-label="Remove uploaded image"
                              >
                                  <TrashIcon className="h-3 w-3" />
                              </button>
                          </div>
                      )}
                  </div>
                  {uploadedImageFile && <p className="text-xs text-slate-400 mt-2">{uploadedImageFile.name}</p>}
              </div>

              {!uploadedImageFile && (
                <>
                  <p className="text-sm font-medium text-slate-200 mb-2">Or Choose from Library</p>
                  <div className="mt-2 p-2 bg-slate-900/50 border border-slate-600 rounded-lg max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {imagesToShow.map((img: ImageData) => (
                          <button
                          key={img.url}
                          type="button"
                          onClick={() => handleSelectLibraryImage(img.url)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${imageUrl === img.url ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-slate-500'}`}
                          title={img.name}
                          >
                          <img src={img.url} alt={img.name} className="w-full h-full object-contain aspect-square bg-slate-700/50 p-1" />
                          {imageUrl === img.url && (
                              <div className="absolute inset-0 bg-indigo-500/60 flex items-center justify-center">
                              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                              </div>
                          )}
                          </button>
                      ))}
                      </div>
                  </div>
                </>
              )}
            </div>
            
            {imageUrl && !uploadedImagePreview && (
              <div className="mt-2">
                <p className="block text-sm font-medium text-slate-300 mb-2">Image Preview</p>
                <img src={imageUrl} alt="Component Preview" className="rounded-lg w-full h-auto max-h-32 object-contain bg-slate-700 p-2"/>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
              <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
      {isCameraOpen && (
        <CameraCaptureModal
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCaptureImage}
        />
      )}
    </>
  );
};

export default EditComponentModal;
