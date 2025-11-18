import React from 'react';
import { Project, ProjectStatus } from '../types.ts';

interface MyProjectCardProps {
  project: Project;
}

const MyProjectCard: React.FC<MyProjectCardProps> = ({ project }) => {
  const getStatusClasses = () => {
    switch (project.status) {
      case ProjectStatus.PENDING:
        return 'bg-yellow-500/20 text-yellow-300';
      case ProjectStatus.APPROVED:
        return 'bg-green-500/20 text-green-300';
      case ProjectStatus.REJECTED:
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-white pr-2">{project.projectName}</h4>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClasses()}`}>
          {project.status}
        </span>
      </div>
      <p className="text-sm text-slate-400">Team: {project.teamName}</p>
      {project.status === ProjectStatus.REJECTED && project.adminFeedback && (
        <p className="text-xs text-yellow-400 bg-yellow-900/30 p-2 rounded-md">
            <strong className="font-semibold">Feedback:</strong> {project.adminFeedback}
        </p>
      )}
      <p className="text-xs text-slate-500 pt-1 border-t border-slate-700/50">
        Submitted: {new Date(project.submittedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default MyProjectCard;