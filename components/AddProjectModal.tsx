import React, { useState, useMemo } from 'react';
import { Project, ProjectType, RequiredComponent, Component } from '../types.ts';
import { UploadIcon, PlusIcon, TrashIcon, ChevronDownIcon, SearchIcon, CheckCircleIcon } from './Icons.tsx';

interface AddProjectModalProps {
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id' | 'submittedAt' | 'status'>) => void;
  studentName: string;
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

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onAddProject, studentName, availableComponents }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.HARDWARE);
  const [teamName, setTeamName] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [features, setFeatures] = useState('');
  const [description, setDescription] = useState('');
  const [prototypeDrawingUrl, setPrototypeDrawingUrl] = useState<string | undefined>();
  const [requiredComponents, setRequiredComponents] = useState<RequiredComponent[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [techStack, setTechStack] = useState('');
  
  const [componentSearch, setComponentSearch] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');


  const filteredComponents = useMemo(() => {
    if (!componentSearch) return [];
    return availableComponents
      .filter(c => c.name.toLowerCase().includes(componentSearch.toLowerCase()))
      .slice(0, 5); // Limit results for performance
  }, [componentSearch, availableComponents]);

  const addComponentToRequired = (component: Component) => {
    if (!requiredComponents.some(rc => rc.componentId === component.id)) {
      setRequiredComponents([...requiredComponents, { componentId: component.id, componentName: component.name, quantity: 1 }]);
    }
    setComponentSearch('');
  };

  const updateRequiredQuantity = (componentId: string, quantity: number) => {
    setRequiredComponents(requiredComponents.map(rc => 
        rc.componentId === componentId ? { ...rc, quantity: Math.max(1, quantity) } : rc
    ));
  };

  const removeRequiredComponent = (componentId: string) => {
    setRequiredComponents(requiredComponents.filter(rc => rc.componentId !== componentId));
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        setPrototypeDrawingUrl(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !teamName || !teamEmail || !teamMembers || !features || !description || requiredComponents.length === 0) {
      alert('Please fill out all required fields.');
      return;
    }
    
    setSubmissionStatus('submitting');
    
    try {
        // Simulate a short delay for UX
        await new Promise(res => setTimeout(res, 500));
        
        onAddProject({
          submitterStudentName: studentName,
          projectName,
          projectType,
          teamName,
          teamEmail,
          teamMembers,
          mobileNumber,
          features,
          description,
          prototypeDrawingUrl,
          requiredComponents,
          timeline,
          budget,
          techStack,
        });

        setSubmissionStatus('success');

        setTimeout(() => {
            onClose();
        }, 2000);

    } catch (error) {
        alert('There was an error submitting your project. Please try again.');
        setSubmissionStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-3xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} disabled={submissionStatus === 'submitting'} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-sky-400 flex-shrink-0">Submit New Project Proposal</h2>
        
        {submissionStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center flex-grow text-center animate-success">
                <CheckCircleIcon className="h-24 w-24 text-green-400" />
                <h3 className="text-2xl font-bold text-white mt-4">Project Submitted Successfully!</h3>
                <p className="text-slate-400 mt-2">Your project is now pending admin approval. You can track its status in the "My Projects" section.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputField id="projectName" label="Project Name" value={projectName} onChange={setProjectName} required />
                 <div>
                    <label className="block text-sm font-medium text-slate-300">Project Type</label>
                    <div className="mt-2 flex gap-4">
                        {Object.values(ProjectType).map(type => (
                            <label key={type} className="flex items-center gap-2 text-slate-200">
                                <input type="radio" name="projectType" value={type} checked={projectType === type} onChange={() => setProjectType(type)} className="form-radio bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-600" />
                                {type}
                            </label>
                        ))}
                    </div>
                 </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputField id="teamName" label="Team Name" value={teamName} onChange={setTeamName} required />
                 <InputField id="teamEmail" label="Team Email" type="email" value={teamEmail} onChange={setTeamEmail} required />
              </div>
              <InputField id="teamMembers" label="Team Members (comma-separated)" value={teamMembers} onChange={setTeamMembers} required isTextArea/>
              <InputField id="mobileNumber" label="Mobile Number (Optional)" type="tel" value={mobileNumber} onChange={setMobileNumber} />
              <InputField id="features" label="Project Features (list main features)" value={features} onChange={setFeatures} required isTextArea/>
              <InputField id="description" label="Project Description" value={description} onChange={setDescription} required isTextArea rows={4}/>
              
              <div>
                <label className="block text-sm font-medium text-slate-300">Prototype Drawing (Optional)</label>
                <div className="mt-2 p-4 bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg text-center">
                    <UploadIcon className="mx-auto h-10 w-10 text-slate-500"/>
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageUpload}/>
                    </label>
                    <p className="text-xs text-slate-500">PNG or JPG up to 2MB</p>
                    {prototypeDrawingUrl && <img src={prototypeDrawingUrl} alt="Prototype preview" className="mt-2 mx-auto max-h-32 rounded-md"/>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Required Components</label>
                <div className="relative mt-2">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search for a component to add..."
                        value={componentSearch}
                        onChange={e => setComponentSearch(e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 pl-10 text-white"
                    />
                    {filteredComponents.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg">
                            {filteredComponents.map(comp => (
                                <button key={comp.id} type="button" onClick={() => addComponentToRequired(comp)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
                                    {comp.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {requiredComponents.map(rc => (
                        <div key={rc.componentId} className="flex items-center gap-3 bg-slate-700/50 p-2 rounded-md">
                            <span className="flex-grow text-slate-200">{rc.componentName}</span>
                            <input 
                                type="number"
                                value={rc.quantity}
                                onChange={e => updateRequiredQuantity(rc.componentId, parseInt(e.target.value, 10))}
                                min="1"
                                className="w-20 bg-slate-800 border-slate-600 rounded-md py-1 px-2 text-white text-center"
                            />
                            <button type="button" onClick={() => removeRequiredComponent(rc.componentId)} className="p-1 text-slate-400 hover:text-red-500">
                                <TrashIcon className="h-4 w-4"/>
                            </button>
                        </div>
                    ))}
                </div>
              </div>
              
               <div className="border-t border-slate-700/50 pt-4">
                <button type="button" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400 transition-colors">
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                  <span className="font-semibold">Advanced Details</span>
                </button>
                {isAdvancedOpen && (
                  <div className="mt-4 pl-7 space-y-4">
                    <InputField id="timeline" label="Estimated Timeline (e.g., 4 weeks)" value={timeline} onChange={setTimeline} />
                    <InputField id="budget" label="Estimated Budget (Optional)" value={budget} onChange={setBudget} />
                    <InputField id="techStack" label="Technology Stack (e.g., Arduino IDE, Python, Fusion 360)" value={techStack} onChange={setTechStack} isTextArea />
                  </div>
                )}
              </div>
               <div className="flex justify-end gap-4 pt-4 flex-shrink-0">
                <button type="button" onClick={onClose} disabled={submissionStatus === 'submitting'} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submissionStatus === 'submitting'} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 disabled:opacity-50">
                   {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

const InputField: React.FC<{id: string, label: string, value: string, onChange: (value: string) => void, type?: string, required?: boolean, isTextArea?: boolean, rows?: number}> = 
({id, label, value, onChange, type = "text", required = false, isTextArea = false, rows = 2}) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}{required && <span className="text-red-400">*</span>}</label>
      {isTextArea ? (
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} required={required} rows={rows} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
      ) : (
        <input type={type} id={id} value={value} onChange={e => onChange(e.target.value)} required={required} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500"/>
      )}
    </div>
);

export default AddProjectModal;