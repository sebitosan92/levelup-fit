"use client"

import { motion } from "framer-motion"
import { Droplets, Check, Droplet } from "lucide-react"
import { addWater, useWaterData } from "@/lib/fitness-store"

const GOAL_ML = 2000
const DROP_ML = 250
const TOTAL_DROPS = GOAL_ML / DROP_ML

export function WaterTracker() {
  const waterData = useWaterData()
  const filledDrops = Math.min(Math.floor(waterData.amount / DROP_ML), TOTAL_DROPS)
  const isComplete = waterData.amount >= GOAL_ML
  const progressPercent = Math.min((waterData.amount / GOAL_ML) * 100, 100)

  return (
    <motion.div 
      className="rounded-3xl glass-card p-5 border border-white/10 relative overflow-hidden bg-white/[0.02]" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20">
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">Chłodzenie Systemu</h3>
            <p className="text-[8px] font-mono text-cyan-500/50 uppercase mt-1">Status: Aktywny</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono font-black text-cyan-400 tracking-tighter">
            {waterData.amount} / {GOAL_ML} ML
          </span>
        </div>
      </div>

      {/* PASEK POSTĘPU */}
      <div className="h-1.5 rounded-full bg-white/5 mb-5 overflow-hidden border border-white/5">
        <motion.div 
          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }} 
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* SIATKA KROPEL */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {Array.from({ length: TOTAL_DROPS }).map((_, i) => (
          <button
            key={i}
            onClick={() => !isComplete && addWater(DROP_ML)}
            className={`group flex items-center justify-center h-14 rounded-2xl border transition-all duration-300 ${
              i < filledDrops 
              ? "bg-cyan-500/15 border-cyan-500/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]" 
              : "bg-white/5 border-white/5 hover:border-white/20"
            }`}
          >
            <Droplet 
              className={`w-5 h-5 transition-all duration-500 group-active:scale-75 ${
                i < filledDrops 
                ? "text-cyan-400 fill-cyan-400/30 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                : "text-white/10"
              }`} 
            />
          </button>
        ))}
      </div>

      {/* PRZYCISK AKCJI */}
      <button 
        onClick={() => !isComplete && addWater(DROP_ML)} 
        className={`w-full py-4 rounded-2xl font-mono text-[10px] font-black uppercase tracking-[0.2em] border transition-all active:scale-[0.97] ${
          isComplete 
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
          : "bg-cyan-500 text-black border-transparent shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-white"
        }`}
      >
        {isComplete ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={14} strokeWidth={3} /> OPTYMALIZACJA ZAKOŃCZONA
          </span>
        ) : (
          `ZASIL SYSTEM +${DROP_ML} ML`
        )}
      </button>

      {/* DEKORACJA TŁA */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.02] pointer-events-none rotate-12">
        <Droplets size={120} />
      </div>
    </motion.div>
  )
}