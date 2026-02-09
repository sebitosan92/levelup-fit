'use client';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, MessageSquare, X, Zap, ChevronLeft, Bell } from "lucide-react"
import { useMessages, useFriends, useAuth, sendChatMessage } from "@/lib/fitness-store"

const getAvatarColor = (name: string) => {
  const safeName = name || "Wojownik";
  const colors = [
    'from-cyan-500/40 to-blue-600/40', 
    'from-purple-500/40 to-pink-600/40', 
    'from-emerald-500/40 to-teal-600/40', 
    'from-orange-500/40 to-red-600/40'
  ]
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
    <div className="w-full max-w-[450px] mx-auto bg-[#050505] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col relative" style={{ height: 'calc(100vh - 140px)', maxHeight: '720px' }}>
      
      {/* 1. GÓRNY PASEK AWATARÓW - STYL STORIES */}
      <div className="flex-none p-5 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex flex-col items-center gap-2 flex-none">
            <button 
              onClick={() => { setSelectedFriend(null); setActiveSubTab('chat'); }}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${!selectedFriend && activeSubTab === 'chat' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-white/10 bg-white/5'}`}
            >
              <MessageSquare size={22} className={!selectedFriend ? 'text-cyan-400' : 'text-white/20'} />
            </button>
            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Global</span>
          </div>

          {friends.map(f => (
            <div key={f.id} className="flex flex-col items-center gap-2 flex-none relative group">
              <button 
                onClick={() => setSelectedFriend({ id: f.id, name: f.display_name })}
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(f.display_name)} border-2 transition-all flex items-center justify-center text-lg font-black text-white ${selectedFriend?.id === f.id ? 'border-purple-500 scale-110 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                {f.display_name[0]}
              </button>
              <span className="text-[10px] font-bold text-white/50 truncate w-14 text-center">{f.display_name.split(' ')[0]}</span>
              
              <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center shadow-lg">
                <span className="text-[8px] font-black text-white">1</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. GŁÓWNA TREŚĆ (FEED / LISTA) */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
         <div className="flex-none p-4 flex justify-center gap-3">
            <button 
              onClick={() => setActiveSubTab('chat')}
              className={`px-8 py-2 rounded-full text-[11px] font-black transition-all ${activeSubTab === 'chat' ? 'bg-white/10 text-white shadow-inner' : 'text-white/20'}`}
            >FEED</button>
            <button 
              onClick={() => setActiveSubTab('friends')}
              className={`px-8 py-2 rounded-full text-[11px] font-black transition-all ${activeSubTab === 'friends' ? 'bg-white/10 text-white shadow-inner' : 'text-white/20'}`}
            >EKIPA</button>
         </div>

         <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
           {activeSubTab === 'chat' ? (
             globalMessages.map((msg) => (
               <div key={msg.id} className={`flex gap-3 ${msg.user_id === profile?.id ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(msg.display_name)} flex-none border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-sm`}>
                   {msg.display_name[0]}
                 </div>
                 <div className={`p-4 rounded-2xl text-[14px] max-w-[80%] border ${msg.user_id === profile?.id ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-50 rounded-tr-none' : 'bg-white/[0.03] border-white/10 text-white/80 rounded-tl-none'}`}>
                   <p className="text-[8px] font-black opacity-30 uppercase mb-1 tracking-tighter">{msg.display_name}</p>
                   {msg.text}
                 </div>
               </div>
             ))
           ) : (
             friends.map(f => (
               <div key={f.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-[1.5rem] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setSelectedFriend({id: f.id, name: f.display_name})}>
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(f.display_name)} flex items-center justify-center font-black text-white text-xl`}>{f.display_name[0]}</div>
                    <div>
                        <p className="text-sm font-bold text-white">{f.display_name}</p>
                        <p className="text-[10px] text-cyan-500/60 uppercase font-black">Level {f.level || 1}</p>
                    </div>
                 </div>
                 <Bell size={16} className="text-purple-500/50 animate-pulse" />
               </div>
             ))
           )}
         </div>

         {activeSubTab === 'chat' && (
           <form onSubmit={handleSend} className="p-5 bg-black/40 backdrop-blur-md border-t border-white/5 flex gap-3">
             <input 
               value={message} onChange={(e) => setMessage(e.target.value)}
               placeholder="Napisz do wszystkich..."
               className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/40 transition-all"
             />
             <button type="submit" className="p-3 bg-white text-black rounded-2xl transition-transform active:scale-90 shadow-lg"><Send size={20} /></button>
           </form>
         )}
      </div>

      {/* 3. MODAL CZATU PRYWATNEGO - LEWITUJĄCY STYL (GLASS) */}
      <AnimatePresence>
        {selectedFriend && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="absolute inset-x-3 top-3 bottom-24 z-50 bg-[#0c0c0c]/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* Header okna prywatnego */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedFriend(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors"><ChevronLeft size={24} /></button>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedFriend.name)} border border-white/20 flex items-center justify-center font-black text-white text-sm`}>
                  {selectedFriend.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{selectedFriend.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Szyfrowane</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedFriend(null)} className="p-2 text-white/10 hover:text-white transition-colors"><X size={22} /></button>
            </div>

            {/* Wiadomości prywatne */}
            <div ref={privateScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-purple-500/[0.02]">
               {privateMessages.map((msg) => {
                 const isMe = msg.user_id === profile?.id;
                 return (
                   <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                     <div className={`w-7 h-7 rounded-full flex-none bg-gradient-to-br ${getAvatarColor(msg.display_name)} flex items-center justify-center text-[9px] font-black text-white border border-white/10 opacity-50`}>
                       {msg.display_name[0]}
                     </div>
                     <div className={`px-5 py-3 rounded-[1.5rem] text-[14px] max-w-[80%] border ${
                       isMe 
                       ? 'bg-purple-600 text-white border-purple-400 rounded-br-none shadow-[0_10px_20px_rgba(168,85,247,0.2)]' 
                       : 'bg-white/10 text-white/90 border-white/5 rounded-bl-none backdrop-blur-sm'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Input prywatny - Nowoczesna Pigułka */}
            <div className="p-5 bg-transparent border-t border-white/5">
               <form onSubmit={handleSend} className="flex gap-2 bg-white/5 border border-white/10 rounded-[1.8rem] p-2 focus-within:border-purple-500/40 focus-within:bg-white/[0.08] transition-all shadow-inner">
                 <input 
                   autoFocus
                   value={message} onChange={(e) => setMessage(e.target.value)}
                   placeholder="Zadaj pytanie..."
                   className="flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/20"
                 />
                 <button type="submit" className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-lg shadow-purple-500/30">
                   <Send size={22} />
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}