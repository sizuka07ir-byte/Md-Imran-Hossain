import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Headset } from 'lucide-react';
import { type SupportMessage } from '../constants';
import { cn } from '../lib/utils';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: SupportMessage[];
  onSendMessage: (content: string) => void;
}

export const SupportChat = ({ isOpen, onClose, messages, onSendMessage }: SupportChatProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed inset-x-6 bottom-24 top-20 z-50 flex flex-col glass-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto max-w-lg mx-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Headset size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white">Live Support</h3>
                <p className="text-[10px] text-primary flex items-center gap-1 font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors border border-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Headset size={32} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">How can we help?</p>
                  <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1">Our support team is online and ready to assist you.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-medium",
                    msg.sender === 'user' 
                      ? "bg-primary text-black rounded-tr-none" 
                      : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-widest">{msg.timestamp}</span>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white/5 border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors pr-14"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 top-2 bottom-2 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
