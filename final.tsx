'use client';
import { useEffect, useState, createContext, useContext, useRef } from 'react';
import { authApi } from '@/lib/api';
import SkeletonLoading from '@/components/ui/loading/skeleton/skeletonLoading';
import AuthenticationLoading from '@/components/ui/loading/auth/authLoading';

interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    oidc_sub: string;
    oidc_provider: string;
    profile_picture: string;
    last_login: string;
    date_joined: string;
    job_title?: string;
    team_name?: string;
    country?: string;
    metier?: string;
    gbl?: string;
}

interface TrinoResponse {
    success: boolean;
    data?: {
        job_title: string;
        team_name: string;
        country: string;
        metier: string;
        gbl: string;
    };
    error?: string;
}

// ============================================
// CACHE CONFIGURATION
// ============================================
const USER_CACHE_KEY = 'qdi_user_cache';
const CACHE_EXPIRY_KEY = 'qdi_cache_expiry';
const AUTH_COMPLETE_KEY = 'qdi_auth_complete';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// ============================================
// GLOBAL IN-MEMORY CACHE (fastest)
// ============================================
let globalUserData: User | null = null;
let isAuthenticating = false;

export const setGlobalUser = (user: User | null) => {
    globalUserData = user;
};

export const getGlobalUser = (): User | null => {
    return globalUserData;
};

// ============================================
// LOCAL STORAGE CACHE FUNCTIONS
// ============================================
const getCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (expiry && Date.now() > parseInt(expiry)) {
            localStorage.removeItem(USER_CACHE_KEY);
            localStorage.removeItem(CACHE_EXPIRY_KEY);
            return null;
        }
        
        const cached = localStorage.getItem(USER_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

const setCachedUser = (user: User) => {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
    } catch {
        // Storage full or unavailable
    }
};

// ============================================
// CHECK IF USER HAS EVER AUTHENTICATED
// ============================================
const hasEverAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_COMPLETE_KEY) === 'true';
};

const setHasAuthenticated = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_COMPLETE_KEY, 'true');
};

// ============================================
// CONTEXT
// ============================================
const AuthContext = createContext<{
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
} | null>(null);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(globalUserData);
    const [loading, setLoading] = useState(!globalUserData);
    const [showAuthLoading, setShowAuthLoading] = useState(false);
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        // Prevent double-checking
        if (hasCheckedAuth.current) return;
        hasCheckedAuth.current = true;

        async function checkAuth() {
            // 1. If we have global user, we're done (instant)
            if (globalUserData) {
                setUser(globalUserData);
                setLoading(false);
                return;
            }

            // 2. Check localStorage cache (very fast)
            const cachedUser = getCachedUser();
            if (cachedUser) {
                setUser(cachedUser);
                setGlobalUser(cachedUser);
                setLoading(false);
                
                // Refresh in background silently
                refreshUserInBackground();
                return;
            }

            // 3. No cache - need to fetch from API
            // Only show AuthLoading if user has NEVER authenticated before
            if (!hasEverAuthenticated()) {
                setShowAuthLoading(true);
            }

            // Prevent multiple simultaneous auth calls
            if (isAuthenticating) {
                return;
            }
            isAuthenticating = true;

            try {
                const [currentUser, trinoResponse] = await Promise.all([
                    authApi.getCurrentUser(),
                    authApi.getUserTrinoData().catch((): TrinoResponse => ({
                        success: false,
                        error: 'Trino data unavailable'
                    }))
                ]);

                if (!currentUser) {
                    window.location.href = '/accounts/oidc/bnpp-oidc/login/';
                    return;
                }

                // Merge Trino data
                const trinoData = trinoResponse as TrinoResponse;
                if (trinoData.success && trinoData.data) {
                    currentUser.job_title = trinoData.data.job_title || '';
                    currentUser.team_name = trinoData.data.team_name || '';
                    currentUser.country = trinoData.data.country || '';
                    currentUser.metier = trinoData.data.metier || '';
                    currentUser.gbl = trinoData.data.gbl || '';
                }

                // Update all caches
                setUser(currentUser);
                setGlobalUser(currentUser);
                setCachedUser(currentUser);
                setHasAuthenticated();
                
                setLoading(false);
                setShowAuthLoading(false);
            } catch (error) {
                console.log('Authentication error:', error);
                window.location.href = '/accounts/oidc/bnpp-oidc/login/';
            } finally {
                isAuthenticating = false;
            }
        }

        // Background refresh - never blocks UI
        async function refreshUserInBackground() {
            try {
                const [currentUser, trinoResponse] = await Promise.all([
                    authApi.getCurrentUser(),
                    authApi.getUserTrinoData().catch((): TrinoResponse => ({
                        success: false,
                        error: 'Trino data unavailable'
                    }))
                ]);

                if (currentUser) {
                    const trinoData = trinoResponse as TrinoResponse;
                    if (trinoData.success && trinoData.data) {
                        currentUser.job_title = trinoData.data.job_title || '';
                        currentUser.team_name = trinoData.data.team_name || '';
                        currentUser.country = trinoData.data.country || '';
                        currentUser.metier = trinoData.data.metier || '';
                        currentUser.gbl = trinoData.data.gbl || '';
                    }
                    
                    setGlobalUser(currentUser);
                    setCachedUser(currentUser);
                    
                    // Only update if data changed
                    setUser(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(currentUser)) {
                            return currentUser;
                        }
                        return prev;
                    });
                }
            } catch {
                // Silent fail - user already has cached data
            }
        }

        checkAuth();
    }, []);

    // ============================================
    // RENDER LOGIC
    // ============================================
    
    // Show AuthLoading ONLY on first-ever authentication
    if (showAuthLoading && !user) {
        return <AuthenticationLoading />;
    }

    // Show Skeleton for all other loading states
    if (loading || !user) {
        return <SkeletonLoading showHeaderSidebar={true} />;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
