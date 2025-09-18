'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileCompletionDetails, calculateProfileCompletion } from '@/lib/profile-completion';

export interface Profile {
  id: string;
  name: string;
  header: any;
  experience: any[];
  education: any[];
  skills: any;
  projects: any[];
  evidence: any[];
  created_at: string;
  updated_at: string;
}

export interface ProfileWithCompletion extends Profile {
  completion: ProfileCompletionDetails;
}

interface ProfileContextType {
  profiles: ProfileWithCompletion[];
  activeProfile: ProfileWithCompletion | null;
  isLoading: boolean;
  error: string | null;
  setActiveProfile: (profile: ProfileWithCompletion | null) => void;
  loadProfiles: () => Promise<void>;
  createProfile: (profileData: any) => Promise<Profile | null>;
  updateProfile: (id: string, profileData: any) => Promise<Profile | null>;
  deleteProfile: (id: string) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profiles, setProfiles] = useState<ProfileWithCompletion[]>([]);
  const [activeProfile, setActiveProfile] = useState<ProfileWithCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use authenticated user from AuthContext
  const { user, loading: authLoading } = useAuth();

  const loadProfiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Rely on auth cookie; do not send demo user ID in production
      const response = await fetch('/api/profiles', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load profiles');
      }
      
      const data = await response.json();
      const profilesWithCompletion = (data.profiles || []).map((profile: Profile) => ({
        ...profile,
        completion: calculateProfileCompletion(profile)
      }));
      
      setProfiles(profilesWithCompletion);
      
      // Set active profile if none is set and profiles exist
      if (!activeProfile && profilesWithCompletion.length > 0) {
        const savedActiveId = localStorage.getItem('activeProfileId');
        const savedProfile = savedActiveId ? 
          profilesWithCompletion.find((p: any) => p.id === savedActiveId) : null;
        
        setActiveProfile(savedProfile || profilesWithCompletion[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData: any): Promise<Profile | null> => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name || 'New Profile',
          profile_data: profileData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const result = await response.json();
      await loadProfiles(); // Reload all profiles
      return result.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return null;
    }
  };

  const updateProfile = async (id: string, profileData: any): Promise<Profile | null> => {
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name,
          profile_data: profileData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      await loadProfiles(); // Reload all profiles
      return result.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    }
  };

  const deleteProfile = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      // If deleting active profile, switch to another one
      if (activeProfile?.id === id) {
        const remainingProfiles = profiles.filter(p => p.id !== id);
        setActiveProfile(remainingProfiles.length > 0 ? remainingProfiles[0] : null);
      }

      await loadProfiles(); // Reload all profiles
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      return false;
    }
  };

  const handleSetActiveProfile = (profile: ProfileWithCompletion | null) => {
    setActiveProfile(profile);
    if (profile) {
      localStorage.setItem('activeProfileId', profile.id);
    } else {
      localStorage.removeItem('activeProfileId');
    }
  };

  useEffect(() => {
    // Load profiles once auth is ready (prevents first-call missing cookie)
    if (!authLoading) {
      loadProfiles();
    }
  }, [authLoading]);

  const value: ProfileContextType = {
    profiles,
    activeProfile,
    isLoading,
    error,
    setActiveProfile: handleSetActiveProfile,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}
