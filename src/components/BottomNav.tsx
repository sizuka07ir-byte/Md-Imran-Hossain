import { motion } from 'motion/react';
import { Home, Landmark, Cpu, Wallet, User, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { type User as UserType } from '../constants';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType;
}

export const BottomNav = ({ activeTab, setActiveTab, user }: BottomNavProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'deposit', label: 'Deposit', icon: Landmark },
    { id: 'mining', label: 'Mining', icon: Cpu },
    { id: 'withdraw', label: 'Withdraw', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (user.isAdmin) {
    tabs.splice(4, 0, { id: 'admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 px-2 pb-6 pt-3 md:pb-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center p-2 group"
            >
              <div className={cn(
                "transition-all duration-300 mb-1",
                isActive ? "text-primary scale-110" : "text-gray-400 group-hover:text-gray-200"
              )}>
                <Icon size={24} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "text-primary opacity-100" : "text-gray-500 opacity-60"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute -top-1 w-8 h-1 bg-primary rounded-full blur-[4px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
