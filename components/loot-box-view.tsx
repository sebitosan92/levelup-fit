"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Zap, Shield, Crown, Flame, Loader2, Download, Trophy, Dumbbell, Target, Wind, Heart } from "lucide-react"
import { useLootBoxes, openLootBox } from "@/lib/fitness-store"

const REWARDS = [
  { title: "MOC TYTANA", rarity: "LEGENDARNY", icon: <Flame size={28} />, color: "from-orange-500 to-red-600", stats: { str: 99, spd: 0, def: 0, foc: 0 }, desc: "Siła godna bogów" },
  { title: "NEONOWA PRĘDKOŚĆ", rarity: "EPICKI", icon: <Zap size={28} />, color: "from-cyan-400 to-blue-600", stats: { str: 0, spd: 50, def: 0, foc: 0 }, desc: "Przełam barierę dźwięku" },
  { title: "STALOWY KORPUS", rarity: "RZADKI", icon: <Shield size={28} />, color: "from-slate-400 to-slate-600", stats: { str: 0, spd: 0, def: 30, foc: 0 }, desc: "Twardy jak skała" },
  { title: "SKUPIENIE ZEN", rarity: "POSPOLITY", icon: <Crown size={28} />, color: "from-emerald-400 to-green-600", stats: { str: 0, spd: 0, def: 0, foc: 10 }, desc: "Umysł ponad materią" },
  { title: "KROK CIENIA", rarity: "EPICKI", icon: <Wind size={28} />, color: "from-indigo-500 to-purple-700", stats: { str: 5, spd: 40, def: 5, foc: 0 }, desc: "Niewidzialne przemieszczenie" },
  { title: "OKO CYKLOPA", rarity: "RZADKI", icon: <Target size={28} />, color: "from-red-400 to-red-800", stats: { str: 0, spd: 0, def: 0, foc: 35 }, desc: "Precyzja uderzenia" },
  { title: "PRZECIĄŻENIE", rarity: "LEGENDARNY", icon: <Dumbbell size={28} />, color: "from-yellow-400 to-orange-700", stats: { str: 60, spd: -10, def: 40, foc: 0 }, desc: "Czysty przyrost masy" },
  { title: "WITALNOŚĆ", rarity: "POSPOLITY", icon: <Heart size={28} />, color: "from-pink-400 to-rose-600", stats: { str: 5, spd: 5, def: 5, foc: 5 }, desc: "Ogólne wzmocnienie systemu" },
]

export function LootBoxView() {
  const lootCount = useLootBoxes()
  const [isOpening, setIsOpening] = useState(false)
  const [reward, setReward] = useState<typeof REWARDS[0] | null>(null)
  
  const [myStats, setMyStats] = useState({ str: 0, spd: 0, def: 0, foc: 0 })

  const handleOpen = () => {
    if (lootCount <= 0) return
    setIsOpening(true)
    openLootBox()
    setTimeout(() => {
      setReward(REWARDS[Math.floor(Math.random() * REWARDS.length)])
      setIsOpening(false)
    }, 1000)
  }

  const claimReward = () => {
    if (reward) {
      setMyStats(prev => ({
        str: prev.str + reward.stats.str,
        spd: prev.spd + reward.stats.spd,
        def: prev.def + reward.stats.def,
        foc: prev.foc + reward.stats.foc,
      }))
      setReward(null)
    }
  }

  return (
    <div className="w-full px-2 py-4 flex flex-col items-center gap-4">
      
      {/* --- PANEL STATYSTYK --- */}
      <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-[2rem] p-4 backdrop-blur-md shadow-inner">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Trophy size={16} className="text-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Atrybuty Jednostki</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "SIŁ", val: myStats.str, color: "text-orange-500" },
            { label: "ZRE", val: myStats.spd, color: "text-cyan-400" },
            { label: "WYT", val: myStats.def, color: "text-slate-400" },
            { label: "SKU", val: myStats.foc, color: "text-emerald-400" }
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-2 border border-white/5 flex justify-between items-center px-4">
              <span className="text-[9px] font-mono text-white/40">{s.label}</span>
              <span className={`font-black font-mono ${s.color}`}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL SKRZYNEK */}
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Box size={20} className="text-purple-400" />
          <span className="text-sm font-black text-white">{lootCount} ZRZUTÓW</span>
        </div>
        <button 
          onClick={handleOpen}
          disabled={lootCount <= 0 || isOpening}
          className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-20 transition-all"
        >
          {isOpening ? "SKANOWANIE..." : "OTWÓRZ SKRZYNIĘ"}
        </button>
      </div>

      <AnimatePresence>
        {reward && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-[320px] rounded-[2.5rem] bg-gradient-to-r ${reward.color} p-[1px]`}
            >
              <div className="bg-zinc-950 rounded-[2.4rem] p-5 flex items-center gap-4 relative overflow-hidden">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${reward.color} shadow-lg`}>
                  {reward.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">{reward.rarity}</p>
                  <h3 className="text-lg font-black text-white uppercase leading-none mb-1">{reward.title}</h3>
                  <p className="text-white/40 text-[9px] italic mb-1">{reward.desc}</p>
                  <div className="flex gap-2">
                    {Object.entries(reward.stats).map(([k, v]) => v !== 0 && (
                      <span key={k} className="text-[9px] font-bold text-neon-green uppercase">{k} +{v}</span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={claimReward}
                  className="bg-white text-black p-3 rounded-xl hover:bg-neon-green transition-all active:scale-90"
                >
                  <Download size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpening && (
        <div className="flex flex-col items-center py-4">
          <Loader2 className="text-purple-500 animate-spin" size={24} />
        </div>
      )}
    </div>
  )
}