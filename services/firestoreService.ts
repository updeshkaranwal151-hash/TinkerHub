import { db } from './firebase.ts';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { Component, IssueRecord, Project, ProjectStatus } from '../types.ts';

const componentsCollectionRef = collection(db, 'components');
const projectsCollectionRef = collection(db, 'projects');

// Helper function to convert Firestore doc to a clean Component object
const docToComponent = (doc: DocumentSnapshot): Component => {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty!");

    // Convert Firestore Timestamps to ISO strings to prevent circular structure errors
    const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : (data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString());

    // Sanitize the `issuedTo` array to ensure `issuedDate` is a string
    const issuedTo = (data.issuedTo || []).map((issue: any) => ({
        ...issue,
        issuedDate: issue.issuedDate instanceof Timestamp
            ? issue.issuedDate.toDate().toISOString()
            : issue.issuedDate
    }));

    return {
        id: doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
        totalQuantity: data.totalQuantity,
        issuedTo: issuedTo,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable,
        createdAt: createdAt,
        lowStockThreshold: data.lowStockThreshold,
        links: data.links || [],
        isUnderMaintenance: data.isUnderMaintenance || false,
        maintenanceLog: data.maintenanceLog || [],
    } as Component;
}

const docToProject = (doc: DocumentSnapshot): Project => {
    const data = doc.data();
    if (!data) throw new Error("Project document data is empty!");

    const submittedAt = data.submittedAt instanceof Timestamp 
        ? data.submittedAt.toDate().toISOString() 
        : (data.submittedAt ? new Date(data.submittedAt).toISOString() : new Date().toISOString());

    return {
        id: doc.id,
        submitterStudentName: data.submitterStudentName,
        projectName: data.projectName,
        projectType: data.projectType,
        teamName: data.teamName,
        teamEmail: data.teamEmail,
        teamMembers: data.teamMembers,
        mobileNumber: data.mobileNumber,
        features: data.features,
        description: data.description,
        prototypeDrawingUrl: data.prototypeDrawingUrl,
        requiredComponents: data.requiredComponents || [],
        status: data.status,
        submittedAt: submittedAt,
        adminFeedback: data.adminFeedback,
        timeline: data.timeline,
        budget: data.budget,
        techStack: data.techStack,
    } as Project;
}


export const getComponents = async (): Promise<Component[]> => {
    const q = query(componentsCollectionRef, orderBy('createdAt', 'desc'));
    const data = await getDocs(q);
    return data.docs.map(docToComponent);
};

export const addComponent = async (component: Omit<Component, 'id' | 'createdAt'>): Promise<Component> => {
    const newComponentData = { ...component, createdAt: serverTimestamp() };
    const docRef = await addDoc(componentsCollectionRef, newComponentData);
    
    return {
      ...component,
      id: docRef.id,
      createdAt: new Date().toISOString(),
    };
};

export const updateComponent = async (component: Component): Promise<void> => {
    const componentDoc = doc(db, 'components', component.id);
    const { id, createdAt, ...componentData } = component;
    await updateDoc(componentDoc, componentData);
};

export const deleteComponent = async (id: string): Promise<void> => {
    const componentDoc = doc(db, 'components', id);
    await deleteDoc(componentDoc);
};

export const clearAllComponents = async (): Promise<void> => {
    const q = query(componentsCollectionRef);
    const querySnapshot = await getDocs(q);
    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, 'components', docSnapshot.id)));
    });
    await Promise.all(deletePromises);
};


export const toggleAvailability = async (component: Component): Promise<Component> => {
    const componentDocRef = doc(db, 'components', component.id);
    const newAvailability = !component.isAvailable;
    await updateDoc(componentDocRef, { isAvailable: newAvailability });
    return { ...component, isAvailable: newAvailability };
}

export const issueComponent = async (id: string, studentName: string, quantity: number): Promise<Component> => {
    const componentDocRef = doc(db, 'components', id);
    
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");
    const component = docToComponent(docSnap);

    const newIssue: IssueRecord = {
        id: crypto.randomUUID(),
        studentName,
        issuedDate: new Date().toISOString(),
        quantity
    };
    
    const updatedIssuedTo = [...component.issuedTo, newIssue];
    await updateDoc(componentDocRef, { issuedTo: updatedIssuedTo });

    return { ...component, issuedTo: updatedIssuedTo };
};

export const returnIssue = async (componentId: string, issueId: string): Promise<Component> => {
    const componentDocRef = doc(db, 'components', componentId);

    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");
    const component = docToComponent(docSnap);

    const updatedIssuedTo = component.issuedTo.filter(issue => issue.id !== issueId);
    await updateDoc(componentDocRef, { issuedTo: updatedIssuedTo });

    return { ...component, issuedTo: updatedIssuedTo };
};

// --- Project Functions ---

export const getProjects = async (): Promise<Project[]> => {
    const q = query(projectsCollectionRef, orderBy('submittedAt', 'desc'));
    const data = await getDocs(q);
    return data.docs.map(docToProject);
};

export const addProject = async (projectData: Omit<Project, 'id' | 'submittedAt' | 'status'>): Promise<Project> => {
    const newProjectData = { 
        ...projectData, 
        submittedAt: serverTimestamp(),
        status: ProjectStatus.PENDING,
    };
    const docRef = await addDoc(projectsCollectionRef, newProjectData);
    
    return {
      ...projectData,
      id: docRef.id,
      submittedAt: new Date().toISOString(), // client timestamp for immediate UI update
      status: ProjectStatus.PENDING,
    };
};

export const updateProjectStatus = async (projectId: string, status: ProjectStatus, feedback?: string): Promise<Project> => {
    const projectDocRef = doc(db, 'projects', projectId);
    
    const updateData: { status: ProjectStatus; adminFeedback?: string } = { status };
    if (feedback !== undefined) {
      updateData.adminFeedback = feedback;
    }

    await updateDoc(projectDocRef, updateData);

    const docSnap = await getDoc(projectDocRef);
    if (!docSnap.exists()) throw new Error("Project not found after update");
    return docToProject(docSnap);
};

// --- Maintenance Functions ---
export const toggleMaintenanceStatus = async (componentId: string): Promise<Component> => {
    const componentDocRef = doc(db, 'components', componentId);
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");
    
    const component = docToComponent(docSnap);
    const newStatus = !component.isUnderMaintenance;
    await updateDoc(componentDocRef, { isUnderMaintenance: newStatus });
    
    return { ...component, isUnderMaintenance: newStatus };
};

export const addMaintenanceLog = async (componentId: string, notes: string): Promise<Component> => {
    const componentDocRef = doc(db, 'components', componentId);
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");

    const component = docToComponent(docSnap);
    const newLog = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        notes,
    };
    
    const updatedLog = [newLog, ...(component.maintenanceLog || [])];
    await updateDoc(componentDocRef, { maintenanceLog: updatedLog });

    return { ...component, maintenanceLog: updatedLog };
};

export const deleteMaintenanceLog = async (componentId: string, logId: string): Promise<Component> => {
    const componentDocRef = doc(db, 'components', componentId);
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");

    const component = docToComponent(docSnap);
    const updatedLog = (component.maintenanceLog || []).filter(log => log.id !== logId);
    await updateDoc(componentDocRef, { maintenanceLog: updatedLog });

    return { ...component, maintenanceLog: updatedLog };
};
