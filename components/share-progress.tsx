"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, X, Check, Zap, Droplets, Timer, ExternalLink } from "lucide-react"
import { useFitnessData, useWaterData } from "@/lib/fitness-store"

export function ShareProgress() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const fitnessData = useFitnessData()
  const waterData = useWaterData()

  const handleShare = useCallback(async () => {
    const text = `🚀 LevelUP Fit Progress\n\n⭐ Poziom: ${fitnessData.currentLevel}\n⏱️ Trening: ${fitnessData.totalMinutes} min\n💧 Woda: ${waterData.amount}ml / 2000ml\n\nDołącz do mnie w walce o formę! 🔥`
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: "Mój postęp w LevelUP Fit", 
          text: text 
        })
      } catch (err) {
        console.log("Anulowano udostępnianie")
      }
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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-[11px] font-mono font-bold text-white uppercase tracking-wider border border-white/10 hover:bg-white/5 transition-all"
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-3.5 h-3.5 text-neon-purple" />
        Udostępnij wynik
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              className="relative w-full max-w-sm z-10"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Karta graficzna do udostępnienia */}
              <div
                ref={cardRef}
                className="rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                style={{
                  background: "linear-gradient(135deg, #0a0a0a 0%, #121212 100%)",
                }}
              >
                <div className="p-8">
                  {/* Nagłówek karty */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30">
                      <Zap className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-base font-black font-mono italic tracking-tighter text-white">
                        LEVEL<span className="text-neon-green">UP</span> FIT
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">Karta Wojownika</p>
                    </div>
                  </div>

                  {/* Wyświetlacz poziomu */}
                  <div className="text-center mb-8 relative">
                    <div className="absolute inset-0 bg-neon-purple/5 blur-3xl rounded-full" />
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2">Aktualny Poziom</p>
                    <p className="text-7xl font-black font-mono italic text-white neon-purple-text leading-none">
                      {fitnessData.currentLevel}
                    </p>
                    
                    {/* Pasek postępu */}
                    <div className="mt-6 px-4">
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-green"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground font-mono mt-2 uppercase tracking-widest">
                        {progressPercent}% do kolejnego poziomu
                      </p>
                    </div>
                  </div>

                  {/* Siatka statystyk */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <Timer className="w-4 h-4 text-neon-purple mx-auto mb-2" />
                      <p className="text-lg font-black font-mono text-white leading-none">{fitnessData.totalMinutes}</p>
                      <p className="text-[8px] text-muted-foreground font-mono uppercase mt-1">Minut</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <Zap className="w-4 h-4 text-neon-green mx-auto mb-2" />
                      <p className="text-lg font-black font-mono text-white leading-none">{fitnessData.currentLevel}</p>
                      <p className="text-[8px] text-muted-foreground font-mono uppercase mt-1">Level</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-2" />
                      <p className="text-lg font-black font-mono text-white leading-none">{waterData.amount}</p>
                      <p className="text-[8px] text-muted-foreground font-mono uppercase mt-1">ml Wody</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Akcja główna */}
              <div className="mt-6">
                <motion.button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-neon-purple text-white font-mono text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  whileTap={{ scale: 0.97 }}
                >
                  {copied ? (
                    <><Check className="w-4 h-4" /> SKOPIOWANO DO SCHOWKA</>
                  ) : (
                    <><ExternalLink className="w-4 h-4" /> UDOSTĘPNIJ PROTOKÓŁ</>
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