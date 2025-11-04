
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [animationState, setAnimationState] = useState<'assembling' | 'text-reveal' | 'fading-out'>('assembling');
  const [isLogoRotating, setIsLogoRotating] = useState(false);

  useEffect(() => {
    // Logo assembly is 2s (from CSS animations like animate-move-top-left)

    // Start logo rotation after assembly is complete
    const logoRotationStartTimer = setTimeout(() => {
      setIsLogoRotating(true);
    }, 2000); // Start rotating after 2 seconds

    // Start text reveal after assembly is complete
    const textTimer = setTimeout(() => {
      setAnimationState('text-reveal');
    }, 2000); // Start text reveal after 2 seconds

    // Start fading out the entire splash screen
    // Total duration is 8s. If fade-out is 0.5s, it should start at 7.5s.
    const fadeOutTimer = setTimeout(() => {
      setAnimationState('fading-out');
      setIsLogoRotating(false); // Stop rotation when fading out
    }, 7500); // Start fading out at 7.5 seconds

    // Finish the splash screen and transition to the next page
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 8000); // Total splash screen duration is 8 seconds

    return () => {
      clearTimeout(logoRotationStartTimer);
      clearTimeout(textTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  const wrapperClasses = `
    fixed inset-0 bg-slate-900 flex flex-col justify-center items-center z-[100] transition-opacity duration-500
    ${animationState === 'fading-out' ? 'opacity-0' : 'opacity-100'}
  `;

  return (
    <div className={wrapperClasses}>
      <div className={`relative w-24 h-24 md:w-32 md:h-32 ${isLogoRotating ? 'animate-rotate-logo' : ''}`}>
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