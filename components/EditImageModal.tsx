import React, { useState, useEffect } from 'react';
import { ImageData } from './imageLibrary.ts';

interface EditImageModalProps {
  image: ImageData | null;
  onClose: () => void;
  onSave: (newName: string) => void;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (image) {
      setName(image.name);
    }
  }, [image]);

  if (!image) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide a name for the image.");
      return;
    }
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-sky-400">Edit Image Name</h2>
        <div className="mb-4">
            <img src={image.url} alt={image.name} className="max-h-32 w-auto mx-auto bg-slate-700 rounded-md p-2" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="imageName" className="block text-sm font-medium text-slate-300">Image Name</label>
            <input 
              type="text" 
              id="imageName" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditImageModal;