import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoaderProps {
  isLoading: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#101010] select-none"
        >
          {/* 3 Staggered Dots */}
          <div className="flex items-center gap-3 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-3 h-3 rounded-full block shadow-[0_0_12px_var(--accent-glow)]"
                style={{ backgroundColor: 'var(--accent)' }}
                animate={{
                  y: [0, -12, 0],
                  opacity: [0.75, 1, 0.75],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.18,
                }}
              />
            ))}
          </div>

          {/* Loader text matching Image 4 */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white text-xl sm:text-[20px] font-normal tracking-tight"
          >
            Just a moment.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
