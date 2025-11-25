import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase.ts';
import { Logo } from './Logo.tsx';
import { AnimatedBackground } from './PasswordProtection.tsx';
import { KeyIcon, UserIcon } from './Icons.tsx';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error("Firebase Auth Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col z-50 p-4 overflow-hidden">
      <AnimatedBackground />
      <main className="flex-grow flex flex-col justify-center items-center">
        <div className="text-center mb-8 z-10">
          <Logo className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Tinker<span className="text-sky-400">Hub</span>
          </h1>
          <p className="text-lg text-slate-400 mt-2">The ATL Lab Inventory Manager</p>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm z-10 border border-slate-700">
          <h2 className="text-xl font-bold mb-6 text-center text-slate-200">
            {isLoginView ? 'Secure Login' : 'Create Account'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-slate-400" /></div>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@school.com" required autoFocus className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 px-4 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyIcon className="h-5 w-5 text-slate-400" /></div>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 px-4 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">{error}</p>}
            <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-6">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1">
              {isLoginView ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </main>
      <footer className="w-full text-center text-slate-500 text-sm py-4 z-10">
        this app is made with ❤️ by Apoorv karanwal
      </footer>
    </div>
  );
};

export default Login;
