import React, { useState, useMemo } from 'react';
import { Logo } from './Logo.tsx';
import { DatabaseIcon, ProjectIcon, ArrowLeftIcon } from './Icons.tsx';

interface PasswordProtectionProps {
  onUserLogin: (view: 'inventory' | 'projects') => void;
  onAdminSuccess: () => void;
}

export const AnimatedBackground: React.FC = () => {
    const icons = useMemo(() => ['#', '$', '_', '&', '@', '{', '}', '<', '>', '%', '*'], []);
    const colors = useMemo(() => ['#38bdf8', '#818cf8', '#f471b5', '#fbbf24', '#34d399', '#a78bfa', '#f87171'], []);

    const floatingIcons = useMemo(() => {
        return Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            char: icons[Math.floor(Math.random() * icons.length)],
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s duration
            animationDelay: `-${Math.random() * 25}s`, // start at random points in the animation
            fontSize: `${Math.random() * 24 + 16}px`, // 16px to 40px
            color: colors[Math.floor(Math.random() * colors.length)],
            textShadow: `0 0 8px ${colors[Math.floor(Math.random() * colors.length)]}66`,
        }));
    }, [icons, colors]);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden" aria-hidden="true">
            {floatingIcons.map(icon => (
                <span
                    key={icon.id}
                    className="absolute bottom-[-10%] animate-float"
                    style={{
                        left: icon.left,
                        animationDuration: icon.animationDuration,
                        animationDelay: icon.animationDelay,
                        fontSize: icon.fontSize,
                        color: icon.color,
                        textShadow: icon.textShadow,
                    }}
                >
                    {icon.char}
                </span>
            ))}
        </div>
    );
};


const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onUserLogin, onAdminSuccess }) => {
  const [step, setStep] = useState<'role' | 'hub'>('role');

  const RoleSelection = () => (
    <>
      <h2 className="text-xl font-bold mb-6 text-center text-slate-200">
          Select Panel
      </h2>
      <div className="space-y-4">
          <button
              onClick={() => setStep('hub')}
              className="w-full flex items-center justify-center py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-lg shadow-sky-600/30 transition-all duration-300 transform hover:scale-105"
          >
              User Panel
          </button>
          <button
              onClick={onAdminSuccess}
              className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105"
          >
              Admin Panel
          </button>
      </div>
    </>
  );

  const HubSelection = () => (
    <>
      <div className="flex items-center mb-6 relative">
        <button onClick={() => setStep('role')} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-700/50 absolute left-0">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-center text-slate-200 flex-grow">
            Choose Your Hub
        </h2>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => onUserLogin('inventory')}
          className="w-full text-left p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-600 hover:border-sky-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-600/30 text-sky-400 rounded-lg"><DatabaseIcon className="h-6 w-6"/></div>
            <div>
              <h3 className="font-bold text-lg text-white">Inventory Manager</h3>
              <p className="text-sm text-slate-400">Track and manage lab components.</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => onUserLogin('projects')}
          className="w-full text-left p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-600 hover:border-indigo-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/30 text-indigo-400 rounded-lg"><ProjectIcon className="h-6 w-6"/></div>
            <div>
              <h3 className="font-bold text-lg text-white">Project Hub</h3>
              <p className="text-sm text-slate-400">Organize and showcase student projects.</p>
            </div>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col z-50 p-4 overflow-hidden">
        <AnimatedBackground />
        <main className="flex-grow flex flex-col justify-center items-center">
            <div className="text-center mb-8 z-10">
                <Logo className="h-20 w-20 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Tinker
                <span className="text-sky-400">Hub</span>
                </h1>
                <p className="text-lg text-slate-400 mt-2">The ATL Lab Inventory Manager</p>
            </div>
            <div className="password-protection-card bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm z-10 border border-slate-700">
                {step === 'role' ? <RoleSelection /> : <HubSelection />}
            </div>
        </main>
        <footer className="w-full text-center text-slate-500 text-sm py-4 z-10">
            this app is made with ❤️ by Apoorv karanwal
        </footer>
    </div>
  );
};

export default PasswordProtection;
