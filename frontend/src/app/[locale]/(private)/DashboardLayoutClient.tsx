'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logOut, selectCurrentUser } from '@/lib/store/features/auth/authSlice';
import { useGetMeQuery } from '@/lib/store/features/user/userApi';

import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PrivateHeader from '@/components/layout/PrivateHeader';
import MobileDrawer from '@/components/layout/MobileDrawer';
import Footer from '@/components/layout/Footer';
import UploadSheet from '@/components/features/upload/UploadSheet';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Client layout for the dashboard
 * Manages the overall state of the connected UI (User, Drawer, Upload)
 */
export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Retrieving real user data
  const { data: apiUser, isLoading } = useGetMeQuery();
  const storedUser = useAppSelector(selectCurrentUser);

  const displayUser = {
    name: apiUser?.email || storedUser?.email || 'Utilisateur',
    email: apiUser?.email,
    avatar: undefined, // Avatar non géré en backend pour l'instant
  };
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);

  // Proper disconnection management
  const handleLogout = () => {
    dispatch(logOut());
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <PrivateHeader
          user={displayUser}
          onMenuClick={() => setIsDrawerOpen(true)}
        />

        {/* Header Desktop */}
        <DashboardHeader
          user={displayUser}
          onAddFile={() => setIsUploadSheetOpen(true)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        {/* Footer Mobile */}
        <div className="md:hidden">
          <Footer variant="dark" />
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={displayUser}
        onLogout={handleLogout}
      />

      {/* Upload Sheet */}
      <UploadSheet
        isOpen={isUploadSheetOpen}
        onClose={() => setIsUploadSheetOpen(false)}
      />
    </div>
  );
}