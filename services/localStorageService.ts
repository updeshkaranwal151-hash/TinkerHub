import { Component, Project, BackupData, AnalyticsData, ImageData, Category } from '../types.ts';
import * as customImageService from './customImageService';

const COMPONENTS_KEY = 'tinkerhub-components';
const PROJECTS_KEY = 'tinkerhub-projects';
const ANALYTICS_KEY = 'tinkerhub-analytics';

// Helper to simulate API delay and ensure data consistency
const simulateAsync = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 100));
};

// --- Component API ---
export const getComponents = (): Promise<Component[]> => {
    const data = localStorage.getItem(COMPONENTS_KEY);
    return simulateAsync(data ? JSON.parse(data) : []);
};

export const addComponent = (componentData: Omit<Component, 'id' | 'createdAt'>): Promise<Component> => {
    const components = JSON.parse(localStorage.getItem(COMPONENTS_KEY) || '[]');
    const newComponent: Component = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isUnderMaintenance: false, // Ensure default values as they might be omitted in Omit type
        maintenanceLog: [],       // Ensure default values
        ...componentData,
    };
    components.unshift(newComponent); // Add to the beginning for latest first
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(components));
    return simulateAsync(newComponent);
};

export const addMultipleComponents = (componentsToAdd: Omit<Component, 'id' | 'createdAt'>[]): Promise<Component[]> => {
    const existingComponents = JSON.parse(localStorage.getItem(COMPONENTS_KEY) || '[]');
    const newComponents: Component[] = componentsToAdd.map(c => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isUnderMaintenance: false,
        maintenanceLog: [],
        ...c,
    }));
    const updatedComponents = [...newComponents, ...existingComponents];
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(updatedComponents));
    return simulateAsync(newComponents);
};

export const updateComponent = (componentData: Component): Promise<Component> => {
    let components = JSON.parse(localStorage.getItem(COMPONENTS_KEY) || '[]');
    components = components.map((c: Component) => (c.id === componentData.id ? componentData : c));
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(components));
    return simulateAsync(componentData);
};

export const deleteComponent = (id: string): Promise<void> => {
    let components = JSON.parse(localStorage.getItem(COMPONENTS_KEY) || '[]');
    components = components.filter((c: Component) => c.id !== id);
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(components));
    return simulateAsync(undefined);
};

export const clearAllComponents = (): Promise<void> => {
    localStorage.removeItem(COMPONENTS_KEY);
    return simulateAsync(undefined);
};

// --- Project API ---

export const getProjects = (): Promise<Project[]> => {
    const data = localStorage.getItem(PROJECTS_KEY);
    return simulateAsync(data ? JSON.parse(data) : []);
};

export const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    const newProject: Project = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...projectData,
    };
    projects.unshift(newProject); // Add to the beginning for latest first
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return simulateAsync(newProject);
};

export const updateProject = (projectData: Project): Promise<Project> => {
    let projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    projects = projects.map((p: Project) => (p.id === projectData.id ? projectData : p));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return simulateAsync(projectData);
};

export const deleteProject = (id: string): Promise<void> => {
    let projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    projects = projects.filter((p: Project) => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return simulateAsync(undefined);
};

export const clearAllProjects = (): Promise<void> => {
    localStorage.removeItem(PROJECTS_KEY);
    return simulateAsync(undefined);
};

// --- Analytics API ---
const initialAnalytics: AnalyticsData = { totalVisits: 0, uniqueVisitors: 0, successfulLogins: 0 };

export const getAnalyticsData = (): Promise<AnalyticsData> => {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return simulateAsync(data ? JSON.parse(data) : initialAnalytics);
};

const updateAnalytics = async (field: keyof AnalyticsData, increment: number) => {
    const analytics = await getAnalyticsData();
    const updatedAnalytics = { ...analytics, [field]: (analytics[field] || 0) + increment };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
    return simulateAsync(updatedAnalytics);
};

export const trackVisit = (): Promise<AnalyticsData> => updateAnalytics('totalVisits', 1);
export const trackLogin = (): Promise<AnalyticsData> => updateAnalytics('successfulLogins', 1);

export const resetAnalyticsData = (): Promise<AnalyticsData> => {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(initialAnalytics));
    return simulateAsync(initialAnalytics);
};

// --- Backup API ---
export const exportData = async (): Promise<BackupData> => {
    const components = await getComponents();
    const projects = await getProjects();
    const analytics = await getAnalyticsData();
    const customImages = customImageService.getCustomImageLibrary();

    return simulateAsync({ components, projects, analytics, customImageLibrary: customImages });
};

export const importData = async (data: BackupData): Promise<void> => {
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(data.components || []));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects || []));
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data.analytics || initialAnalytics));
    customImageService.saveCustomImageLibrary(data.customImageLibrary || {});
    return simulateAsync(undefined);
};
