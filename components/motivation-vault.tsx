"use client"

import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Dumbbell,
  ImagePlus,
  Trash2,
  Trophy,
} from "lucide-react"
import {
  getStoredPin,
  setStoredPin,
  getTodayWorkoutMinutes,
  useVaultImages,
  addVaultImage,
  removeVaultImage,
  useFitnessData,
} from "@/lib/fitness-store"

// --- IMPORT LOOT BOXA ---
import { LootBoxView } from "./loot-box-view"

interface VaultImage {
  id: string;
  src: string;
  title: string;
}

const BUILTIN_CARDS = [
  { id: "b1", title: "Peak Performance", subtitle: "Push beyond limits", gradient: "from-neon-purple/30 to-neon-green/10", requiredLevel: 1 },
  { id: "b2", title: "Iron Will", subtitle: "Consistency is power", gradient: "from-neon-green/30 to-neon-purple/10", requiredLevel: 5 },
  { id: "b3", title: "Beast Mode", subtitle: "Unleash potential", gradient: "from-neon-purple/20 to-neon-green/20", requiredLevel: 10 },
  { id: "b4", title: "No Excuses", subtitle: "Every rep counts", gradient: "from-neon-green/15 to-neon-purple/25", requiredLevel: 15 },
  { id: "b5", title: "Grind Time", subtitle: "Champions train daily", gradient: "from-neon-purple/30 to-neon-green/5", requiredLevel: 20 },
  { id: "b6", title: "Level Up", subtitle: "Transform yourself", gradient: "from-neon-green/30 to-neon-purple/5", requiredLevel: 25 },
]

export function MotivationVault() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [hasPin, setHasPin] = useState(false)
  const [isSettingPin, setIsSettingPin] = useState(false)
  const [error, setError] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [todayMinutes, setTodayMinutes] = useState(0)
  
  const vaultImages = useVaultImages() as VaultImage[]
  const fitnessData = useFitnessData()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = getStoredPin()
    setHasPin(!!stored)
    setTodayMinutes(getTodayWorkoutMinutes())
  }, [])

  const canReveal = todayMinutes >= 30

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (pinInput.length >= 4) return
      const newPin = pinInput + digit
      setPinInput(newPin)
      setError("")

      if (newPin.length === 4) {
        if (isSettingPin || !hasPin) {
          setStoredPin(newPin)
          setHasPin(true)
          setIsSettingPin(false)
          setIsUnlocked(true)
          setPinInput("")
        } else {
          const stored = getStoredPin()
          if (stored === newPin) {
            setIsUnlocked(true)
            setPinInput("")
          } else {
            setError("Wrong PIN")
            setTimeout(() => {
              setPinInput("")
              setError("")
            }, 1200)
          }
        }
      }
    },
    [pinInput, isSettingPin, hasPin],
  )

  const handleDeleteDigit = () => {
    setPinInput((p) => p.slice(0, -1))
    setError("")
  }

  const handleReveal = () => {
    if (canReveal) setRevealed(!revealed)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const name = file.name.replace(/\.[^/.]+$/, "")
      addVaultImage(result, name)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ---- PIN Screen ----
  if (!isUnlocked) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[75vh] px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(270 80% 65% / 0.06) 0%, transparent 70%)" }}
        />

        <motion.div
          className="w-14 h-14 rounded-2xl bg-neon-purple/15 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Lock className="w-7 h-7 text-neon-purple" />
        </motion.div>

        <h2 className="text-xl font-bold text-foreground mb-1 font-mono">
          {isSettingPin || !hasPin ? "Set Your PIN" : "Enter PIN"}
        </h2>
        <p className="text-sm text-muted-foreground font-mono mb-8 text-center">
          {isSettingPin || !hasPin ? "Create a 4-digit code" : "Enter your 4-digit code to access the vault"}
        </p>

        <div className="flex gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                i < pinInput.length
                  ? error ? "bg-destructive border-destructive" : "bg-neon-purple border-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                  : "border-border/60"
              }`}
              animate={error && i < pinInput.length ? { x: [0, -5, 5, -5, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 w-60">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
            if (key === "") return <div key="empty" className="h-14" />
            if (key === "del") return (
              <motion.button key={key} onClick={handleDeleteDigit} className="h-14 rounded-xl glass-card text-muted-foreground flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )
            return (
              <motion.button key={key} onClick={() => handleDigitPress(key)} className="h-14 rounded-xl bg-secondary/60 text-foreground text-lg font-mono font-medium flex items-center justify-center hover:bg-secondary" whileTap={{ scale: 0.88 }}>
                {key}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ---- Unlocked Vault ----
  const currentLevel = fitnessData.currentLevel
  const unlockedBuiltinCount = BUILTIN_CARDS.filter((c) => c.requiredLevel <= currentLevel).length

  return (
    <motion.div className="px-4 pb-24 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-neon-green/15 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-neon-green" />
          </div>
          <h2 className="text-lg font-bold text-foreground font-mono text-xs">VAULT ACCESS GRANTED</h2>
        </div>
        <button onClick={() => { setIsUnlocked(false); setPinInput(""); setRevealed(false); }} className="text-[10px] text-muted-foreground font-mono px-3 py-1 rounded-xl glass-card border border-white/5">
          LOCK
        </button>
      </div>

      {/* --- SEKCJA LOOT BOXÓW (WIDOCZNA PO WPISANIU PINU) --- */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden bg-white/5 shadow-2xl">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neon-purple/80">Neural Supply Drops</span>
          <div className="w-1 h-1 bg-neon-purple rounded-full animate-pulse shadow-[0_0_5px_rgba(168,85,247,1)]" />
        </div>
        <div className="scale-95 origin-top">
          <LootBoxView />
        </div>
      </div>

      {/* REVEAL MECHANIC */}
      <motion.div className="p-4 rounded-2xl glass-card relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${canReveal ? "bg-neon-green/15" : "bg-secondary"}`}>
              <Dumbbell className={`w-4 h-4 ${canReveal ? "text-neon-green" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground font-mono">{canReveal ? "Visuals Decrypted" : "Visual Encryption Active"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">Today: {todayMinutes}/30 min</p>
            </div>
          </div>
          <motion.button onClick={handleReveal} disabled={!canReveal} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] font-bold transition-all ${canReveal ? "bg-neon-green/15 text-neon-green" : "bg-secondary/50 text-muted-foreground cursor-not-allowed"}`} whileTap={canReveal ? { scale: 0.95 } : {}}>
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            {revealed ? "HIDE" : "REVEAL"}
          </motion.button>
        </div>
      </motion.div>

      {/* CARDS PROGRESS */}
      <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neon-purple/15 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-neon-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground font-mono uppercase tracking-tighter">Level-Gated Motivation</p>
          <p className="text-[10px] text-muted-foreground font-mono">{unlockedBuiltinCount}/{BUILTIN_CARDS.length} Archive Unlocked</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-neon-purple px-2 py-1 rounded-lg bg-neon-purple/15 border border-neon-purple/20">LVL {currentLevel}</span>
      </div>

      {/* UPLOAD */}
      <div className="mb-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <motion.button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl glass-card text-[10px] font-mono font-bold text-foreground border border-white/5" whileTap={{ scale: 0.97 }}>
          <ImagePlus size={14} className="text-neon-purple" />
          UPLOAD TO ARCHIVE
        </motion.button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3">
        {vaultImages.map((img, i) => (
          <motion.div key={img.id} className="relative h-44 rounded-2xl overflow-hidden border border-border/40 group" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <img src={img.src || "/placeholder.svg"} alt={img.title} className="absolute inset-0 w-full h-full object-cover" />
            <AnimatePresence>
              {!revealed && (
                <motion.div className="absolute inset-0 bg-background/90 backdrop-blur-xl flex items-center justify-center" exit={{ opacity: 0 }}>
                  <Lock className="w-5 h-5 text-muted-foreground/20" />
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => removeVaultImage(img.id)} className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}

        {BUILTIN_CARDS.map((card, i) => {
          const levelUnlocked = card.requiredLevel <= currentLevel
          const isFullyVisible = revealed && levelUnlocked
          return (
            <motion.div key={card.id} className={`relative h-44 rounded-2xl overflow-hidden border ${levelUnlocked ? "border-border/40 shadow-lg" : "border-border/10 opacity-60"}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (vaultImages.length + i) * 0.05 }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
              <AnimatePresence>
                {!isFullyVisible && (
                  <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-2" exit={{ opacity: 0 }}>
                    <Lock size={16} className="text-white/20" />
                    {!levelUnlocked && <span className="text-[8px] font-mono text-white/40 uppercase">LVL {card.requiredLevel} REQ</span>}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                <p className="text-[11px] font-bold text-white font-mono uppercase tracking-tighter">{card.title}</p>
                <p className="text-[9px] text-white/60 font-mono italic">{card.subtitle}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}