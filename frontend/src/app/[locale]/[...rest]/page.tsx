import { notFound } from 'next/navigation';

export default function CatchAllPage() {
  // This page intercepts all unknown routes within a locale (e.g., /fr/unknown)
  // and forces the display of the 'not-found.tsx' file located at the same level.
  notFound();
}