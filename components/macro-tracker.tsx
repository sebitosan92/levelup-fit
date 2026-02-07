"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Beef, 
  Wheat, 
  Droplet, 
  RotateCcw, 
  Zap,
  ChevronRight,
  Cloud,
  Target
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export function MacroTracker() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const [macros, setMacros] = useState<Macros>({
    protein: 0,
    carbs: 0,
    fats: 0
  })

  // Dynamiczne cele pobierane z kalkulatora
  const [goals, setGoals] = useState<Macros>({
    protein: 160,
    carbs: 250,
    fats: 70
  })

  // 1. Ładowanie danych i Celów (z Kalkulatora)
  useEffect(() => {
    // Pobierz zapisane spożycie
    const savedMacros = localStorage.getItem('daily_macros')
    if (savedMacros) {
      try { setMacros(JSON.parse(savedMacros)) } catch (e) { console.error(e) }
    }

    // Pobierz CELE z kalkulatora (Klucz musi być taki sam jak w Kalkulatorze)
    const savedGoals = localStorage.getItem('user_bio_goals')
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals)
        setGoals({
          protein: parsedGoals.protein || 160,
          carbs: parsedGoals.carbs || 250,
          fats: parsedGoals.fats || 70
        })
      } catch (e) { console.error("Błąd ładowania celów", e) }
    }

    const fetchSupabaseMacros = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_macros')
        .select('protein, carbs, fats')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        const cloudMacros: Macros = {
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fats: data.fats || 0
        }
        setMacros(cloudMacros)
        localStorage.setItem('daily_macros', JSON.stringify(cloudMacros))
      }
    }

    fetchSupabaseMacros()

    // Opcjonalnie: Nasłuchiwanie zmian w LocalStorage (jeśli kalkulator jest na tej samej stronie)
    const handleStorageChange = () => {
        const updatedGoals = localStorage.getItem('user_bio_goals')
        if (updatedGoals) setGoals(JSON.parse(updatedGoals))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 2. Synchronizacja spożycia
  useEffect(() => {
    const syncData = async () => {
      localStorage.setItem('daily_macros', JSON.stringify(macros))
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setIsSyncing(true)
      try {
        await supabase.from('user_macros').upsert({
          user_id: user.id,
          protein: macros.protein,
          carbs: macros.carbs,
          fats: macros.fats,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      } catch (err) {
        console.error("Sync error:", err)
      } finally {
        setTimeout(() => setIsSyncing(false), 800)
      }
    }

    const timeoutId = setTimeout(syncData, 1500)
    return () => clearTimeout(timeoutId)
  }, [macros])

  const addMacro = (type: keyof Macros, amount: number) => {
    setMacros(prev => ({ ...prev, [type]: Math.max(0, prev[type] + amount) }))
  }

  const setExactMacro = (type: keyof Macros, value: number) => {
    setMacros(prev => ({ ...prev, [type]: value }))
  }

  const resetMacros = () => {
    if(confirm("Zresetować dzisiejsze paliwo?")) {
      setMacros({ protein: 0, carbs: 0, fats: 0 })
    }
  }

  const totalCalories = (macros.protein * 4) + (macros.carbs * 4) + (macros.fats * 9)
  const targetCalories = (goals.protein * 4) + (goals.carbs * 4) + (goals.fats * 9)

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 glass-card rounded-2xl border border-white/10 flex items-center justify-between group hover:border-cyan-500/50 transition-all bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 relative">
            <Zap size={18} />
            {isSyncing && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute -top-1 -right-1 text-cyan-200"
              >
                <Cloud size={10} />
              </motion.div>
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-white uppercase font-mono tracking-tight flex items-center gap-2">
              Monitor Paliwa
              {isSyncing && <span className="text-[7px] text-cyan-500 animate-pulse tracking-tighter">SYNCING...</span>}
            </p>
            <p className="text-[9px] text-white/40 uppercase font-mono tracking-widest">
                {totalCalories} / {targetCalories} kcal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:block h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-cyan-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%` }}
                />
            </div>
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                <ChevronRight size={16} className="text-white/20" />
            </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 mt-2 space-y-8 glass-card rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
              <MacroRow label="Białko" current={macros.protein} goal={goals.protein} color="bg-red-500" icon={<Beef size={12} />} onAdd={(val) => addMacro('protein', val)} onSet={(val) => setExactMacro('protein', val)} />
              <MacroRow label="Węglowodany" current={macros.carbs} goal={goals.carbs} color="bg-yellow-500" icon={<Wheat size={12} />} onAdd={(val) => addMacro('carbs', val)} onSet={(val) => setExactMacro('carbs', val)} />
              <MacroRow label="Tłuszcze" current={macros.fats} goal={goals.fats} color="bg-emerald-500" icon={<Droplet size={12} />} onAdd={(val) => addMacro('fats', val)} onSet={(val) => setExactMacro('fats', val)} />

              <div className="pt-2 flex justify-between items-center border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] text-white/20 font-mono uppercase italic flex items-center gap-1">
                    <Target size={8} /> Cele zsynchronizowane z Bio-Kalkulatorem
                  </p>
                  <p className="text-[7px] text-cyan-500/30 font-mono uppercase flex items-center gap-1"><Cloud size={8} /> Cloud Backup Active</p>
                </div>
                <button onClick={resetMacros} className="p-2 text-white/20 hover:text-red-400 transition-colors"><RotateCcw size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MacroRowProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  icon: React.ReactNode;
  onAdd: (val: number) => void;
  onSet: (val: number) => void;
}

function MacroRow({ label, current, goal, color, icon, onAdd, onSet }: MacroRowProps) {
  const progress = Math.min(100, (current / goal) * 100)
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-white/5 text-white/60">{icon}</span>
          <span className="text-[9px] font-mono text-white/60 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-white">{current} <span className="text-white/20">/ {goal}g</span></span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${progress}%` }} className={`h-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
      </div>
      <input type="range" min="0" max={goal + 100} value={current} onChange={(e) => onSet(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
      <div className="flex gap-2">
        {[5, 10, 25].map(val => (
          <button key={val} onClick={() => onAdd(val)} className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-mono text-white/40 transition-all active:scale-95">+{val}g</button>
        ))}
      </div>
    </div>
  )
}