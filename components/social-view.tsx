'use client';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, MessageSquare, X, Zap, ChevronLeft, Bell } from "lucide-react"
import { useMessages, useFriends, useAuth, sendChatMessage } from "@/lib/fitness-store"

const getAvatarColor = (name: string) => {
  const safeName = name || "Wojownik";
  const colors = ['from-cyan-500/40 to-blue-600/40', 'from-purple-500/40 to-pink-600/40', 'from-emerald-500/40 to-teal-600/40', 'from-orange-500/40 to-red-600/40']
  const index = safeName.length % colors.length
  return colors[index]
}

export function SocialView() {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'friends'>('chat')
  const [selectedFriend, setSelectedFriend] = useState<{id: string, name: string} | null>(null)
  const [message, setMessage] = useState('')
  
  const { display_name, profile } = useAuth()
  const friends = useFriends()
  
  const globalMessages = useMessages(null)
  const privateMessages = useMessages(selectedFriend?.id || null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const privateScrollRef = useRef<HTMLDivElement>(null)

  // Autoscroll dla czatu głównego
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [globalMessages, activeSubTab])

  // Autoscroll dla czatu prywatnego
  useEffect(() => {
    if (privateScrollRef.current) {
      privateScrollRef.current.scrollTop = privateScrollRef.current.scrollHeight
    }
  }, [privateMessages, selectedFriend])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    await sendChatMessage(message, display_name, selectedFriend?.id || null)
    setMessage('')
  }

  return (
    <div className="w-full max-w-[450px] mx-auto bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative" style={{ height: '650px' }}>
      
      {/* 1. GÓRNY PASEK AWATARÓW (CHAT BUBBLES) */}
      <div className="flex-none p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex flex-col items-center gap-1 flex-none">
            <button 
              onClick={() => { setSelectedFriend(null); setActiveSubTab('chat'); }}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${!selectedFriend && activeSubTab === 'chat' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}
            >
              <MessageSquare size={20} className={!selectedFriend ? 'text-cyan-400' : 'text-white/40'} />
            </button>
            <span className="text-[9px] font-black uppercase text-white/40">Global</span>
          </div>

          {friends.map(f => (
            <div key={f.id} className="flex flex-col items-center gap-1 flex-none relative">
              <button 
                onClick={() => setSelectedFriend({ id: f.id, name: f.display_name })}
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(f.display_name)} border-2 transition-all flex items-center justify-center text-sm font-black text-white ${selectedFriend?.id === f.id ? 'border-purple-500 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-transparent opacity-70'}`}
              >
                {f.display_name[0]}
              </button>
              <span className="text-[9px] font-bold text-white/60 truncate w-14 text-center">{f.display_name.split(' ')[0]}</span>
              
              <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center shadow-lg">
                <span className="text-[8px] font-black text-white">1</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. GŁÓWNA TREŚĆ */}
      <div className="flex-1 overflow-hidden relative">
         <div className="h-full flex flex-col">
            <div className="flex-none p-3 flex justify-center gap-2">
                <button 
                  onClick={() => setActiveSubTab('chat')}
                  className={`px-6 py-1.5 rounded-full text-[10px] font-black transition-all ${activeSubTab === 'chat' ? 'bg-cyan-500 text-black' : 'text-white/20'}`}
                >FEED</button>
                <button 
                  onClick={() => setActiveSubTab('friends')}
                  className={`px-6 py-1.5 rounded-full text-[10px] font-black transition-all ${activeSubTab === 'friends' ? 'bg-purple-500 text-white' : 'text-white/20'}`}
                >LISTA</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {activeSubTab === 'chat' ? (
                globalMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.user_id === profile?.id ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(msg.display_name)} flex-none border border-white/10 flex items-center justify-center text-[10px] font-black text-white`}>
                      {msg.display_name[0]}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs max-w-[75%] border ${msg.user_id === profile?.id ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-50 rounded-tr-none' : 'bg-white/5 border-white/10 text-white/70 rounded-tl-none'}`}>
                      <p className="text-[8px] font-black opacity-30 uppercase mb-1">{msg.display_name}</p>
                      {msg.text}
                    </div>
                  </div>
                ))
              ) : (
                friends.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 cursor-pointer" onClick={() => setSelectedFriend({id: f.id, name: f.display_name})}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(f.display_name)} flex items-center justify-center font-black text-white`}>{f.display_name[0]}</div>
                        <div>
                            <p className="text-sm font-bold text-white">{f.display_name}</p>
                            <p className="text-[10px] text-white/30 uppercase italic">Poziom {f.level}</p>
                        </div>
                    </div>
                    <Bell size={14} className="text-purple-500 animate-pulse" />
                  </div>
                ))
              )}
            </div>

            {activeSubTab === 'chat' && (
              <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                <input 
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Napisz do wszystkich..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                />
                <button type="submit" className="p-2 bg-cyan-500 rounded-xl text-black transition-transform active:scale-90"><Send size={18} /></button>
              </form>
            )}
         </div>
      </div>

      {/* 3. OVERLAY CZATU PRYWATNEGO (MODAL) */}
      <AnimatePresence>
        {selectedFriend && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#0a0a0a] z-50 flex flex-col"
          >
            {/* Header okna prywatnego */}
            <div className="p-5 border-b border-purple-500/20 bg-purple-500/5 flex items-center gap-4">
              <button onClick={() => setSelectedFriend(null)} className="p-2 hover:bg-white/10 rounded-full text-white/40"><ChevronLeft size={24} /></button>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedFriend.name)} border border-white/20 flex items-center justify-center font-black text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]`}>
                {selectedFriend.name[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{selectedFriend.name}</h4>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-green-500/70 uppercase tracking-widest">Kryptopołączenie</span>
                </div>
              </div>
              <button onClick={() => setSelectedFriend(null)} className="p-2 text-white/20 hover:text-white"><X size={20} /></button>
            </div>

            {/* Wiadomości prywatne z Awatarami */}
            <div ref={privateScrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
               {privateMessages.map((msg) => {
                 const isMe = msg.user_id === profile?.id;
                 return (
                   <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                     {/* Awatar przy wiadomości */}
                     <div className={`w-6 h-6 rounded-full flex-none bg-gradient-to-br ${getAvatarColor(msg.display_name)} flex items-center justify-center text-[8px] font-black text-white border border-white/10`}>
                       {msg.display_name[0]}
                     </div>
                     
                     <div className={`px-4 py-2.5 rounded-2xl text-[14px] max-w-[75%] border ${
                       isMe 
                       ? 'bg-purple-600 text-white border-purple-400 rounded-br-none shadow-[0_4px_12px_rgba(168,85,247,0.2)]' 
                       : 'bg-white/10 text-white/90 border-white/10 rounded-bl-none'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Input prywatny */}
            <div className="p-5 bg-black border-t border-white/10">
               <form onSubmit={handleSend} className="flex gap-2">
                 <input 
                   autoFocus
                   value={message} onChange={(e) => setMessage(e.target.value)}
                   placeholder={`Szyfruj do ${selectedFriend.name.split(' ')[0]}...`}
                   className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-purple-500/50"
                 />
                 <button type="submit" className="p-4 bg-purple-500 rounded-2xl text-white transition-all active:scale-95 shadow-lg shadow-purple-500/30">
                   <Send size={20} />
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}