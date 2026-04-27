/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, MessageCircle } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Deposit } from './components/Deposit';
import { Mining } from './components/Mining';
import { Withdraw } from './components/Withdraw';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { Admin } from './components/Admin';
import { NotificationCenter } from './components/NotificationCenter';
import { SupportChat } from './components/SupportChat';
import { DUMMY_USER, DUMMY_NOTIFICATIONS, createNewUser, type User, type Notification, type SupportMessage, MINING_PLANS } from './constants';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>(DUMMY_USER);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('lumix_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    
    // Load support messages
    const savedMessages = localStorage.getItem('lumix_support_messages');
    if (savedMessages) {
      setSupportMessages(JSON.parse(savedMessages));
    }
    
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('lumix_support_messages', JSON.stringify(supportMessages));
  }, [supportMessages]);

  const sendSupportMessage = (content: string, sender: 'user' | 'admin' = 'user', targetUserEmail?: string, targetUserName?: string) => {
    const newMessage: SupportMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userEmail: targetUserEmail || user.email,
      userName: targetUserName || user.name,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender,
      isRead: sender === 'user' ? false : true
    };
    setSupportMessages(prev => [...prev, newMessage]);
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleLogin = (name: string, email: string, isLogin: boolean, referralCode?: string) => {
    const savedUsersStr = localStorage.getItem('lumix_users') || '[]';
    const savedUsers: User[] = JSON.parse(savedUsersStr);

    if (isLogin) {
      // Login logic
      const existingUser = savedUsers.find(u => u.email === email);
      if (existingUser) {
        if (existingUser.isBanned) {
          alert("❌ Access Denied: This ID is currently banned. Please contact support.");
          return;
        }
        setUser(existingUser);
        localStorage.setItem('lumix_current_user', JSON.stringify(existingUser));
        setIsLoggedIn(true);
      } else if (email === DUMMY_USER.email) {
        if (DUMMY_USER.isBanned) {
          alert("❌ Access Denied: This ID is currently banned.");
          return;
        }
        setUser(DUMMY_USER);
        localStorage.setItem('lumix_current_user', JSON.stringify(DUMMY_USER));
        setIsLoggedIn(true);
      } else {
        alert("Account not found. Please register.");
      }
    } else {
      // Registration logic
      const emailExists = savedUsers.some(u => u.email === email) || email === DUMMY_USER.email;
      if (emailExists) {
        alert("Email already registered. Please login.");
        return;
      }

      const newUser = createNewUser(name, email);
      const updatedUsers = [...savedUsers, newUser];
      localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));
      localStorage.setItem('lumix_current_user', JSON.stringify(newUser));
      setUser(newUser);
      setIsLoggedIn(true);
      
      addNotification({
        title: 'Welcome to LUMIX',
        message: `Your account has been created ${referralCode ? 'using referral ' + referralCode : 'with a $0 initial balance.'}`,
        type: 'system'
      });

      if (referralCode) {
        // Find referrer and potentially award bonus (mock logic)
        const referrer = savedUsers.find(u => u.referralCode === referralCode) || (DUMMY_USER.referralCode === referralCode ? DUMMY_USER : null);
        if (referrer) {
          console.log(`Referral tracked from: ${referrer.name}`);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lumix_current_user');
    setIsLoggedIn(false);
    setActiveTab('home');
    setUser(DUMMY_USER);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('lumix_current_user', JSON.stringify(updatedUser));
    
    // Also update in lumix_users list
    const savedUsersStr = localStorage.getItem('lumix_users') || '[]';
    const savedUsers: User[] = JSON.parse(savedUsersStr);
    const updatedUsers = savedUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard user={user} />;
      case 'deposit': return <Deposit 
        user={user}
        onReturnToHome={() => setActiveTab('home')} 
        onDepositSuccess={(amount, txId) => {
          addNotification({
            title: 'Deposit Initiated',
            message: `Your deposit of $${amount} (ID: ${txId}) is currently being verified.`,
            type: 'deposit',
            status: 'pending'
          });
        }}
      />;
      case 'mining': return <Mining 
        user={user} 
        onToggleMining={(planId, isOn) => {
          const plan = MINING_PLANS.find(p => p.id === planId);
          
          if (isOn) {
            // Anyone can turn ON if they have balance
            const currentBalance = user.balance;
            if (plan && currentBalance < plan.minInvestment) {
              alert(`Insufficient balance. Minimum investment for ${plan.name} is $${plan.minInvestment}.`);
              return false;
            }
            
            const updatedUser: User = { 
              ...user, 
              balance: 0, 
              miningBalance: Number(user.miningBalance || 0) + Number(currentBalance),
              profit: Number(user.profit || 0) + (Number(currentBalance) * 0.05),
              activeNodes: [...(user.activeNodes || []), planId]
            };
            
            handleUpdateUser(updatedUser);
            addNotification({
              title: 'Mining Started ✅',
              message: `Nodes deployed successfully. $${Number(currentBalance).toFixed(2)} transferred to mining wallet.`,
              type: 'mining'
            });
            return true;
          } else {
            // ONLY Admin can turn OFF
            if (!user.isAdmin) {
              alert("Restricted Action: Only an administrator can power down compute nodes.");
              return false;
            }

            // Global Shutdown when admin turns off a node
            const savedUsersStr = localStorage.getItem('lumix_users') || '[]';
            const savedUsers: User[] = JSON.parse(savedUsersStr);
            
            let affectedCount = 0;
            const updatedUsers = savedUsers.map(u => {
              const nodeIds = u.activeNodes || [];
              if (nodeIds.includes(planId)) {
                affectedCount++;
                const investment = Number(u.miningBalance || 0);
                const bonus = investment * 0.03; // 3% bonus
                return {
                  ...u,
                  balance: Number(u.balance || 0) + investment + bonus,
                  miningBalance: 0,
                  activeNodes: nodeIds.filter(id => id !== planId)
                };
              }
              return u;
            });

            localStorage.setItem('lumix_users', JSON.stringify(updatedUsers));

            // Sync current user if they are the admin (which they are) and were affected
            const syncUser = updatedUsers.find(u => u.email === user.email);
            if (syncUser) {
              setUser(syncUser);
              localStorage.setItem('lumix_current_user', JSON.stringify(syncUser));
            }

            addNotification({
              title: 'Global Node Shutdown',
              message: `${plan?.name} power cycle completed globally. ${affectedCount} user(s) received a 3% bonus.`,
              type: 'mining'
            });
            return true;
          }
        }}
      />;
      case 'withdraw': return <Withdraw user={user} />;
      case 'profile': return <Profile user={user} onLogout={handleLogout} onNavigate={setActiveTab} onUpdateUser={handleUpdateUser} />;
      case 'admin': return <Admin />;
      default: return <Dashboard user={user} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full glow-green"
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  if (user.isBanned) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-[2.5rem] border border-red-500/20 max-w-sm w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Access Revoked</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Your account has been suspended for violating our platform terms. Please contact support if you believe this is a mistake.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg shadow-[0_0_15px_rgba(0,200,83,0.5)] flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <span className="text-xl font-bold tracking-tight">CRYPTO<span className="text-primary text-glow-green">MAX</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Market Status</span>
            <span className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Live
            </span>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 relative hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-gray-400" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,200,83,0.8)]" />
            )}
          </button>
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
            <span className="text-primary font-bold text-xs">{user.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
        </div>
      </header>

      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />

      <main className="relative z-10 max-w-lg mx-auto px-6 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!user.isAdmin && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-black rounded-full shadow-[0_0_20px_rgba(0,200,83,0.5)] flex items-center justify-center z-40"
        >
          <MessageCircle size={24} />
          {supportMessages.filter(m => m.sender === 'admin' && !m.isRead).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
              {supportMessages.filter(m => m.sender === 'admin' && !m.isRead).length}
            </span>
          )}
        </motion.button>
      )}

      <SupportChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={supportMessages.filter(m => m.userEmail === user.email)}
        onSendMessage={sendSupportMessage}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
    </div>
  );
}
