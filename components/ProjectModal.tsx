import React, { useState, useEffect, useMemo } from 'react';
import { Project, RequiredComponent, Component, Attachment, ProjectStatus } from '../types.ts';
import { SearchIcon, PlusIcon, TrashIcon, UploadIcon, FileIcon } from './Icons.tsx';

interface ProjectModalProps {
  onClose: () => void;
  onSave: (project: any) => void;
  existingProject?: Project | null;
  availableComponents: Component[];
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSave, existingProject, availableComponents }) => {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [projectDate, setProjectDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.IN_PROGRESS);
  
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [currentMember, setCurrentMember] = useState('');

  const [projectLogoUrl, setProjectLogoUrl] = useState<string | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [componentSearch, setComponentSearch] = useState('');

  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setTeamName(existingProject.teamName || '');
      setDescription(existingProject.description || '');
      setFeatures(existingProject.features || '');
      setProjectDate(existingProject.projectDate ? new Date(existingProject.projectDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setStatus(existingProject.status || ProjectStatus.IN_PROGRESS);
      setTeamMembers(existingProject.teamMembers || []);
      setProjectLogoUrl(existingProject.projectLogoUrl);
      setLogoPreview(existingProject.projectLogoUrl || null);
      setYoutubeUrl(existingProject.youtubeUrl || '');
      setAttachments(existingProject.attachments || []);
      setSelectedComponents(new Set(existingProject.requiredComponents.map(c => c.componentId)));
    }
  }, [existingProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamName.trim()) {
      alert('Project name and Team name are required.');
      return;
    }

    const requiredComponents: RequiredComponent[] = [...selectedComponents].map(id => {
      const component = availableComponents.find(c => c.id === id);
      return { componentId: id, componentName: component?.name || 'Unknown Component' };
    });

    const projectData = {
      name,
      teamName,
      teamMembers,
      description,
      features,
      projectDate,
      status,
      requiredComponents,
      projectLogoUrl,
      youtubeUrl,
      attachments,
    };

    if (existingProject) {
      onSave({ ...existingProject, ...projectData });
    } else {
      onSave(projectData);
    }
  };
  
  const handleComponentToggle = (componentId: string) => {
    const newSelection = new Set(selectedComponents);
    if (newSelection.has(componentId)) {
      newSelection.delete(componentId);
    } else {
      newSelection.add(componentId);
    }
    setSelectedComponents(newSelection);
  };
  
  const handleAddMember = () => {
    if (currentMember.trim() && !teamMembers.includes(currentMember.trim())) {
        setTeamMembers([...teamMembers, currentMember.trim()]);
        setCurrentMember('');
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setTeamMembers(teamMembers.filter(m => m !== memberToRemove));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setProjectLogoUrl(base64);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAttachmentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = [...attachments];
      // FIX: Iterate directly over the FileList. Array.from(files) was causing `file` to be typed as `unknown`.
      // The FileList is iterable and correctly types each item as File.
      for (const file of files) {
        const dataUrl = await fileToBase64(file);
        newAttachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        });
      }
      setAttachments(newAttachments);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };


  const filteredComponents = useMemo(() => {
    return availableComponents.filter(c => 
      c.name.toLowerCase().includes(componentSearch.toLowerCase())
    );
  }, [availableComponents, componentSearch]);

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-sky-400 mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-white flex-shrink-0">{existingProject ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 custom-scrollbar">
          
          <Section title="1. Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-slate-300">Project Name</label>
                <input type="text" id="projectName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
              </div>
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-slate-300">Team Name</label>
                <input type="text" id="teamName" value={teamName} onChange={e => setTeamName(e.target.value)} required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectDate" className="block text-sm font-medium text-slate-300">Project Date</label>
                  <input type="date" id="projectDate" value={projectDate} onChange={e => setProjectDate(e.target.value)} required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                </div>
                <div>
                  <label htmlFor="projectStatus" className="block text-sm font-medium text-slate-300">Project Status</label>
                   <select id="projectStatus" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500">
                      {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
            </div>
             <div>
              <label htmlFor="projectLogo" className="block text-sm font-medium text-slate-300">Project Logo</label>
              <div className="mt-2 flex items-center gap-4">
                {logoPreview && <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 rounded-lg object-cover bg-slate-700" />}
                <label htmlFor="logo-upload" className="cursor-pointer py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition">
                  <UploadIcon /> Upload Logo
                </label>
                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only"/>
              </div>
            </div>
          </Section>

          <Section title="2. Team Members">
              <div className="flex items-stretch gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter team member name..."
                    value={currentMember}
                    onChange={(e) => setCurrentMember(e.target.value)}
                    className="flex-grow bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"
                  />
                  <button type="button" onClick={handleAddMember} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"><PlusIcon /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {teamMembers.map(member => (
                      <div key={member} className="flex items-center gap-2 bg-slate-700/50 text-sm text-slate-200 pl-3 pr-1 py-1 rounded-full">
                          {member}
                          <button type="button" onClick={() => handleRemoveMember(member)} className="text-slate-400 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                  ))}
              </div>
          </Section>

          <Section title="3. Project Details">
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300">Project Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
            </div>
             <div>
              <label htmlFor="features" className="block text-sm font-medium text-slate-300">Key Features (one per line)</label>
              <textarea id="features" value={features} onChange={e => setFeatures(e.target.value)} rows={4} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
            </div>
             <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-slate-300">YouTube Video URL</label>
              <input type="url" id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
            </div>
          </Section>

          <Section title="4. Required Components">
            <div className="relative mb-2">
                <input type="text" placeholder="Search components..." value={componentSearch} onChange={e => setComponentSearch(e.target.value)} className="w-full bg-slate-900/80 border-slate-600 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            </div>
            <div className="bg-slate-900/50 border border-slate-600 rounded-lg max-h-48 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {filteredComponents.length > 0 ? filteredComponents.map(component => (
                <label key={component.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <input type="checkbox" checked={selectedComponents.has(component.id)} onChange={() => handleComponentToggle(component.id)} className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-600"/>
                  <span className="text-slate-200">{component.name}</span>
                </label>
              )) : ( <p className="text-slate-500 text-center text-sm p-4">No components found.</p> )}
            </div>
          </Section>
           <Section title="5. Attachments">
                <label htmlFor="attachments-upload" className="cursor-pointer w-full text-center py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                    <UploadIcon /> Add Files (PDF, JPG, MP4, etc.)
                </label>
                <input id="attachments-upload" type="file" multiple onChange={handleAttachmentsUpload} className="sr-only"/>
                <div className="space-y-2">
                    {attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between gap-2 bg-slate-700/50 p-2 rounded-md">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                                <span className="text-sm text-slate-300 truncate">{att.name}</span>
                                <span className="text-xs text-slate-500 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveAttachment(att.id)} className="p-1 text-slate-400 hover:text-red-500 flex-shrink-0"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
           </Section>
        </form>
        <div className="flex-shrink-0 flex justify-end gap-4 pt-6 mt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition">Cancel</button>
            <button type="submit" onClick={handleSubmit} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition">
              {existingProject ? 'Save Changes' : 'Create Project'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;