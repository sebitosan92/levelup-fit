"use client"

import { motion } from "framer-motion"
import { Droplets, Check } from "lucide-react"
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
    <motion.div className="rounded-2xl glass-card p-5 border border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neon-purple/15 flex items-center justify-center">
            <Droplets className="w-3.5 h-3.5 text-neon-purple" />
          </div>
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Hydration</h3>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{waterData.amount} / {GOAL_ML}ml</span>
      </div>

      <div className="h-1.5 rounded-full bg-secondary mb-5 overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-green" animate={{ width: `${progressPercent}%` }} />
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {Array.from({ length: TOTAL_DROPS }).map((_, i) => (
          <button
            key={i}
            onClick={() => !isComplete && addWater(DROP_ML)}
            className={`flex items-center justify-center h-14 rounded-xl border transition-all ${i < filledDrops ? "bg-neon-purple/10 border-neon-purple/30" : "bg-secondary/30 border-border/50"}`}
          >
            <Droplets className={`w-5 h-5 ${i < filledDrops ? "text-neon-purple" : "text-muted-foreground/20"}`} />
          </button>
        ))}
      </div>

      <button onClick={() => !isComplete && addWater(DROP_ML)} className={`w-full py-3 rounded-xl font-mono text-sm font-semibold border ${isComplete ? "bg-neon-green/10 text-neon-green border-neon-green/20" : "bg-neon-purple/10 text-neon-purple border-neon-purple/20"}`}>
        {isComplete ? "Goal Reached!" : `+ ${DROP_ML}ml`}
      </button>
    </motion.div>
  )
}