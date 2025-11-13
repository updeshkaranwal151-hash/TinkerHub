import { Component, IssueRecord, Category, Project, RequiredComponent, MaintenanceRecord, Attachment, ProjectStatus, ProjectTask, ProjectPriority, AccessLogRecord } from '../types.ts';
import { ImageData } from '../components/imageLibrary.ts';


const COMPONENTS_STORAGE_KEY = 'atl-inventory-components';
const PROJECTS_STORAGE_KEY = 'atl-inventory-projects';
const IMAGE_LIBRARY_KEY = 'atl-inventory-custom-images';
const ANALYTICS_KEY = 'atl-inventory-analytics';
const VISITOR_ID_KEY = 'atl-inventory-visitor-id';
const ADMIN_PASSWORD_KEY = 'atl-admin-password';
const USER_PASSWORD_KEY = 'atl-user-password';
const ACCESS_LOG_KEY = 'atl-inventory-access-log';


// --- Analytics Types ---
interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  successfulLogins: number;
}

// --- Component Functions ---

// Helper to get all components from LocalStorage
const getComponentsFromStorage = (): Component[] => {
  try {
    const data = localStorage.getItem(COMPONENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Could not parse components from LocalStorage", error);
    return [];
  }
};

// Helper to save all components to LocalStorage
const saveComponentsToStorage = (components: Component[]): void => {
  localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(components));
};

export const getComponents = (): Component[] => {
  const components = getComponentsFromStorage();
  // Sort by createdAt descending, similar to the original firestore query
  return components.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

export const addComponent = (component: Omit<Component, 'id' | 'createdAt' | 'isUnderMaintenance' | 'maintenanceLog'>): Component => {
  const components = getComponentsFromStorage();
  const newComponent: Component = {
    ...component,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isUnderMaintenance: false,
    maintenanceLog: [],
  };
  const updatedComponents = [newComponent, ...components];
  saveComponentsToStorage(updatedComponents);
  return newComponent;
};

// FIX: The type for `componentsToAdd` was too restrictive. It omitted `isUnderMaintenance` and `maintenanceLog`,
// but these properties can be present in imported data and are used in the function body.
// The type is updated to `Omit<Component, 'id' | 'createdAt'>[]` to match the data structure from the CSV import.
export const addMultipleComponents = (componentsToAdd: Omit<Component, 'id' | 'createdAt'>[]): Component[] => {
  const existingComponents = getComponentsFromStorage();
  
  const newComponents: Component[] = componentsToAdd.map(component => ({
    ...component,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isUnderMaintenance: component.isUnderMaintenance || false,
    maintenanceLog: component.maintenanceLog || [],
  }));

  const updatedComponents = [...newComponents, ...existingComponents];
  saveComponentsToStorage(updatedComponents);

  return newComponents;
};

export const updateComponent = (componentToUpdate: Component): void => {
  let components = getComponentsFromStorage();
  components = components.map(c => (c.id === componentToUpdate.id ? componentToUpdate : c));
  saveComponentsToStorage(components);
};

export const deleteComponent = (id: string): void => {
  let components = getComponentsFromStorage();
  components = components.filter(c => c.id !== id);
  saveComponentsToStorage(components);
};

export const toggleAvailability = (component: Component): Component => {
  let components = getComponentsFromStorage();
  const updatedComponent = { ...component, isAvailable: !component.isAvailable };
  components = components.map(c => (c.id === component.id ? updatedComponent : c));
  saveComponentsToStorage(components);
  return updatedComponent;
}

export const issueComponent = (id: string, studentName: string, quantity: number): Component => {
    let components = getComponentsFromStorage();
    let updatedComponent: Component | undefined;

    const updatedComponents = components.map(c => {
        if (c.id === id) {
            const newIssue: IssueRecord = {
                id: crypto.randomUUID(),
                studentName,
                issuedDate: new Date().toISOString(),
                quantity,
            };
            const updatedIssuedTo = [...(c.issuedTo || []), newIssue];
            updatedComponent = { ...c, issuedTo: updatedIssuedTo };
            return updatedComponent;
        }
        return c;
    });

    if (!updatedComponent) {
        throw new Error("Component not found");
    }

    saveComponentsToStorage(updatedComponents);
    return updatedComponent;
};

export const returnIssue = (componentId: string, issueId: string): Component => {
    let components = getComponentsFromStorage();
    let updatedComponent: Component | undefined;

    const updatedComponents = components.map(c => {
        if (c.id === componentId) {
            const updatedIssuedTo = c.issuedTo.filter(issue => issue.id !== issueId);
            updatedComponent = { ...c, issuedTo: updatedIssuedTo };
            return updatedComponent;
        }
        return c;
    });

    if (!updatedComponent) {
        throw new Error("Component not found");
    }

    saveComponentsToStorage(updatedComponents);
    return updatedComponent;
};

export const clearAllComponents = (): void => {
    localStorage.removeItem(COMPONENTS_STORAGE_KEY);
};

// --- Maintenance Functions ---

const findComponent = (components: Component[], id: string): [Component, number] => {
  const index = components.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Component not found");
  return [components[index], index];
};

export const toggleMaintenanceStatus = (componentId: string): Component => {
    const components = getComponentsFromStorage();
    const [component, index] = findComponent(components, componentId);
    const updatedComponent = { ...component, isUnderMaintenance: !component.isUnderMaintenance };
    components[index] = updatedComponent;
    saveComponentsToStorage(components);
    return updatedComponent;
};

export const addMaintenanceLog = (componentId: string, notes: string): Component => {
    const components = getComponentsFromStorage();
    const [component, index] = findComponent(components, componentId);
    
    const newLog: MaintenanceRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        notes,
    };
    
    const updatedComponent = {
        ...component,
        maintenanceLog: [newLog, ...(component.maintenanceLog || [])],
    };
    
    components[index] = updatedComponent;
    saveComponentsToStorage(components);
    return updatedComponent;
};

export const deleteMaintenanceLog = (componentId: string, logId: string): Component => {
    const components = getComponentsFromStorage();
    const [component, index] = findComponent(components, componentId);
    
    const updatedComponent = {
        ...component,
        maintenanceLog: (component.maintenanceLog || []).filter(log => log.id !== logId),
    };

    components[index] = updatedComponent;
    saveComponentsToStorage(components);
    return updatedComponent;
};


// --- Project Functions ---

const getProjectsFromStorage = (): Project[] => {
  try {
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Could not parse projects from LocalStorage", error);
    return [];
  }
};

const saveProjectsToStorage = (projects: Project[]): void => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  const projects = getProjectsFromStorage();
  return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'attachments' | 'requiredComponents'>): Project => {
  const projects = getProjectsFromStorage();
  const newProject: Project = {
    ...projectData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    attachments: [],
    requiredComponents: [],
    priority: projectData.priority || ProjectPriority.MEDIUM,
    tags: projectData.tags || [],
    visibility: projectData.visibility || 'Public',
    coverImageUrl: projectData.coverImageUrl || `https://placehold.co/600x400/1e293b/475569/png?text=${encodeURIComponent(projectData.title)}`
  };
  saveProjectsToStorage([newProject, ...projects]);
  return newProject;
};


export const updateProject = (projectToUpdate: Project): void => {
  let projects = getProjectsFromStorage();
  projects = projects.map(p => (p.id === projectToUpdate.id ? projectToUpdate : p));
  saveProjectsToStorage(projects);
};

export const deleteProject = (id: string): void => {
  let projects = getProjectsFromStorage();
  projects = projects.filter(p => p.id !== id);
  saveProjectsToStorage(projects);
};


// --- Custom Image Library Functions ---

export const getCustomImageLibrary = (): Record<string, ImageData[]> => {
  try {
    const data = localStorage.getItem(IMAGE_LIBRARY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Could not parse custom image library from LocalStorage", error);
    return {};
  }
};

export const saveCustomImageLibrary = (library: Record<string, ImageData[]>): void => {
  localStorage.setItem(IMAGE_LIBRARY_KEY, JSON.stringify(library));
};

export const updateCustomImageName = (category: Category, imageUrl: string, newName: string): void => {
  const library = getCustomImageLibrary();
  if (library[category]) {
    const imageIndex = library[category].findIndex(img => img.url === imageUrl);
    if (imageIndex > -1) {
      library[category][imageIndex].name = newName;
      saveCustomImageLibrary(library);
    }
  }
};

export const deleteCustomImage = (category: Category, imageUrl: string): void => {
    const library = getCustomImageLibrary();
    if (library[category]) {
        library[category] = library[category].filter(img => img.url !== imageUrl);
        saveCustomImageLibrary(library);
    }
};


// --- Analytics Functions ---

export const getAnalyticsData = (): AnalyticsData => {
  const data = localStorage.getItem(ANALYTICS_KEY);
  return data ? JSON.parse(data) : { totalVisits: 0, uniqueVisitors: 0, successfulLogins: 0 };
};

const saveAnalyticsData = (data: AnalyticsData) => {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
};

export const trackVisit = (): void => {
  const analytics = getAnalyticsData();
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    analytics.uniqueVisitors += 1;
  }

  analytics.totalVisits += 1;
  saveAnalyticsData(analytics);
};

export const trackSuccessfulLogin = (): void => {
  const analytics = getAnalyticsData();
  analytics.successfulLogins += 1;
  saveAnalyticsData(analytics);
};

// --- Access Log Functions ---
export const getAccessLog = (): AccessLogRecord[] => {
    try {
        const data = localStorage.getItem(ACCESS_LOG_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Could not parse access log from LocalStorage", error);
        return [];
    }
};

const saveAccessLog = (log: AccessLogRecord[]): void => {
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(log));
};

export const trackAccess = (): void => {
    const log = getAccessLog();
    const newEntry: AccessLogRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
    };
    // Keep the log from getting excessively large, cap at 1000 entries
    const updatedLog = [newEntry, ...log].slice(0, 1000);
    saveAccessLog(updatedLog);
};

export const clearAccessLog = (): void => {
    localStorage.removeItem(ACCESS_LOG_KEY);
};


// --- Password Management Functions ---
export const getAdminPassword = (): string | null => {
  return localStorage.getItem(ADMIN_PASSWORD_KEY);
};

export const setAdminPassword = (password: string): void => {
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
};

export const getUserPassword = (): string | null => {
  return localStorage.getItem(USER_PASSWORD_KEY);
};

export const setUserPassword = (password: string): void => {
  localStorage.setItem(USER_PASSWORD_KEY, password);
};

// --- Global Data Management ---
interface AllAppData {
  components: Component[];
  projects: Project[];
  imageLibrary: Record<string, ImageData[]>;
  analytics: AnalyticsData;
  adminPassword: string | null;
  userPassword: string | null;
}

export const exportAllAppData = (): AllAppData => {
  return {
    components: getComponentsFromStorage(),
    projects: getProjectsFromStorage(),
    imageLibrary: getCustomImageLibrary(),
    analytics: getAnalyticsData(),
    adminPassword: getAdminPassword(),
    userPassword: getUserPassword(),
  };
};

export const importAllAppData = (data: AllAppData): void => {
  localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(data.components));
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data.projects));
  localStorage.setItem(IMAGE_LIBRARY_KEY, JSON.stringify(data.imageLibrary));
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data.analytics));
  if (data.adminPassword) localStorage.setItem(ADMIN_PASSWORD_KEY, data.adminPassword);
  if (data.userPassword) localStorage.setItem(USER_PASSWORD_KEY, data.userPassword);
};


export const clearAllAppData = (): void => {
  localStorage.removeItem(COMPONENTS_STORAGE_KEY);
  localStorage.removeItem(PROJECTS_STORAGE_KEY);
  localStorage.removeItem(IMAGE_LIBRARY_KEY);
  localStorage.removeItem(ANALYTICS_KEY);
  localStorage.removeItem(VISITOR_ID_KEY); // Also clear visitor ID
  localStorage.removeItem(ACCESS_LOG_KEY); // Also clear access log
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
  localStorage.removeItem(USER_PASSWORD_KEY);
}