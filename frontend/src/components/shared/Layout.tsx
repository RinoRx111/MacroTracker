// frontend/src/components/shared/Layout.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps { 
  children: React.ReactNode; 
  setCurrentPage: (page: string) => void; 
  currentPage: string; 
}

export const Layout: React.FC<LayoutProps> = ({ children, setCurrentPage, currentPage }) => {
  const { isSidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen w-full bg-panel text-white overflow-hidden font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="h-full z-50"
          >
            <Sidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
