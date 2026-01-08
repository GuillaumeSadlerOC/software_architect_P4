import { ReactNode } from 'react';
import PublicHeaderWrapper from '@/components/layout/PublicHeaderWrapper'; // Changement d'import
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen ds-bg-gradient">

      <PublicHeaderWrapper />
      
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}