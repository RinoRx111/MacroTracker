import React, { useState } from 'react';
import { Layout } from './components/shared/Layout';
import { Dashboard } from './pages/Dashboard';
import { WeightTracker } from './pages/WeightTracker';
import { UserProfile } from './pages/UserProfile';
import { RecipeBuilder } from './pages/RecipeBuilder';
import { Hydration } from './pages/Hydration';
import { FoodLog } from './pages/FoodLog';         // NEW
import { Analytics } from './pages/Analytics';     // NEW
import { Settings } from './pages/Settings';       // NEW

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard />;
      case 'logging':    return <FoodLog />;        // NOW WORKS
      case 'recipes':    return <RecipeBuilder />;
      case 'weight':     return <WeightTracker />;
      case 'analytics':  return <Analytics />;      // NOW WORKS
      case 'water':      return <Hydration />;
      case 'profile':    return <UserProfile />;
      case 'settings':   return <Settings />;       // NOW WORKS
      default: return <Dashboard />;
    }
  };

  return (
    <Layout setCurrentPage={(page) => setCurrentPage(page as any)} currentPage={currentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;