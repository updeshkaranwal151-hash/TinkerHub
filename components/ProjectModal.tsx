import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectTask, ProjectPriority } from '../types.ts';
import { UploadIcon, ChevronDownIcon } from './Icons.tsx';

type ProjectSaveData = Omit<Project, 'id' | 'createdAt' | 'attachments' | 'requiredComponents'>;

interface ProjectModalProps {
  onClose: () => void;
  onSave: (projectData: ProjectSaveData) => void;
  projectToEdit?: Project;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSave, projectToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Advanced details state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNED);
  const [initialTasks, setInitialTasks] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>(ProjectPriority.MEDIUM);
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [projectLead, setProjectLead] = useState('');
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setTeamMembers(projectToEdit.teamMembers.join(', '));
      setCoverImageUrl(projectToEdit.coverImageUrl || '');
      setImagePreview(projectToEdit.coverImageUrl || null);
      // Populate advanced fields
      setStatus(projectToEdit.status);
      setInitialTasks(projectToEdit.tasks.map(t => t.text).join('\n'));
      setNotes(projectToEdit.notes);
      setPriority(projectToEdit.priority || ProjectPriority.MEDIUM);
      setTags(projectToEdit.tags.join(', '));
      setStartDate(projectToEdit.startDate || '');
      setEndDate(projectToEdit.endDate || '');
      setBudget(projectToEdit.budget?.toString() || '');
      setProjectLead(projectToEdit.projectLead || '');
      setVisibility(projectToEdit.visibility || 'Public');

    }
  }, [projectToEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setCoverImageUrl(base64);
      setImagePreview(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Project title is required.');
      return;
    }
    
    const tasks: ProjectTask[] = initialTasks
        .split('\n')
        .map(text => text.trim())
        .filter(Boolean)
        .map(text => ({
            id: crypto.randomUUID(),
            text,
            isCompleted: false
        }));

    onSave({
      title,
      description,
      teamMembers: teamMembers.split(',').map(name => name.trim()).filter(Boolean),
      coverImageUrl,
      status,
      tasks: projectToEdit ? projectToEdit.tasks.concat(tasks.filter(nt => !projectToEdit.tasks.some(et => et.text === nt.text))) : tasks,
      notes,
      priority,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      projectLead: projectLead || undefined,
      visibility,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-5 text-sky-400">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">Project Title</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required autoFocus className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
          </div>
          <div>
            <label htmlFor="teamMembers" className="block text-sm font-medium text-slate-300">Team Members</label>
            <input type="text" id="teamMembers" value={teamMembers} onChange={e => setTeamMembers(e.target.value)} placeholder="e.g., Jane Doe, John Smith" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
            <p className="text-xs text-slate-500 mt-1">Separate names with a comma.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Cover Image</label>
            <div className="mt-2 flex items-center gap-4">
              {imagePreview && <img src={imagePreview} alt="Cover preview" className="h-16 w-16 rounded-md object-cover bg-slate-700" />}
              <label htmlFor="cover-upload" className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg cursor-pointer">
                <UploadIcon /> Upload Image
                <input id="cover-upload" type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
              </label>
            </div>
          </div>

          {/* Advanced Details Collapsible Section */}
          <div className="border-t border-slate-700/50 pt-3">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex justify-between items-center w-full text-left text-sm font-medium text-slate-300 hover:text-white"
            >
              <span>Advanced Details</span>
              <ChevronDownIcon className={`transition-transform h-5 w-5 text-slate-400 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAdvancedOpen && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-300">Status</label>
                        <select id="status" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500">
                            {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-slate-300">Priority</label>
                        <select id="priority" value={priority} onChange={e => setPriority(e.target.value as ProjectPriority)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500">
                            {Object.values(ProjectPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-300">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-300">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-300">Tags</label>
                    <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., robotics, IoT, competition" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                    <p className="text-xs text-slate-500 mt-1">Separate tags with a comma.</p>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-slate-300">Estimated Budget (₹)</label>
                        <input type="number" id="budget" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g., 5000" min="0" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="visibility" className="block text-sm font-medium text-slate-300">Visibility</label>
                        <select id="visibility" value={visibility} onChange={e => setVisibility(e.target.value as 'Public' | 'Private')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500">
                           <option value="Public">Public</option>
                           <option value="Private">Private</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label htmlFor="projectLead" className="block text-sm font-medium text-slate-300">Project Lead / Mentor</label>
                    <input type="text" id="projectLead" value={projectLead} onChange={e => setProjectLead(e.target.value)} placeholder="e.g., Mr. Smith" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                </div>
                 <div>
                  <label htmlFor="initialTasks" className="block text-sm font-medium text-slate-300">Initial Tasks</label>
                  <textarea id="initialTasks" value={initialTasks} onChange={e => setInitialTasks(e.target.value)} rows={3} placeholder="Add one task per line..." className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-300">Notes</label>
                  <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Jot down initial ideas or goals..." className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition">{projectToEdit ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;