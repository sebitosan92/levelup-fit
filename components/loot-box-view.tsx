"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Zap, Shield, Crown, Flame, Loader2, Download, Trophy, Dumbbell, Target, Wind, Heart } from "lucide-react"
import { useLootBoxes, openLootBox } from "@/lib/fitness-store"

const REWARDS = [
  { title: "TITAN POWER", rarity: "LEGENDARY", icon: <Flame size={28} />, color: "from-orange-500 to-red-600", stats: { str: 99, spd: 0, def: 0, foc: 0 }, desc: "God-like strength" },
  { title: "NEON SPEED", rarity: "EPIC", icon: <Zap size={28} />, color: "from-cyan-400 to-blue-600", stats: { str: 0, spd: 50, def: 0, foc: 0 }, desc: "Break the sound barrier" },
  { title: "IRON BODY", rarity: "RARE", icon: <Shield size={28} />, color: "from-slate-400 to-slate-600", stats: { str: 0, spd: 0, def: 30, foc: 0 }, desc: "Solid as a rock" },
  { title: "ZEN FOCUS", rarity: "COMMON", icon: <Crown size={28} />, color: "from-emerald-400 to-green-600", stats: { str: 0, spd: 0, def: 0, foc: 10 }, desc: "Mind over matter" },
  { title: "SHADOW STEP", rarity: "EPIC", icon: <Wind size={28} />, color: "from-indigo-500 to-purple-700", stats: { str: 5, spd: 40, def: 5, foc: 0 }, desc: "Invisible movement" },
  { title: "BULL EYE", rarity: "RARE", icon: <Target size={28} />, color: "from-red-400 to-red-800", stats: { str: 0, spd: 0, def: 0, foc: 35 }, desc: "Precision strikes" },
  { title: "OVERLOAD", rarity: "LEGENDARY", icon: <Dumbbell size={28} />, color: "from-yellow-400 to-orange-700", stats: { str: 60, spd: -10, def: 40, foc: 0 }, desc: "Pure mass gain" },
  { title: "VITALITY", rarity: "COMMON", icon: <Heart size={28} />, color: "from-pink-400 to-rose-600", stats: { str: 5, spd: 5, def: 5, foc: 5 }, desc: "General health boost" },
]

export function LootBoxView() {
  const lootCount = useLootBoxes()
  const [isOpening, setIsOpening] = useState(false)
  const [reward, setReward] = useState<typeof REWARDS[0] | null>(null)
  
  // Lokalny stan statystyk (w realnej apce brałbyś to z bazy/localStorage)
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
      
      {/* --- NOWE OKNO STATYSTYK --- */}
      <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-[2rem] p-4 backdrop-blur-md shadow-inner">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Trophy size={16} className="text-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Character Attributes</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "STR", val: myStats.str, color: "text-orange-500" },
            { label: "SPD", val: myStats.spd, color: "text-cyan-400" },
            { label: "DEF", val: myStats.def, color: "text-slate-400" },
            { label: "FOC", val: myStats.foc, color: "text-emerald-400" }
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
          <span className="text-sm font-black text-white">{lootCount} DROPS</span>
        </div>
        <button 
          onClick={handleOpen}
          disabled={lootCount <= 0 || isOpening}
          className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-20 transition-all"
        >
          {isOpening ? "SCANNING..." : "OPEN BOX"}
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