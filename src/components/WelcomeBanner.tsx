import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useEffect } from 'react';

interface WelcomeBannerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const WelcomeBanner = ({ isOpen, onClose, userName }: WelcomeBannerProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="w-full max-w-sm glass-card rounded-[2.5rem] p-8 border border-primary/30 relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,200,83,0.2)]"
          >
            {/* Animated particles background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <motion.div 
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px]" 
              />
            </div>

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_20px_rgba(0,200,83,0.3)]"
              >
                <ShieldCheck size={40} className="text-primary" />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-black text-white uppercase tracking-tight mb-2"
              >
                Wellcome To <span className="text-primary text-glow-green">CRYPTOMAX</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-sm mb-8 leading-relaxed"
              >
                Hello {userName.split(' ')[0]}! Your account is ready. Access the world's most advanced cloud mining nodes from Singapore HQ.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all glow-green group"
              >
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <button 
                onClick={onClose}
                className="mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors"
              >
                Dismiss
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
