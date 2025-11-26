import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUmVbuyPzLrsbgQtvKhvBmz1hP_zBEvls",
    authDomain: "tinkerhub-baefa.firebaseapp.com",
    projectId: "tinkerhub-baefa",
    storageBucket: "tinkerhub-baefa.firebasestorage.app",
    messagingSenderId: "521562582633",
    appId: "1:521562582633:web:dad4db0f02210da8d07cf8",
    measurementId: "G-9SKFHSFFMC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to improve connection stability.
// Forcing long polling and disabling fetch streams can prevent transport
// errors in environments with unstable WebSocket or streaming support.
initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);