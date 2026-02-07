"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Save, RotateCcw, Flame, CheckCircle2 } from "lucide-react"
import { addWorkoutMinutes } from "@/lib/fitness-store"

export function WorkoutTimer({ onLevelUp }: { onLevelUp?: () => void }) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const handleSave = useCallback(async () => {
    if (seconds < 60) return
    setIsRunning(false)
    const minutes = Math.floor(seconds / 60)
    
    // ZAPIS DO BAZY
    const result = await addWorkoutMinutes(minutes)
    
    setSaved(true)
    if (result.leveledUp && onLevelUp) onLevelUp()
    
    setTimeout(() => {
      setSeconds(0)
      setSaved(false)
    }, 2000)
  }, [seconds, onLevelUp])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="rounded-2xl glass-card p-5 border border-white/10 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">
        <Flame size={14} className="text-purple-500" />
        <span>Inicjacja Treningu</span>
      </div>

      <div className="text-center mb-6 relative">
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-2"
            >
              <CheckCircle2 size={40} className="text-green-500 mb-2" />
              <p className="text-green-500 font-black text-sm uppercase tracking-widest">Sesja Zapisana</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-5xl font-mono font-black tracking-tighter text-white">
                {formatTime(seconds)}
              </p>
              <p className="text-[10px] text-white/30 font-bold mt-2 uppercase tracking-widest">
                Pozyskano: {Math.floor(seconds / 60)} MIN aktywności
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-3 relative z-10">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          disabled={saved}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black font-mono text-xs tracking-widest transition-all active:scale-95 ${
            isRunning 
            ? 'bg-white/5 text-white/60 border border-white/10' 
            : 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
          }`}
        >
          {isRunning ? (
            <><Pause size={14} /> WSTRZYMAJ</>
          ) : (
            <><Play size={14} /> ROZPOCZNIJ</>
          )}
        </button>

        <AnimatePresence>
          {seconds >= 60 && !saved && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={handleSave} 
              className="px-6 py-4 rounded-xl bg-green-500/20 text-green-500 border border-green-500/30 font-black font-mono text-xs tracking-widest hover:bg-green-500 hover:text-black transition-all active:scale-95"
            >
              ZAPISZ
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Dekoracyjne tło dla efektu cyber */}
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <p className="text-[40px] font-black italic">SYNC</p>
      </div>
    </div>
  )
}