'use client';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send } from "lucide-react"
import { useMessages, useFriends, useAuth, sendChatMessage } from "@/lib/fitness-store"

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
    /* Używamy !important w stylu liniowym, aby przebić się przez globals.css 
       Jeśli po wklejeniu tego nadal nie widzisz ZIELONEGO tła, znaczy że edytujemy zły plik.
    */
    <div 
      className="w-full max-w-[340px] mx-auto overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl"
      style={{ 
        height: '240px !important', 
        maxHeight: '240px !important',
        minHeight: '240px !important',
        background: 'linear-gradient(to bottom, #0a0a0a, #111) !important',
        display: 'flex',
        flexDirection: 'column'
      } as any}
    >
      
      {/* HEADER - Bardzo niski */}
      <div className="flex items-center justify-between p-2 bg-white/5 border-b border-white/10">
        <span className="text-[9px] font-black uppercase text-cyan-400 px-2 italic">Neural.Link</span>
        <div className="flex gap-1 bg-black/50 p-0.5 rounded-lg">
          <button 
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1 rounded-md text-[8px] font-bold ${activeSubTab === 'chat' ? 'bg-cyan-500 text-black' : 'text-white/40'}`}
          >CHAT</button>
          <button 
            onClick={() => setActiveSubTab('friends')}
            className={`px-3 py-1 rounded-md text-[8px] font-bold ${activeSubTab === 'friends' ? 'bg-purple-500 text-white' : 'text-white/40'}`}
          >FRIENDS</button>
        </div>
      </div>

      {/* CONTENT - Sztywna wysokość dla scrolla */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeSubTab === 'chat' ? (
            <motion.div 
              key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="flex flex-col h-full"
            >
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide text-[10px]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.user_id === profile?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`px-2 py-1 rounded-lg ${msg.user_id === profile?.id ? 'bg-cyan-500/20 text-cyan-100' : 'bg-white/5 text-white/70'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT AREA */}
              <form onSubmit={handleSend} className="p-2 bg-black/40 border-t border-white/10 flex gap-2">
                <input 
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Transmit..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none"
                />
                <button type="submit" className="bg-cyan-500 p-1.5 rounded-lg text-black"><Send size={12} /></button>
              </form>
            </motion.div>
          ) : (
            <div className="p-3 space-y-1 overflow-y-auto h-full scrollbar-hide">
              {friends.map(f => (
                <div key={f.id} className="flex justify-between p-1.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold">{f.display_name}</span>
                  <span className="text-[8px] text-purple-400">LVL {f.level}</span>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}