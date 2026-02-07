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
// Upewnij się, że ten plik istnieje w @/components/loot-box-view.tsx
import { LootBoxView } from "./loot-box-view"

interface VaultImage {
  id: string;
  src: string;
  title: string;
}

const BUILTIN_CARDS = [
  { id: "b1", title: "Szczyt Formy", subtitle: "Przekraczaj granice", gradient: "from-purple-600/30 to-emerald-500/10", requiredLevel: 1 },
  { id: "b2", title: "Żelazna Wola", subtitle: "Konsekwencja to potęga", gradient: "from-emerald-500/30 to-purple-600/10", requiredLevel: 5 },
  { id: "b3", title: "Tryb Bestii", subtitle: "Uwolnij potencjał", gradient: "from-purple-600/20 to-emerald-500/20", requiredLevel: 10 },
  { id: "b4", title: "Zero Wymówek", subtitle: "Każde powtórzenie się liczy", gradient: "from-emerald-500/15 to-purple-600/25", requiredLevel: 15 },
  { id: "b5", title: "Czas Walki", subtitle: "Mistrzowie trenują codziennie", gradient: "from-purple-600/30 to-emerald-500/5", requiredLevel: 20 },
  { id: "b6", title: "Nowy Poziom", subtitle: "Przetransformuj siebie", gradient: "from-emerald-500/30 to-purple-600/5", requiredLevel: 25 },
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
        if (!hasPin) {
          setStoredPin(newPin)
          setHasPin(true)
          setIsUnlocked(true)
          setPinInput("")
        } else {
          const stored = getStoredPin()
          if (stored === newPin) {
            setIsUnlocked(true)
            setPinInput("")
          } else {
            setError("Błędny PIN")
            setTimeout(() => {
              setPinInput("")
              setError("")
            }, 1000)
          }
        }
      }
    },
    [pinInput, hasPin],
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

  // ---- Ekran PIN ----
  if (!isUnlocked) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[75vh] px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Lock className="w-8 h-8 text-purple-500" />
        </motion.div>

        <h2 className="text-xl font-black text-white mb-1 font-mono uppercase italic tracking-tighter">
          {!hasPin ? "Ustaw klucz dostępu" : "Autoryzacja skarbca"}
        </h2>
        <p className="text-[10px] text-white/40 font-mono mb-10 text-center uppercase tracking-widest">
          {!hasPin ? "Zdefiniuj 4-cyfrowy protokół" : "Wprowadź kod PIN, aby odszyfrować dane"}
        </p>

        <div className="flex gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                i < pinInput.length
                  ? error 
                    ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                    : "bg-purple-500 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  : "border-white/10 bg-transparent"
              }`}
              animate={error && i < pinInput.length ? { x: [0, -4, 4, -4, 0] } : {}}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-64">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key, idx) => {
            if (key === "") return <div key={`empty-${idx}`} />
            return (
              <motion.button
                key={key}
                onClick={() => key === "del" ? handleDeleteDigit() : handleDigitPress(key)}
                className={`h-14 rounded-2xl flex items-center justify-center font-mono text-xl font-black transition-all ${
                  key === "del" 
                    ? "bg-white/5 text-white/30 hover:bg-red-500/10 hover:text-red-500" 
                    : "bg-white/5 text-white hover:bg-white/10 active:bg-purple-500/20"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {key === "del" ? <Trash2 size={18} /> : key}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ---- Odblokowany Skarbiec ----
  const currentLevel = fitnessData.currentLevel
  const unlockedBuiltinCount = BUILTIN_CARDS.filter((c) => c.requiredLevel <= currentLevel).length

  return (
    <motion.div className="px-4 pb-24 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* NAGŁÓWEK */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <h2 className="text-[10px] font-black text-white/90 font-mono tracking-[0.3em] uppercase italic">Sektor: Skarbiec</h2>
        </div>
        <button 
          onClick={() => { setIsUnlocked(false); setPinInput(""); setRevealed(false); }} 
          className="text-[9px] text-white/30 font-black font-mono px-3 py-1.5 rounded-lg border border-white/5 uppercase hover:text-white transition-colors bg-white/5"
        >
          Wyloguj
        </button>
      </div>

      {/* SEKCJA LOOT BOXÓW */}
      <div className="rounded-[2rem] border border-white/10 overflow-hidden bg-white/[0.02] backdrop-blur-md shadow-2xl">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">Neuralne Zrzuty Zaopatrzenia</span>
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]" />
        </div>
        <div className="p-2">
          <LootBoxView />
        </div>
      </div>

      {/* ODSZYFROWYWANIE */}
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${canReveal ? "bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30" : "bg-white/5 border border-white/10"}`}>
              <Dumbbell className={`w-5 h-5 ${canReveal ? "text-emerald-500" : "text-white/20"}`} />
            </div>
            <div>
              <p className="text-[11px] font-black text-white font-mono uppercase tracking-widest">{canReveal ? "Dane Odszyfrowane" : "Dane Zaszyfrowane"}</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase italic">{todayMinutes}/30 min treningu</p>
            </div>
          </div>
          <motion.button 
            onClick={handleReveal} 
            disabled={!canReveal} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[10px] font-black transition-all ${canReveal ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-white/5 text-white/20 cursor-not-allowed"}`} 
            whileTap={canReveal ? { scale: 0.95 } : {}}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            {revealed ? "UKRYJ" : "ODKRYJ"}
          </motion.button>
        </div>
      </div>

      {/* STATY ARKIWUM */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <Trophy className="w-4 h-4 text-purple-500" />
          <div className="min-w-0">
            <p className="text-[8px] font-black text-white/30 font-mono uppercase tracking-[0.2em]">Status</p>
            <p className="text-[10px] text-white font-black font-mono uppercase truncate">{unlockedBuiltinCount}/{BUILTIN_CARDS.length} ODZYSKANO</p>
          </div>
        </div>
        <motion.button 
          onClick={() => fileInputRef.current?.click()} 
          className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center gap-2 group hover:bg-purple-500/20 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          <ImagePlus size={16} className="text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-purple-400 font-mono uppercase tracking-widest">DODAJ DANE</span>
        </motion.button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* SIATKA DANYCH */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {vaultImages.map((img, i) => (
            <motion.div key={img.id} className="relative h-48 rounded-3xl overflow-hidden border border-white/10 group shadow-2xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <img src={img.src || "/placeholder.svg"} alt={img.title} className="absolute inset-0 w-full h-full object-cover" />
              {!revealed && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white/10" />
                </div>
              )}
              <button onClick={() => removeVaultImage(img.id)} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {BUILTIN_CARDS.map((card, i) => {
          const levelUnlocked = card.requiredLevel <= currentLevel
          const isFullyVisible = revealed && levelUnlocked
          return (
            <motion.div key={card.id} className={`relative h-48 rounded-3xl overflow-hidden border transition-all duration-500 ${levelUnlocked ? "border-white/20" : "border-white/5 opacity-40 grayscale"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (vaultImages.length + i) * 0.05 }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
              {!isFullyVisible && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-4 text-center">
                  <Lock size={18} className="text-white/10 mb-2" />
                  {!levelUnlocked && <p className="text-[7px] font-black font-mono text-purple-400 uppercase tracking-[0.2em]">WYMAGANY POZIOM {card.requiredLevel}</p>}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black to-transparent">
                <p className="text-[12px] font-black text-white font-mono uppercase italic tracking-tighter">{card.title}</p>
                <p className="text-[9px] text-white/40 font-mono italic mt-1 leading-tight">{card.subtitle}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}