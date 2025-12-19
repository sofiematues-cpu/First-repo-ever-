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
        // Fetch user and Trino data in PARALLEL for maximum speed
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
        
        // Merge Trino data into user object if available
        const trinoData = trinoResponse as TrinoResponse;
        if(trinoData.success && trinoData.data){
          currentUser.job_title = trinoData.data.job_title || '';
          currentUser.team_name = trinoData.data.team_name || '';
          currentUser.country = trinoData.data.country || '';
          currentUser.metier = trinoData.data.metier || '';
          currentUser.gbl = trinoData.data.gbl || '';
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
---------------
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
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Small delay to ensure global user is set
    const timer = setTimeout(() => {
      const user = getGlobalUser();
      if(user) {
        setUserName(user.full_name || user.username || '');
        setTeamName(user.team_name || '');
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return(
    <header className="header">
      <div className="header__left">
        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          <h2 className="header__subtitle">
            Welcome back{' '}
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <DotFlashing size="small" />
              </span>
            ) : (
              <>
                {userName || 'User'}
                {isLoading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}>
                    <DotFlashing size="small" />
                  </span>
                ) : (
                  teamName && ` | ${teamName}`
                )}
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
