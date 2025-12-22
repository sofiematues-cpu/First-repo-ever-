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
            <p className="profile-role">{user.job_title || user.oidc_provider || "SSO User"}</p>
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

        {/* Work Information */}
        <div className="profile-card">
          <h3 className="profile-card-title">Work Information</h3>
          <div className="profile-info-list">
            <div className="profile-info-item">
              <FiBriefcase className="profile-icon" />
              <span className="profile-label">Job Title:</span>
              <span className="profile-value">
                {user.job_title || <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiUsers className="profile-icon" />
              <span className="profile-label">Team:</span>
              <span className="profile-value">
                {user.team_name || <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiMapPin className="profile-icon" />
              <span className="profile-label">Country:</span>
              <span className="profile-value">
                {user.country || <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiBriefcase className="profile-icon" />
              <span className="profile-label">Metier:</span>
              <span className="profile-value">
                {user.metier || <DotFlashing size="small" />}
              </span>
            </div>

            <div className="profile-info-item">
              <FiGlobe className="profile-icon" />
              <span className="profile-label">GBL:</span>
              <span className="profile-value">
                {user.gbl || <DotFlashing size="small" />}
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
