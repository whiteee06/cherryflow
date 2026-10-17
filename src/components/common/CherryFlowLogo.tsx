import React from 'react';
import { motion } from 'motion/react';

interface CherryFlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'app' | 'favicon' | 'splash' | 'sidebar' | 'footer' | 'loading';
  showSubtitle?: boolean;
  subtitleText?: string;
  lightText?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

export const CherryFlowLogo: React.FC<CherryFlowLogoProps> = ({
  size = 'md',
  variant = 'app',
  showSubtitle = false,
  subtitleText = 'Automate. Organize. Grow.',
  lightText = false,
  className = '',
  onClick,
  animated = true,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-[11px]' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl sm:text-4xl', sub: 'text-[12px]' },
    '2xl': { icon: 'w-20 h-20', text: 'text-4xl sm:text-5xl', sub: 'text-[14px]' },
  };

  const currentSize = sizeMap[size];

  // If favicon variant, render icon only
  if (variant === 'favicon') {
    return (
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(220,20,60,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="cherryFavGloss1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff6b81" />
              <stop offset="40%" stopColor="#DC143C" />
              <stop offset="85%" stopColor="#9f1239" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>
            <radialGradient id="cherryFavGloss2" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="35%" stopColor="#f43f5e" />
              <stop offset="80%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#580718" />
            </radialGradient>
            <linearGradient id="metalFavC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="favGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path d="M 68,22 A 38,38 0 1,0 68,78 L 78,66 A 25,25 0 1,1 78,34 Z" fill="url(#metalFavC)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 44,58 L 54,48 L 62,52 L 74,36" stroke="#DC143C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#favGlow)" />
          <circle cx="74" cy="36" r="3.5" fill="#ffe4e6" stroke="#DC143C" strokeWidth="1.5" />
          <path d="M 30,52 C 32,32 48,16 52,12" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 42,56 C 44,38 50,22 52,12" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 52,12 C 60,8 70,10 72,16 C 62,20 54,16 52,12 Z" fill="#DC143C" stroke="#fda4af" strokeWidth="1" />
          <circle cx="28" cy="58" r="15" fill="url(#cherryFavGloss1)" />
          <ellipse cx="23" cy="52" rx="4" ry="2.5" fill="#ffffff" opacity="0.65" transform="rotate(-25 23 52)" />
          <circle cx="42" cy="62" r="14" fill="url(#cherryFavGloss2)" />
          <ellipse cx="37" cy="56" rx="3.5" ry="2" fill="#ffffff" opacity="0.75" transform="rotate(-25 37 56)" />
        </svg>
      </div>
    );
  }

  const logoContent = (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      {/* 3D Cherry & Growth Chart Emblem SVG */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(244,63,94,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Cherry Red Glossy Gradient */}
            <radialGradient id="cherryGloss1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff6b81" />
              <stop offset="40%" stopColor="#e11d48" />
              <stop offset="85%" stopColor="#9f1239" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>

            <radialGradient id="cherryGloss2" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="35%" stopColor="#f43f5e" />
              <stop offset="80%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#580718" />
            </radialGradient>

            {/* Metallic C Gradient */}
            <linearGradient id="metalC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Silver Accent Gradient */}
            <linearGradient id="silverAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Red Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Metallic Outer Ring / Letter C */}
          <path
            d="M 68,22 A 38,38 0 1,0 68,78 L 78,66 A 25,25 0 1,1 78,34 Z"
            fill="url(#metalC)"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Rising Chart Bars inside C */}
          <rect x="46" y="52" width="5" height="16" rx="1.5" fill="url(#metalC)" opacity="0.9" />
          <rect x="54" y="44" width="5" height="24" rx="1.5" fill="url(#silverAccent)" />
          <rect x="62" y="36" width="5" height="32" rx="1.5" fill="url(#silverAccent)" />

          {/* Growth Trend Line with Target Marker */}
          <path
            d="M 44,58 L 54,48 L 62,52 L 74,36"
            stroke="#f43f5e"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
          <circle cx="74" cy="36" r="3.5" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" />

          {/* Metallic Stems */}
          <path
            d="M 30,52 C 32,32 48,16 52,12"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 42,56 C 44,38 50,22 52,12"
            stroke="#cbd5e1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Stem Metallic Leaf */}
          <path
            d="M 52,12 C 60,8 70,10 72,16 C 62,20 54,16 52,12 Z"
            fill="#e11d48"
            stroke="#fda4af"
            strokeWidth="1"
          />

          {/* Cherry 1 (Left/Lower) */}
          <circle cx="28" cy="58" r="15" fill="url(#cherryGloss1)" />
          <ellipse cx="23" cy="52" rx="4" ry="2.5" fill="#ffffff" opacity="0.65" transform="rotate(-25 23 52)" />

          {/* Cherry 2 (Right/Upper) */}
          <circle cx="42" cy="62" r="14" fill="url(#cherryGloss2)" />
          <ellipse cx="37" cy="56" rx="3.5" ry="2" fill="#ffffff" opacity="0.75" transform="rotate(-25 37 56)" />
        </svg>
      </div>

      {/* Typography Brand Title */}
      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-tight flex items-center ${currentSize.text} leading-none`}>
          <span className="bg-gradient-to-r from-rose-500 via-rose-500 to-rose-600 bg-clip-text text-transparent drop-shadow-xs">
            Cherry
          </span>
          <span className={lightText ? "text-slate-900 font-extrabold tracking-tight" : "text-white dark:text-slate-100 font-extrabold tracking-tight"}>
            Flow
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-bold tracking-wider text-slate-400 dark:text-slate-400 mt-1 ${currentSize.sub}`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (!animated) {
    return logoContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {logoContent}
    </motion.div>
  );
};
