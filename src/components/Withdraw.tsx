import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowRight, AlertCircle, History, Filter, Calendar, X, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { RECENT_TRANSACTIONS, type User } from '../constants';

interface WithdrawProps {
  user: User;
}

export const Withdraw = ({ user }: WithdrawProps) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val < 7) {
      alert("Minimum withdrawal is $7.00");
      return;
    }
    if (!address.trim()) {
      alert("Please enter a wallet address.");
      return;
    }
    if (val > user.profit) {
      alert("Insufficient profit balance.");
      return;
    }

    setIsSubmitting(true);

    const commission = val * 0.07;
    const netAmount = val - commission;
    const newTxId = 'WDR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Create real request for admin
    const newRequest = {
      id: newTxId,
      type: 'Withdrawal',
      amount: val,
      fee: commission,
      netAmount: netAmount,
      user: user.name,
      userEmail: user.email,
      status: 'pending',
      date: new Date().toISOString(),
      address: address
    };

    const savedRequests = JSON.parse(localStorage.getItem('lumix_requests') || '[]');
    localStorage.setItem('lumix_requests', JSON.stringify([...savedRequests, newRequest]));

    // Deduct from profit locally and globally
    const updatedUser = { ...user, profit: user.profit - val };
    
    // Update lumix_users
    const savedUsersStr = localStorage.getItem('lumix_users') || '[]';
    const savedUsers: User[] = JSON.parse(savedUsersStr);
    const updatedUsers = savedUsers.map(u => u.email === user.email ? updatedUser : u);
    localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));
    
    // Update lumix_current_user
    localStorage.setItem('lumix_current_user', JSON.stringify(updatedUser));

    // Force page refresh or state update in parent would be better, but for now we'll rely on the alert and simulated async
    setTimeout(() => {
      setIsSubmitting(false);
      setAmount('');
      setAddress('');
      alert("Withdrawal request submitted successfully! Funds have been deducted and are pending admin approval.");
      window.location.reload(); // Simple way to sync all states
    }, 1500);
  };

  const userRequests = JSON.parse(localStorage.getItem('lumix_requests') || '[]')
    .filter((r: any) => r.userEmail === user.email)
    .map((r: any) => ({
      id: r.id,
      type: r.type.toLowerCase() as 'deposit' | 'withdraw',
      amount: r.amount,
      status: r.status,
      date: r.date.split('T')[0],
      method: r.method || r.address || r.type
    }));

  const filteredHistory = [...RECENT_TRANSACTIONS, ...userRequests].filter(t => {
    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    
    // Status filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    
    // Date range filter
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-glow-green">Withdraw Funds</h2>
        <p className="text-gray-400 text-sm">Securely transfer profits to your private wallet.</p>
      </header>

      <div className="glass-card rounded-3xl p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Wallet size={100} className="text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Trading Capital</p>
            <p className="text-xl font-bold text-white opacity-40">${user.balance.toLocaleString()}</p>
            <span className="text-[8px] text-gray-500 font-bold uppercase">Locked for Mining</span>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 relative group">
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,200,83,0.8)]" />
            </div>
            <p className="text-[10px] text-primary uppercase font-black tracking-wider mb-1">Profit Wallet</p>
            <p className="text-xl font-bold text-primary">${user.profit.toLocaleString()}</p>
            <button 
              onClick={() => setAmount(user.profit.toString())}
              className="mt-2 w-full text-[10px] font-black text-black bg-primary rounded-lg py-1 hover:bg-white transition-all uppercase"
            >
              Use All
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-gray-400">Withdrawal Amount ($)</label>
              <span className="text-[10px] font-black text-orange-500 uppercase">Min: $7.00</span>
            </div>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-bold text-white font-mono"
              />
            </div>

            {parseFloat(amount) > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2"
              >
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-gray-500">Service Fee (7%)</span>
                  <span className="text-red-400">-${(parseFloat(amount) * 0.07).toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-gray-400">Net Arrival</span>
                  <span className="text-primary">${(parseFloat(amount) * 0.93).toFixed(2)}</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Wallet Address (TRC20/BTC)</label>
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your wallet address"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Withdrawal Policy</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Only funds in your <span className="text-white font-bold">Profit Wallet</span> (Mining earnings & commissions) are withdrawable. Main Balance is reserved for trading and mining operations.
            </p>
          </div>
        </div>

        <button 
          onClick={handleWithdraw}
          disabled={isSubmitting || !amount || parseFloat(amount) < 7 || !address}
          className="w-full bg-primary disabled:opacity-50 disabled:grayscale hover:bg-primary/90 text-black font-bold py-4 rounded-2xl transition-all glow-green active:scale-95 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
          ) : (
            "Submit Withdrawal Request"
          )}
        </button>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History size={20} className="text-primary" />
            Withdrawal History
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-xl transition-all",
              showFilters || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "bg-white/5 text-gray-400 hover:text-white"
            )}
          >
            <Filter size={18} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Filter by Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[10px] font-bold uppercase focus:outline-none focus:border-primary transition-all text-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Filter by Type</label>
                    <select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[10px] font-bold uppercase focus:outline-none focus:border-primary transition-all text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdraw">Withdrawals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Start Date</label>
                    <div className="relative">
                      <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-2 text-[10px] focus:outline-none focus:border-primary transition-all text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative">
                      <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-2 text-[10px] focus:outline-none focus:border-primary transition-all text-white"
                      />
                    </div>
                  </div>
                </div>

                {(statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate) && (
                  <button 
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-gray-400 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <X size={12} /> Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 glass border border-white/5 rounded-2xl">
              <History size={40} className="mx-auto mb-3 text-gray-700" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matching transactions</p>
              <p className="text-[10px] text-gray-600 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredHistory.map((tx, i) => (
              <div key={tx.id} className="glass border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{tx.method}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={cn("font-bold", tx.type === 'deposit' ? "text-primary text-glow-green" : "text-red-500")}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                  </p>
                  <p className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block border",
                    tx.status === 'pending' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                    tx.status === 'completed' ? "bg-primary/10 text-primary border-primary/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
