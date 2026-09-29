import React from 'react';
import { LOCAL_STORAGE_KEYS } from '../utils/auth';

// i added debug logs here, the reason being i was redirected to the auth page when i was logged in
// i later found out that the error was in axios interceptors logic


const ProtectedRoute = ({ children }) => {
  // Get stored data
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
  
  console.log('🔒 ProtectedRoute Check:', {
    path: window.location.pathname,
    hasToken: !!token,
    hasUser: !!userString,
    userString: userString ? 'exists' : 'missing'
  });

  // Early return if no auth data
  if (!token || !userString) {
    console.log(' Missing auth data');
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
          rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-white/60">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  // Parse user data safely
  let user = null;
  try {
    user = JSON.parse(userString);
    console.log('👤 Parsed user:', {
      hasUser: !!user,
      hasRole: !!user?.role,
      role: user?.role || 'none'
    });
  } catch (error) {
    console.error(' Failed to parse user data:', error);
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
          rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Session Error</h2>
          <p className="text-white/60">Invalid session data. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Verify user and role exist
  if (!user || !user.role) {
    console.warn(' Missing user or role:', { user });
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
          rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Session</h2>
          <p className="text-white/60">Missing user role. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Path checking
  const currentPath = window.location.pathname;
  const userRole = user.role.toLowerCase();
  const isDashboardPath = currentPath.startsWith('/dashboard');
  const hasCorrectRole = currentPath.includes(userRole);

  console.log('🎭 Role Check:', { 
    currentPath, 
    userRole, 
    isDashboardPath, 
    hasCorrectRole 
  });

  // Wrong dashboard access
  if (isDashboardPath && !hasCorrectRole) {
    console.log(' Wrong dashboard access');
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
          rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-white/60">
            This dashboard is not available for your role: {userRole}
          </p>
        </div>
      </div>
    );
  }

  // Success case
  console.log(' Access granted:', {
    path: currentPath,
    role: userRole
  });

  return children;
};

export default ProtectedRoute;