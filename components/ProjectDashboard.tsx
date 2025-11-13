import React, { useState, useMemo, useEffect } from 'react';
import { Project, Component, ProjectStatus, ProjectTask, Attachment } from '../types.ts';
import { EditIcon, TrashIcon, TeamIcon, PlusIcon, FileIcon, VideoIcon, AudioIcon, ImageIcon, PdfIcon, GripVerticalIcon, CheckboxCheckedIcon } from './Icons.tsx';

interface ProjectDashboardProps {
  project: Project;
  inventoryComponents: Component[];
  onEdit: (project: Project) => void;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
}

const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) { return null; }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const FileTypeIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-slate-300" />;
    if (mimeType.startsWith('video/')) return <VideoIcon className="h-6 w-6 text-slate-300" />;
    if (mimeType.startsWith('audio/')) return <AudioIcon className="h-6 w-6 text-slate-300" />;
    if (mimeType === 'application/pdf') return <PdfIcon className="h-6 w-6 text-slate-300" />;
    return <FileIcon className="h-6 w-6 text-slate-300" />;
};

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ title, children, className, style }) => (
    <div className={`widget-enter-animation bg-slate-800/50 border border-slate-700 rounded-lg p-5 ${className}`} style={{ opacity: 0, ...style }}>
        <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3">{title}</h3>
        {children}
    </div>
);

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, inventoryComponents, onEdit, onUpdate, onDelete }) => {
    const youtubeEmbedUrl = getYoutubeEmbedUrl(project.youtubeUrl || '');

    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        setTasks(project.tasks || []);
        setNotes(project.notes || '');
    }, [project]);

    const statusColors = {
        [ProjectStatus.IN_PROGRESS]: "bg-sky-500/30 text-sky-300 border-sky-500/50",
        [ProjectStatus.COMPLETED]: "bg-green-500/30 text-green-300 border-green-500/50",
        [ProjectStatus.ON_HOLD]: "bg-yellow-500/30 text-yellow-300 border-yellow-500/50",
    };

    const handleAddTask = () => {
        if(newTaskText.trim()){
            const newTask: ProjectTask = {
                id: crypto.randomUUID(),
                text: newTaskText.trim(),
                isCompleted: false
            };
            const updatedTasks = [...tasks, newTask];
            setTasks(updatedTasks);
            onUpdate({...project, tasks: updatedTasks});
            setNewTaskText('');
        }
    };
    
    const handleToggleTask = (taskId: string) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? {...t, isCompleted: !t.isCompleted} : t);
        setTasks(updatedTasks);
        onUpdate({...project, tasks: updatedTasks});
    };
    
    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        onUpdate({...project, tasks: updatedTasks});
    };
    
    const handleNotesBlur = () => {
        if(project.notes !== notes) {
            onUpdate({...project, notes});
        }
    };

    const completedTasks = useMemo(() => tasks.filter(t => t.isCompleted).length, [tasks]);
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className="p-4 md:p-6 project-dashboard">
            <header className="flex flex-col sm:flex-row items-start gap-4 pb-4 mb-4">
                <img 
                    src={project.projectLogoUrl || 'https://placehold.co/100x100/1e293b/94a3b8/png?text=Logo'}
                    alt={`${project.name} Logo`}
                    className="w-24 h-24 rounded-lg object-cover bg-slate-700 border-2 border-slate-600"
                />
                <div className="flex-grow">
                    <h2 className="text-3xl font-bold text-white">{project.name}</h2>
                    <p className="text-slate-400">{project.teamName}</p>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-slate-500">
                            Created: {new Date(project.projectDate).toLocaleDateString()}
                        </p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColors[project.status]}`}>{project.status}</span>
                    </div>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                    <button onClick={() => onEdit(project)} className="p-2 bg-slate-700 hover:bg-sky-600 rounded-lg transition"><EditIcon /></button>
                    <button onClick={() => onDelete(project.id)} className="p-2 bg-slate-700 hover:bg-red-600 rounded-lg transition"><TrashIcon /></button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {project.description && <Card title="Description" className="widget-enter-animation" style={{ animationDelay: '100ms'}}><p className="text-slate-300 whitespace-pre-wrap">{project.description}</p></Card>}
                    
                    <Card title="Tasks" className="widget-enter-animation" style={{ animationDelay: '200ms'}}>
                        <div className="space-y-2">
                             {totalTasks > 0 && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>{completedTasks}/{totalTasks}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-sky-500 h-2 rounded-full transition-all duration-500" style={{width: `${progressPercentage}%`}}></div>
                                    </div>
                                </div>
                            )}
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {tasks.map(task => (
                                    <div key={task.id} className="task-item flex items-center gap-2 bg-slate-900/50 p-2 rounded-md border border-slate-700 has-[:checked]:bg-green-900/30">
                                        <button onClick={() => handleToggleTask(task.id)}>
                                            {task.isCompleted ? <CheckboxCheckedIcon className="h-6 w-6 text-green-400"/> : <div className="h-6 w-6 border-2 border-slate-500 rounded-md"></div>}
                                        </button>
                                        <p className={`flex-grow text-sm ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.text}</p>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-500 hover:text-red-400"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-stretch gap-2 pt-2">
                                <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask()} placeholder="Add a new task..." className="flex-grow bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white"/>
                                <button onClick={handleAddTask} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"><PlusIcon /></button>
                            </div>
                        </div>
                    </Card>

                    {youtubeEmbedUrl && (
                        <Card title="Project Video" className="widget-enter-animation" style={{ animationDelay: '300ms'}}>
                            <div className="aspect-video">
                                <iframe src={youtubeEmbedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-md"></iframe>
                            </div>
                        </Card>
                    )}
                    {project.features && <Card title="Features" className="widget-enter-animation" style={{ animationDelay: '400ms'}}><ul className="list-disc list-inside text-slate-300 space-y-1">{project.features.split('\n').map((feat, i) => feat.trim() && <li key={i}>{feat}</li>)}</ul></Card>}
                     <Card title="Notes" className="widget-enter-animation" style={{ animationDelay: '500ms'}}>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={handleNotesBlur} placeholder="Add any notes, thoughts, or logs here..." rows={5} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white text-sm" />
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Team" className="widget-enter-animation" style={{ animationDelay: '150ms'}}>
                        <div className="space-y-2">
                            {project.teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md">
                                    <TeamIcon className="h-5 w-5 text-indigo-400" />
                                    <span className="text-slate-200">{member}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Required Components" className="widget-enter-animation" style={{ animationDelay: '250ms'}}>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                             {project.requiredComponents.map(comp => (
                                <p key={comp.componentId} className="text-slate-300 text-sm bg-slate-700/50 p-1.5 rounded-md">- {comp.componentName}</p>
                             ))}
                        </div>
                    </Card>
                    <Card title="Attachments" className="widget-enter-animation" style={{ animationDelay: '350ms'}}>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                           {project.attachments.map(att => (
                               <a href={att.dataUrl} download={att.name} key={att.id} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                   <FileTypeIcon mimeType={att.type} />
                                   <div className="overflow-hidden">
                                       <p className="text-sm text-slate-200 truncate font-medium">{att.name}</p>
                                       <p className="text-xs text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                                   </div>
                               </a>
                           ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ProjectDashboard;