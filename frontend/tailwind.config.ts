import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * ==========================
 * 
 * With Tailwind v4, most of the configuration is done in CSS
 * via @theme inline in global.css.
 * 
 * This file contains only :
 * - Content paths
 * - Possible plugins
 * 
 * Colors, fonts, and other tokens are defined in :
 * - src/styles/base/ (Common - Do not modify)
 * - src/styles/themes/ (Project specific)
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  /**
   * Dark mode configuration
   * Uses the .dark class on <html> or a parent element
   */
  darkMode: "class",
  
  theme: {
    extend: {
      /**
       * Font families
       * -------------
       * The CSS variables are defined in the theme
       * and injected via `next/font` into `layout.tsx`
       */
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      
      /**
       * Custom animations
       * -----------------
       * Project-specific animations
       */
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "spin-slow": "spin 2s linear infinite",
      },
      
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  
  plugins: [
    /**
     * Plugins Tailwind
     * ----------------
     * Add the necessary plugins here :
     * - @tailwindcss/forms
     * - @tailwindcss/typography
     * - etc.
     */
  ],
};

export default config;
