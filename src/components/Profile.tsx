import { motion } from 'motion/react';
import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Mail, Phone, MapPin, Share2, Copy, Check, ShieldAlert, Camera, X, Users } from 'lucide-react';
import { type User as UserType } from '../constants';
import { cn } from '../lib/utils';
import { useState, ChangeEvent } from 'react';

interface ProfileProps {
  user: UserType;
  onLogout?: () => void;
  onNavigate?: (tab: string) => void;
  onUpdateUser?: (updatedUser: UserType) => void;
  openNotifications?: () => void;
}

export const Profile = ({ user, onLogout, onNavigate, onUpdateUser, openNotifications }: ProfileProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState('+1 (555) 000-0000');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          avatar: base64String
        });
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const menuItems = [
    { icon: Users, label: 'My Team', color: 'text-primary', id: 'my-team' },
    { icon: Settings, label: 'Account Settings', color: 'text-gray-400' },
    { icon: Shield, label: 'Security & 2FA', color: 'text-blue-400' },
    { icon: Bell, label: 'Notifications & History', color: 'text-yellow-400', action: openNotifications },
    { icon: HelpCircle, label: 'Support Center', color: 'text-primary' },
    { icon: Share2, label: 'Telegram Support', color: 'text-blue-500', action: () => window.open('https://t.me/Cryptomax99', '_blank') },
  ];

  if (user.isAdmin) {
    menuItems.unshift({ icon: ShieldAlert, label: 'Admin Dashboard', color: 'text-red-500' });
  }

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: editName
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col items-center py-8">
        <div className="relative group">
          <div className="h-28 w-28 rounded-full border-2 border-primary p-1 bg-primary/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,200,83,0.3)] mb-4 overflow-hidden relative">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-4xl font-bold text-primary">{user.name.split(' ').map(n => n[0]).join('')}</span>
            )}
            
            {/* Upload Overlay */}
            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="text-primary mb-1" />
              <span className="text-[10px] font-black uppercase text-white">Update</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </label>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "absolute bottom-4 -right-2 h-10 w-10 rounded-xl border-4 border-[#050505] flex items-center justify-center text-black shadow-xl transition-all z-10",
              isEditing ? "bg-red-500 rotate-45" : "bg-primary"
            )}
          >
            {isEditing ? <X size={20} /> : <Settings size={18} />}
          </button>
        </div>
        
        {isEditing ? (
          <div className="w-full max-w-xs space-y-2">
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-xl font-bold text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="Full Name"
              autoFocus
            />
            <button 
              onClick={handleSave}
              className="w-full py-2 bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/30 hover:bg-primary/30 transition-all"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-glow-green text-center">{user.name}</h2>
            <p className="text-gray-400 text-sm">Premium Member</p>
          </>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Status</p>
          <p className="text-primary font-bold">Verified</p>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Member Since</p>
          <p className="font-bold">Apr 2026</p>
        </div>
      </div>

      {/* Referral Section */}
      <div className="gradient-card rounded-[2rem] p-6 border border-primary/20 shadow-[0_0_20px_rgba(0,200,83,0.1)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Share2 size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Referral Program</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Earn bonuses by inviting friends</p>
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Your Referral Link</p>
            <p className="text-xs font-mono text-primary truncate">cryptomax.io/ref={user.referralCode}</p>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`https://cryptomax.io/ref=${user.referralCode}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="shrink-0 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black active:scale-90 transition-transform"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Settings</h3>
        <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.id === 'my-team' && onNavigate) {
                    onNavigate('my-team');
                    return;
                  }
                  if (item.action) {
                    item.action();
                    return;
                  }
                  if (item.label === 'Admin Dashboard' && onNavigate) {
                    onNavigate('admin');
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-white/5",
                  i !== menuItems.length - 1 && "border-b"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl bg-white/5", item.color)}>
                    <Icon size={20} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Contact Info</h3>
        <div className="glass shadow-xl rounded-3xl p-5 space-y-4 border border-white/5">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Mail size={16} />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Phone size={16} />
            {isEditing ? (
              <input 
                type="text" 
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="bg-transparent border-b border-white/10 focus:border-primary outline-none"
              />
            ) : (
              <span>{editPhone}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <MapPin size={16} />
            <span>Singapore</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 text-red-500 font-bold p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors shadow-lg"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
};
