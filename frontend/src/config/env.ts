import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Server-Side Variables
   * Available only in server code (SSR, API Routes).
   * Internal Docker: container-to-container communication.
   */
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    
    // URL used by Next.js (SSR) to reach the backend via the Docker network
    // Ex: http://backend:3000/api
    INTERNAL_API_URL: z.string().url(),
  },

  /*
   * Client Side Variables
   * Available in the browser. Must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    // URL used by the browser to reach the API (via Traefik or localhost)
    // Ex: http://localhost:3000/api
    NEXT_PUBLIC_API_URL: z.string().url(),
    
    // Public URL of the frontend (for sharing links, OG images, etc.)
    NEXT_PUBLIC_APP_URL: z.string().url(),
    
    // Allowed image domains (optional, for next/image)
    NEXT_PUBLIC_IMAGE_DOMAINS: z.string().optional(),
  },

  /*
   * Runtime Env
   * Required for destructuring process.env in Next.js Edge/Client
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_IMAGE_DOMAINS: process.env.NEXT_PUBLIC_IMAGE_DOMAINS,
  },

  /*
   * Behavior in case of error
   * If true, the build fails if the variables are invalid (DevOps Security)
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});