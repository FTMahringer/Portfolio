'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useSettings();

  // Skip animations if reduced motion is enabled
  const shouldAnimate = !settings.reduceMotion;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={shouldAnimate ? { y: 10 } : {}}
        animate={shouldAnimate ? { y: 0 } : {}}
        exit={shouldAnimate ? { y: -10 } : {}}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
