import React, { useState, useMemo } from 'react';
import { Component, Category, ComponentLink, LinkType } from '../types.ts';
import { componentLibrary } from './componentLibrary.ts';
import { ImageData } from './imageLibrary.ts';
import { PlusIcon, TrashIcon } from './Icons.tsx';

interface AddComponentModalProps {
  onClose: () => void;
  onAddComponent: (component: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>) => void;
  imageLibrary: Record<string, ImageData[]>;
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({ onClose, onAddComponent, imageLibrary }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [links, setLinks] = useState<ComponentLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<LinkType>(LinkType.DATASHEET);

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
    onAddComponent({
      name,
      description,
      category,
      totalQuantity: numericQuantity,
      issuedTo: [],
      imageUrl: imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image',
      isAvailable: true,
      lowStockThreshold: numericThreshold,
      links
    });
  };
  
  const imagesToShow = useMemo(() => {
    const categoryImages = imageLibrary[category] || [];
    const generalImages = imageLibrary[Category.GENERAL] || [];
    const combined = [...categoryImages, ...generalImages];
    // Remove duplicates by URL, keeping the first occurrence
    return Array.from(new Map(combined.map(item => [item.url, item])).values());
  }, [category, imageLibrary]);


  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-sky-400">Add New Component</h2>
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
                            <TrashIcon />
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
            <div className="mt-2 p-2 bg-slate-900/50 border border-slate-600 rounded-lg max-h-40 overflow-y-auto">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {imagesToShow.map((img: ImageData) => (
                    <button
                    key={img.url}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
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
          </div>


          {imageUrl && (
            <div className="mt-2">
              <p className="block text-sm font-medium text-slate-300 mb-2">Image Preview</p>
              <img src={imageUrl} alt="Component Preview" className="rounded-lg w-full h-auto max-h-32 object-contain bg-slate-700 p-2"/>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">Add Component</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComponentModal;