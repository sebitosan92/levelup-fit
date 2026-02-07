"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RotateCcw,
  Zap,
  Info,
  LogOut,
  User,
  Edit3,
  Check,
  X,
  Trophy,
  Droplets,
  Lock,
  Loader2
} from "lucide-react"
import {
  resetAllData,
  useFitnessData,
  useWorkoutLog,
  useAuth,
  logoutUser,
  updateUsername,
  useLifetimeBoxes
} from "@/lib/fitness-store"

export function SettingsView() {
  const fitnessData = useFitnessData()
  const workoutLog = useWorkoutLog()
  const auth = useAuth()
  const totalLootBoxes = useLifetimeBoxes()

  const [showConfirm, setShowConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const totalWorkouts = workoutLog.length

  useEffect(() => {
    if (isEditing && auth?.display_name) {
      setNewName(auth.display_name)
    }
  }, [isEditing, auth?.display_name])

  const handleReset = () => {
    resetAllData()
    window.location.reload()
  }

  const handleSaveName = async () => {
    if (newName.trim() && newName !== auth?.display_name) {
      setIsUpdating(true)
      try {
        const result = await updateUsername(newName.trim())
        if (result?.success) setIsEditing(false)
        else alert("Błąd: " + (result?.error || "Nieznany błąd"))
      } catch (err) {
        alert("Awaria systemu.")
      } finally {
        setIsUpdating(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  return (
    // Dodano max-w-md i mx-auto dla wyrównania wielkości do reszty apki
    <motion.div 
      className="max-w-md mx-auto px-4 pb-24 w-full" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-black italic tracking-tighter font-mono mb-8 uppercase text-white">
        Ustawienia i Protokół
      </h2>

      {/* PROFIL - POWIĘKSZONY */}
      {auth && (
        <div className="rounded-2xl glass-card p-6 mb-6 border border-white/10 bg-white/5 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 flex items-center justify-center border border-neon-purple/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <User className="w-8 h-8 text-neon-purple" />
            </div>
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div 
                    key="editing" 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={isUpdating}
                      className="bg-black/40 border border-neon-green/50 rounded-lg px-3 py-2 text-base font-mono text-neon-green w-full focus:outline-none shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button onClick={handleSaveName} className="text-neon-green p-2 hover:bg-white/5 rounded-lg">
                        {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black font-mono text-white truncate leading-none">
                      {auth.display_name}
                    </p>
                    <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/5 rounded">
                      <Edit3 size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                )}
              </AnimatePresence>
              <p className="text-[11px] text-neon-green font-mono uppercase mt-2 tracking-[0.2em] font-bold">
                Level {fitnessData.currentLevel} Warrior
              </p>
            </div>
            <button 
              onClick={logoutUser} 
              className="p-3 bg-white/5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STATYSTYKI - POWIĘKSZONE GRIDY */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl glass-card border border-white/10 bg-white/5 shadow-lg">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.15em] mb-2">Treningi</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black font-mono italic text-white">{totalWorkouts}</p>
            <span className="text-[10px] text-muted-foreground font-mono uppercase">Sesji</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-white/10 bg-white/5 shadow-lg">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.15em] mb-2">Loot Boxes</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black font-mono italic text-neon-purple">{totalLootBoxes}</p>
            <span className="text-[10px] text-neon-purple/60 font-mono uppercase">Szt.</span>
          </div>
        </div>
      </div>

      {/* INSTRUKCJA - WIĘKSZA INTERLINIA I PADDING */}
      <div className="rounded-2xl glass-card p-6 mb-6 border border-white/10 bg-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-4 bg-neon-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <h3 className="text-xs font-mono text-white uppercase tracking-[0.2em] font-bold">Zasady Systemu</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Level Up", desc: "30 min wysiłku = 1 Punkt Poziomu", icon: <Zap size={16} className="text-neon-purple" /> },
            { label: "Nagrody", desc: "Nowe itemy w panelu Nagród", icon: <Trophy size={16} className="text-yellow-500" /> },
            { label: "Woda", desc: "Optymalnie 2000ml na dobę", icon: <Droplets size={16} className="text-blue-400" /> },
            { label: "Skarbiec", desc: "Zabezpieczony kodem PIN", icon: <Lock size={16} className="text-red-400" /> },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <p className="text-xs font-black font-mono uppercase text-white tracking-wide">{item.label}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESET - PEŁNA SZEROKOŚĆ I WIĘKSZE PRZYCISKI */}
      <div className="rounded-2xl glass-card p-6 border border-red-500/20 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
        <h3 className="text-[10px] font-mono text-red-500 uppercase tracking-[0.2em] mb-5 font-bold">Protokół Bezpieczeństwa</h3>
        {showConfirm ? (
          <div className="space-y-3">
            <button 
              onClick={handleReset} 
              className="w-full py-4 rounded-xl bg-red-600 text-xs font-black font-mono text-white uppercase tracking-widest shadow-lg shadow-red-900/40 active:scale-95 transition-transform"
            >
              POTWIERDZAM RESET DANYCH
            </button>
            <button 
              onClick={() => setShowConfirm(false)} 
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white uppercase tracking-widest"
            >
              ANULUJ
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowConfirm(true)} 
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-red-500/30 text-red-500 font-mono text-xs font-black uppercase tracking-widest hover:bg-red-500/10 transition-all shadow-inner"
          >
            <RotateCcw size={16} /> RESETUJ WSZYSTKIE DANE
          </button>
        )}
      </div>
    </motion.div>
  )
}