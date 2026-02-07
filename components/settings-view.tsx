"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trash2,
  RotateCcw,
  Zap,
  Info,
  ChevronRight,
  LogOut,
  User,
  Edit3,
  Check,
  X,
  Target,
  Trophy,
  Droplets,
  Lock,
  Loader2
} from "lucide-react"
import {
  resetAllData,
  useFitnessData,
  useWaterData,
  useWorkoutLog,
  useAuth,
  logoutUser,
  updateUsername,
} from "@/lib/fitness-store"

export function SettingsView() {
  const fitnessData = useFitnessData()
  const waterData = useWaterData()
  const workoutLog = useWorkoutLog()
  const auth = useAuth()
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const totalWorkouts = workoutLog.length
  
  // Synchronizacja newName z auth.display_name przy wejściu w tryb edycji
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
        // WYWOŁANIE POPRAWIONEJ FUNKCJI ZE STORE
        const result = await updateUsername(newName.trim())
        
        // TypeScript teraz poprawnie widzi 'result.success'
        if (result?.success) {
          setIsEditing(false)
        } else {
          alert("Error updating profile: " + (result?.error || "Unknown error"))
        }
      } catch (err) {
        console.error("Update failed:", err)
        alert("System failure during update.")
      } finally {
        setIsUpdating(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      className="px-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-xl font-black italic tracking-tighter font-mono mb-6 uppercase">
        Settings & Protocol
      </h2>

      {/* --- PROFILE CARD --- */}
      {auth && (
        <motion.div
          className="rounded-2xl glass-card p-5 mb-4 border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-neon-purple/15 flex items-center justify-center border border-neon-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <User className="w-7 h-7 text-neon-purple" />
            </div>
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div 
                    key="editing"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={isUpdating}
                      className="bg-white/5 border border-neon-green/30 rounded px-2 py-1 text-sm font-mono focus:outline-none w-full text-neon-green"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    {isUpdating ? (
                      <Loader2 size={16} className="animate-spin text-neon-purple" />
                    ) : (
                      <>
                        <button onClick={handleSaveName} className="text-neon-green p-1 hover:bg-white/5 rounded transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="text-red-400 p-1 hover:bg-white/5 rounded transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="display"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                  >
                    <p className="text-sm font-bold font-mono text-foreground truncate">
                      {auth.display_name}
                    </p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-white/5 rounded transition-colors"
                    >
                      <Edit3 size={12} className="text-muted-foreground hover:text-neon-purple" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-[10px] text-neon-green font-mono uppercase tracking-widest mt-0.5">
                Level {fitnessData.currentLevel} Warrior
              </p>
              <p className="text-[9px] text-muted-foreground font-mono opacity-50 truncate">
                {auth.user?.email}
              </p>
            </div>
            <button 
              onClick={logoutUser} 
              className="p-2 rounded-xl glass-card border border-white/5 text-muted-foreground hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-2xl glass-card border border-white/5">
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Total Workouts</p>
          <p className="text-2xl font-black font-mono italic">{totalWorkouts}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/5">
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Water Today</p>
          <p className="text-2xl font-black font-mono italic text-neon-green">{waterData.amount}ml</p>
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <motion.div
        className="rounded-2xl glass-card p-5 mb-4 border border-white/5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-neon-green" />
          <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">How Protocol Works</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Level Up", desc: "30 min workout = +1 Level", icon: <Zap size={14} className="text-neon-purple" /> },
            { label: "Rewards", desc: "Unlock loot as you level up", icon: <Trophy size={14} className="text-yellow-500" /> },
            { label: "Water Goal", desc: "Target: 2000ml daily", icon: <Droplets size={14} className="text-blue-400" /> },
            { label: "The Vault", desc: "Locked until daily workout", icon: <Lock size={14} className="text-red-400" /> },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="shrink-0">{item.icon}</div>
              <div>
                <p className="text-xs font-bold font-mono uppercase tracking-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* --- RECENT LOGS --- */}
      {workoutLog.length > 0 && (
        <div className="rounded-2xl glass-card p-5 mb-4 border border-white/5">
          <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 italic">Recent Logs</h3>
          <div className="space-y-2">
            {workoutLog.slice(-3).reverse().map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-mono opacity-60">{log.date}</span>
                <span className="text-xs font-mono text-neon-green font-bold">+{log.minutes} MIN</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- DANGER ZONE --- */}
      <div className="rounded-2xl glass-card p-5 border border-red-500/20 bg-red-500/5">
        <h3 className="text-[10px] font-mono text-red-500 uppercase tracking-widest mb-4">System Reset</h3>
        {showConfirm ? (
          <div className="flex gap-2">
            <button 
              onClick={handleReset} 
              className="flex-1 py-3 rounded-xl bg-red-600 text-[10px] font-bold font-mono text-white hover:bg-red-700 transition-colors"
            >
              CONFIRM WIPE
            </button>
            <button 
              onClick={() => setShowConfirm(false)} 
              className="flex-1 py-3 rounded-xl glass-card border border-white/10 text-[10px] font-mono hover:bg-white/5 transition-colors"
            >
              CANCEL
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowConfirm(true)} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-500 font-mono text-[10px] font-bold hover:bg-red-500/10 transition-colors"
          >
            <RotateCcw size={14} /> CLEAR LOCAL PROTOCOL
          </button>
        )}
      </div>
    </motion.div>
  )
}