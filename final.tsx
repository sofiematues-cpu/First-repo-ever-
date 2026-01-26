'use client';
import { useEffect, useState, createContext, useContext } from 'react';
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

// Cache keys
const USER_CACHE_KEY = 'qdi_user_cache';
const CACHE_EXPIRY_KEY = 'qdi_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get cached user
const getCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (expiry && Date.now() > parseInt(expiry)) {
            // Cache expired
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

// Set cached user
const setCachedUser = (user: User) => {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
    } catch {
        // Storage full or unavailable
    }
};

// Global user cache (in-memory for current session)
let globalUserData: User | null = null;

export const setGlobalUser = (user: User | null) => {
    globalUserData = user;
};

export const getGlobalUser = (): User | null => {
    return globalUserData;
};

const isFirstAuthentication = (): boolean => {
    if (typeof window === 'undefined') return true;
    const hasAuthSession = sessionStorage.getItem('qdi_auth_complete');
    return !hasAuthSession;
};

const AuthContext = createContext<{
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFirstAuth] = useState(isFirstAuthentication());

    useEffect(() => {
        async function checkAuth() {
            // 1. Check in-memory cache first (fastest)
            if (globalUserData) {
                setUser(globalUserData);
                setLoading(false);
                return;
            }

            // 2. Check localStorage cache (fast)
            const cachedUser = getCachedUser();
            if (cachedUser) {
                setUser(cachedUser);
                setGlobalUser(cachedUser);
                setLoading(false);
                
                // Refresh in background (don't wait)
                refreshUserInBackground();
                return;
            }

            // 3. No cache - fetch from API
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

                const trinoData = trinoResponse as TrinoResponse;
                if (trinoData.success && trinoData.data) {
                    currentUser.job_title = trinoData.data.job_title || '';
                    currentUser.team_name = trinoData.data.team_name || '';
                    currentUser.country = trinoData.data.country || '';
                    currentUser.metier = trinoData.data.metier || '';
                    currentUser.gbl = trinoData.data.gbl || '';
                }

                setUser(currentUser);
                setGlobalUser(currentUser);
                setCachedUser(currentUser);
                
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('qdi_auth_complete', 'true');
                }
                
                setLoading(false);
            } catch (error) {
                console.log('Authentication error:', error);
                window.location.href = '/accounts/oidc/bnpp-oidc/login/';
            }
        }

        // Background refresh function
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
                    
                    // Update caches silently
                    setGlobalUser(currentUser);
                    setCachedUser(currentUser);
                    
                    // Only update state if data changed
                    setUser(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(currentUser)) {
                            return currentUser;
                        }
                        return prev;
                    });
                }
            } catch {
                // Silent fail for background refresh
            }
        }

        checkAuth();
    }, []);

    if (loading || !user) {
        if (isFirstAuth) {
            return <AuthenticationLoading />;
        }
        return <SkeletonLoading showHeaderSidebar={true} />;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
