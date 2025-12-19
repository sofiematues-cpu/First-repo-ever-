"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiUser, FiGlobe, FiBriefcase, FiUsers, FiMapPin, FiSun, FiMoon } from "react-icons/fi";
import { Header } from "@/components/layout/header";
import { authApi } from "@/lib/api";
import { getGlobalUser } from "../../app/AuthProvider";
import type { User, ProfileSettings, MyProfileProps } from "./my-profile.types";
import "@/tailwind/components/my-profile/my-profile.css";
import DotFlashing from "@/components/ui/loading/DotFlashing";

export function MyProfile({ className = "" }: MyProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ProfileSettings>({
    pushNotifications: false,
    darkMode: false,
    language: "English",
  });

  // Fetch user data from global cache (instant!) or fallback to API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try global cache first (instant!)
        const cachedUser = getGlobalUser();
        if(cachedUser) {
          setUser(cachedUser);
          setLoading(false);
          return;
        }

        // Fallback: Fetch from API if cache not available
        const [userData, trinoData] = await Promise.all([
          authApi.getCurrentUser(),
          authApi.getUserTrinoData().catch(() => ({ success: false }))
        ]);
        
        if (userData) {
          // Merge Trino data
          if(trinoData.success && trinoData.data){
            userData.job_title = trinoData.data.job_title;
            userData.team_name = trinoData.data.team_name;
            userData.country = trinoData.data.country;
            userData.metier = trinoData.data.metier;
            userData.gbl = trinoData.data.gbl;
          }
          setUser(userData);
        } else {
          router.push('/');
        }
      } catch (err) {
        setIsError('Failed to load user data');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      const isDark = savedDarkMode === "true";
      setSettings(prev => ({ ...prev, darkMode: isDark }));
      document.documentElement.classList.toggle("dark-mode", isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    setSettings(prev => ({ ...prev, darkMode: newDarkMode }));
    document.documentElement.classList.toggle("dark-mode", newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="My Profile" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header title="My Profile" />
        <div className="bg-red-50 border-l-4 border-red-300 rounded-lg p-6 m-8">
          <p className="text-red-800">{isError || "User not found"}</p>
          <a href="/" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Go to login
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="My Profile" />
      <div className={`profile-page ${className}`}>
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-img bg-primary-300 flex items-center justify-center text-white text-4xl font-bold">
                  {user.first_name?.[0] || user.email[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.full_name}</h2>
            <p className="profile-role">{user.oidc_provider || "SSO User"}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="profile-card">
          <h3 className="profile-card-title">Account Details</h3>
          <div className="profile-info-list">
            <div className="profile-info-item">
              <FiMail className="profile-icon" />
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.email}</span>
            </div>
            
            <div className="profile-info-item">
              <FiUser className="profile-icon" />
              <span className="profile-label">Username:</span>
              <span className="profile-value">{user.username}</span>
            </div>
            
            <div className="profile-info-item">
              <FiGlobe className="profile-icon" />
              <span className="profile-label">OIDC Provider:</span>
              <span className="profile-value">{user.oidc_provider || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Work Information - WITH DOT LOADING */}
        <div className="profile-card">
          <h3 className="profile-card-title">Work Information</h3>
          <div className="profile-info-list">
            <div className="profile-info-item">
              <FiBriefcase className="profile-icon" />
              <span className="profile-label">Job Title:</span>
              <span className="profile-value">
                {user.job_title ? user.job_title : <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiUsers className="profile-icon" />
              <span className="profile-label">Team:</span>
              <span className="profile-value">
                {user.team_name ? user.team_name : <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiMapPin className="profile-icon" />
              <span className="profile-label">Country:</span>
              <span className="profile-value">
                {user.country ? user.country : <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiBriefcase className="profile-icon" />
              <span className="profile-label">Metier:</span>
              <span className="profile-value">
                {user.metier ? user.metier : <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiGlobe className="profile-icon" />
              <span className="profile-label">GBL:</span>
              <span className="profile-value">
                {user.gbl ? user.gbl : <DotFlashing size="small" />}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="profile-card">
          <h3 className="profile-card-title">Preferences</h3>
          <div className="profile-setting-list">
            <div className="profile-setting-item">
              <div className="profile-setting-info">
                {settings.darkMode ? <FiMoon className="profile-icon" /> : <FiSun className="profile-icon" />}
                <span className="profile-label">Dark Mode</span>
              </div>
              <button 
                onClick={toggleDarkMode} 
                className={`profile-toggle ${settings.darkMode ? "profile-toggle-active" : ""}`}
              >
                <span className="profile-toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="profile-logout-button">
          Logout
        </button>
      </div>
    </>
  );
}

export default MyProfile;
--------------
"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import SkeletonLoading from "@/components/ui/loading/SkeletonLoading";
import AuthenticationLoading from "@/components/ui/loading/AuthenticationLoading";

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

// Global user cache
let globalUserData: User | null = null;

export const setGlobalUser = (user: User | null) => {
  globalUserData = user;
};

export const getGlobalUser = (): User | null => {
  return globalUserData;
};

// Session storage key for authentication state
const AUTH_SESSION_KEY = 'qdi_portal_auth_initialized';

// Check if this is first authentication (real backend logic)
const isFirstAuthentication = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  // Check if user has an active session cookie/token
  const hasSession = document.cookie.includes('sessionid') || 
                     document.cookie.includes('csrftoken') ||
                     sessionStorage.getItem(AUTH_SESSION_KEY) !== null;
  
  return !hasSession;
};

// Mark authentication as complete
const markAuthenticationComplete = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
  }
};

const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
} | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstAuth, setIsFirstAuth] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Determine if this is first authentication
    const firstAuth = isFirstAuthentication();
    setIsFirstAuth(firstAuth);

    async function checkAuth() {
      try {
        // Fetch user and Trino data in parallel
        const [currentUser, trinoResponse] = await Promise.all([
          authApi.getCurrentUser(),
          authApi.getUserTrinoData().catch((): TrinoResponse => ({ 
            success: false, 
            error: 'Trino data unavailable' 
          }))
        ]);

        if(!currentUser){
          window.location.href = '/accounts/oidc/bnpp-oidc/login/';
          return;
        }
        
        // Merge Trino data
        const trinoData = trinoResponse as TrinoResponse;
        if(trinoData.success && trinoData.data){
          currentUser.job_title = trinoData.data.job_title || '';
          currentUser.team_name = trinoData.data.team_name || '';
          currentUser.country = trinoData.data.country || '';
          currentUser.metier = trinoData.data.metier || '';
          currentUser.gbl = trinoData.data.gbl || '';
        }
        
        // Set user in context and global cache
        setUser(currentUser);
        setGlobalUser(currentUser);
        
        // Mark auth as complete
        markAuthenticationComplete();
        setLoading(false);
      } catch(error){
        console.log("Authentication error:", error);
        window.location.href = '/accounts/oidc/bnpp-oidc/login/';
      }
    }
    
    checkAuth();
  }, []);

  if(loading || !user){
    // Show auth loading ONLY on first authentication
    if(isFirstAuth) {
      return <AuthenticationLoading />;
    }
    
    // Show skeleton with header/sidebar for subsequent loads
    return <SkeletonLoading showHeaderSidebar={true} />;
  }

  return(
    <AuthContext.Provider value={{user, setUser, loading, setLoading}}>
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
_____________________
import React from 'react';
import './SkeletonLoading.css';
import Header from '@/components/layout/header/header';
import Sidebar from '@/components/layout/sidebar/sidebar';

interface SkeletonLoadingProps {
  showHeaderSidebar?: boolean;
}

export default function SkeletonLoading({ showHeaderSidebar = false }: SkeletonLoadingProps) {
  if (showHeaderSidebar) {
    // Show actual header and sidebar with skeleton content
    return (
      <div className="skeleton-with-layout">
        <Header title="Loading..." />
        <div className="skeleton-layout-container">
          <Sidebar />
          <div className="skeleton-content-area">
            <div className="skeleton-content-loading">
              {/* Content skeleton cards */}
              <div className="skeleton-card">
                <div className="skeleton-box skeleton-card-title"></div>
                <div className="skeleton-box skeleton-card-line"></div>
                <div className="skeleton-box skeleton-card-line"></div>
                <div className="skeleton-box skeleton-card-line short"></div>
              </div>
              
              <div className="skeleton-card">
                <div className="skeleton-box skeleton-card-title"></div>
                <div className="skeleton-box skeleton-card-line"></div>
                <div className="skeleton-box skeleton-card-line"></div>
              </div>

              <div className="skeleton-card">
                <div className="skeleton-box skeleton-card-title"></div>
                <div className="skeleton-box skeleton-card-line"></div>
                <div className="skeleton-box skeleton-card-line"></div>
                <div className="skeleton-box skeleton-card-line short"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original full-screen skeleton (for first load scenarios)
  return (
    <div className="skeleton-loading-wrapper">
      <div className="skeleton-loading-container">
        {/* Header Skeleton */}
        <div className="skeleton-header">
          <div className="skeleton-box skeleton-title"></div>
          <div className="skeleton-box skeleton-subtitle"></div>
        </div>

        {/* Main Content Skeleton */}
        <div className="skeleton-content">
          <div className="skeleton-sidebar">
            <div className="skeleton-box skeleton-menu-item"></div>
            <div className="skeleton-box skeleton-menu-item"></div>
            <div className="skeleton-box skeleton-menu-item"></div>
            <div className="skeleton-box skeleton-menu-item"></div>
          </div>
          
          <div className="skeleton-main">
            <div className="skeleton-card">
              <div className="skeleton-box skeleton-card-title"></div>
              <div className="skeleton-box skeleton-card-line"></div>
              <div className="skeleton-box skeleton-card-line"></div>
              <div className="skeleton-box skeleton-card-line short"></div>
            </div>
            
            <div className="skeleton-card">
              <div className="skeleton-box skeleton-card-title"></div>
              <div className="skeleton-box skeleton-card-line"></div>
              <div className="skeleton-box skeleton-card-line"></div>
            </div>
          </div>
        </div>

        {/* Loading text with dots */}
        <div className="skeleton-loading-text">
          <span>Loading your workspace</span>
          <div className="skeleton-dots">
            <div className="skeleton-dot"></div>
            <div className="skeleton-dot"></div>
            <div className="skeleton-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
___________________
/* Original full-screen skeleton */
.skeleton-loading-wrapper {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.skeleton-loading-container {
  width: 90%;
  max-width: 1200px;
  padding: 40px;
}

.skeleton-box {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-header {
  margin-bottom: 40px;
}

.skeleton-title {
  height: 48px;
  width: 300px;
  margin-bottom: 16px;
}

.skeleton-subtitle {
  height: 24px;
  width: 500px;
}

.skeleton-content {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
}

.skeleton-sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-menu-item {
  height: 48px;
  width: 100%;
}

.skeleton-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skeleton-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-card-title {
  height: 28px;
  width: 200px;
  margin-bottom: 16px;
}

.skeleton-card-line {
  height: 16px;
  width: 100%;
  margin-bottom: 12px;
}

.skeleton-card-line.short {
  width: 60%;
}

.skeleton-loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin-top: 40px;
}

.skeleton-dots {
  display: flex;
  gap: 6px;
}

.skeleton-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00965e;
  animation: skeleton-dot-bounce 1.4s infinite ease-in-out both;
}

.skeleton-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.skeleton-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes skeleton-dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* NEW: Skeleton with actual header/sidebar layout */
.skeleton-with-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.skeleton-layout-container {
  display: flex;
  min-height: calc(100vh - 80px); /* Adjust based on your header height */
}

.skeleton-content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.skeleton-content-loading {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-content {
    flex-direction: column;
  }
  
  .skeleton-sidebar {
    width: 100%;
  }
  
  .skeleton-subtitle {
    width: 100%;
  }

  .skeleton-layout-container {
    flex-direction: column;
  }
}
_______________
"use client";

import {FiBell, FiUser} from "react-icons/fi";
import "./header.css";
import { useEffect, useState } from "react";
import { getGlobalUser } from "../../app/AuthProvider";
import DotFlashing from "@/components/ui/loading/DotFlashing";

type HeaderProps = {
  title: string;
};

export default function Header({title}: HeaderProps){
  const [userName, setUserName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [dataReady, setDataReady] = useState(false);
  
  useEffect(() => {
    // Check for user data with retries
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkUserData = () => {
      const user = getGlobalUser();
      
      if(user) {
        setUserName(user.full_name || user.username || '');
        setTeamName(user.team_name || '');
        setDataReady(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkUserData, 200);
      } else {
        // After max attempts, stop loading dots
        setDataReady(true);
      }
    };

    checkUserData();
  }, []);

  return(
    <header className="header">
      <div className="header__left">
        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          <h2 className="header__subtitle">
            {!dataReady ? (
              // Show dots while loading
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <DotFlashing size="small" />
              </span>
            ) : (
              // Show actual data
              <>
                Welcome back {userName || 'User'}
                {teamName && ` | ${teamName}`}
              </>
            )}
          </h2>
        </div>
      </div>

      <div className="header__center">
        <input type="text" placeholder="Search dashboards, products, clients..." className="header__search" />
      </div>

      <div className="header__right">
        <a href="/my-profile"><FiBell className="header__icon"/></a>
        <a href="/my-profile"><FiUser className="header__icon"/></a>
      </div>
    </header>
  );
}
___________________
import React from 'react';
import './AuthenticationLoading.css';

export default function AuthenticationLoading() {
  return (
    <div className="auth-loading-wrapper">
      <div className="auth-loading-container">
        <div className="auth-loading-logo">
          <div className="auth-loading-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#00965e" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 4" className="auth-loading-circle"/>
            </svg>
          </div>
        </div>
        
        <h2 className="auth-loading-title">QDI Portal</h2>
        <p className="auth-loading-text">Authenticating your session</p>
        
        <div className="auth-loading-dots">
          <div className="auth-dot"></div>
          <div className="auth-dot"></div>
          <div className="auth-dot"></div>
        </div>
      </div>
    </div>
  );
}
___________________