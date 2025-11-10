
import { Component, Project, BackupData, AnalyticsData } from '../types.ts';

const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            throw new Error(errorData.error || `An unknown server error occurred.`);
        }
        // Handle cases where there might not be a JSON body (e.g., 204 No Content)
        if (response.status === 204) {
            return null as T;
        }
        return response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

// --- Component API ---

export const getComponents = () => apiRequest<Component[]>('/api/components');

export const addComponent = (componentData: Omit<Component, 'id' | 'createdAt'>) =>
    apiRequest<Component>('/api/components', {
        method: 'POST',
        body: JSON.stringify(componentData),
    });
    
export const addMultipleComponents = (components: Omit<Component, 'id' | 'createdAt'>[]) =>
    apiRequest<Component[]>('/api/components/batch', {
        method: 'POST',
        body: JSON.stringify(components),
    });

export const updateComponent = (componentData: Component) =>
    apiRequest<Component>(`/api/components/${componentData.id}`, {
        method: 'PUT',
        body: JSON.stringify(componentData),
    });

export const deleteComponent = (id: string) =>
    apiRequest<void>(`/api/components/${id}`, { method: 'DELETE' });

export const clearAllComponents = () =>
    apiRequest<void>('/api/components', { method: 'DELETE' });

// --- Project API ---

export const getProjects = () => apiRequest<Project[]>('/api/projects');

export const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) =>
    apiRequest<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });

export const updateProject = (projectData: Project) =>
    apiRequest<Project>(`/api/projects/${projectData.id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });

export const deleteProject = (id: string) =>
    apiRequest<void>(`/api/projects/${id}`, { method: 'DELETE' });

export const clearAllProjects = () =>
    apiRequest<void>('/api/projects', { method: 'DELETE' });

// --- Analytics API ---
export const getAnalyticsData = () => apiRequest<AnalyticsData>('/api/analytics');
export const trackVisit = () => apiRequest('/api/analytics', { method: 'POST', body: JSON.stringify({ type: 'visit' }) });
export const trackLogin = () => apiRequest('/api/analytics', { method: 'POST', body: JSON.stringify({ type: 'login' }) });
export const resetAnalyticsData = () => apiRequest('/api/analytics', { method: 'DELETE' });


// --- Backup API ---
export const exportData = () => apiRequest<BackupData>('/api/backup');

export const importData = (data: BackupData) => apiRequest<void>('/api/backup', {
    method: 'POST',
    body: JSON.stringify(data),
});
