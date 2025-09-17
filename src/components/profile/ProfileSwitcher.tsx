'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/contexts/ProfileContext';
import { getCompletionColor, getCompletionBgColor } from '@/lib/profile-completion';
import { 
  User, 
  Plus, 
  Check, 
  Settings, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface ProfileSwitcherProps {
  onProfileSelect?: () => void;
  showManageButton?: boolean;
}

export default function ProfileSwitcher({ onProfileSelect, showManageButton = true }: ProfileSwitcherProps) {
  const { profiles, activeProfile, setActiveProfile, isLoading } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const maxProfiles = 5;
  const canAddMore = profiles.length < maxProfiles;

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile);
    setIsOpen(false);
    onProfileSelect?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
        <div className="animate-pulse bg-gray-200 rounded w-24 h-4"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Active Profile Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            activeProfile ? getCompletionBgColor(activeProfile.completion.percentage) : 'bg-gray-100'
          }`}>
            <User className="w-5 h-5 text-gray-600" />
          </div>
          {activeProfile && (
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              activeProfile.completion.percentage >= 85 
                ? 'bg-green-500 text-white' 
                : activeProfile.completion.percentage >= 60
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {activeProfile.completion.percentage}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900">
            {activeProfile?.name || 'No Profile Selected'}
          </div>
          {activeProfile && (
            <div className={`text-sm ${getCompletionColor(activeProfile.completion.percentage)}`}>
              {activeProfile.completion.percentage}% complete
            </div>
          )}
        </div>
        
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">Select Profile</h3>
            <p className="text-sm text-gray-500">
              {profiles.length} of {maxProfiles} profiles
            </p>
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      getCompletionBgColor(profile.completion.percentage)
                    }`}>
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      profile.completion.percentage >= 85 
                        ? 'bg-green-500 text-white' 
                        : profile.completion.percentage >= 60
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {profile.completion.percentage}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">
                        {profile.name}
                      </span>
                      {activeProfile?.id === profile.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {profile.header?.name || 'Unnamed Profile'}
                    </div>
                    <div className={`text-sm ${getCompletionColor(profile.completion.percentage)}`}>
                      {profile.completion.percentage}% complete
                      {profile.completion.missingFields.length > 0 && (
                        <span className="text-gray-500 ml-1">
                          • Missing: {profile.completion.missingFields.slice(0, 2).join(', ')}
                          {profile.completion.missingFields.length > 2 && ' +more'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <Link 
                      href={`/profile/${profile.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </Link>
                  </div>
                </div>
              </button>
            ))}

            {/* Add New Profile Button */}
            {canAddMore && (
              <Link href="/import">
                <button
                  className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-gray-600 group-hover:text-blue-600 font-medium">
                      Add New Profile
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {maxProfiles - profiles.length} slots remaining
                  </p>
                </button>
              </Link>
            )}

            {!canAddMore && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
                <AlertCircle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Maximum profiles reached</p>
                <p className="text-xs text-gray-500">Delete a profile to add a new one</p>
              </div>
            )}
          </div>

          {showManageButton && (
            <div className="p-4 border-t border-gray-200">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                  Manage All Profiles
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
