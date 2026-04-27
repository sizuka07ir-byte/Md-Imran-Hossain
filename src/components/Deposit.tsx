import { motion, AnimatePresence } from 'motion/react';
import { Landmark, ArrowRight, Bitcoin, CircleDollarSign, History, Copy, Check, Upload, ArrowLeft, ShieldCheck, Filter, Calendar, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { RECENT_TRANSACTIONS, type User } from '../constants';

interface DepositProps {
  user: User;
  onReturnToHome?: () => void;
  onDepositSuccess?: (amount: string, txId: string) => void;
}

export const Deposit = ({ user, onReturnToHome, onDepositSuccess }: DepositProps) => {
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('USDT');
  const [copying, setCopying] = useState(false);
  const [txId, setTxId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  
  // Filtering state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const WALLET_ADDRESS = "TG2DsXEivuteKbNycv8NFrQB8meNjnj81p";
  const MIN_DEPOSIT = 10;

  const methods = [
    { id: 'USDT', name: 'USDT (TRC20)', icon: CircleDollarSign, color: 'text-emerald-400' },
    { id: 'BTC', name: 'Bitcoin', icon: Bitcoin, color: 'text-orange-400' },
    { id: 'ETH', name: 'Ethereum', icon: Landmark, color: 'text-blue-400' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const generateTxId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'LMX-';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = () => {
    if (!screenshot) {
      alert("Please upload a screenshot of your transaction.");
      return;
    }
    const newTxId = generateTxId();
    setTxId(newTxId);
    
    // Create real request for admin
    const newRequest = {
      id: newTxId,
      type: 'Deposit',
      amount: parseFloat(amount),
      user: user.name,
      userEmail: user.email,
      status: 'pending',
      date: new Date().toISOString(),
      method: selectedMethod
    };

    const savedRequests = JSON.parse(localStorage.getItem('lumix_requests') || '[]');
    localStorage.setItem('lumix_requests', JSON.stringify([...savedRequests, newRequest]));

    if (onDepositSuccess) {
      onDepositSuccess((parseFloat(amount) + 1).toFixed(2), newTxId);
    }
    setStep('success');
  };

  const calculatedAmount = amount ? (parseFloat(amount) + 1).toFixed(2) : '0.00';

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
    <div className="space-y-6 pb-24">
      <header className="flex items-center gap-4">
        {step !== 'input' && (
          <button 
            onClick={() => step === 'success' ? setStep('input') : setStep('input')}
            className="h-10 w-10 rounded-full glass flex items-center justify-center text-primary"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-glow-green">Deposit Funds</h2>
          <p className="text-gray-400 text-sm">Add funds to your account via cryptocurrency.</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div 
            key="input-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-[2.5rem] p-8 space-y-6 border border-white/5 shadow-2xl"
          >
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Investment Method</label>
              <div className="grid grid-cols-1 gap-3">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,200,83,0.2)]" 
                          : "border-white/5 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl bg-white/5", isSelected ? "text-primary" : "text-gray-500")}>
                          <Icon size={20} />
                        </div>
                        <span className={cn("font-bold uppercase tracking-tight", isSelected ? "text-white" : "text-gray-400")}>{method.name}</span>
                      </div>
                      {isSelected && <motion.div layoutId="check" className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg"><ArrowRight size={12} className="text-black" /></motion.div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Enter Amount ($)</label>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter bg-red-500/10 px-2 py-0.5 rounded">Min: ${MIN_DEPOSIT}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-2xl font-black placeholder:text-gray-700"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-medium px-1">Note: A small gateway fee of $1.00 will be added to your total.</p>
            </div>

            <button 
              disabled={!amount || parseFloat(amount) < MIN_DEPOSIT}
              onClick={() => setStep('confirm')}
              className="w-full bg-primary disabled:opacity-50 disabled:grayscale hover:bg-primary/90 text-black font-black py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,200,83,0.4)] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              Transfer Funds <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div 
            key="confirm-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-[2.5rem] p-8 space-y-6 border border-white/5">
              <div className="text-center space-y-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Amount to Send</p>
                <h1 className="text-5xl font-black text-primary text-glow-green">${calculatedAmount}</h1>
                <p className="text-[10px] text-gray-500 underline decoration-primary/30">Includes ${amount} deposit + $1 gateway fee</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Wallet Address ({selectedMethod})</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between font-mono text-xs break-all">
                      {WALLET_ADDRESS}
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      {copying ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Evidence of Payment</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className={cn(
                      "w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all",
                      screenshot ? "border-primary bg-primary/5" : "border-white/10 bg-white/5 group-hover:border-primary/50"
                    )}>
                      {screenshot ? (
                        <>
                          <Check size={40} className="text-primary mb-2" />
                          <p className="text-sm font-bold text-white truncate max-w-xs">{screenshot.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase mt-1">Ready to submit</p>
                        </>
                      ) : (
                        <>
                          <Upload size={40} className="text-gray-500 mb-2 group-hover:text-primary transition-colors" />
                          <p className="text-sm font-bold text-gray-400">Click to Upload Screenshot</p>
                          <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">JPEG, PNG, WEBP</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-black font-black py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,200,83,0.4)] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                Confirm Deposit <Check size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-card rounded-[2.5rem] p-8 text-center space-y-8 border border-primary/20 shadow-[0_0_50px_rgba(0,200,83,0.15)]"
          >
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-full h-full bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(0,200,83,0.3)]">
                <ShieldCheck size={48} className="text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Deposit Queued</h2>
              <p className="text-gray-400 text-sm font-medium">Your transaction receipt has been submitted for node validation.</p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-5 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Transaction Identification</span>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-primary font-mono font-bold text-sm tracking-tighter">{txId}</span>
                  <Copy size={14} className="text-gray-600 cursor-pointer hover:text-primary transition-colors" onClick={() => navigator.clipboard.writeText(txId)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Amount Paid</span>
                  <p className="text-xl font-black text-white">${calculatedAmount}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Status</span>
                  <div className="flex justify-end">
                    <p className="text-[10px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-lg">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
              <Landmark size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                Node verification is a 3-layer security process. Funds typically reflect in your dashboard within 5-15 minutes.
              </p>
            </div>

            <button 
              onClick={() => {
                if (onReturnToHome) onReturnToHome();
                else setStep('input');
              }}
              className="w-full bg-primary hover:bg-primary/90 text-black font-black py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,200,83,0.4)] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              Return to Dashboard <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 'input' && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History size={20} className="text-primary" />
              Deposit History
            </h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-xl transition-all",
                showFilters || statusFilter !== 'all' || startDate || endDate
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
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matching deposits</p>
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
                  <p className="font-bold text-primary text-glow-green">+${tx.amount}</p>
                  <p className="text-[10px] text-primary uppercase font-bold px-2 py-0.5 bg-primary/10 rounded-full inline-block border border-primary/20">
                    {tx.status}
                  </p>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  );
};

