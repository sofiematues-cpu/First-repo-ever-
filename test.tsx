"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { authApi } from "@/lib/api";
import SkeletonLoading from "@/components/ui/loading/SkeletonLoading";

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
  // Trino fields
  job_title?: string;
  team_name?: string;
  country?: string;
  metier?: string;
  gbl?: string;
}

// Global user cache for instant access
let globalUserData: User | null = null;

export const setGlobalUser = (user: User | null) => {
  globalUserData = user;
};

export const getGlobalUser = (): User | null => {
  return globalUserData;
};

// Create AuthContext
const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
} | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Fetch user and Trino data in PARALLEL
        const [currentUser, trinoData] = await Promise.all([
          authApi.getCurrentUser(),
          authApi.getUserTrinoData().catch(() => ({ success: false }))
        ]);

        if(!currentUser){
          window.location.href = '/accounts/oidc/bnpp-oidc/login/';
          return;
        }
        
        // Merge Trino data into user object
        if(trinoData?.success && trinoData?.data){
          Object.assign(currentUser, trinoData.data);
        }
        
        // Set both context and global cache
        setUser(currentUser);
        setGlobalUser(currentUser);
        setLoading(false);
      } catch(error){
        console.log("Error, failed to auth user:", error);
        window.location.href = '/accounts/oidc/bnpp-oidc/login/';
      }
    }
    
    checkAuth();
  }, []);

  if(loading || !user){
    return <SkeletonLoading />;
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
-----------------------
"use client";

import {FiBell, FiUser} from "react-icons/fi";
import "./header.css";
import { useEffect, useState } from "react";
import { getGlobalUser } from "../../app/AuthProvider";

type HeaderProps = {
  title: string;
};

export default function Header({title}: HeaderProps){
  const [userName, setUserName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  
  useEffect(() => {
    // Get data from global cache - INSTANT, NO DELAY!
    const user = getGlobalUser();
    if(user) {
      setUserName(user.full_name || user.username || 'User');
      setTeamName(user.team_name || '');
    }
  }, []);

  return(
    <header className="header">
      <div className="header__left">
        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          <h2 className="header__subtitle">
            Welcome back {userName || 'User'}{teamName ? ` | ${teamName}` : ''}
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
-------------------
import React from 'react';
import './DotPulse.css';

interface DotPulseProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function DotPulse({ size = 'medium', color = '#00965e' }: DotPulseProps) {
  return (
    <div className={`dot-pulse-container dot-pulse-${size}`}>
      <div className="dot-pulse" style={{ backgroundColor: color }}></div>
    </div>
  );
}
_________________________
.dot-pulse-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dot-pulse {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #00965e;
  animation: dot-pulse-animation 1.4s infinite ease-in-out both;
}

.dot-pulse::before,
.dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #00965e;
  animation: dot-pulse-animation 1.4s infinite ease-in-out both;
}

.dot-pulse::before {
  left: -15px;
  animation-delay: -0.32s;
}

.dot-pulse::after {
  left: 15px;
  animation-delay: 0.16s;
}

@keyframes dot-pulse-animation {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Size variants */
.dot-pulse-small .dot-pulse,
.dot-pulse-small .dot-pulse::before,
.dot-pulse-small .dot-pulse::after {
  width: 6px;
  height: 6px;
}

.dot-pulse-small .dot-pulse::before {
  left: -10px;
}

.dot-pulse-small .dot-pulse::after {
  left: 10px;
}

.dot-pulse-large .dot-pulse,
.dot-pulse-large .dot-pulse::before,
.dot-pulse-large .dot-pulse::after {
  width: 14px;
  height: 14px;
}

.dot-pulse-large .dot-pulse::before {
  left: -20px;
}

.dot-pulse-large .dot-pulse::after {
  left: 20px;
}
______________________
import React from 'react';
import './DotFlashing.css';

interface DotFlashingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function DotFlashing({ size = 'medium', color = '#00965e' }: DotFlashingProps) {
  return (
    <div className={`dot-flashing-container dot-flashing-${size}`}>
      <div className="dot-flashing" style={{ backgroundColor: color }}></div>
      <div className="dot-flashing" style={{ backgroundColor: color, animationDelay: '0.2s' }}></div>
      <div className="dot-flashing" style={{ backgroundColor: color, animationDelay: '0.4s' }}></div>
    </div>
  );
}
__________________________
.dot-flashing-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dot-flashing {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #00965e;
  animation: dot-flashing-animation 1s infinite linear alternate;
}

@keyframes dot-flashing-animation {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}

/* Size variants */
.dot-flashing-small .dot-flashing {
  width: 6px;
  height: 6px;
}

.dot-flashing-large .dot-flashing {
  width: 14px;
  height: 14px;
}
-----------------------
import React from 'react';
import './SkeletonLoading.css';

export default function SkeletonLoading() {
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

        {/* Loading text with BNPP green dots */}
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
__________________
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
}
_____________________