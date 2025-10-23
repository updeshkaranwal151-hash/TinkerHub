import React, { useState, useMemo } from 'react';

interface PasswordProtectionProps {
  onSuccess: () => void;
}

const CORRECT_PASSWORD = 'ATAL LAB 112233';

const AnimatedBackground: React.FC = () => {
    const icons = useMemo(() => ['#', '$', '_', '&', '@', '{', '}', '<', '>', '%', '*'], []);
    const colors = useMemo(() => ['#38bdf8', '#818cf8', '#f471b5', '#fbbf24', '#34d399', '#a78bfa', '#f87171'], []);

    const floatingIcons = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            char: icons[Math.floor(Math.random() * icons.length)],
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s duration
            animationDelay: `-${Math.random() * 25}s`, // start at random points in the animation
            fontSize: `${Math.random() * 24 + 16}px`, // 16px to 40px
            color: colors[Math.floor(Math.random() * colors.length)],
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
                        textShadow: `0 0 8px ${icon.color}66`, // Add a subtle glow
                    }}
                >
                    {icon.char}
                </span>
            ))}
        </div>
    );
};


const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col z-50 p-4 overflow-hidden">
        <AnimatedBackground />
        <main className="flex-grow flex flex-col justify-center items-center">
            <div className="text-center mb-8 z-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Tinker
                <span className="text-sky-400">Hub</span>
                </h1>
                <p className="text-lg text-slate-400 mt-2">The ATL Lab Inventory Manager</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm z-10 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-center text-slate-200">Enter Password to Access</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-3 px-4 text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="************"
                    autoFocus
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300"
                >
                    Unlock
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

export default PasswordProtection;
