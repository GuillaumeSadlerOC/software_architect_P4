import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest } from 'next/server';

// We initialize the next-intl logic
const intlMiddleware = createMiddleware(routing);

// We export a function with an explicit name to satisfy Next.js
export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}
 
export const config = {
  // Robust generic matcher :
  // Ignore /api, /_next, /_vercel and files with extensions (images, cscs...)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};