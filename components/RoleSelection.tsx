import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types.ts';
import * as firestoreService from '../services/firestoreService.ts';
import { AnimatedBackground } from './PasswordProtection.tsx';
import { Logo } from './Logo.tsx';

interface RoleSelectionProps {
  user: User;
  onRoleSelected: (profile: Omit<UserProfile, 'uid'>) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ user, onRoleSelected }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = async (role: 'admin' | 'student') => {
    setIsLoading(true);
    const profileData = {
      email: user.email!,
      role: role,
      schoolId: null, // This will be set in the next step
    };
    await firestoreService.createUserProfile(user.uid, profileData);
    onRoleSelected(profileData);
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col justify-center items-center z-50 p-4 overflow-hidden">
      <AnimatedBackground />
      <div className="text-center mb-8 z-10">
        <Logo className="h-20 w-20 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white">Welcome to TinkerHub!</h1>
        <p className="text-lg text-slate-400 mt-2">To get started, please select your role.</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-sm z-10 border border-slate-700 space-y-4">
        <h2 className="text-xl font-bold text-center text-slate-200">I am a...</h2>
        <button
          onClick={() => handleSelectRole('admin')}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? 'Processing...' : 'Lab Admin / Teacher'}
        </button>
        <button
          onClick={() => handleSelectRole('student')}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-lg shadow-sky-600/30 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? 'Processing...' : 'Student'}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
