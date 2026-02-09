"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Timer, Zap, TrendingUp, BarChart3, 
  Trophy, Gift, Database, Users, X, Activity, 
  CheckCircle2, AlertCircle, Clock,
  Calculator
} from "lucide-react"

// Importy komponentów lokalnych
import { LevelRing } from "./level-ring"
import { WorkoutTimer } from "./workout-timer"
import { WaterTracker } from "./water-tracker"
import { HoloCard } from "./holo-card"
import { WeatherEnvironment } from "./weather-env"
import { StatsRadar } from "./stats-radar"
import { SocialView } from "./social-view"
import { ShareProgress } from "./share-progress"
import { BioCalculator } from "./bio-calculator"
import { MacroTracker } from "./macro-tracker" // IMPORT NOWEGO KOMPONENTU

import { useWeather } from "@/lib/weather-store"
import { 
  useFitnessData, 
  useAuth,
  useWaterData,
  getTodayWorkoutMinutes,
  claimQuestReward,
  useLootBoxes,
  getTimeUntilMidnight
} from "@/lib/fitness-store"

export function Dashboard() {
  const { profile, display_name } = useAuth()
  const fitness = useFitnessData()
  const water = useWaterData()
  const workoutMins = typeof getTodayWorkoutMinutes === 'function' ? getTodayWorkoutMinutes() : 0
  const lootBoxes = useLootBoxes() || 0
  const { vibe, temp } = useWeather()
  
  const [showVault, setShowVault] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  
  const [systemStatus, setSystemStatus] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClaimAction = async (xp: number, stat: any, val: number) => {
    setSystemStatus(null);
    const result = await claimQuestReward(xp, stat, val)
    
    if (result?.isAlreadyClaimed) {
      setSystemStatus({ 
        text: `LIMIT OSIĄGNIĘTY. RESET ZA: ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`, 
        type: 'error' 
      })
    } else if (result?.success) {
      setSystemStatus({ text: `SYNCHRONIZACJA OK: +${xp} XP DODANE`, type: 'success' })
    } else {
      setSystemStatus({ text: "BŁĄD POŁĄCZENIA Z SERWEREM", type: 'error' })
    }
    
    setTimeout(() => setSystemStatus(null), 5000)
  }

  if (!profile && !display_name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-12 h-12 text-cyan-500 animate-pulse" />
        <p className="text-cyan-500/50 font-mono text-[10px] uppercase tracking-widest">Nawiązywanie połączenia neuronowego...</p>
      </div>
    )
  }

  const weatherColor = vibe === 'rainy' ? 'text-cyan-400' : vibe === 'sunny' ? 'text-orange-400' : 'text-emerald-400'

  return (
    <div className="relative space-y-6 pb-24 px-4 sm:px-0">
      <WeatherEnvironment />
      
      {/* NOTYFIKACJE SYSTEMOWE */}
      <div className="fixed top-24 left-4 right-4 z-[100] pointer-events-none">
        <AnimatePresence mode="wait">
          {systemStatus && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`max-w-md mx-auto p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl flex items-center gap-4 pointer-events-auto ${
                systemStatus.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-200' : 'bg-green-950/90 border-green-500 text-green-200'
              }`}
            >
              {systemStatus.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-green-400" />}
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">System</span>
                <span className="text-xs font-black uppercase tracking-tight">{systemStatus.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className={`text-[10px] font-mono uppercase tracking-widest ${weatherColor}`}>
              {vibe === 'rainy' ? 'DESZCZ' : vibe === 'sunny' ? 'SŁOŃCE' : 'STANDARD'} AKTYWNY {temp !== null && `[${temp}°C]`}
            </p>
            <h1 className="text-xl font-bold font-mono italic text-white uppercase tracking-tighter">LevelUP FIT by Seba</h1>
            
            <div className="pt-2">
              <ShareProgress />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowSocial(true)} className="p-3 glass-card rounded-xl border border-cyan-500/50 text-cyan-400 bg-cyan-500/10 transition-all hover:bg-cyan-500/20 active:scale-90">
              <Users size={20} />
            </button>
            <button onClick={() => setShowVault(true)} className="relative p-3 glass-card rounded-xl border border-purple-500/50 text-purple-400 bg-purple-500/10 transition-all hover:bg-purple-500/20 active:scale-90">
              <Database size={20} />
              {lootBoxes > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] text-white rounded-full flex items-center justify-center font-bold animate-pulse">{lootBoxes}</span>}
            </button>
          </div>
        </div>

        {/* BONUS DZIENNY */}
        <button 
          onClick={() => handleClaimAction(50, 'foc', 10)} 
          className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between shadow-lg hover:bg-white/10 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Gift size={18} className="text-yellow-500 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-white uppercase tracking-tight">Połączenie Neuronowe</span>
          </div>
          <span className="text-[10px] font-black text-yellow-500 uppercase">Odbierz Bonus</span>
        </button>

        <div className="flex justify-center py-4">
          <LevelRing level={fitness?.currentLevel || 1} totalMinutes={fitness?.totalMinutes || 0} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl">
              <Timer size={14} className="text-purple-400 mb-2"/>
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Czas Całkowity</p>
              <p className="text-2xl font-black text-white">{fitness?.totalMinutes || 0}<span className="text-xs ml-1 text-purple-400">m</span></p>
            </div>
          </HoloCard>
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl">
              <TrendingUp size={14} className="text-cyan-400 mb-2"/>
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Następny Poziom</p>
              <p className="text-2xl font-black text-white">{30 - ((fitness?.totalMinutes || 0) % 30)}<span className="text-xs ml-1 text-cyan-400">m</span></p>
            </div>
          </HoloCard>
        </div>

        <WorkoutTimer />
        <WaterTracker />

        {/* BIO-OPTYMALIZACJA (KALKULATOR + MAKRO) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Calculator size={14} className="text-purple-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Bio-Optymalizacja</h2>
          </div>
          <div className="grid gap-4">
            <BioCalculator />
            <MacroTracker />
          </div>
        </div>

        {/* ANALIZA BIOMETRYCZNA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <BarChart3 size={14} className="text-cyan-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Analiza Biometryczna</h2>
          </div>
          <HoloCard>
            <div className="p-6 glass-card rounded-[2.5rem] flex justify-center items-center min-h-[300px] overflow-hidden">
              <StatsRadar />
            </div>
          </HoloCard>
        </div>

        {/* MISJE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Aktywne Misje</h2>
            </div>
            <div className="text-[9px] font-mono text-cyan-500/50 flex items-center gap-1 bg-cyan-500/5 px-2 py-1 rounded">
              <Clock size={10} /> {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { id: 'q1', title: 'Protokół Nawodnienia', desc: 'Wypij 2000ml wody', progress: water?.amount || 0, total: 2000, reward: 50, stat: 'def' },
              { id: 'q2', title: 'Budowa Wytrzymałości', desc: 'Trenuj przez 30 min', progress: workoutMins, total: 30, reward: 100, stat: 'str' }
            ].map(quest => {
              const percentage = Math.min(100, Math.round(((Number(quest.progress) || 0) / (Number(quest.total) || 1)) * 100))
              const isDone = percentage >= 100
              return (
                <div key={quest.id} className={`p-4 glass-card rounded-2xl border transition-all duration-500 ${isDone ? 'border-green-500/40 bg-green-500/10' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white italic uppercase tracking-tight">{quest.title}</p>
                      <p className="text-[9px] text-white/30 font-mono uppercase">{quest.progress} / {quest.total} ML/MIN</p>
                    </div>
                    {isDone ? (
                      <button onClick={() => handleClaimAction(quest.reward, quest.stat as any, 5)} className="bg-white text-black text-[9px] font-black px-4 py-2 rounded-lg uppercase shadow-lg">Odbierz</button>
                    ) : (
                      <div className="px-3 py-1 bg-black/40 rounded flex items-center gap-2">
                        <Zap size={10} className="text-yellow-500" />
                        <span className="text-[9px] font-black text-white/60">{quest.reward} XP</span>
                      </div>
                    )}
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full ${isDone ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500/40'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MODALE */}
      <AnimatePresence>
        {showSocial && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocial(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md z-10">
              <div className="absolute -top-12 right-0">
                <button onClick={() => setShowSocial(false)} className="p-2 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <SocialView />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVault && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVault(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className="relative z-10 bg-black border border-white/20 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(168,85,247,0.2)]">
              <Database className="mx-auto mb-4 text-purple-500" size={48} />
              <h2 className="text-xl font-black text-white uppercase italic">Skarbiec</h2>
              <p className="text-white/50 text-xs mt-2 uppercase tracking-widest leading-relaxed">System nagród w trakcie <br/>synchronizacji neuronowej...</p>
              <button onClick={() => setShowVault(false)} className="mt-6 px-8 py-2 bg-purple-500 text-white font-black rounded-xl uppercase text-[10px] active:scale-95 transition-transform">Zamknij</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}