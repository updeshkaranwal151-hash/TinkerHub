import React, { useState } from 'react';
import { generateImageWithAI } from '../services/geminiService.ts';
import { Component, Category } from '../types.ts';
import { componentLibrary } from './componentLibrary.ts';
import { SparklesIcon } from './Icons.tsx';

interface AddComponentModalProps {
  onClose: () => void;
  onAddComponent: (component: Omit<Component, 'id' | 'createdAt'>) => void;
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const AddComponentModal: React.FC<AddComponentModalProps> = ({ onClose, onAddComponent }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericQuantity = parseInt(totalQuantity, 10);
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
    });
  };

  const handleGenerateImage = async () => {
    if (!name.trim()) {
      alert('Please enter a component name first to generate an image.');
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `A high-quality, professional, photorealistic image of a single electronic component: '${name}', on a clean, minimalist, white studio background. Centered. 4:3 aspect ratio.`;
      
      const base64ImageBytes = await generateImageWithAI(prompt);

      setImageUrl(`data:image/jpeg;base64,${base64ImageBytes}`);
    } catch (error: any) {
      console.error('AI image generation failed:', error);
      alert(`Sorry, the AI image could not be generated. Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      try {
        const base64 = await toBase64(file);
        setImageUrl(base64);
      } catch (error) {
        console.error('Error converting file to base64', error);
        alert('Could not process the image. Please try another one.');
      }
    }
  };

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
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          
          <div>
            <label htmlFor="totalQuantity" className="block text-sm font-medium text-slate-300">Total Quantity</label>
            <input type="number" id="totalQuantity" value={totalQuantity} onChange={e => setTotalQuantity(e.target.value)} min="1" required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">Component Image</label>
                <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !name.trim()}
                    className="flex items-center gap-1.5 text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-1.5 px-3 rounded-lg transition duration-200"
                >
                    {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                    ) : (
                    <>
                        <SparklesIcon /> <span className="hidden sm:inline">Generate with AI</span><span className="sm:hidden">AI Gen</span>
                    </>
                    )}
                </button>
            </div>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-400 justify-center">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-indigo-500 px-3 py-1.5">
                            <span>Upload an image</span>
                            <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                        </label>
                    </div>
                    <p className="text-xs text-slate-500">or use AI generator</p>
                </div>
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
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">Add Component</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComponentModal;