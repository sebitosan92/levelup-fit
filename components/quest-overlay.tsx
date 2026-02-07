"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Droplets, Dumbbell, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import React, { useState, useEffect } from "react"
// UPEWNIJ SIĘ ŻE TA ŚCIEŻKA JEST POPRAWNA:
import { claimQuestReward, useWaterData, getTodayWorkoutMinutes, getTimeUntilMidnight } from "@/lib/fitness-store"

export function QuestSystem() {
  const water = useWaterData()
  const workoutMins = getTodayWorkoutMinutes()
  
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' })
  const [status, setStatus] = useState<{ text: string; type: 'error' | 'success' | 'debug' } | null>(null)

  // Bezpieczne odliczanie
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const time = getTimeUntilMidnight()
        setTimeLeft(time)
      } catch (e) {
        console.error("Błąd funkcji czasu:", e)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClaim = async (reward: number, stat: 'str' | 'spd' | 'def' | 'foc', val: number) => {
    // TEST: Sprawdźmy czy UI w ogóle reaguje na kliknięcie
    setStatus({ text: "ŁĄCZENIE Z BAZĄ...", type: 'debug' })

    try {
      const result = await claimQuestReward(reward, stat, val)
      console.log("DEBUG RESULT:", result)

      if (result?.isAlreadyClaimed) {
        setStatus({ 
          text: `NAGRODA JUŻ ODEBRANA! RESET ZA: ${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`, 
          type: 'error' 
        })
      } else if (result?.success) {
        setStatus({ text: `ODEBRANO NAGRODĘ! +${reward} XP`, type: 'success' })
        if (result.leveledUp) setShowLevelUp(true)
      } else {
        // Jeśli result jest pusty lub success = false
        setStatus({ text: result?.error || "BŁĄD: Baza nie odpowiedziała poprawnie.", type: 'error' })
      }
    } catch (err: any) {
      console.error("KRYTYCZNY BŁĄD UI:", err)
      setStatus({ text: "AWARIA POŁĄCZENIA: " + err.message, type: 'error' })
    }

    // Ukryj po 5 sek.
    setTimeout(() => setStatus(null), 5000)
  }

  const quests = [
    { 
      id: 'q1', title: 'Protokół Nawodnienia', desc: 'Wypij 2000ml wody', 
      icon: <Droplets className="text-blue-400" />,
      progress: water?.amount || 0, goal: 2000, reward: 10, stat: 'def' as const
    },
    { 
      id: 'q2', title: 'Żelazna Wola', desc: '30 min treningu', 
      icon: <Dumbbell className="text-purple-400" />,
      progress: workoutMins || 0, goal: 30, reward: 20, stat: 'str' as const
    }
  ]

  return (
    <div className="w-full max-w-md mx-auto space-y-4 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest italic">Zadania Operacyjne</h3>
        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/30 font-mono text-xs">
          {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
        </div>
      </div>

      {/* POWIADOMIENIE - ZAWSZE WIDOCZNE GDY STATUS ISTNIEJE */}
      <div className="relative z-[60]">
        <AnimatePresence mode="wait">
          {status && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border-2 flex items-center gap-3 font-bold text-xs uppercase tracking-tighter shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
                status.type === 'error' ? 'bg-red-600 border-red-400 text-white' : 
                status.type === 'debug' ? 'bg-yellow-500 border-yellow-300 text-black' :
                'bg-green-600 border-green-400 text-white'
              }`}
            >
              {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {status.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LISTA QUESTÓW */}
      <div className="space-y-3">
        {quests.map(q => {
          const isDone = q.progress >= q.goal
          return (
            <div key={q.id} className={`p-4 rounded-2xl border transition-all ${isDone ? 'bg-white/10 border-green-500/30' : 'bg-white/5 border-white/10 opacity-80'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/40 rounded-lg shadow-inner">{q.icon}</div>
                  <div>
                    <p className="text-sm font-black text-white italic">{q.title}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold">{q.progress} / {q.goal}</p>
                  </div>
                </div>
                {isDone ? (
                  <button 
                    onClick={() => handleClaim(q.reward, q.stat, 5)}
                    className="bg-white text-black text-[10px] font-black px-5 py-2 rounded-full uppercase hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                  >
                    Odbierz
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white/20 rounded-full animate-ping" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL LEVEL UP */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6" onClick={() => setShowLevelUp(false)}>
            <div className="text-center space-y-4">
              <Trophy size={80} className="text-yellow-400 mx-auto" />
              <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">Level Up!</h2>
              <p className="text-blue-400 font-mono tracking-widest uppercase">System zsynchronizowany</p>
              <button className="px-12 py-3 bg-white text-black font-black uppercase rounded-full">Kontynuuj</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}