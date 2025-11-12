import React, { useState, useEffect } from 'react';
import { Component, Category, ComponentLink, LinkType, AISuggestions } from '../types.ts';
import { identifyComponentFromImage } from '../services/geminiService.ts';
import { PlusIcon, TrashIcon } from './Icons.tsx';

interface AIComponentScanResultModalProps {
  imageDataUrl: string;
  onClose: () => void;
  onAddComponent: (component: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>) => void;
}

const AIComponentScanResultModal: React.FC<AIComponentScanResultModalProps> = ({ imageDataUrl, onClose, onAddComponent }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [links, setLinks] = useState<ComponentLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<LinkType>(LinkType.DATASHEET);

  useEffect(() => {
    const identifyComponent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mimeType = imageDataUrl.substring(imageDataUrl.indexOf(':') + 1, imageDataUrl.indexOf(';'));
        const base64Data = imageDataUrl.split(',')[1];
        if (!base64Data) {
          throw new Error("Invalid image data provided.");
        }
        
        const result = await identifyComponentFromImage(base64Data, mimeType);
        
        // Pre-fill form state with AI suggestions
        setName(result.name || 'Unknown Component');
        setDescription(result.description || 'AI could not determine a description.');
        setCategory(result.category || Category.GENERAL);

      } catch (err: any) {
        setError(err.message || "Failed to identify the component. Please try adding it manually.");
      } finally {
        setIsLoading(false);
      }
    };
    identifyComponent();
  }, [imageDataUrl]);

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      try {
        new URL(newLinkUrl);
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
      isAvailable: true,
      imageUrl: imageDataUrl, // Use the scanned image
      lowStockThreshold: numericThreshold,
      links,
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
          <h3 className="text-xl font-semibold text-slate-300 mt-4 animate-pulse">Analyzing component...</h3>
          <p className="text-slate-500 mt-2">The AI is identifying your component. This might take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold text-red-400">An Error Occurred</h3>
          <p className="text-slate-400 mt-2 bg-red-900/30 p-3 rounded-md">{error}</p>
          <button onClick={onClose} className="mt-6 py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition">Close</button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0 md:w-1/3">
            <img src={imageDataUrl} alt="Scanned Component" className="rounded-lg w-full h-auto object-contain bg-slate-700 p-2" />
            <p className="text-xs text-slate-500 text-center mt-2">Scanned Image</p>
          </div>
          <div className="flex-grow space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Component Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-slate-300">Reference Links</label>
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

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50 mt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition">Cancel</button>
          <button type="submit" className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg shadow-green-600/30 transition">Add to Inventory</button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-sky-400 flex-shrink-0">AI Scan Result</h2>
        <div className="flex-grow overflow-y-auto pr-2">
            {!isLoading && !error && <p className="text-sm text-slate-400 mb-4 bg-slate-900/50 p-3 rounded-md border border-slate-600">AI has identified the following component. Please review and edit the details before adding to your inventory.</p>}
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AIComponentScanResultModal;
