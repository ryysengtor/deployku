'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/admin/AdminPanel';
import { useStore } from '@/store/useStore';
import LoadingScreen from '@/components/store/LoadingScreen';

export default function AdminPage() {
  const router = useRouter();
  const currentView = useStore((s) => s.currentView);
  const setView = useStore((s) => s.setView);
  const setHasHydrated = useStore((s) => s.setHasHydrated);
  const _hasHydrated = useStore((s) => s._hasHydrated);

  // Track whether we've properly initialized the admin view
  const hasInitializedRef = useRef(false);

  // Safety fallback: if hydration doesn't complete in 3 seconds, force it
  // This prevents getting stuck on loading screen forever
  useEffect(() => {
    if (_hasHydrated) return;
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [_hasHydrated, setHasHydrated]);

  // Ensure currentView is 'admin' when on /admin route
  useEffect(() => {
    if (!_hasHydrated) return;
    if (currentView !== 'admin') {
      setView('admin');
    }
    // Mark as initialized AFTER the view is set to admin
    // Use setTimeout to ensure the state update has been processed
    const timer = setTimeout(() => {
      hasInitializedRef.current = true;
    }, 150);
    return () => clearTimeout(timer);
  }, [_hasHydrated, currentView, setView]);

  // When AdminPanel sets view to 'home' (e.g. "Kembali ke Store" / logout),
  // navigate the browser to the home page.
  // ONLY do this after initialization to prevent redirect loop
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (currentView === 'home') {
      hasInitializedRef.current = false; // Reset before navigation
      router.push('/');
    }
  }, [currentView, router]);

  // Wait for hydration before rendering
  if (!_hasHydrated) {
    return <LoadingScreen />;
  }

  return <AdminPanel />;
}
