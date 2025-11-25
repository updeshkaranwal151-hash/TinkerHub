import React, { useState } from 'react';
import { User } from 'firebase/auth';
import * as firestoreService from '../services/firestoreService.ts';
import { AnimatedBackground } from './PasswordProtection.tsx';
import { Logo } from './Logo.tsx';
import { KeyIcon } from './Icons.tsx';

interface LicenseKeyEntryProps {
  user: User;
  onLicenseVerified: (schoolId: string, schoolName: string) => void;
}

const LicenseKeyEntry: React.FC<LicenseKeyEntryProps> = ({ user, onLicenseVerified }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const schoolInfo = await firestoreService.validateLicense(licenseKey.trim());
      if (schoolInfo) {
        // License is valid and not claimed
        // 1. Claim the license
        await firestoreService.claimLicense(licenseKey.trim(), user.uid);
        
        // 2. Update user's profile with school info
        await firestoreService.createUserProfile(user.uid, {
            email: user.email!,
            role: 'admin',
            schoolId: schoolInfo.schoolId,
            schoolName: schoolInfo.schoolName,
        });
        
        // 3. Proceed to the dashboard
        onLicenseVerified(schoolInfo.schoolId, schoolInfo.schoolName);
      } else {
        setError('Invalid or already claimed license key.');
      }
    } catch (err) {
      setError('An error occurred while verifying the license.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col justify-center items-center z-50 p-4 overflow-hidden">
      <AnimatedBackground />
      <div className="text-center mb-8 z-10">
        <Logo className="h-20 w-20 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white">Admin Verification</h1>
        <p className="text-lg text-slate-400 mt-2">Please enter the license key provided to your institution.</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-sm z-10 border border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-300 mb-2">License Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyIcon className="h-5 w-5 text-slate-400" /></div>
              <input
                type="text"
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="e.g., ATAL_2025_..."
                required
                autoFocus
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 px-4 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Activate & Proceed'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LicenseKeyEntry;
