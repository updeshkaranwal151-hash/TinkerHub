import React, { useState, useEffect } from 'react';
import { Component, Category } from '../types.ts';
import { componentLibrary } from './componentLibrary.ts';

interface EditComponentModalProps {
  onClose: () => void;
  onUpdateComponent: (component: Component) => void;
  component: Component | null;
  generateDescription: (componentName: string) => Promise<string>;
  generateImage: (componentName: string) => Promise<string>;
}

const EditComponentModal: React.FC<EditComponentModalProps> = ({ onClose, onUpdateComponent, component, generateDescription, generateImage }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (component) {
      setName(component.name);
      setDescription(component.description);
      setCategory(component.category);
      setTotalQuantity(component.totalQuantity);
      setImageUrl(component.imageUrl || '');
    }
  }, [component]);

  if (!component) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || totalQuantity < 1) {
        alert("Please provide a valid name and quantity.");
        return;
    }
    onUpdateComponent({
      ...component,
      name,
      description,
      category,
      totalQuantity,
      imageUrl: imageUrl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image',
    });
  };

  const handleGenerateDescription = async () => {
    if (!name) {
      alert('Please enter a component name first.');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const generatedDesc = await generateDescription(name);
      setDescription(generatedDesc);
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!name) {
      alert('Please enter a component name first.');
      return;
    }
    setIsGeneratingImage(true);
    try {
      const generatedImageUrl = await generateImage(name);
      setImageUrl(generatedImageUrl);
    } catch (error: any) {
      console.error('Error generating image:', error);
      alert(error.message || 'Failed to generate image. Please try again or provide a URL manually.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
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
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <div className="relative">
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
              <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc || !name} className="absolute bottom-2 right-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded disabled:bg-slate-500 disabled:cursor-not-allowed">
                {isGeneratingDesc ? 'Generating...' : '✨ Auto-generate'}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="totalQuantity" className="block text-sm font-medium text-slate-300">Total Quantity</label>
            <input type="number" id="totalQuantity" value={totalQuantity} onChange={e => setTotalQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-300">Image URL (Optional)</label>
            <div className="flex items-center gap-2 mt-1">
                <input type="text" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage || !name} className="flex-shrink-0 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-3 rounded-md disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                  {isGeneratingImage ? 'Generating...' : 'Gen Image'}
                </button>
            </div>
          </div>
          
          {imageUrl && (
            <div className="mt-4">
              <p className="block text-sm font-medium text-slate-300 mb-2">Image Preview</p>
              <img src={imageUrl} alt="Component Preview" className="rounded-lg w-full h-auto max-h-48 object-contain bg-slate-700"/>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComponentModal;