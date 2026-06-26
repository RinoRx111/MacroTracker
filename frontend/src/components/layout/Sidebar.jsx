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
    <div className="hidden md:flex flex-col w-64 bg-[var(--bg-card)] border-r border-[var(--border-main)] h-screen sticky top-0">
      <div className="p-6 border-b border-[var(--border-main)]">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          MacroTracker
        </h1>
      </div>

      <nav className="flex-1 p-4">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => setActiveLink(link.href)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all mb-2 border-l-4 rounded-r-lg ${
              activeLink === link.href
                ? 'border-[var(--accent-primary)] bg-[var(--bg-card-tint)] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-tint)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-main)]">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card-tint)] hover:bg-[var(--border-main)] text-[var(--text-primary)] transition"
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
    <div className="md:hidden sticky top-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border-main)]">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          MacroTracker
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-2xl text-[var(--text-primary)]"
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-main)]">
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
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all mb-2 border-l-4 rounded-r-lg ${
                  activeLink === link.href
                    ? 'border-[var(--accent-primary)] bg-[var(--bg-card-tint)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-tint)] hover:text-[var(--text-primary)]'
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-main)] z-40">
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
            className={`flex-1 py-3 text-center transition-all border-t-2 ${
              activeLink === link.href
                ? 'border-[var(--accent-primary)] bg-[var(--bg-card-tint)] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            <span className="text-2xl">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
