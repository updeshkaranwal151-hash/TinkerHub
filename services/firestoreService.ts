import { db } from './firebase';
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
import { Component, IssueRecord } from '../types';

const componentsCollectionRef = collection(db, 'components');

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
    } as Component;
}

export const getComponents = async (): Promise<Component[]> => {
    const q = query(componentsCollectionRef, orderBy('createdAt', 'desc'));
    const data = await getDocs(q);
    return data.docs.map(docToComponent);
};

export const addComponent = async (component: Omit<Component, 'id' | 'createdAt'>): Promise<Component> => {
    const newComponentData = { ...component, createdAt: serverTimestamp() };
    const docRef = await addDoc(componentsCollectionRef, newComponentData);
    
    // To fix the circular dependency error and improve performance,
    // construct the component object on the client-side instead of re-fetching.
    // The server timestamp will be available on the next full refresh.
    return {
      ...component,
      id: docRef.id,
      createdAt: new Date().toISOString(), // Use client timestamp for immediate UI update
    };
};

export const updateComponent = async (component: Component): Promise<void> => {
    const componentDoc = doc(db, 'components', component.id);
    // Exclude id and createdAt from the update payload to avoid overwriting them
    const { id, createdAt, ...componentData } = component;
    await updateDoc(componentDoc, componentData);
};

export const deleteComponent = async (id: string): Promise<void> => {
    const componentDoc = doc(db, 'components', id);
    await deleteDoc(componentDoc);
};

export const toggleAvailability = async (component: Component): Promise<Component> => {
    const componentDocRef = doc(db, 'components', component.id);
    const newAvailability = !component.isAvailable;
    await updateDoc(componentDocRef, { isAvailable: newAvailability });
    return { ...component, isAvailable: newAvailability };
}

export const issueComponent = async (id: string, studentName: string): Promise<Component> => {
    const componentDocRef = doc(db, 'components', id);
    
    const docSnap = await getDoc(componentDocRef);
    if (!docSnap.exists()) throw new Error("Component not found");
    const component = docToComponent(docSnap);

    const newIssue: IssueRecord = {
        id: crypto.randomUUID(),
        studentName,
        issuedDate: new Date().toISOString()
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