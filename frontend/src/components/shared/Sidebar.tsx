// frontend/src/components/shared/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, Utensils, Scale, BarChart3, 
  Settings, User, Droplets, ChevronLeft, BookOpen 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';

interface SidebarProps {
  setCurrentPage: (page: string) => void;
  currentPage: string;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'logging', label: 'Food Log', icon: Utensils },
  { id: 'recipes', label: 'Recipe Builder', icon: BookOpen }, // Added Recipe Builder here
  { id: 'weight', label: 'Weight Tracker', icon: Scale },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'water', label: 'Hydration', icon: Droplets },
];

export const Sidebar: React.FC<SidebarProps> = ({ setCurrentPage, currentPage }) => {
  const { toggleSidebar } = useAppStore();

  return (
    <div className="w-64 h-full bg-surface border-r border-border flex flex-col p-4 relative">
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xs">NP</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            NutriPremium
          </h1>
        </div>
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-border text-zinc-500 hover:text-white transition-all">
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Main Menu</p>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-border'
              }`}
            >
              <item.icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110'}`} />
              <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              {isActive && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Account</p>
        <button onClick={() => setCurrentPage('profile')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${currentPage === 'profile' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-border'}`}>
          <User size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Profile</span>
        </button>
        <button onClick={() => setCurrentPage('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${currentPage === 'settings' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-border'}`}>
          <Settings size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};
