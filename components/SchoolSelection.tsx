import React, { useState, useEffect } from 'react';
import * as firestoreService from '../services/firestoreService.ts';
import { Logo } from './Logo.tsx';
import { AnimatedBackground } from './PasswordProtection.tsx';
import { SearchIcon } from './Icons.tsx';

interface SchoolSelectionProps {
  onSchoolSelected: (schoolId: string, schoolName: string) => void;
  onLogout: () => void;
}

const SchoolSelection: React.FC<SchoolSelectionProps> = ({ onSchoolSelected, onLogout }) => {
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolList = await firestoreService.getSchools();
        setSchools(schoolList);
        setFilteredSchools(schoolList);
      } catch (error) {
        console.error("Failed to fetch schools", error);
        // Handle error, maybe show a message
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchools();
  }, []);
  
  useEffect(() => {
    setFilteredSchools(
      schools.filter(school => school.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, schools]);

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col justify-center items-center z-50 p-4 overflow-hidden">
      <AnimatedBackground />
      <div className="text-center mb-8 z-10">
        <Logo className="h-20 w-20 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white">Select Your School</h1>
        <p className="text-lg text-slate-400 mt-2">Find your school to access the lab inventory.</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-lg z-10 border border-slate-700 flex flex-col max-h-[70vh]">
        <div className="relative mb-4 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for your school..."
            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-2">
          {isLoading ? (
            <p className="text-center text-slate-400 animate-pulse">Loading schools...</p>
          ) : filteredSchools.length > 0 ? (
            filteredSchools.map(school => (
              <button
                key={school.id}
                onClick={() => onSchoolSelected(school.id, school.name)}
                className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-white font-semibold transition-colors"
              >
                {school.name}
              </button>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">No schools found matching your search.</p>
          )}
        </div>
      </div>
      <button onClick={onLogout} className="z-10 mt-8 text-slate-500 hover:text-white transition-colors">
          Logout
      </button>
    </div>
  );
};

export default SchoolSelection;
