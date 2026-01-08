'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface JarvisCoreProps {
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function JarvisCore({ isThinking = false, size = 'md', className }: JarvisCoreProps) {
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12', // Un peu plus grand par défaut
    lg: 'w-24 h-24',
    xl: 'w-48 h-48'
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("relative flex items-center justify-center", currentSize, className)}>
      
      {/* 1. OUTER RING (Anneau externe) */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full border-2 transition-all duration-1000",
          // IDLE: Cyan Brillant | THINKING: Violet Electrique
          isThinking 
            ? "border-transparent border-t-indigo-500 border-r-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]" 
            : "border-transparent border-t-cyan-400/80 border-r-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
          isThinking ? "animate-[spin_1s_linear_infinite]" : "animate-[spin_4s_linear_infinite]"
        )}
      />

      {/* 2. MIDDLE RING (Anneau intermédiaire) */}
      <div 
        className={cn(
          "absolute inset-[15%] rounded-full border-2 transition-all duration-1000",
          isThinking 
            ? "border-transparent border-b-purple-400 border-l-purple-300" 
            : "border-transparent border-b-sky-400/60 border-l-sky-500/40",
          isThinking ? "animate-[spin_1.5s_linear_infinite_reverse]" : "animate-[spin_7s_linear_infinite_reverse]"
        )}
      />

      {/* 3. INNER CORE (Le Noyau) */}
      <div 
        className={cn(
          "absolute inset-[35%] rounded-full transition-all duration-500 flex items-center justify-center",
          isThinking 
            ? "bg-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.8)]" 
            : "bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.4)]",
          isThinking ? "animate-pulse" : ""
        )}
      >
        {/* Point central solide */}
        <div className={cn(
            "w-1.5 h-1.5 rounded-full shadow-lg",
            isThinking ? "bg-white shadow-[0_0_10px_white]" : "bg-cyan-200 shadow-[0_0_5px_cyan]"
        )} />
      </div>

    </div>
  );
}