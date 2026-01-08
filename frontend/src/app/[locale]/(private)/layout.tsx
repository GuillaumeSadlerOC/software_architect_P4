import { ReactNode } from 'react';
import DashboardLayoutClient from './DashboardLayoutClient';

interface PrivateLayoutProps {
  children: ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {  
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}