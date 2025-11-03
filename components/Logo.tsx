import React from 'react';

// Colors are inspired by the drawing and adapted for a modern UI
const BLUE = "#3b82f6"; // Tailwind's blue-500
const GREEN = "#22c55e"; // Tailwind's green-500
const ORANGE = "#f97316"; // Tailwind's orange-500
const GREY = "#6b7280"; // Tailwind's gray-500

export const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="TinkerHub Logo"
  >
    <defs>
        <path id="quadrant" d="M0 20C0 8.95 8.95 0 20 0H42V42H0V20Z" />
    </defs>
    
    {/* Quadrants */}
    <use href="#quadrant" fill={BLUE} />
    <use href="#quadrant" fill={GREEN} transform="rotate(90 50 50)" />
    <use href="#quadrant" fill={BLUE} transform="rotate(180 50 50)" />
    <use href="#quadrant" fill={GREEN} transform="rotate(270 50 50)" />
    
    {/* Separators */}
    <rect x="42" y="0" width="16" height="100" fill={ORANGE} />
    <rect x="0" y="42" width="100" height="16" fill={ORANGE} />

    {/* Central Grey Cross - path is more complex to match the drawing's feel */}
    <path d="M42 42V32C46 38 52 38 58 32V42H42Z" fill={GREY} />
    <path d="M42 58V68C46 62 52 62 58 68V58H42Z" fill={GREY} />
    <path d="M42 42H32C38 46 38 52 32 58H42V42Z" fill={GREY} />
    <path d="M58 42H68C62 46 62 52 68 58H58V42Z" fill={GREY} />
  </svg>
);
