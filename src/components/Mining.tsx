import { motion } from 'motion/react';
import { Zap, Cpu, HardDrive, CheckCircle2, Power } from 'lucide-react';
import { MINING_PLANS, type User } from '../constants';
import { cn } from '../lib/utils';

interface MiningProps {
  user: User;
  onToggleMining: (planId: string, isOn: boolean) => boolean;
}

export const Mining = ({ user, onToggleMining }: MiningProps) => {
  const iconMap: any = { Zap, Cpu, HardDrive };

  const handleToggle = (planId: string) => {
    const isActive = (user.activeNodes || []).includes(planId);
    
    if (isActive && !user.isAdmin) {
      alert("Access Denied: Only administrators can power down compute nodes.");
      return;
    }
    
    const nextState = !isActive;
    onToggleMining(planId, nextState);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-glow-green">Mining Center</h2>
          <p className="text-gray-400 text-sm">Deploy compute nodes to generate daily returns.</p>
        </div>
        {user.isAdmin && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Admin Control Mode</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {MINING_PLANS.map((plan, i) => {
          const Icon = iconMap[plan.icon] || Zap;
          const isFeatured = plan.id === 'pro';
          const isActive = (user.activeNodes || []).includes(plan.id);
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "rounded-3xl p-6 relative overflow-hidden group border transition-all duration-500",
                isFeatured 
                  ? "bg-primary text-black border-primary shadow-[0_0_30px_rgba(0,200,83,0.3)]" 
                  : "gradient-card border-white/5",
                isActive && !isFeatured && "border-primary/50 shadow-[0_0_20px_rgba(0,200,83,0.1)]"
              )}
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={120} className={cn(isFeatured ? "text-black" : "text-primary", "rotate-12")} />
              </div>

              <div className="flex items-start justify-between">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
                  isFeatured ? "bg-black/10 text-black border border-black/10" : "bg-primary/10 text-primary glow-green"
                )}>
                  <Icon size={24} />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(plan.id);
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                      isActive ? "bg-primary shadow-[0_0_10px_rgba(0,200,83,0.4)]" : "bg-white/10"
                    )}
                  >
                    <motion.div
                      animate={{ x: isActive ? 24 : 0 }}
                      className={cn(
                        "w-4 h-4 rounded-full shadow-sm",
                        isActive ? "bg-black" : "bg-gray-400"
                      )}
                    />
                  </button>
                  <div className="text-right">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
                      isFeatured ? "bg-black/10 text-black border border-black/10" : "bg-primary/10 text-primary border border-primary/20"
                    )}>
                      {plan.duration} Days
                    </span>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold uppercase text-primary">Active</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className={cn("text-xl font-black uppercase tracking-tight", isFeatured ? "text-black" : "text-white")}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={cn("text-3xl font-black", isFeatured ? "text-black" : "text-primary")}>+{plan.dailyProfit}%</p>
                  <p className={cn("text-sm font-bold opacity-60", isFeatured ? "text-black" : "text-gray-500")}>Daily ROI</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  `Min Investment: $${plan.minInvestment}`,
                  'Automated Payouts',
                  'Secure Hash Protocol'
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                    <CheckCircle2 size={16} className={isFeatured ? "text-black" : "text-primary"} />
                    <span className={isFeatured ? "text-black/80" : "text-gray-400"}>{perk}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleToggle(plan.id)}
                className={cn(
                   "w-full mt-6 font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2",
                  isActive 
                    ? (user.isAdmin ? "bg-white/10 text-white border border-white/10 hover:bg-white/20" : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed")
                    : (isFeatured ? "bg-black text-white hover:bg-black/90 shadow-[0_0_20px_rgba(0,0,0,0.2)]" : "bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(0,200,83,0.3)]")
                )}
              >
                <Power size={18} className={cn(isActive ? (user.isAdmin ? "text-primary animate-pulse" : "text-gray-600") : "")} />
                {isActive 
                  ? (user.isAdmin ? 'Power Off Node' : 'Node Running (Locked)')
                  : (isFeatured ? 'Upgrade Now' : 'Deploy Node')}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

