import React from 'react';
import { Project, Attachment, RequiredComponent } from '../types.ts';
import { EditIcon, TrashIcon, ArrowLeftIcon, TeamIcon, FileIcon, VideoIcon, AudioIcon, ImageIcon, PdfIcon } from './Icons.tsx';

interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
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
    } catch (e) {
        return null;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const FileTypeIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-slate-300" />;
    if (mimeType.startsWith('video/')) return <VideoIcon className="h-6 w-6 text-slate-300" />;
    if (mimeType.startsWith('audio/')) return <AudioIcon className="h-6 w-6 text-slate-300" />;
    if (mimeType === 'application/pdf') return <PdfIcon className="h-6 w-6 text-slate-300" />;
    return <FileIcon className="h-6 w-6 text-slate-300" />;
};

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-5 ${className}`}>
        <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3">{title}</h3>
        {children}
    </div>
);

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onClose, onEdit, onDelete }) => {
    const youtubeEmbedUrl = getYoutubeEmbedUrl(project.youtubeUrl || '');

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 md:p-6 card-enter-animation">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start gap-4 pb-4 mb-4 border-b border-slate-700">
                <button onClick={onClose} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition self-start sm:self-center">
                    <ArrowLeftIcon />
                </button>
                <img 
                    src={project.projectLogoUrl || 'https://placehold.co/100x100/1e293b/94a3b8/png?text=Logo'}
                    alt={`${project.name} Logo`}
                    className="w-24 h-24 rounded-lg object-cover bg-slate-700 border-2 border-slate-600"
                />
                <div className="flex-grow">
                    <h2 className="text-3xl font-bold text-white">{project.name}</h2>
                    <p className="text-slate-400">{project.teamName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        Created on: {new Date(project.projectDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                    <button onClick={() => onEdit(project)} className="p-2 bg-slate-700 hover:bg-sky-600 rounded-lg transition"><EditIcon /></button>
                    <button onClick={() => onDelete(project.id)} className="p-2 bg-slate-700 hover:bg-red-600 rounded-lg transition"><TrashIcon /></button>
                </div>
            </header>

            {/* Main Content */}
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {project.description && <Card title="Description"><p className="text-slate-300 whitespace-pre-wrap">{project.description}</p></Card>}
                    {youtubeEmbedUrl && (
                        <Card title="Project Video">
                            <div className="aspect-video">
                                <iframe
                                    src={youtubeEmbedUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full rounded-md"
                                ></iframe>
                            </div>
                        </Card>
                    )}
                    {project.features && <Card title="Features"><ul className="list-disc list-inside text-slate-300 space-y-1">{project.features.split('\n').map((feat, i) => feat.trim() && <li key={i}>{feat}</li>)}</ul></Card>}
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Team">
                        <div className="space-y-2">
                            {project.teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md">
                                    <TeamIcon className="h-5 w-5 text-indigo-400" />
                                    <span className="text-slate-200">{member}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Required Components">
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-1">
                             {project.requiredComponents.map(comp => (
                                <p key={comp.componentId} className="text-slate-300 text-sm bg-slate-700/50 p-1.5 rounded-md">- {comp.componentName}</p>
                             ))}
                        </div>
                    </Card>
                    <Card title="Attachments">
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
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

export default ProjectDetailView;