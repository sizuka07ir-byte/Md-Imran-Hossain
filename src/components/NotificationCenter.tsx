import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, Clock, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Notification } from '../constants';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';

interface NotificationCenterProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCenter = ({ notifications, isOpen, onClose, onMarkAsRead }: NotificationCenterProps) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'deposits' | 'withdrawals'>('alerts');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const savedRequests = JSON.parse(localStorage.getItem('lumix_requests') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('lumix_current_user') || '{}');
      const userTransactions = savedRequests.filter((req: any) => req.userEmail === currentUser.email);
      setTransactions(userTransactions);
    }
  }, [isOpen]);

  const deposits = transactions.filter(t => t.type === 'Deposit');
  const withdrawals = transactions.filter(t => t.type === 'Withdrawal');

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
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {activeTab === 'alerts' && <Bell size={20} className="text-primary" />}
                  {activeTab === 'deposits' && <ArrowDownLeft size={20} className="text-orange-500" />}
                  {activeTab === 'withdrawals' && <ArrowUpRight size={20} className="text-primary" />}
                  <h3 className="font-bold text-lg uppercase tracking-wider">
                    {activeTab === 'alerts' ? 'Alerts' : activeTab === 'deposits' ? 'Deposits' : 'Withdrawals'}
                  </h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                {[
                  { id: 'alerts', label: 'Alerts', icon: Bell, count: notifications.length },
                  { id: 'deposits', label: 'Deposits', icon: ArrowDownLeft, count: deposits.length },
                  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight, count: withdrawals.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all",
                      activeTab === tab.id ? "bg-primary text-black shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight">
                      <tab.icon size={12} />
                      {tab.label}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 rounded-full",
                      activeTab === tab.id ? "bg-black/20" : "bg-white/10"
                    )}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeTab === 'alerts' && (
                notifications.length === 0 ? (
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
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {activeTab === 'deposits' && (
                deposits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                    <ArrowDownLeft size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-center">No deposit history</p>
                  </div>
                ) : (
                  deposits.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <DollarSign size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold">${tx.amount}</p>
                            <p className="text-[8px] text-gray-500 font-mono">{tx.id}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase border",
                          tx.status === 'pending' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                          tx.status === 'approved' ? "bg-primary/10 text-primary border-primary/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] text-gray-500 font-bold uppercase">
                        <Clock size={10} />
                        {new Date(tx.date).toLocaleString()}
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'withdrawals' && (
                withdrawals.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                    <ArrowUpRight size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-center">No withdrawal history</p>
                  </div>
                ) : (
                  withdrawals.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <DollarSign size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold">${tx.amount}</p>
                            <p className="text-[8px] text-gray-500 font-mono">{tx.id}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase border",
                          tx.status === 'pending' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                          tx.status === 'approved' ? "bg-primary/10 text-primary border-primary/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] text-gray-500 font-bold uppercase">
                        <Clock size={10} />
                        {new Date(tx.date).toLocaleString()}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            {activeTab === 'alerts' && notifications.some(n => !n.read) && (
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
