import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    Unsubscribe
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';

interface AuthState {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    unsubscribe: Unsubscribe | null;

    // Actions
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
    signOut: () => Promise<void>;
    initializeAuth: () => Unsubscribe;
    cleanup: () => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
    unsubscribe: null,

    signIn: async (email: string, password: string) => {
        try {
            set({ isLoading: true });
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                set({
                    user: userData,
                    firebaseUser: userCredential.user,
                    isAuthenticated: true
                });

                // Store user role for quick access
                await AsyncStorage.setItem('userRole', userData.role);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    signUp: async (email: string, password: string, name: string, role: UserRole) => {
        try {
            set({ isLoading: true });
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in Firestore
            const userData: User = {
                id: userCredential.user.uid,
                email,
                name,
                role,
                preferences: {
                    theme: 'system',
                    notifications: true,
                    autoPlay: false,
                    playbackSpeed: 1.0,
                    categories: []
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), userData);

            set({
                user: userData,
                firebaseUser: userCredential.user,
                isAuthenticated: true
            });

            // Store user role for quick access
            await AsyncStorage.setItem('userRole', role);
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            await AsyncStorage.removeItem('userRole');
            set({
                user: null,
                firebaseUser: null,
                isAuthenticated: false
            });
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },

    initializeAuth: () => {
        set({ isLoading: true });

        // Clean up previous subscription
        const { unsubscribe: currentUnsubscribe } = get();
        if (currentUnsubscribe) {
            currentUnsubscribe();
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        set({
                            user: userData,
                            firebaseUser,
                            isAuthenticated: true
                        });

                        // Store user role for quick access
                        await AsyncStorage.setItem('userRole', userData.role);
                    }
                } catch (error) {
                    console.error('Error getting user data:', error);
                }
            } else {
                set({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false
                });
                await AsyncStorage.removeItem('userRole');
            }
            set({ isLoading: false });
        });

        // Store unsubscribe function
        set({ unsubscribe });

        return unsubscribe;
    },

    cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    setUser: (user: User | null) => {
        set({ user });
    }
}));