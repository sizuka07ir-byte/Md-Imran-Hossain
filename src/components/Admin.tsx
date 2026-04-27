import { motion, AnimatePresence } from 'motion/react';
import { Users, DollarSign, Activity, Settings, Search, Check, X, MoreVertical, TrendingUp, UserMinus, ShieldAlert, MessageCircle, Send, Trash2, Zap, Cpu, HardDrive, Power } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { type User, type Transaction, type SupportMessage, DUMMY_USER, MINING_PLANS } from '../constants';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'stats' | 'support' | 'system'>('users');
  const [requests, setRequests] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [selectedUserChat, setSelectedUserChat] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
    // Ensure unique users by filtering out any that match the DUMMY_USER email
    const uniqueSavedUsers = savedUsers.filter((u: User) => u.email !== DUMMY_USER.email);
    setUsers([DUMMY_USER, ...uniqueSavedUsers]);

    // Load support messages
    const savedMessages = localStorage.getItem('lumix_support_messages');
    if (savedMessages) {
      setSupportMessages(JSON.parse(savedMessages));
    }

    // Load requests
    const savedRequests = JSON.parse(localStorage.getItem('lumix_requests') || '[]');
    if (savedRequests.length === 0) {
      // Add some sample requests if none exist
      const initialRequests = [
        { id: 'LMX-1001', type: 'Deposit', amount: 250, user: 'John Doe', userEmail: 'john@example.com', status: 'pending', date: new Date().toISOString() },
        { id: 'LMX-1002', type: 'Withdrawal', amount: 120, user: 'Jane Smith', userEmail: 'jane@example.com', status: 'pending', date: new Date().toISOString() },
      ];
      setRequests(initialRequests);
      localStorage.setItem('lumix_requests', JSON.stringify(initialRequests));
    } else {
      setRequests(savedRequests);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedUserChat, supportMessages]);

  const handleReply = (userEmail: string, userName: string) => {
    if (!replyInput.trim()) return;
    
    const newMessage: SupportMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userEmail,
      userName,
      content: replyInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'admin',
      isRead: true
    };

    const updatedMessages = [...supportMessages, newMessage];
    setSupportMessages(updatedMessages);
    localStorage.setItem('lumix_support_messages', JSON.stringify(updatedMessages));
    setReplyInput('');
  };

  const markChatAsRead = (userEmail: string) => {
    const updatedMessages = supportMessages.map(m => 
      m.userEmail === userEmail && m.sender === 'user' ? { ...m, isRead: true } : m
    );
    setSupportMessages(updatedMessages);
    localStorage.setItem('lumix_support_messages', JSON.stringify(updatedMessages));
  };

  const handleRequest = (id: string, action: 'approved' | 'rejected') => {
    const updatedRequests = requests.map(req => {
      if (req.id === id) {
        if (req.status !== 'pending') return req; // Already processed

        if (action === 'approved') {
          // Update user balance
          const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
          const updatedUsers = savedUsers.map((u: User) => {
            if (u.email === req.userEmail) {
              const amount = parseFloat(req.amount);
              if (req.type === 'Deposit') {
                return { ...u, balance: (u.balance || 0) + amount };
              }
            }
            return u;
          });
          
          localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));
          
          // Also update current view users
          setUsers(prev => prev.map(u => {
            if (u.email === req.userEmail) {
              const amount = parseFloat(req.amount);
              if (req.type === 'Deposit') {
                return { ...u, balance: (u.balance || 0) + amount };
              }
            }
            return u;
          }));

          // If the admin themselves is the user:
          const currentUserStr = localStorage.getItem('lumix_current_user');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser.email === req.userEmail) {
              const amount = parseFloat(req.amount);
              if (req.type === 'Deposit') {
                localStorage.setItem('lumix_current_user', JSON.stringify({ ...currentUser, balance: (currentUser.balance || 0) + amount }));
              }
            }
          }
        } else if (action === 'rejected' && req.type === 'Withdrawal') {
          // If withdrawal is rejected, return the funds to the user's profit balance
          const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
          const amount = parseFloat(req.amount);
          const updatedUsers = savedUsers.map((u: User) => {
            if (u.email === req.userEmail) {
              return { ...u, profit: (u.profit || 0) + amount };
            }
            return u;
          });
          localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));
          
          setUsers(prev => prev.map(u => {
            if (u.email === req.userEmail) {
              return { ...u, profit: (u.profit || 0) + amount };
            }
            return u;
          }));

          const currentUserStr = localStorage.getItem('lumix_current_user');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser.email === req.userEmail) {
              localStorage.setItem('lumix_current_user', JSON.stringify({ ...currentUser, profit: (currentUser.profit || 0) + amount }));
            }
          }
        }
        return { ...req, status: action };
      }
      return req;
    });

    setRequests(updatedRequests);
    localStorage.setItem('lumix_requests', JSON.stringify(updatedRequests));
  };

  const statsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Platform Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        fill: true,
        borderColor: '#00C853',
        backgroundColor: 'rgba(0, 200, 83, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const deleteUser = (email: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      const updatedUsers = users.filter(u => u.email !== email);
      setUsers(updatedUsers);
      
      // Persist to localStorage
      const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
      const newSavedUsers = savedUsers.filter((u: User) => u.email !== email);
      localStorage.setItem('lumix_users', JSON.stringify(newSavedUsers));
    }
  };

  const toggleBan = (email: string) => {
    const updatedUsers = users.map(u => 
      u.email === email ? { ...u, isBanned: !u.isBanned } : u
    );
    setUsers(updatedUsers);
    
    // Persist to localStorage
    const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
    const newSavedUsers = savedUsers.map((u: User) => 
      u.email === email ? { ...u, isBanned: !u.isBanned } : u
    );
    localStorage.setItem('lumix_users', JSON.stringify(newSavedUsers));

    // If we're banning the current user, they'll be kicked out on refresh or next action
    const currentUser = JSON.parse(localStorage.getItem('lumix_current_user') || '{}');
    if (currentUser.email === email) {
      localStorage.setItem('lumix_current_user', JSON.stringify({ ...currentUser, isBanned: !currentUser.isBanned }));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGlobalNodeToggle = (planId: string, turnOff: boolean) => {
    if (!turnOff) {
      alert("Mass activation is not currently supported via Global Toggle. Users must deploy nodes individually.");
      return;
    }

    if (!window.confirm(`DANGER: You are about to SHUT DOWN all active "${planId}" nodes globally. All affected users will receive their balance back PLUS a 3% bonus. Proceed?`)) {
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('lumix_users') || '[]');
    let affectedCount = 0;
    
    const updatedUsers = savedUsers.map((u: User) => {
      if ((u.activeNodes || []).includes(planId)) {
        affectedCount++;
        const investment = Number(u.miningBalance || 0);
        const bonus = investment * 0.03;
        return {
          ...u,
          balance: Number(u.balance || 0) + investment + bonus,
          miningBalance: 0,
          activeNodes: (u.activeNodes || []).filter(id => id !== planId)
        };
      }
      return u;
    });

    localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers); // Update local state
    
    // Update admin if they were affected
    const currentUser = JSON.parse(localStorage.getItem('lumix_current_user') || '{}');
    const updatedMe = updatedUsers.find((u: User) => u.email === currentUser.email);
    if (updatedMe) {
      localStorage.setItem('lumix_current_user', JSON.stringify(updatedMe));
    }

    alert(`SUCCESS: Global shutdown complete. ${affectedCount} users were affected and compensated.`);
  };

  const getMiningStats = (planId: string) => {
    const activeUsers = users.filter(u => (u.activeNodes || []).includes(planId));
    const totalBalance = activeUsers.reduce((sum, u) => sum + (u.miningBalance || 0), 0);
    return { count: activeUsers.length, balance: totalBalance };
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Admin System</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Management Dashboard</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'stats', label: 'Analytics', icon: Activity },
          { id: 'transactions', label: 'Vault', icon: DollarSign },
          { id: 'support', label: 'Support', icon: MessageCircle },
          { id: 'system', label: 'System', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all duration-300 min-w-[100px]",
              activeTab === tab.id 
                ? "bg-white/10 text-white shadow-xl" 
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            <tab.icon size={16} />
            <span className="relative">
              {tab.label}
              {tab.id === 'support' && supportMessages.filter(m => m.sender === 'user' && !m.isRead).length > 0 && (
                <span className="absolute -top-1 -right-4 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user, i) => (
              <div key={user.email} className="glass-card border border-white/5 p-4 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <span className="text-gray-400 font-black">{user.name[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{user.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      {user.isAdmin && <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-md font-black uppercase border border-red-500/20">Admin</span>}
                      {user.isBanned && <span className="text-[8px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded-md font-black uppercase border border-gray-500/20">Banned</span>}
                      <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase border border-primary/20">Ref: {user.referralCode}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-sm font-black text-white">${(user.balance ?? 0).toLocaleString()}</p>
                  <div className="flex gap-1">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
                      <Settings size={14} />
                    </button>
                    {!user.isAdmin && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => toggleBan(user.email)}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            user.isBanned 
                              ? "bg-green-500/10 hover:bg-green-500/20 text-green-500" 
                              : "bg-red-500/10 hover:bg-red-500/20 text-red-500"
                          )}
                          title={user.isBanned ? "Unban User" : "Ban User"}
                        >
                          {user.isBanned ? <Check size={14} /> : <UserMinus size={14} />}
                        </button>
                        <button 
                          onClick={() => deleteUser(user.email)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'stats' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Revenue Growth</h3>
            <div className="h-[200px]">
              <Line 
                data={statsData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#666', font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } }
                  }
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-3xl border border-white/5">
              <TrendingUp className="text-primary mb-3" size={24} />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Total Users</p>
              <h4 className="text-2xl font-black">{users.length}</h4>
            </div>
            <div className="glass-card p-5 rounded-3xl border border-white/5">
              <DollarSign className="text-primary mb-3" size={24} />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Vault Value</p>
              <h4 className="text-2xl font-black">$42.8K</h4>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'transactions' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 px-1">Vault Operations</h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="glass-card border border-white/5 p-4 rounded-3xl group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      req.type === 'Deposit' ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500"
                    )}>
                      {req.type === 'Deposit' ? <DollarSign size={14} /> : <TrendingUp size={14} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">{req.type} Request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-mono">ID: {req.id}</span>
                    <span className={cn(
                      "text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase border",
                      req.status === 'pending' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                      req.status === 'approved' ? "bg-primary/10 text-primary border-primary/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {req.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{req.user}</p>
                    <p className="text-lg font-black text-white">${req.amount.toLocaleString()}</p>
                  </div>
                  {req.status === 'pending' ? (
                    <div className="flex gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRequest(req.id, 'rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all text-[10px] font-black uppercase"
                      >
                        <X size={14} /> Reject
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRequest(req.id, 'approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all text-[10px] font-black uppercase"
                      >
                        <Check size={14} /> Approve
                      </motion.button>
                    </div>
                  ) : (
                    <div className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase border",
                      req.status === 'approved' ? "bg-primary/5 text-primary/50 border-primary/10" : "bg-red-500/5 text-red-500/50 border-red-500/10"
                    )}>
                      {req.status === 'approved' ? <Check size={12} /> : <X size={12} />}
                      {req.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {activeTab === 'support' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            {/* User List */}
            <div className="md:col-span-1 glass-card border border-white/5 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Conversations</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                {Array.from(new Set(supportMessages.map(m => m.userEmail))).map((email: string) => {
                  const lastMsg = [...supportMessages].reverse().find(m => m.userEmail === email);
                  const unreadCount = supportMessages.filter(m => m.userEmail === email && m.sender === 'user' && !m.isRead).length;
                  return (
                    <button
                      key={email}
                      onClick={() => {
                        setSelectedUserChat(email);
                        markChatAsRead(email);
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left border transition-all",
                        selectedUserChat === email 
                          ? "bg-primary/10 border-primary/20" 
                          : "bg-white/5 border-transparent hover:bg-white/10"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[100px]">{lastMsg?.userName}</span>
                        {unreadCount > 0 && (
                          <span className="w-4 h-4 bg-primary text-black text-[8px] font-black rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{lastMsg?.content}</p>
                    </button>
                  );
                })}
                {supportMessages.length === 0 && (
                  <div className="p-8 text-center opacity-30">
                    <MessageCircle size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Active Chats</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 glass-card border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
              {selectedUserChat ? (
                <>
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {supportMessages.find(m => m.userEmail === selectedUserChat)?.userName}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">{selectedUserChat}</p>
                    </div>
                  </div>
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
                  >
                    {supportMessages
                      .filter(m => m.userEmail === selectedUserChat)
                      .map(msg => (
                        <div 
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[80%]",
                            msg.sender === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div className={cn(
                            "px-4 py-2 rounded-2xl text-[11px] font-medium",
                            msg.sender === 'admin' 
                              ? "bg-primary text-black rounded-tr-none" 
                              : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[8px] text-gray-600 mt-1 font-bold uppercase tracking-widest">{msg.timestamp}</span>
                        </div>
                      ))}
                  </div>
                  <div className="p-4 bg-white/5 border-t border-white/5">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(selectedUserChat, supportMessages.find(m => m.userEmail === selectedUserChat)?.userName || '')}
                        placeholder="Type reply..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                      />
                      <button 
                        onClick={() => handleReply(selectedUserChat, supportMessages.find(m => m.userEmail === selectedUserChat)?.userName || '')}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary/20"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-30">
                  <MessageCircle size={48} className="mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Select a conversation to reply</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'system' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Global Mining Management</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <ShieldAlert size={12} />
              MASTER CONTROL
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MINING_PLANS.map((plan) => {
              const stats = getMiningStats(plan.id);
              const Icon = plan.id === 'starter' ? Zap : plan.id === 'pro' ? Cpu : HardDrive;
              
              return (
                <div key={plan.id} className="glass-card border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Icon size={120} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                        <Icon size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">{plan.name}</h4>
                        <div className="flex gap-4 mt-1">
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-gray-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{stats.count} Active Nodes</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign size={12} className="text-gray-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">${stats.balance.toLocaleString()} Locked</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleGlobalNodeToggle(plan.id, false)}
                        className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-500 cursor-not-allowed"
                        disabled
                      >
                        Global Start
                      </button>
                      <button 
                        onClick={() => handleGlobalNodeToggle(plan.id, true)}
                        className="flex-1 md:flex-none px-8 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-2xl text-[10px] font-black uppercase text-red-500 flex items-center justify-center gap-2"
                      >
                        <Power size={14} />
                        Kill All Nodes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-red-500/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl text-red-500">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-white">System Security Protocols</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  The "Kill All Nodes" function is a global override. It synchronously terminates all active compute processes for the selected tier and triggers an automated 3% profit bonus payout to maintain platform trust during maintenance windows.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
