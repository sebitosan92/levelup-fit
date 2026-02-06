"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Save, RotateCcw, Flame } from "lucide-react"
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
    <div className="rounded-2xl glass-card p-5 border border-white/10">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground font-mono text-xs uppercase tracking-widest">
        <Flame size={14} className="text-neon-purple" />
        <span>Workout Timer</span>
      </div>
      <div className="text-center mb-6">
        <p className="text-5xl font-mono font-bold tracking-tight">{formatTime(seconds)}</p>
        <p className="text-[10px] text-muted-foreground mt-2">{Math.floor(seconds / 60)} MIN EARNED</p>
      </div>
      <div className="flex justify-center gap-3">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-3 rounded-xl font-mono text-sm font-bold ${isRunning ? 'bg-white/10' : 'bg-neon-purple text-white'}`}
        >
          {isRunning ? "PAUSE" : "START"}
        </button>
        {seconds >= 60 && !saved && (
          <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-green-500/20 text-green-500 font-mono text-sm font-bold">
            SAVE
          </button>
        )}
      </div>
    </div>
  )
}