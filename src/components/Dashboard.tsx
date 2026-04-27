import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CryptoChart } from './CryptoChart';
import { RECENT_TRANSACTIONS, type User } from '../constants';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-glow-green">Welcome back,</h2>
          <p className="text-gray-400 text-sm">{user.name.split(' ')[0]}, check your portfolio updates.</p>
        </div>
        <div className="h-10 w-10 rounded-full border border-primary/30 p-1 bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-xs">{user.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-card rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={80} className="text-primary" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Main Wallet</p>
            <h1 className="text-2xl font-black tracking-tight">${(user.balance ?? 0).toLocaleString()}</h1>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-primary text-xs font-bold uppercase tracking-wider">Mining Wallet</p>
            <h1 className="text-2xl font-black tracking-tight text-white">${(user.miningBalance ?? 0).toLocaleString()}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Daily Profit
            </p>
            <p className="text-xl font-black text-primary">+${((user.profit ?? 0) / 10).toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Mining Rate</p>
            <p className="text-xl font-black">{user.miningPower} TH/s</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          Market Statistics
        </h3>
        <div className="glass-card rounded-2xl p-4">
          <CryptoChart />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button className="text-primary text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {RECENT_TRANSACTIONS.map((tx, i) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass border border-white/5 p-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  tx.type === 'deposit' ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
                )}>
                  {tx.type === 'deposit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold capitalize">{tx.type} via {tx.method}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold",
                  tx.type === 'deposit' ? "text-primary" : "text-red-500"
                )}>
                  {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  {tx.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
