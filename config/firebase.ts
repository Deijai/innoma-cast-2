import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
    // @ts-ignore
    getReactNativePersistence, initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBY-v9wFx2f3hUTJlpnp3XEPZTzVWiFWTE",
    authDomain: "innoma-cast-b3a0e.firebaseapp.com",
    projectId: "innoma-cast-b3a0e",
    storageBucket: "innoma-cast-b3a0e.firebasestorage.app",
    messagingSenderId: "890188687460",
    appId: "1:890188687460:web:36663e98a6ab7618f29771",
    measurementId: "G-78SS57BBNW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;