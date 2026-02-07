"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, Circle, Flame, Plus, Trophy, 
  Zap, Trash2, Dumbbell, Droplets, Moon, 
  Brain, Coffee, Target, BarChart, Book, 
  Apple, GlassWater, Eye, Wind, Timer,
  Activity, ShieldAlert, Cpu, ChevronRight
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

const PRESETS = [
  { title: "Zimny Prysznic", icon: <Droplets size={14} />, color: "text-blue-400" },
  { title: "Trening 30m", icon: <Dumbbell size={14} />, color: "text-green-400" },
  { title: "2L Wody", icon: <GlassWater size={14} />, color: "text-cyan-400" },
  { title: "Brak Słodyczy", icon: <Target size={14} />, color: "text-red-400" },
  { title: "Medytacja", icon: <Brain size={14} />, color: "text-purple-400" },
  { title: "Czytanie 15m", icon: <Book size={14} />, color: "text-indigo-400" },
  { title: "7h Snu", icon: <Moon size={14} />, color: "text-violet-500" },
  { title: "Post Przerywany", icon: <Timer size={14} />, color: "text-orange-400" },
]

interface Habit {
  id: string;
  title: string;
  streak_count: number;
  last_completed_at: string | null;
  is_completed_today?: boolean;
}

export function HabitStack() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  // --- LOGIKA LICZNIKA ZAGROŻENIA ---
  const [timeLeft, setTimeLeft] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const eod = new Date()
      eod.setHours(23, 59, 59, 999)
      
      const diff = eod.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      
      setIsUrgent(hours < 3)
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data: habitsData } = await supabase.from('user_habits').select(`*, habit_logs(completed_at)`).eq('user_id', user.id)
    if (habitsData) {
      const formattedHabits = habitsData.map(h => ({
        ...h,
        is_completed_today: h.habit_logs.some((log: any) => log.completed_at === today)
      }))
      setHabits(formattedHabits)
    }
    setIsLoading(false)
  }

  const addHabit = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !title.trim()) return
    const { data } = await supabase.from('user_habits').insert([{ title, user_id: user.id }]).select().single()
    if (data) setHabits([...habits, { ...data, is_completed_today: false }])
  }

  const toggleHabit = async (habit: Habit) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    if (habit.is_completed_today) {
      await supabase.from('habit_logs').delete().eq('habit_id', habit.id).eq('completed_at', today)
      updateLocalStreak(habit.id, -1)
    } else {
      await supabase.from('habit_logs').insert([{ habit_id: habit.id, user_id: user.id, completed_at: today }])
      updateLocalStreak(habit.id, 1)
    }
  }

  const updateLocalStreak = (id: string, inc: number) => {
    setHabits(habits.map(h => h.id === id ? { ...h, is_completed_today: !h.is_completed_today, streak_count: Math.max(0, h.streak_count + inc) } : h))
  }

  const deleteHabit = async (id: string) => {
    await supabase.from('user_habits').delete().eq('id', id)
    setHabits(habits.filter(h => h.id !== id))
  }

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak_count, 0)
  const completionRate = habits.length > 0 ? Math.round((habits.filter(h => h.is_completed_today).length / habits.length) * 100) : 0

  return (
    <div className="space-y-6 pb-20">
      {/* --- LOG SYSTEMOWY --- */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex -space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-1 h-3 rounded-full ${completionRate > (i * 30) ? 'bg-orange-500 animate-pulse' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">
          {completionRate === 100 ? "System: Wydajność Optymalna" : `System: Wydajność na poziomie ${completionRate}%`}
        </p>
      </div>

      {/* --- LICZNIK ZAGROŻENIA --- */}
      <motion.div 
        animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`p-5 rounded-[2rem] border transition-all duration-700 flex items-center justify-between ${
          isUrgent 
            ? "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]" 
            : "bg-white/[0.02] border-white/5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isUrgent ? "bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-white/5 text-white/40"}`}>
            <ShieldAlert size={20} className={isUrgent ? "animate-bounce" : ""} />
          </div>
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isUrgent ? "text-red-500" : "text-white/40"}`}>
              Protokół Resetu
            </h4>
            <p className="text-[8px] font-mono text-white/20 uppercase mt-0.5">Automatyczna weryfikacja o 00:00</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-mono font-black tracking-tighter ${isUrgent ? "text-red-500" : "text-white"}`}>
            {timeLeft}
          </p>
          <p className="text-[7px] font-black text-white/10 uppercase tracking-widest mt-1">Status: Aktywny</p>
        </div>
      </motion.div>

      {/* --- STATS DASHBOARD --- */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card relative overflow-hidden bg-orange-500/5 border border-orange-500/20 p-5 rounded-[2.5rem]">
          <Flame className="absolute -right-2 -top-2 text-orange-500/10 w-16 h-16" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Streak Total</span>
            <p className="text-3xl font-black text-white font-mono mt-1">{totalStreaks}</p>
          </div>
        </div>
        <div className="glass-card relative overflow-hidden bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-[2.5rem]">
          <Activity className="absolute -right-2 -top-2 text-cyan-500/10 w-16 h-16" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Realizacja</span>
            <p className="text-3xl font-black text-cyan-500 font-mono mt-1">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* --- WEEKLY MATRIX --- */}
      <div className="glass-card bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                <Cpu size={12} className="text-white/20" />
                <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Macierz 7-dniowa</h3>
            </div>
            <span className="text-[8px] font-mono text-green-500/50 uppercase">Synchro Ok</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${i === 5 ? 'border-orange-500/50 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'border-white/5 bg-white/5'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${i <= 5 ? 'bg-orange-500 shadow-[0_0_5px_#f97316]' : 'bg-white/10'}`} />
              </div>
              <span className="text-[8px] font-black text-white/20">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- QUICK PRESETS --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Szybkie Definicje</h3>
            <ChevronRight size={12} className="text-white/20" />
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-4 px-2 snap-x no-scrollbar">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                onClick={() => addHabit(p.title)}
                className="flex-shrink-0 snap-start flex items-center gap-3 px-5 py-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
              >
                <span className={p.color}>{p.icon}</span>
                <span className="text-[10px] font-bold text-white uppercase whitespace-nowrap">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- ACTIVE PROTOCOLS --- */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Aktywne Protokoły</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
             <span className="text-[9px] font-mono text-white/40 uppercase">Live Update</span>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative overflow-hidden p-5 rounded-[2rem] border transition-all duration-500 ${
                  habit.is_completed_today 
                    ? 'bg-orange-500/[0.07] border-orange-500/30' 
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => toggleHabit(habit)}
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        habit.is_completed_today 
                          ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] rotate-[360deg]' 
                          : 'bg-black/40 text-white/20 border border-white/10 group-hover:border-white/20'
                      }`}
                    >
                      {habit.is_completed_today ? <Zap size={20} fill="currentColor" /> : <Circle size={20} />}
                    </button>
                    
                    <div>
                      <p className={`text-sm font-black uppercase tracking-tight ${habit.is_completed_today ? 'text-white' : 'text-white/40'}`}>
                        {habit.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                          <Flame size={12} className={habit.streak_count > 0 ? "text-orange-500" : "text-white/10"} />
                          <span className="text-[9px] font-mono text-white/60 tracking-tighter">{habit.streak_count} DNI</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="p-3 text-white/5 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: habit.is_completed_today ? "100%" : "0%" }}
                    className="h-full bg-orange-500 shadow-[0_0_15px_#f97316]"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="relative mt-6 pb-10">
            <input 
              type="text"
              placeholder="ZDEFINIUJ NOWY PROTOKÓŁ..."
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (addHabit(newHabitTitle), setNewHabitTitle(""))}
              className="w-full bg-white/[0.02] border border-white/5 rounded-[1.5rem] py-5 px-6 text-[10px] font-mono text-white uppercase tracking-widest focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}