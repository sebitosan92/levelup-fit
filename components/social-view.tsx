'use client';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  Send, 
  Trophy, 
  Zap, 
  Globe,
  ShieldCheck
} from "lucide-react"
import { 
  useMessages, 
  useFriends, 
  useAuth, 
  sendChatMessage 
} from "@/lib/fitness-store"

export function SocialView() {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'friends'>('chat')
  const [message, setMessage] = useState('')
  const { display_name } = useAuth()
  const messages = useMessages()
  const friends = useFriends()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll do dołu czatu
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    await sendChatMessage(message, display_name)
    setMessage('')
  }

  return (
    <div className="space-y-6 pb-20">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            COMMUNITY
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Nexus Hub Online</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              activeSubTab === 'chat' ? 'bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4]' : 'text-slate-400'
            }`}
          >
            CHAT
          </button>
          <button 
            onClick={() => setActiveSubTab('friends')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              activeSubTab === 'friends' ? 'bg-purple-500 text-white shadow-[0_0_15px_#a855f7]' : 'text-slate-400'
            }`}
          >
            FRIENDS
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'chat' ? (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-[500px] bg-black/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl"
          >
            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm">
                  <Globe className="w-8 h-8 mb-2 opacity-20" />
                  <p>Silence in the nexus...</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={`flex flex-col ${msg.display_name === display_name ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-cyan-500/70 tracking-tighter">
                      {msg.display_name}
                    </span>
                  </div>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.display_name === display_name 
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-100 rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <button 
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-black p-2 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="friends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {friends.map((friend) => (
              <div 
                key={friend.id}
                className="bg-gradient-to-r from-white/5 to-transparent border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                    <span className="text-purple-400 font-black text-xl">{friend.display_name[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                      {friend.display_name}
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    </h3>
                    <p className="text-[10px] text-slate-500 italic">"{friend.status_message || 'No status'}"</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-purple-400 font-black text-sm italic">
                    <Zap className="w-3 h-3" />
                    LVL {friend.level}
                  </div>
                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Active Warrior</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- QUICK STAT CARD --- */}
      <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Global Rank</p>
            <h4 className="text-3xl font-black italic tracking-tighter">#24</h4>
          </div>
          <Trophy className="w-12 h-12 text-yellow-500/40 rotate-12" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
      </div>
    </div>
  )
}