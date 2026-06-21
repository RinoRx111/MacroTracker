import React, { useState, useEffect } from 'react';
import { useAuth, useUser, SignIn } from '@clerk/react';
import { Sidebar, Navbar, MobileNav } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { FoodDiary } from './pages/FoodDiary';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { WorkoutTracker } from './pages/WorkoutTracker';
import { useFood } from './hooks/useFood';
import { useProfile } from './hooks/useProfile';
import { analyticsApi } from './api/analyticsApi';
import { getDarkMode, setDarkMode as saveDarkMode } from './store/appStore';
import { setClerkTokenResolver, apiClient } from './api/sharedClient';
import { formatDateLocal } from './utils/formatters';

function App() {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(getDarkMode());
  const { foods, loading: foodLoading, fetchDailyLogs } = useFood();
  const { profile, loading: profileLoading, reload: reloadProfile } = useProfile();
  const [dailySummary, setDailySummary] = useState(null);

  const isClerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { isSignedIn, getToken } = isClerkEnabled ? useAuth() : { isSignedIn: true, getToken: null };
  const { user } = isClerkEnabled ? useUser() : { user: null };

  useEffect(() => {
    saveDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Set the Clerk token resolver for API requests
  useEffect(() => {
    if (isClerkEnabled && getToken) {
      setClerkTokenResolver(getToken);
    }
  }, [getToken]);

  // Sync profile metadata on sign-in
  useEffect(() => {
    if (isClerkEnabled && isSignedIn && user) {
      const syncProfile = async () => {
        try {
          await apiClient.post('/profile/sync', {
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName || '',
          });
        } catch (e) {
          console.error('Error syncing profile with backend:', e);
        }
      };
      syncProfile();
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isClerkEnabled || isSignedIn) {
      reloadProfile();
      fetchDailyLogs();
      loadDailySummary();
    }
  }, [isSignedIn]);

  const loadDailySummary = async () => {
    try {
      const today = formatDateLocal();
      const response = await analyticsApi.getSummary(today);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error loading daily summary:', error);
    }
  };


  const renderPage = () => {
    switch (activeLink) {
      case 'dashboard':
        return <Dashboard user={profile} profile={profile} loading={profileLoading} dailySummary={dailySummary} reloadSummary={loadDailySummary} />;
      case 'diary':
        return <FoodDiary user={profile} onFoodChange={loadDailySummary} />;
      case 'workouts':
        return <WorkoutTracker />;
      case 'analytics':
        return <Analytics user={profile} />;
      case 'profile':
        return <Profile user={profile} />;
      case 'settings':
        return <Settings profile={profile} darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return null;
    }
  };

  if (isClerkEnabled && !isSignedIn) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center text-gray-950 dark:text-white mb-6">
              Welcome to MacroTracker 🥗
            </h2>
            <div className="flex justify-center">
              <SignIn routing="hash" appearance={{
                variables: {
                  colorPrimary: '#10b981',
                  colorBackground: darkMode ? '#1f2937' : '#ffffff',
                  colorText: darkMode ? '#ffffff' : '#111827',
                }
              }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <div className="flex">
          <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} darkMode={darkMode} setDarkMode={setDarkMode} />
          
          <div className="flex-1 flex flex-col">
            <Navbar activeLink={activeLink} setActiveLink={setActiveLink} darkMode={darkMode} setDarkMode={setDarkMode} />
            
            <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
              {renderPage()}
            </main>
          </div>
        </div>

        <MobileNav activeLink={activeLink} setActiveLink={setActiveLink} />
      </div>
    </div>
  );
}

export default App;
