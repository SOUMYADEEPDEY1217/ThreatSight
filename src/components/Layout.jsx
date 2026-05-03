import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ThreeBackground from './ThreeBackground';
import AppSidebar from './AppSidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background relative">
      <ThreeBackground />
      <AppSidebar />
      <MobileNav />
      <main
        className="flex-1 md:p-8 p-4 pb-24 md:pb-8 overflow-auto relative z-10"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 2rem)' }}
      >
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
