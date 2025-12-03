// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA5MG3eNodor_jySREFoVRTr1xjPWegmXE",
    authDomain: "iotrix-2025.firebaseapp.com",
    projectId: "iotrix-2025",
    storageBucket: "iotrix-2025.firebasestorage.app",
    messagingSenderId: "453602753158",
    appId: "1:453602753158:web:1f9b6ff641560b9b686f07",
    measurementId: "G-RRN4Y00D4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;