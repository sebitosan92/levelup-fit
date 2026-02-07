"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calculator, 
  Scale, 
  Ruler, 
  Droplets, 
  Flame, 
  ChevronRight,
  Target,
  Cloud
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Inicjalizacja klienta
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function BioCalculator() {
  const [weight, setWeight] = useState(75)
  const [height, setHeight] = useState(180)
  const [age, setAge] = useState(25)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [activity, setActivity] = useState(1.2) 
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // 1. Inicjalizacja: Pobierz dane z LocalStorage i Supabase
  useEffect(() => {
    // Najpierw ładujemy szybko z LocalStorage (dla UX)
    const savedParams = localStorage.getItem('user_bio_params')
    if (savedParams) {
      const params = JSON.parse(savedParams)
      setWeight(params.weight || 75)
      setHeight(params.height || 180)
      setAge(params.age || 25)
      setGender(params.gender || 'male')
      setActivity(params.activity || 1.2)
    }

    // Potem dociągamy najświeższe dane z chmury
    const fetchCloudParams = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles') // Upewnij się, że masz taką tabelę
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        setWeight(data.weight)
        setHeight(data.height)
        setAge(data.age)
        setGender(data.gender)
        setActivity(data.activity)
      }
    }

    fetchCloudParams()
  }, [])

  // Obliczenia
  const bmr = gender === 'male' 
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161

  const tdee = Math.round(bmr * activity)
  const waterGoal = Math.round(weight * 35)

  // 2. Synchronizacja: LocalStorage + Supabase (Debounced)
  useEffect(() => {
    const syncBioData = async () => {
      // Zapis lokalny
      const params = { weight, height, age, gender, activity }
      localStorage.setItem('user_bio_params', JSON.stringify(params))

      // Oblicz cele dla MacroTrackera
      const protein = Math.round(weight * 2)
      const fats = Math.round(weight * 1)
      const carbs = Math.max(0, Math.round((tdee - (protein * 4) - (fats * 9)) / 4))
      
      localStorage.setItem('user_bio_goals', JSON.stringify({ protein, carbs, fats, tdee, waterGoal }))
      window.dispatchEvent(new Event('storage'))

      // Zapis w chmurze
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setIsSyncing(true)
      try {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          weight,
          height,
          age,
          gender,
          activity,
          tdee,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      } catch (err) {
        console.error("Bio Sync error:", err)
      } finally {
        setTimeout(() => setIsSyncing(false), 800)
      }
    }

    const timeoutId = setTimeout(syncBioData, 2000) // Czekamy 2s po ostatniej zmianie suwaka
    return () => clearTimeout(timeoutId)
  }, [weight, height, age, gender, activity, tdee, waterGoal])

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 glass-card rounded-2xl border border-white/10 flex items-center justify-between group hover:border-purple-500/50 transition-all bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 relative">
            <Calculator size={18} />
            {isSyncing && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute -top-1 -right-1 text-purple-300"
              >
                <Cloud size={10} />
              </motion.div>
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-white uppercase font-mono tracking-tight flex items-center gap-2">
              Bio-Kalkulator
              {isSyncing && <span className="text-[7px] text-purple-500 animate-pulse tracking-tighter">SAVING...</span>}
            </p>
            <p className="text-[9px] text-white/40 uppercase font-mono tracking-widest">{weight}kg • {gender === 'male' ? 'M' : 'K'} • {tdee} kcal</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
          <ChevronRight size={16} className="text-white/20" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 mt-2 space-y-6 glass-card rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-white/40 uppercase ml-1">Waga (kg)</label>
                  <div className="relative">
                    <Scale size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-sm font-mono text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-white/40 uppercase ml-1">Wzrost (cm)</label>
                  <div className="relative">
                    <Ruler size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-sm font-mono text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex p-1 bg-black/40 border border-white/10 rounded-xl">
                  <button 
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono transition-all ${gender === 'male' ? 'bg-purple-500 text-white' : 'text-white/30'}`}
                  >
                    Mężczyzna
                  </button>
                  <button 
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono transition-all ${gender === 'female' ? 'bg-purple-500 text-white' : 'text-white/30'}`}
                  >
                    Kobieta
                  </button>
                </div>
                <div className="w-24 space-y-1.5">
                   <label className="text-[9px] font-mono text-white/40 uppercase ml-1">Wiek</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono text-white/40 uppercase ml-1 flex justify-between">
                  <span>Aktywność</span>
                  <span className="text-purple-400 font-bold">x{activity}</span>
                </label>
                <input 
                  type="range" min="1.2" max="1.9" step="0.1" 
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-white/10 rounded-lg appearance-none h-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                  <p className="text-[9px] font-mono text-purple-400 uppercase font-black mb-1">TDEE</p>
                  <p className="text-xl font-black text-white font-mono">{tdee}<span className="text-[10px] ml-1 text-white/40">kcal</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-[9px] font-mono text-cyan-500 uppercase font-black mb-1">Woda</p>
                  <p className="text-xl font-black text-white font-mono">{waterGoal}<span className="text-[10px] ml-1 text-white/40">ml</span></p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                   <Target size={14} className="text-purple-400" />
                   <span className="text-[8px] font-mono text-white/40 uppercase tracking-tight">Cloud Sync Active</span>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full ${isSyncing ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}