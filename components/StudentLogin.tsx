import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { AnimatedBackground } from './PasswordProtection.tsx';
import { ArrowLeftIcon, UserIcon } from './Icons.tsx';

interface StudentLoginProps {
  onStudentLogin: (name: string) => void;
  onBack: () => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onStudentLogin, onBack }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStudentLogin(name.trim());
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col z-50 p-4 overflow-hidden">
      <AnimatedBackground />
      <header className="absolute top-0 left-0 p-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 py-2 px-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-colors duration-300 backdrop-blur-sm"
        >
          <ArrowLeftIcon /> Back
        </button>
      </header>
      <main className="flex-grow flex flex-col justify-center items-center">
        <div className="text-center mb-8 z-10">
          <Logo className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Student
            <span className="text-sky-400">Hub</span>
          </h1>
          <p className="text-lg text-slate-400 mt-2">Enter your name to access the lab inventory.</p>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm z-10 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-slate-300 mb-2">
                Your Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="studentName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  required
                  autoFocus
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 px-4 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              Enter Lab
            </button>
          </form>
        </div>
      </main>
      <footer className="w-full text-center text-slate-500 text-sm py-4 z-10">
        this app is made with ❤️ by Apoorv karanwal
      </footer>
    </div>
  );
};

export default StudentLogin;