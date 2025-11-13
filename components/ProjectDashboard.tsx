import React, { useState, useMemo, useCallback } from 'react';
import { Project, Component, ProjectStatus, RequiredComponent, ProjectTask, Attachment, AttachmentType, ProjectPriority } from '../types.ts';
import { EditIcon, TrashIcon, PlusIcon, TeamIcon, CheckboxIcon, CheckboxCheckedIcon, GripVerticalIcon, FileIcon, ImageIcon, VideoIcon, LinkIcon, PdfIcon, AudioIcon, UploadIcon, CalendarIcon, FlagIcon, TagIcon, UserIcon as LeadIcon, GlobeIcon, LockIcon } from './Icons.tsx';
import ProjectModal from './ProjectModal.tsx';

type ProjectUpdateData = Omit<Project, 'id' | 'createdAt' | 'attachments' | 'requiredComponents'>;

interface ProjectDashboardProps {
  project: Project;
  inventoryComponents: Component[];
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

// Helper to convert File to Base64 for storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, inventoryComponents, onUpdateProject, onDeleteProject }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const completedTasks = useMemo(() => project.tasks.filter(t => t.isCompleted).length, [project.tasks]);
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProject({ ...project, status: e.target.value as ProjectStatus });
  };
  
  const handleSaveEditedProject = (projectData: ProjectUpdateData) => {
      onUpdateProject({ 
        ...project, 
        ...projectData, 
        // Ensure arrays that aren't editable in this modal are preserved
        attachments: project.attachments,
        requiredComponents: project.requiredComponents,
      });
      setIsEditModalOpen(false);
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-green-500/20 text-green-300 border-green-500/30';
      case ProjectStatus.IN_PROGRESS: return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case ProjectStatus.ON_HOLD: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case ProjectStatus.PLANNED: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="project-dashboard">
      {/* Header Banner */}
       <header
        className="project-dashboard-banner relative h-48 md:h-56 rounded-lg m-4 md:m-6 overflow-hidden p-6 flex flex-col justify-end"
        style={{
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.9) 20%, rgba(15, 23, 42, 0.2)), url(${project.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">{project.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-slate-300">
                    <TeamIcon className="h-5 w-5" />
                    <span>{project.teamMembers.join(', ')}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 bg-slate-900/50 p-2 rounded-lg">
                <select
                    value={project.status}
                    onChange={handleStatusChange}
                    className={`bg-transparent border text-sm font-semibold py-1 px-3 rounded-full appearance-none focus:outline-none ${getStatusColor(project.status)}`}
                >
                    {Object.values(ProjectStatus).map(s => <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>)}
                </select>
                <button onClick={() => setIsEditModalOpen(true)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md"><EditIcon /></button>
                <button onClick={() => onDeleteProject(project.id)} className="p-2 bg-red-800 hover:bg-red-700 rounded-md"><TrashIcon /></button>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="p-4 pt-0 md:p-8 md:pt-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TasksWidget project={project} onUpdateProject={onUpdateProject} />
          <AttachmentsWidget project={project} onUpdateProject={onUpdateProject} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ProjectDetailsWidget project={project} />
          <RequiredComponentsWidget project={project} onUpdateProject={onUpdateProject} inventoryComponents={inventoryComponents} />
          <NotesWidget project={project} onUpdateProject={onUpdateProject} />
        </div>
      </div>
      
      {isEditModalOpen && (
        <ProjectModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEditedProject}
          projectToEdit={project}
        />
      )}
    </div>
  );
};


const ProjectDetailsWidget: React.FC<{ project: Project }> = ({ project }) => {
    const getPriorityClasses = (priority: ProjectPriority) => {
        switch (priority) {
            case ProjectPriority.URGENT: return 'text-red-400 border-red-500/50 bg-red-900/30';
            case ProjectPriority.HIGH: return 'text-orange-400 border-orange-500/50 bg-orange-900/30';
            case ProjectPriority.MEDIUM: return 'text-sky-400 border-sky-500/50 bg-sky-900/30';
            case ProjectPriority.LOW: return 'text-green-400 border-green-500/50 bg-green-900/30';
            default: return 'text-slate-400 border-slate-500/50 bg-slate-900/30';
        }
    };

    const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: React.ReactNode | string | number }> = ({ icon, label, value }) => (
        value ? (
            <div className="flex items-start gap-3">
                <div className="text-slate-500 mt-0.5">{icon}</div>
                <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <div className="text-sm font-medium text-slate-200">{value}</div>
                </div>
            </div>
        ) : null
    );

    return (
        <div className="widget-enter-animation widget bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h3 className="font-bold text-lg text-slate-200 mb-4">Project Details</h3>
            <div className="space-y-4">
                <DetailItem
                    icon={<FlagIcon />}
                    label="Priority"
                    value={
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getPriorityClasses(project.priority)}`}>
                            {project.priority}
                        </span>
                    }
                />
                <DetailItem
                    icon={<CalendarIcon />}
                    label="Timeline"
                    value={`${project.startDate || 'N/A'} → ${project.endDate || 'N/A'}`}
                />
                 <DetailItem
                    icon={<LeadIcon />}
                    label="Project Lead"
                    value={project.projectLead}
                />
                <DetailItem
                    icon={project.visibility === 'Public' ? <GlobeIcon /> : <LockIcon />}
                    label="Visibility"
                    value={project.visibility}
                />
                <DetailItem
                    icon={<TagIcon />}
                    label="Tags"
                    value={
                        project.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">{tag}</span>
                                ))}
                            </div>
                        ) : 'No tags'
                    }
                />
            </div>
        </div>
    );
};


// Individual Widgets
const TasksWidget: React.FC<{ project: Project; onUpdateProject: (p: Project) => void; }> = ({ project, onUpdateProject }) => {
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const newTask: ProjectTask = { id: crypto.randomUUID(), text: newTaskText.trim(), isCompleted: false };
        onUpdateProject({ ...project, tasks: [...project.tasks, newTask] });
        setNewTaskText('');
    };
    
    const handleToggleTask = (taskId: string) => {
        const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        onUpdateProject({ ...project, tasks: updatedTasks });
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = project.tasks.filter(t => t.id !== taskId);
        onUpdateProject({ ...project, tasks: updatedTasks });
    };

    return (
        <div className="widget-enter-animation widget bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h3 className="font-bold text-lg text-slate-200 mb-4">Project Checklist</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {project.tasks.length > 0 ? project.tasks.map(task => (
                    <div key={task.id} className="task-item flex items-center gap-3 p-2.5 bg-slate-900/50 rounded-md border border-slate-700/50 has-[:checked]:bg-green-900/20 has-[:checked]:border-green-500/20">
                         <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => handleToggleTask(task.id)}
                            id={`task-${task.id}`}
                            className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-600 cursor-pointer flex-shrink-0"
                         />
                         <label htmlFor={`task-${task.id}`} className="flex-grow text-sm text-slate-200 cursor-pointer">
                           {task.text}
                         </label>
                         <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-500 hover:text-red-400 flex-shrink-0"><TrashIcon className="h-4 w-4"/></button>
                    </div>
                )) : (
                    <p className="text-center text-sm text-slate-500 italic py-4">No tasks added yet.</p>
                )}
            </div>
             <div className="flex items-stretch gap-2 mt-4">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add a new task..."
                    className="flex-grow bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button onClick={handleAddTask} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"><PlusIcon/></button>
            </div>
        </div>
    );
};

const RequiredComponentsWidget: React.FC<{ project: Project; onUpdateProject: (p: Project) => void; inventoryComponents: Component[] }> = ({ project, onUpdateProject, inventoryComponents }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [componentToAdd, setComponentToAdd] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState(1);

    const handleAddComponent = () => {
        if (!componentToAdd || quantityToAdd < 1) return;
        const componentDetails = inventoryComponents.find(c => c.id === componentToAdd);
        if (!componentDetails) return;

        const newRequired: RequiredComponent = { componentId: componentDetails.id, name: componentDetails.name, quantity: quantityToAdd };
        const updatedList = [...project.requiredComponents, newRequired];
        onUpdateProject({ ...project, requiredComponents: updatedList });
        
        setComponentToAdd('');
        setQuantityToAdd(1);
        setIsAdding(false);
    };

    const handleRemoveComponent = (componentId: string) => {
        const updatedList = project.requiredComponents.filter(c => c.componentId !== componentId);
        onUpdateProject({ ...project, requiredComponents: updatedList });
    };
    
    const availableInventoryMap = useMemo(() => {
        const map = new Map<string, number>();
        inventoryComponents.forEach(c => {
            const available = c.totalQuantity - (c.issuedTo || []).reduce((sum, issue) => sum + (issue.quantity || 1), 0);
            map.set(c.id, available);
        });
        return map;
    }, [inventoryComponents]);

    return (
        <div className="widget-enter-animation widget bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h3 className="font-bold text-lg text-slate-200 mb-4">Required Components</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                {project.requiredComponents.map(req => {
                    const available = availableInventoryMap.get(req.componentId) || 0;
                    const hasEnough = available >= req.quantity;
                    return (
                        <div key={req.componentId} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-md border border-slate-700/50">
                            <div>
                                <p className="text-sm font-medium text-slate-200">{req.name}</p>
                                <p className={`text-xs ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                                    Required: {req.quantity} | Available: {available}
                                </p>
                            </div>
                            <button onClick={() => handleRemoveComponent(req.componentId)} className="p-1 text-slate-500 hover:text-red-400"><TrashIcon className="h-4 w-4"/></button>
                        </div>
                    );
                })}
                 {!isAdding && project.requiredComponents.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No components linked yet.</p>}
            </div>
             {isAdding ? (
                 <div className="mt-4 p-3 bg-slate-900/50 rounded-md border border-slate-600 space-y-2">
                    <select value={componentToAdd} onChange={e => setComponentToAdd(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">Select a component...</option>
                        {inventoryComponents
                          .filter(invComp => !project.requiredComponents.some(reqComp => reqComp.componentId === invComp.id))
                          .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" value={quantityToAdd} onChange={e => setQuantityToAdd(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    <div className="flex gap-2">
                         <button onClick={() => setIsAdding(false)} className="flex-1 py-1 px-3 bg-slate-600 hover:bg-slate-700 rounded-md text-sm">Cancel</button>
                         <button onClick={handleAddComponent} className="flex-1 py-1 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm">Add</button>
                    </div>
                 </div>
             ) : (
                <button onClick={() => setIsAdding(true)} className="w-full mt-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">+ Link Component from Inventory</button>
             )}
        </div>
    );
};

const AttachmentsWidget: React.FC<{ project: Project; onUpdateProject: (p: Project) => void; }> = ({ project, onUpdateProject }) => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const base64Url = await fileToBase64(file);
        const type = file.type.startsWith('image/') ? AttachmentType.IMAGE :
                     file.type.startsWith('video/') ? AttachmentType.VIDEO :
                     file.type.startsWith('audio/') ? AttachmentType.AUDIO :
                     file.type === 'application/pdf' ? AttachmentType.PDF : AttachmentType.FILE;

        const newAttachment: Attachment = { id: crypto.randomUUID(), name: file.name, type, url: base64Url, createdAt: new Date().toISOString() };
        onUpdateProject({ ...project, attachments: [newAttachment, ...project.attachments] });
    };

    const handleDeleteAttachment = (id: string) => {
        onUpdateProject({ ...project, attachments: project.attachments.filter(a => a.id !== id) });
    };

    const AttachmentIcon: React.FC<{type: AttachmentType}> = ({ type }) => {
        switch (type) {
            case AttachmentType.IMAGE: return <ImageIcon className="h-5 w-5 text-purple-400"/>;
            case AttachmentType.VIDEO: return <VideoIcon className="h-5 w-5 text-red-400"/>;
            case AttachmentType.AUDIO: return <AudioIcon className="h-5 w-5 text-orange-400"/>;
            case AttachmentType.PDF: return <PdfIcon className="h-5 w-5 text-yellow-400"/>;
            case AttachmentType.LINK: return <LinkIcon className="h-5 w-5 text-sky-400"/>;
            default: return <FileIcon className="h-5 w-5 text-slate-400"/>;
        }
    };

    return (
        <div className="widget-enter-animation widget bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h3 className="font-bold text-lg text-slate-200 mb-4">Attachments & Resources</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {project.attachments.length > 0 ? project.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-md border border-slate-700/50">
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                            {att.type === AttachmentType.IMAGE ? (
                                <img src={att.url} alt={att.name} className="h-10 w-10 object-cover rounded-md bg-slate-700 flex-shrink-0" />
                            ) : (
                                <div className="h-10 w-10 flex items-center justify-center bg-slate-700 rounded-md flex-shrink-0">
                                    <AttachmentIcon type={att.type} />
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-400">{att.name}</p>
                                <p className="text-xs text-slate-500">{new Date(att.createdAt).toLocaleDateString()}</p>
                            </div>
                        </a>
                        <button onClick={() => handleDeleteAttachment(att.id)} className="p-1 text-slate-500 hover:text-red-400 flex-shrink-0 ml-2"><TrashIcon className="h-4 w-4"/></button>
                    </div>
                )) : (
                    <p className="text-center text-sm text-slate-500 italic py-4">No files attached yet.</p>
                )}
            </div>
             <label htmlFor="attachment-upload" className="w-full mt-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <UploadIcon /> Upload File
                <input id="attachment-upload" type="file" onChange={handleFileChange} className="hidden" />
             </label>
        </div>
    );
};

const NotesWidget: React.FC<{ project: Project; onUpdateProject: (p: Project) => void; }> = ({ project, onUpdateProject }) => {
    const [notes, setNotes] = useState(project.notes);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    };

    const handleSaveNotes = () => {
        onUpdateProject({ ...project, notes });
    };
    
    return (
        <div className="widget-enter-animation widget bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h3 className="font-bold text-lg text-slate-200 mb-4">Project Notes</h3>
            <textarea
                value={notes}
                onChange={handleNotesChange}
                onBlur={handleSaveNotes} // Save when user clicks away
                placeholder="Add notes, ideas, or a project journal here..."
                className="w-full h-48 bg-slate-900/50 border border-slate-600 rounded-md text-slate-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar"
            />
        </div>
    );
};

export default ProjectDashboard;