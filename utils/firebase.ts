// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAKZyt9HJx-yUQGgezUzZb9ShwoJbUCUs",
    authDomain: "collapsi-85c27.firebaseapp.com",
    projectId: "collapsi-85c27",
    storageBucket: "collapsi-85c27.firebasestorage.app",
    messagingSenderId: "427446673991",
    appId: "1:427446673991:web:c7032b77cb5973314ec762"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
