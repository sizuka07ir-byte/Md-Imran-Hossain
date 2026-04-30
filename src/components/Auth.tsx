import { motion } from 'motion/react';
import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: (name: string, email: string, isLogin: boolean, referralCode?: string) => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_15px_rgba(0,200,83,0.3)]">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-glow-green">CRYPTOMAX</h1>
          <p className="text-gray-400 font-medium">Digital Assets Ecosystem</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
          <div className="flex bg-white/5 rounded-2xl p-1">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                isLogin ? "bg-primary text-black shadow-[0_0_10px_rgba(0,200,83,0.4)]" : "text-gray-500 hover:text-gray-300"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                !isLogin ? "bg-primary text-black shadow-[0_0_10px_rgba(0,200,83,0.4)]" : "text-gray-500 hover:text-gray-300"
              )}
            >
              Register
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => { 
            e.preventDefault(); 
            if (!email || !password || (!isLogin && !name)) {
              alert("Please fill in all fields.");
              return;
            }
            onLogin(name, email, isLogin, referralCode); 
          }}>
            {!isLogin && (
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Share2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Referral Code (Optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                />
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-primary text-xs font-bold hover:underline">Forgot Password?</button>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-2xl transition-all glow-green active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-[0_0_15px_rgba(0,200,83,0.3)]"
            >
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>

          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Secure Gateway</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Singapore Node</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
