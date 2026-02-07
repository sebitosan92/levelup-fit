'use client';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, MessageSquare } from "lucide-react"
import { useMessages, useFriends, useAuth, sendChatMessage } from "@/lib/fitness-store"

// Logika kolorów awatarów zgodna z Twoim Dashboardem
const getAvatarColor = (name: string) => {
  const colors = [
    'from-cyan-500/40 to-blue-600/40', 
    'from-purple-500/40 to-pink-600/40', 
    'from-emerald-500/40 to-teal-600/40', 
    'from-orange-500/40 to-red-600/40', 
    'from-indigo-500/40 to-violet-600/40'
  ]
  const index = name ? name.length % colors.length : 0
  return colors[index]
}

export function SocialView() {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'friends'>('chat')
  const [message, setMessage] = useState('')
  const { display_name, profile } = useAuth()
  const messages = useMessages()
  const friends = useFriends()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeSubTab])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    await sendChatMessage(message, display_name)
    setMessage('')
  }

  return (
    <div 
      className="w-full max-w-[450px] mx-auto overflow-hidden rounded-[2.5rem] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col bg-[#0a0a0a]"
      style={{ 
        height: '600px',
        maxHeight: '85vh',
      }}
    >
      
      {/* NAGŁÓWEK */}
      <div className="flex-none flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-cyan-400" />
          <span className="text-[11px] font-black uppercase text-cyan-400 tracking-[0.2em] italic">Neural.Link</span>
        </div>
        <div className="flex gap-1 bg-black/50 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveSubTab('chat')}
            className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${activeSubTab === 'chat' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-white/60'}`}
          >CZAT</button>
          <button 
            onClick={() => setActiveSubTab('friends')}
            className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${activeSubTab === 'friends' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-white/40 hover:text-white/60'}`}
          >ZNAJOMI</button>
        </div>
      </div>

      {/* TREŚĆ */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeSubTab === 'chat' ? (
            <motion.div 
              key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="flex flex-col h-full"
            >
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
                {messages.length > 0 ? messages.map((msg) => {
                  const isMe = msg.user_id === profile?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* AWATAR */}
                      <div className={`flex-none w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(msg.display_name || 'System')} flex items-center justify-center border border-white/10 shadow-lg`}>
                        <span className="text-[10px] font-black text-white uppercase">
                          {(msg.display_name || 'S').charAt(0)}
                        </span>
                      </div>

                      {/* WIADOMOŚĆ */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <span className="text-[8px] font-bold text-white/20 uppercase mb-1 px-1 tracking-widest">
                          {msg.display_name}
                        </span>
                        <div className={`px-4 py-2.5 rounded-[1.2rem] break-words w-full text-[13px] leading-relaxed border ${
                          isMe 
                          ? 'bg-cyan-500/10 text-cyan-50 border-cyan-500/30 rounded-tr-none' 
                          : 'bg-white/5 text-white/80 border-white/10 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3">
                    <span className="text-[9px] uppercase tracking-[0.4em]">Brak aktywnych transmisji</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-5 space-y-3 overflow-y-auto h-full scrollbar-hide"
            >
              {friends.length > 0 ? friends.map(f => (
                <div key={f.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(f.display_name)} flex items-center justify-center border border-white/10 shadow-inner`}>
                      <span className="text-xs font-black text-white">{f.display_name.charAt(0)}</span>
                    </div>
                    <span className="text-[13px] font-bold text-white/90">{f.display_name}</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-3 py-1 rounded-lg">POZ {f.level}</span>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center opacity-20 text-[9px] uppercase tracking-[0.3em] text-center px-10">
                  Sieć kontaktów offline
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INPUT */}
      <div className="flex-none p-4 bg-black/80 border-t border-white/10 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Wpisz wiadomość..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
          />
          <button 
            type="submit" 
            disabled={!message.trim()}
            className="bg-cyan-500 p-3.5 rounded-xl text-black hover:bg-cyan-400 active:scale-90 transition-all disabled:opacity-20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}