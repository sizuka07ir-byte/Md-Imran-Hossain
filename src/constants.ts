export interface User {
  name: string;
  email: string;
  balance: number;
  miningBalance: number;
  profit: number;
  miningPower: number;
  referralCode: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  activeNodes?: string[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  method: string;
}

export interface MiningPlan {
  id: string;
  name: string;
  dailyProfit: number;
  duration: number;
  minInvestment: number;
  icon: string;
}

export const DUMMY_USER: User = {
  name: 'System Admin',
  email: 'ffgameking007@gmail.com',
  balance: 1000.00,
  miningBalance: 0,
  profit: 1240.20,
  miningPower: 45.5,
  referralCode: 'LMX-ADMIN',
  isAdmin: true,
  isBanned: false,
  activeNodes: [],
};

export const createNewUser = (name: string, email: string): User => {
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  // Restricted admin check
  const isAdmin = email.toLowerCase() === 'ffgameking007@gmail.com';
  const initialBalance = isAdmin ? 1000.00 : 0;
  
  return {
    name,
    email,
    balance: initialBalance,
    miningBalance: 0,
    profit: 0,
    miningPower: 0,
    referralCode: `LMX-${randomCode}`,
    isAdmin,
    isBanned: false,
    activeNodes: [],
  };
};

export const MINING_PLANS: MiningPlan[] = [
  {
    id: 'starter',
    name: 'Starter Node',
    dailyProfit: 1.2,
    duration: 30,
    minInvestment: 100,
    icon: 'Zap',
  },
  {
    id: 'pro',
    name: 'Advanced Hash',
    dailyProfit: 2.5,
    duration: 60,
    minInvestment: 500,
    icon: 'Cpu',
  },
  {
    id: 'enterprise',
    name: 'Quantum Core',
    dailyProfit: 4.8,
    duration: 90,
    minInvestment: 2500,
    icon: 'HardDrive',
  },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX1024',
    type: 'deposit',
    amount: 1000,
    status: 'completed',
    date: '2024-03-24',
    method: 'USDT (TRC20)',
  },
  {
    id: 'TX1025',
    type: 'withdraw',
    amount: 250,
    status: 'pending',
    date: '2024-03-25',
    method: 'Bitcoin',
  },
  {
    id: 'TX1026',
    type: 'deposit',
    amount: 500,
    status: 'completed',
    date: '2024-03-26',
    method: 'Ethereum',
  },
];

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'deposit' | 'mining' | 'system';
  status?: 'pending' | 'completed' | 'failed';
  read: boolean;
}

export const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Welcome to Lumix',
    message: 'Your account has been successfully secured. Start mining to earn daily profits.',
    time: '2 hours ago',
    type: 'system',
    read: false
  }
];

export interface SupportMessage {
  id: string;
  userEmail: string;
  userName: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'admin';
  isRead: boolean;
}
