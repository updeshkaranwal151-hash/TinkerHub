import { Component, IssueRecord } from '../types';

const STORAGE_KEY = 'atl-inventory-components';

// Helper to get all components from LocalStorage
const getComponentsFromStorage = (): Component[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Could not parse components from LocalStorage", error);
    return [];
  }
};

// Helper to save all components to LocalStorage
const saveComponentsToStorage = (components: Component[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
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

export const addComponent = (component: Omit<Component, 'id' | 'createdAt'>): Component => {
  const components = getComponentsFromStorage();
  const newComponent: Component = {
    ...component,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const updatedComponents = [newComponent, ...components];
  saveComponentsToStorage(updatedComponents);
  return newComponent;
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

export const issueComponent = (id: string, studentName: string): Component => {
    let components = getComponentsFromStorage();
    let updatedComponent: Component | undefined;

    const updatedComponents = components.map(c => {
        if (c.id === id) {
            const newIssue: IssueRecord = {
                id: crypto.randomUUID(),
                studentName,
                issuedDate: new Date().toISOString()
            };
            const updatedIssuedTo = [...c.issuedTo, newIssue];
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
    localStorage.removeItem(STORAGE_KEY);
};
