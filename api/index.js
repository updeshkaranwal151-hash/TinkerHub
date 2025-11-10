
// This is a serverless function that acts as the backend for the TinkerHub app.
// It assumes a Cloudflare Workers or similar environment where `firebase-admin` is available
// and environment variables for Firebase credentials and Gemini API key are configured.

// In a real environment, you would use a bundler to include these dependencies.
// For this context, we assume they are globally available or polyfilled.
import { GoogleGenAI, Type }from "@google/genai";
import * as admin from 'firebase-admin';

// --- Firebase Admin Initialization ---
// This should only run once. The check prevents re-initialization on hot reloads.
// In a real serverless environment, you'd provide service account credentials via secrets.
if (!admin.apps.length) {
  try {
    // In a production environment (e.g., Google Cloud Functions, Cloudflare Workers with secrets):
    // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    
    // For local dev or environments without direct service account JSON:
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}
const db = admin.firestore();

// --- Helper Functions ---
const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const errorResponse = (message, status = 500) => jsonResponse({ error: message }, status);

// --- API Route Handlers ---

const handleGemini = async (request, env) => {
    const apiKey = env.API_KEY; // Assumes API_KEY is stored as a secret in the worker environment
    if (!apiKey) {
      return errorResponse('The API_KEY secret is not configured.', 500);
    }
    const ai = new GoogleGenAI({ apiKey });
    const { type, prompt, context, mode, imageBase64, imageMimeType } = await request.json();

    try {
        if (type === 'assistant') {
            const model = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
            let contents;
            if (imageBase64 && imageMimeType) {
                contents = {
                    parts: [
                        { text: `Context:\n${context}\n\nQuestion:\n${prompt}` },
                        { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
                    ]
                };
            } else {
                contents = `Context:\n${context}\n\nQuestion:\n${prompt}`;
            }

            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: "You are a helpful lab assistant for an Atal Tinkering Lab. Your name is Tinker. Provide concise, helpful, and safe advice. You have access to the current inventory context. Use it to answer questions accurately. If asked for code, provide it in a markdown block.",
                }
            });
            return jsonResponse({ result: response.text });

        } else if (type === 'analyzeAndCount') {
            if (!imageBase64 || !imageMimeType) {
                return errorResponse('Image data is required for analysis.', 400);
            }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: {
                    parts: [
                        { text: "Analyze the image to identify all electronic components. For each distinct component type, provide its name, a brief description, count, and suggest a category. Return a JSON array of objects." },
                        { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                category: {
                                    type: Type.STRING,
                                    enum: ['Microcontroller', 'Sensor', 'Motor', 'Display', 'Power Supply', 'General Component']
                                }
                            }
                        }
                    }
                }
            });
            const parsed = JSON.parse(response.text.trim());
            return jsonResponse({ result: parsed });
        } else {
            return errorResponse('Invalid Gemini request type', 400);
        }
    } catch (e) {
        console.error("Gemini API Error:", e);
        return errorResponse('Failed to get a response from the AI assistant.', 500);
    }
};

const handleBackup = async (request) => {
    if (request.method === 'GET') { // Export
        const [componentsSnap, projectsSnap, analyticsSnap] = await Promise.all([
            db.collection('components').get(),
            db.collection('projects').get(),
            db.collection('analytics').doc('summary').get()
        ]);
        const data = {
            components: componentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            projects: projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            analytics: analyticsSnap.exists ? analyticsSnap.data() : { totalVisits: 0, uniqueVisitors: 0, successfulLogins: 0 },
            // Custom image library is not stored in Firestore in this design, so it's omitted.
        };
        return jsonResponse(data);
    } else if (request.method === 'POST') { // Import
        const { components, projects, analytics } = await request.json();
        const batch = db.batch();

        // Clear existing data
        const oldComponents = await db.collection('components').get();
        oldComponents.forEach(doc => batch.delete(doc.ref));
        const oldProjects = await db.collection('projects').get();
        oldProjects.forEach(doc => batch.delete(doc.ref));

        // Add new data
        components.forEach(c => {
            const docRef = db.collection('components').doc(c.id);
            batch.set(docRef, c);
        });
        projects.forEach(p => {
            const docRef = db.collection('projects').doc(p.id);
            batch.set(docRef, p);
        });
        if (analytics) {
            batch.set(db.collection('analytics').doc('summary'), analytics);
        }
        await batch.commit();
        return jsonResponse({ message: 'Data imported successfully' });
    }
    return errorResponse('Method Not Allowed', 405);
};

const handleAnalytics = async (request) => {
    const { type } = await request.json();
    const analyticsRef = db.collection('analytics').doc('summary');

    if (type === 'visit') {
        await analyticsRef.set({
            totalVisits: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
        return jsonResponse({ success: true });
    } else if (type === 'login') {
         await analyticsRef.set({
            successfulLogins: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
        return jsonResponse({ success: true });
    }
    return errorResponse('Invalid analytics type', 400);
}

// --- Main Router ---
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    try {
        // Simple prefix-based routing
        if (path.startsWith('/api/gemini')) {
            return await handleGemini(request, env);
        }
        if (path.startsWith('/api/backup')) {
            return await handleBackup(request);
        }
         if (path.startsWith('/api/analytics')) {
            return await handleAnalytics(request);
        }
        if (path.startsWith('/api/components') || path.startsWith('/api/projects')) {
            const collectionName = path.split('/')[2];
            const id = path.split('/')[3];
            const collectionRef = db.collection(collectionName);
            
            switch (request.method) {
                case 'GET': {
                    const snapshot = await collectionRef.orderBy('createdAt', 'desc').get();
                    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    return jsonResponse(items);
                }
                case 'POST': {
                    const body = await request.json();
                    const docRef = await collectionRef.add({ ...body, createdAt: new Date().toISOString() });
                    return jsonResponse({ id: docRef.id, ...body, createdAt: new Date().toISOString() }, 201);
                }
                case 'PUT': {
                    if (!id) return errorResponse('Missing ID for update', 400);
                    const body = await request.json();
                    delete body.id; // Don't store id in the document body
                    await collectionRef.doc(id).update(body);
                    return jsonResponse({ id, ...body });
                }
                case 'DELETE': {
                    if (!id) { // Clear all
                        const snapshot = await collectionRef.get();
                        const batch = db.batch();
                        snapshot.docs.forEach(doc => batch.delete(doc.ref));
                        await batch.commit();
                        return jsonResponse({ message: `All ${collectionName} cleared.` });
                    }
                    await collectionRef.doc(id).delete();
                    return jsonResponse({ message: 'Deleted successfully' });
                }
                default:
                    return errorResponse('Method not allowed', 405);
            }
        }
        
        return errorResponse('Not Found', 404);

    } catch (e) {
        console.error('API Error:', e);
        return errorResponse('An internal server error occurred', 500);
    }
}
