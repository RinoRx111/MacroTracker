import React, { useState, useEffect } from 'react';
import { Sidebar, Navbar, MobileNav } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { FoodDiary } from './pages/FoodDiary';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { useFood } from './hooks/useFood';
import { useProfile } from './hooks/useProfile';
import { analyticsApi } from './api/analyticsApi';
import { getDarkMode, setDarkMode as saveDarkMode } from './store/appStore';

function App() {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(getDarkMode());
  const { foods, loading: foodLoading, fetchDailyLogs } = useFood();
  const { profile, loading: profileLoading } = useProfile();
  const [dailySummary, setDailySummary] = useState(null);

  useEffect(() => {
    saveDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchDailyLogs();
    loadDailySummary();
  }, []);

  const loadDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await analyticsApi.getSummary(today);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error loading daily summary:', error);
    }
  };

  const renderPage = () => {
    switch (activeLink) {
      case 'dashboard':
        return <Dashboard user={profile} profile={profile} loading={profileLoading} dailySummary={dailySummary} />;
      case 'diary':
        return <FoodDiary user={profile} />;
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
