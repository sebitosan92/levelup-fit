"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, X, Download, Check, Zap, Droplets, Timer } from "lucide-react"
import { useFitnessData, useWaterData } from "@/lib/fitness-store"

export function ShareProgress() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const fitnessData = useFitnessData()
  const waterData = useWaterData()

  const handleShare = useCallback(async () => {
    const text = `LevelUP Fit Progress\nLevel: ${fitnessData.currentLevel}\nTotal Workout: ${fitnessData.totalMinutes} min\nWater Today: ${waterData.amount}ml / 2000ml\n\nJoin me on LevelUP Fit!`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "LevelUP Fit Progress", text })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [fitnessData, waterData])

  const minutesInLevel = fitnessData.totalMinutes % 30
  const progressPercent = Math.round((minutesInLevel / 30) * 100)

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-mono font-medium text-foreground transition-all"
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-4 h-4 text-neon-purple" />
        Share
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-sm z-10"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center z-20"
                aria-label="Close share dialog"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Shareable card preview */}
              <div
                ref={cardRef}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(240 15% 8%) 0%, hsl(240 12% 12%) 50%, hsl(270 20% 12%) 100%)",
                  border: "1px solid hsl(270 80% 65% / 0.3)",
                }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-mono text-foreground">
                        <span className="text-neon-purple">Level</span>
                        <span className="text-neon-green">UP</span> Fit
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">Fitness RPG Progress</p>
                    </div>
                  </div>

                  {/* Level display */}
                  <div className="text-center mb-6">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Current Level</p>
                    <p className="text-6xl font-bold font-mono text-foreground neon-purple-text">
                      {fitnessData.currentLevel}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden mx-auto max-w-48">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, hsl(270 80% 65%), hsl(142 72% 50%))" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      {progressPercent}% to next level
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-secondary/60 text-center">
                      <Timer className="w-4 h-4 text-neon-purple mx-auto mb-1" />
                      <p className="text-lg font-bold font-mono text-foreground">{fitnessData.totalMinutes}</p>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase">Minutes</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/60 text-center">
                      <Zap className="w-4 h-4 text-neon-green mx-auto mb-1" />
                      <p className="text-lg font-bold font-mono text-foreground">{fitnessData.currentLevel}</p>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase">Level</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/60 text-center">
                      <Droplets className="w-4 h-4 text-neon-purple mx-auto mb-1" />
                      <p className="text-lg font-bold font-mono text-foreground">{waterData.amount}</p>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase">ml Water</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-purple text-primary-foreground font-mono text-sm font-semibold neon-purple-glow"
                  whileTap={{ scale: 0.97 }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Share Stats
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
