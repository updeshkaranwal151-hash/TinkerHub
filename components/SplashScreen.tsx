import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [animationState, setAnimationState] = useState<'assembling' | 'text-reveal' | 'fading-out'>('assembling');

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setAnimationState('text-reveal');
    }, 2000); // Logo animation is 2s, start text after

    const fadeOutTimer = setTimeout(() => {
      setAnimationState('fading-out');
    }, 4500); // Start fading out at 4.5s

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 5000); // Total duration is 5s

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  const wrapperClasses = `
    fixed inset-0 bg-slate-900 flex flex-col justify-center items-center z-[100] transition-opacity duration-500
    ${animationState === 'fading-out' ? 'opacity-0' : 'opacity-100'}
  `;

  const logoContainerClasses = `
    relative w-24 h-24 md:w-32 md:h-32
    ${(animationState === 'text-reveal' || animationState === 'fading-out') ? 'animate-slow-rotate' : ''}
  `;

  return (
    <div className={wrapperClasses}>
      <div className={logoContainerClasses}>
        {/* Top-Left Quadrant */}
        <div className="absolute inset-0 animate-move-top-left" style={{ clipPath: 'inset(0 50% 50% 0)' }}>
          <Logo className="w-full h-full" />
        </div>
        {/* Top-Right Quadrant */}
        <div className="absolute inset-0 animate-move-top-right" style={{ clipPath: 'inset(0 0 50% 50%)' }}>
          <Logo className="w-full h-full" />
        </div>
        {/* Bottom-Left Quadrant */}
        <div className="absolute inset-0 animate-move-bottom-left" style={{ clipPath: 'inset(50% 50% 0 0)' }}>
          <Logo className="w-full h-full" />
        </div>
        {/* Bottom-Right Quadrant */}
        <div className="absolute inset-0 animate-move-bottom-right" style={{ clipPath: 'inset(50% 0 0 50%)' }}>
          <Logo className="w-full h-full" />
        </div>
      </div>
      <h1
        className={`
          mt-6 text-3xl md:text-4xl font-extrabold text-white tracking-wider
          transition-opacity duration-1000
          ${animationState === 'text-reveal' || animationState === 'fading-out' ? 'opacity-100 animate-glow-in' : 'opacity-0'}
        `}
      >
        TinkerHub
      </h1>
    </div>
  );
};

export default SplashScreen;
