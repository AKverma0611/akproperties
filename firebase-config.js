// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBRjzA-PE8RmFC7h8c_hwZYOyQegkTU_Nw",
    authDomain: "akproperties-a8131.firebaseapp.com",
    projectId: "akproperties-a8131",
    storageBucket: "akproperties-a8131.firebasestorage.app",
    messagingSenderId: "909248274958",
    appId: "1:909248274958:web:a57985b9b6c967ecbc925f",
    measurementId: "G-698D82HR9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
