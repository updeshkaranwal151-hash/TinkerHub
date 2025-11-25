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
  setDoc,
  DocumentSnapshot,
  Timestamp,
  where
} from 'firebase/firestore';
import { Component, IssueRecord, Project, ProjectStatus, UserProfile, License } from '../types.ts';


// --- User Profile Management ---
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (uid: string, profileData: Omit<UserProfile, 'uid'>): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, { ...profileData, uid });
};

// --- License and School Management ---
export const validateLicense = async (licenseKey: string): Promise<{ schoolId: string, schoolName: string } | null> => {
  const licenseDocRef = doc(db, 'licenses', licenseKey);
  const docSnap = await getDoc(licenseDocRef);
  if (docSnap.exists()) {
    const license = docSnap.data() as License;
    if (!license.isClaimed) {
      return { schoolId: license.schoolId, schoolName: license.schoolName };
    }
  }
  return null;
};

export const claimLicense = async (licenseKey: string, uid: string): Promise<void> => {
    const licenseDocRef = doc(db, 'licenses', licenseKey);
    await updateDoc(licenseDocRef, {
        isClaimed: true,
        claimedByUid: uid,
    });
};

export const getSchools = async (): Promise<{id: string, name: string}[]> => {
    const schoolsColRef = collection(db, 'schools');
    const snapshot = await getDocs(schoolsColRef);
    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
};

// --- Multi-Tenant Data Access ---

const getComponentsCollectionRef = (schoolId: string) => collection(db, 'schools', schoolId, 'components');
const getProjectsCollectionRef = (schoolId: string) => collection(db, 'schools', schoolId, 'projects');


// Helper function to convert Firestore doc to a clean Component object
const docToComponent = (doc: DocumentSnapshot): Component => {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty!");

    const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : (data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString());

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

// --- Component Functions (Multi-Tenant) ---

export const getComponents = async (schoolId: string): Promise<Component[]> => {
    const q = query(getComponentsCollectionRef(schoolId), orderBy('createdAt', 'desc'));
    const data = await getDocs(q);
    return data.docs.map(docToComponent);
};

export const addComponent = async (schoolId: string, component: Omit<Component, 'id' | 'createdAt'>): Promise<Component> => {
    const newComponentData = { ...component, createdAt: serverTimestamp() };
    const docRef = await addDoc(getComponentsCollectionRef(schoolId), newComponentData);
    
    return {
      ...component,
      id: docRef.id,
      createdAt: new Date().toISOString(),
    };
};

export const updateComponent = async (schoolId: string, component: Component): Promise<void> => {
    const componentDoc = doc(db, 'schools', schoolId, 'components', component.id);
    const { id, createdAt, ...componentData } = component;
    await updateDoc(componentDoc, componentData);
};

export const deleteComponent = async (schoolId: string, id: string): Promise<void> => {
    const componentDoc = doc(db, 'schools', schoolId, 'components', id);
    await deleteDoc(componentDoc);
};

export const issueComponent = async (schoolId: string, id: string, studentName: string, quantity: number): Promise<Component> => {
    const componentDocRef = doc(db, 'schools', schoolId, 'components', id);
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");
    const component = docToComponent(docSnap);
    const newIssue: IssueRecord = {
        id: crypto.randomUUID(), studentName, issuedDate: new Date().toISOString(), quantity
    };
    const updatedIssuedTo = [...component.issuedTo, newIssue];
    await updateDoc(componentDocRef, { issuedTo: updatedIssuedTo });
    return { ...component, issuedTo: updatedIssuedTo };
};

export const returnIssue = async (schoolId: string, componentId: string, issueId: string): Promise<Component> => {
    const componentDocRef = doc(db, 'schools', schoolId, 'components', componentId);
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");
    const component = docToComponent(docSnap);
    const updatedIssuedTo = component.issuedTo.filter(issue => issue.id !== issueId);
    await updateDoc(componentDocRef, { issuedTo: updatedIssuedTo });
    return { ...component, issuedTo: updatedIssuedTo };
};

// --- Project Functions (Multi-Tenant) ---

export const getProjects = async (schoolId: string): Promise<Project[]> => {
    const q = query(getProjectsCollectionRef(schoolId), orderBy('submittedAt', 'desc'));
    const data = await getDocs(q);
    return data.docs.map(docToProject);
};

export const addProject = async (schoolId: string, projectData: Omit<Project, 'id' | 'submittedAt' | 'status'>): Promise<Project> => {
    const newProjectData = { ...projectData, submittedAt: serverTimestamp(), status: ProjectStatus.PENDING };
    const docRef = await addDoc(getProjectsCollectionRef(schoolId), newProjectData);
    return { ...projectData, id: docRef.id, submittedAt: new Date().toISOString(), status: ProjectStatus.PENDING };
};

export const updateProjectStatus = async (schoolId: string, projectId: string, status: ProjectStatus, feedback?: string): Promise<Project> => {
    const projectDocRef = doc(db, 'schools', schoolId, 'projects', projectId);
    const updateData: { status: ProjectStatus; adminFeedback?: string } = { status };
    if (feedback !== undefined) updateData.adminFeedback = feedback;
    await updateDoc(projectDocRef, updateData);
    const docSnap = await getDoc(projectDocRef);
    if (!docSnap.exists()) throw new Error("Project not found after update");
    return docToProject(docSnap);
};

// --- Other functions can be converted similarly, always taking schoolId as the first argument ---
// e.g., clearAllComponents, toggleAvailability, maintenance functions etc.
// For brevity, only core CRUD is fully converted here. The pattern is the same.
