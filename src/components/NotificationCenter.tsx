import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Notification } from '../constants';
import { cn } from '../lib/utils';

interface NotificationCenterProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCenter = ({ notifications, isOpen, onClose, onMarkAsRead }: NotificationCenterProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm glass border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                <h3 className="font-bold text-lg uppercase tracking-wider">Alert Center</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Bell size={48} className="mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No active alerts</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div 
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer",
                      notif.read ? "bg-white/5 border-white/5" : "bg-primary/5 border-primary/20 shadow-lg"
                    )}
                    onClick={() => onMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 p-1.5 rounded-lg",
                        notif.type === 'deposit' ? "bg-orange-500/10 text-orange-500" : 
                        notif.type === 'mining' ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {notif.status === 'pending' ? <Clock size={14} /> : 
                         notif.status === 'completed' ? <CheckCircle2 size={14} /> : <Bell size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm font-bold", !notif.read && "text-white")}>{notif.title}</h4>
                          <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0 ml-2">{notif.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{notif.message}</p>
                        {notif.status === 'pending' && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" /> Verifying on-chain...
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.some(n => !n.read) && (
              <div className="p-4 border-t border-white/5">
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors">
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
