import { motion } from 'motion/react';
import { Users, Copy, Check, Share2, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type User } from '../constants';
import { cn } from '../lib/utils';

interface MyTeamProps {
  user: User;
  onBack: () => void;
}

export function MyTeam({ user, onBack }: MyTeamProps) {
  const [copied, setCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'team' | 'leaderboard'>('team');
  const [leaderboard, setLeaderboard] = useState<{ name: string; avatar?: string; count: number; email: string }[]>([]);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
    
    // Fetch my referrals
    const myReferrals = savedUsers.filter((u: any) => u.referredBy === user.referralCode);
    setTeamMembers(myReferrals);

    // Calculate Leaderboard
    const referralCounts: Record<string, { name: string; avatar?: string; count: number; email: string }> = {};
    
    savedUsers.forEach((u: User) => {
      if (u.referredBy) {
        const referrer = savedUsers.find((ref: User) => ref.referralCode === u.referredBy);
        if (referrer) {
          if (!referralCounts[referrer.email]) {
            referralCounts[referrer.email] = { 
              name: referrer.name, 
              avatar: referrer.avatar, 
              count: 0,
              email: referrer.email 
            };
          }
          referralCounts[referrer.email].count++;
        }
      }
    });

    const sortedLeaderboard = Object.values(referralCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    setLeaderboard(sortedLeaderboard);
  }, [user.referralCode]);

  const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMembers = teamMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">My Team</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Network Overview</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setView('team')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
              view === 'team' ? "bg-primary text-black" : "text-gray-500"
            )}
          >
            Network
          </button>
          <button 
            onClick={() => setView('leaderboard')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
              view === 'leaderboard' ? "bg-primary text-black" : "text-gray-500"
            )}
          >
            Rankings
          </button>
        </div>
      </header>

      {view === 'team' ? (
        <>
          {/* Referral Card */}
          <div className="glass-card border border-primary/20 bg-primary/5 p-6 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Share2 size={120} className="text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <UserPlus size={16} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Invite Friends</span>
              </div>

              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Your Referral Link</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-300 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                  {referralLink}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-primary text-black p-3 rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(0,200,83,0.4)]"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Total Team</p>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <span className="text-2xl font-black text-white">{teamMembers.length}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Your Code</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-primary font-mono">{user.referralCode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & List */}
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search Member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary/50 transition-all text-white font-bold"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Team Directory</h3>
              
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-white/5">
                  <Users size={48} className="mx-auto text-gray-700 mb-3" />
                  <p className="text-sm font-bold text-gray-500">No team members found</p>
                  <p className="text-[10px] text-gray-600 uppercase font-black mt-1">Start sharing your link to grow your team</p>
                </div>
              ) : (
                filteredMembers.map((member, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={member.email} 
                    className="glass-card border border-white/5 p-4 rounded-3xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-black text-lg">{member.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{member.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold">{member.email}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase border border-primary/20">Active Member</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="p-2 bg-white/5 rounded-xl text-gray-500">
                        <Users size={14} />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="glass-card border border-yellow-500/20 bg-yellow-500/5 p-6 rounded-[2.5rem] relative overflow-hidden mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase">Top Referrers</h3>
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Global Hall of Fame</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-xs font-bold text-gray-500 uppercase">No data available yet</p>
              </div>
            ) : (
              leaderboard.map((entry, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={entry.email} 
                  className={cn(
                    "glass-card border p-4 rounded-3xl flex items-center justify-between",
                    i === 0 ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      <span className={cn(
                        "text-sm font-black",
                        i === 0 ? "text-yellow-500 text-xl" : "text-gray-600"
                      )}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                          {entry.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{entry.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{entry.email === user.email ? "That's You!" : "Elite Referrer"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{entry.count}</p>
                    <p className="text-[8px] text-gray-500 font-black uppercase">Refers</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
