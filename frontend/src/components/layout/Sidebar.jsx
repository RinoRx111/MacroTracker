import React, { useState } from 'react';

export const Sidebar = ({ activeLink, setActiveLink, darkMode, setDarkMode }) => {
  const links = [
    { label: 'Dashboard', icon: '📊', href: 'dashboard' },
    { label: 'Food Diary', icon: '🍽️', href: 'diary' },
    { label: 'Workouts', icon: '🏋️', href: 'workouts' },
    { label: 'Analytics', icon: '📈', href: 'analytics' },
    { label: 'Profile', icon: '👤', href: 'profile' },
    { label: 'Settings', icon: '⚙️', href: 'settings' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          MacroTracker
        </h1>
      </div>

      <nav className="flex-1 p-4">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => setActiveLink(link.href)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
              activeLink === link.href
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span className="text-sm font-medium">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </div>
  );
};

export const Navbar = ({ activeLink, setActiveLink, darkMode, setDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          MacroTracker
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex flex-col p-4">
            {[
              { label: 'Dashboard', icon: '📊', href: 'dashboard' },
              { label: 'Food Diary', icon: '🍽️', href: 'diary' },
              { label: 'Workouts', icon: '🏋️', href: 'workouts' },
              { label: 'Analytics', icon: '📈', href: 'analytics' },
              { label: 'Profile', icon: '👤', href: 'profile' },
              { label: 'Settings', icon: '⚙️', href: 'settings' },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setActiveLink(link.href);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                  activeLink === link.href
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export const MobileNav = ({ activeLink, setActiveLink }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around">
        {[
          { label: '📊', href: 'dashboard' },
          { label: '🍽️', href: 'diary' },
          { label: '🏋️', href: 'workouts' },
          { label: '📈', href: 'analytics' },
          { label: '👤', href: 'profile' },
          { label: '⚙️', href: 'settings' },
        ].map((link) => (
          <button
            key={link.href}
            onClick={() => setActiveLink(link.href)}
            className={`flex-1 py-3 text-center transition-all ${
              activeLink === link.href
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
