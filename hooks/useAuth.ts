import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export const useAuth = () => {
    const authStore = useAuthStore();

    // Não inicializa auth aqui para evitar loops
    // A inicialização fica no _layout.tsx

    return {
        user: authStore.user,
        firebaseUser: authStore.firebaseUser,
        isLoading: authStore.isLoading,
        isAuthenticated: authStore.isAuthenticated,
        signIn: authStore.signIn,
        signUp: authStore.signUp,
        signOut: authStore.signOut,
        initializeAuth: authStore.initializeAuth,
        cleanup: authStore.cleanup,
        isCreator: authStore.user?.role === 'creator',
        isListener: authStore.user?.role === 'listener',
    };
};

export const useUserRole = (): UserRole | null => {
    const { user } = useAuth();
    return user?.role || null;
};