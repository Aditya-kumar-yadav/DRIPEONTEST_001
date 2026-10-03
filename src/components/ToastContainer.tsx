import React from 'react';
import { useApp } from '../AppContext';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999999] flex flex-col gap-3 w-full max-w-sm sm:max-w-md px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          // Detect specific types based on both type and message keyword context (Leetcode specifications)
          const msgLower = toast.message.toLowerCase();
          const isCancellation = msgLower.includes('cancel') || msgLower.includes('remove') || msgLower.includes('delete') || toast.type === 'error';
          const isSuccess = toast.type === 'success' || msgLower.includes('login') || msgLower.includes('success') || msgLower.includes('place') || msgLower.includes('authoriz') || msgLower.includes('apply') || msgLower.includes('done') || msgLower.includes('save') || msgLower.includes('update');

          let color = '#C9A96E'; // Default brand gold
          let IconElement = Info;
          let iconBg = 'bg-red-600/10';
          let iconColor = 'text-red-600';
          let ringColor = 'rgba(201,169,110,0.35)';

          if (isCancellation) {
            color = '#ef4444'; // Red cross for cancellation requested successfully
            IconElement = X;
            iconBg = 'bg-red-500/10';
            iconColor = 'text-red-400';
            ringColor = 'rgba(239, 68, 68, 0.35)';
          } else if (isSuccess) {
            color = '#10b981'; // Green tick for changes done, order taken, login success
            IconElement = Check;
            iconBg = 'bg-emerald-500/10';
            iconColor = 'text-emerald-400';
            ringColor = 'rgba(16, 185, 129, 0.35)';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              layout
              className="pointer-events-auto w-full bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden"
            >
              {/* Toast Inner Body matching clean professional theme */}
              <div className="flex items-center justify-between gap-4 p-4 min-h-[60px] relative">
                {/* Optional left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                <div className="flex items-center gap-3.5 flex-grow">
                  {/* Glowing circular icon matching category */}
                  <div 
                    className={`p-1.5 rounded-full ${iconBg} ${iconColor} border flex-shrink-0`}
                    style={{ borderColor: `${color}40`, boxShadow: `0 0 14px ${ringColor}` }}
                  >
                    <IconElement className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div className="flex-grow text-left">
                    <p className="text-xs sm:text-sm font-sans font-medium text-gray-900 leading-relaxed">
                      {toast.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="flex-shrink-0 text-gray-500 hover:text-gray-900 transition-colors p-1.5 -mr-1 rounded-full hover:bg-white/5 cursor-pointer flex items-center justify-center"
                  style={{ cursor: 'pointer' }}
                  title="Close Notification"
                >
                  <X className="w-4 h-4 shadow-sm" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
