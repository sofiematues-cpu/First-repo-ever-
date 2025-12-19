"use client";

import { useEffect, useState, createContext, useContext } from "react";
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

// Check if this is first authentication
const isFirstAuthentication = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  // Check session storage for previous auth
  const hasAuthSession = sessionStorage.getItem('qdi_auth_complete');
  return !hasAuthSession;
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
  const [isFirstAuth] = useState(isFirstAuthentication());

  useEffect(() => {
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
        
        // Set user
        setUser(currentUser);
        setGlobalUser(currentUser);
        
        // Mark auth as complete
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('qdi_auth_complete', 'true');
        }
        
        setLoading(false);
      } catch(error){
        console.log("Authentication error:", error);
        window.location.href = '/accounts/oidc/bnpp-oidc/login/';
      }
    }
    
    checkAuth();
  }, []);

  // Show loading based on auth state
  if(loading || !user){
    // First time login - show auth loading ONLY
    if(isFirstAuth) {
      return <AuthenticationLoading />;
    }
    
    // Subsequent loads - show skeleton with header/sidebar
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
-----------------
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
    let attempts = 0;
    const maxAttempts = 15;
    
    const checkUserData = () => {
      const user = getGlobalUser();
      
      if(user && user.full_name) {
        setUserName(user.full_name || user.username || '');
        setTeamName(user.team_name || '');
        setDataReady(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkUserData, 150);
      } else {
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
            {!dataReady || !userName ? (
              // Show ONLY dots while loading - NO "User" text
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <DotFlashing size="small" />
              </span>
            ) : (
              // Show actual data when ready
              <>
                Welcome back {userName}
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
import './SkeletonLoading.css';
import Header from '@/components/layout/header/header';
import Sidebar from '@/components/layout/sidebar/sidebar';

interface SkeletonLoadingProps {
  showHeaderSidebar?: boolean;
}

export default function SkeletonLoading({ showHeaderSidebar = false }: SkeletonLoadingProps) {
  if (showHeaderSidebar) {
    // Show actual header and sidebar with skeleton content area
    return (
      <div className="skeleton-with-layout">
        <Header title="Loading" />
        <div className="skeleton-layout-container">
          <Sidebar />
          <div className="skeleton-content-area">
            {/* Beautiful skeleton content */}
            <div className="skeleton-content-wrapper">
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
        </div>
      </div>
    );
  }

  // Original beautiful full-screen skeleton
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
_________________
/* Full-screen skeleton wrapper */
.skeleton-loading-wrapper {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  padding-top: 10vh;  /* Centered nicely */
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

/* Skeleton with actual header/sidebar layout */
.skeleton-with-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.skeleton-layout-container {
  display: flex;
  min-height: calc(100vh - 80px);
}

.skeleton-content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5vh;  /* Centered in content area */
}

.skeleton-content-wrapper {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

  .skeleton-loading-wrapper {
    padding-top: 5vh;
  }
}
-------------------