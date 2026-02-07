'use client';

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Lock,
  Check,
  Plus,
  X,
  Pencil,
  Trash2,
  Star,
  Target,
  Sparkles,
} from "lucide-react"
import {
  useFitnessData,
  useRewards,
  addCustomReward,
  removeReward,
  editReward,
  syncRewardsWithLevel,
} from "@/lib/fitness-store"
import type { Reward } from "@/lib/fitness-store"

function RewardModal({
  reward,
  onClose,
  onSave,
}: {
  reward: Reward | null
  onClose: () => void
  onSave: (title: string, description: string, level: number) => void
}) {
  const isEditing = reward !== null
  const [title, setTitle] = useState(reward?.title ?? "")
  const [description, setDescription] = useState(reward?.description ?? "")
  const [level, setLevel] = useState(reward?.level?.toString() ?? "")
  const [shakeError, setShakeError] = useState(false)

  const handleSubmit = () => {
    const lvl = parseInt(level, 10)
    if (!title.trim() || !lvl || lvl < 1) {
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }
    onSave(title.trim(), description.trim(), lvl)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0f0f12, #08080a)",
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.12)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
      >
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-purple/15 flex items-center justify-center neon-purple-glow">
              {isEditing ? <Pencil className="w-4 h-4 text-neon-purple" /> : <Sparkles className="w-4 h-4 text-neon-purple" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                {isEditing ? "Edytuj Nagrodę" : "Nowa Nagroda"}
              </h3>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                {isEditing ? "Zmień parametry celu" : "Stwórz własny cel"}
              </p>
            </div>
          </div>
          <motion.button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white" whileTap={{ scale: 0.9 }}>
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <motion.div className="relative px-6 pb-6 space-y-4" animate={shakeError ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-mono uppercase tracking-widest ml-1">Nazwa Nagrody</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Nowe buty do biegania"
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-white/20 font-mono text-sm border border-white/10 focus:outline-none focus:border-neon-purple/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-mono uppercase tracking-widest ml-1">Wymagany Poziom</label>
            <input
              type="number"
              min={1}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="np. 5"
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-white/20 font-mono text-sm border border-white/10 focus:outline-none focus:border-neon-green/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-mono uppercase tracking-widest ml-1">Opis (Opcjonalnie)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis nagrody..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-white/20 font-mono text-sm border border-white/10 focus:outline-none focus:border-neon-purple/60"
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-neon-purple text-white font-mono text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            whileTap={{ scale: 0.97 }}
          >
            {isEditing ? "Zapisz Zmiany" : "Aktywuj Nagrodę"}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function RewardsView() {
  const fitnessData = useFitnessData()
  const rewards = useRewards()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)

  const handleOpenAdd = () => {
    setEditingReward(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (r: Reward) => {
    setEditingReward(r)
    setModalOpen(true)
  }

  const handleSave = (title: string, description: string, level: number) => {
    if (editingReward) {
      editReward(editingReward.id, title, description, level)
    } else {
      addCustomReward(level, title, description)
    }
    syncRewardsWithLevel(fitnessData.currentLevel)
    setModalOpen(false)
    setEditingReward(null)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingReward(null)
  }

  const unlockedCount = rewards.filter((r) => r.unlocked).length

  return (
    <motion.div className="px-4 pb-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-neon-green/15 flex items-center justify-center border border-neon-green/20">
            <Trophy className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-tight">Nagrody</h2>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
               Odblokowano {unlockedCount} z {rewards.length}
            </p>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleOpenAdd}
        className="w-full flex items-center justify-center gap-2 py-4 mb-6 rounded-2xl border border-dashed border-neon-purple/30 text-[11px] font-mono font-black text-neon-purple uppercase tracking-widest hover:bg-neon-purple/5 transition-all"
        whileTap={{ scale: 0.97 }}
      >
        <Plus className="w-4 h-4" /> Dodaj Nową Nagrodę
      </motion.button>

      {/* Progress Bar Sekcja */}
      <motion.div className="rounded-2xl glass-card p-5 mb-6 border border-white/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neon-purple" />
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Postęp Poziomu</span>
          </div>
          <span className="text-xs font-mono font-black text-neon-purple neon-purple-text">LVL {fitnessData.currentLevel}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden px-[2px] flex items-center">
          <motion.div
            className="h-1 rounded-full bg-gradient-to-r from-neon-purple to-neon-green"
            animate={{ width: `${Math.min(((fitnessData.totalMinutes % 30) / 30) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-[9px] text-white/30 font-mono mt-3 text-center uppercase tracking-tighter">
          Pozostało {30 - (fitnessData.totalMinutes % 30)} min do kolejnego poziomu
        </p>
      </motion.div>

      <div className="space-y-3">
        {rewards.map((reward, i) => {
          const isNext = !reward.unlocked && (i === 0 || rewards[i - 1]?.unlocked)
          return (
            <motion.div
              key={reward.id}
              className={`rounded-2xl p-4 flex items-center gap-4 transition-all border ${
                reward.unlocked 
                  ? "glass-card border-neon-green/20" 
                  : isNext 
                    ? "bg-white/5 border-neon-purple/30" 
                    : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                reward.unlocked 
                  ? "bg-neon-green/10 border-neon-green/30 neon-green-glow" 
                  : isNext 
                    ? "bg-neon-purple/10 border-neon-purple/30" 
                    : "bg-white/5 border-white/10"
              }`}>
                {reward.unlocked ? <Star className="w-5 h-5 text-neon-green" /> : <Lock className="w-4 h-4 text-white/20" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold font-mono truncate uppercase tracking-tight ${reward.unlocked ? "text-white" : "text-white/40"}`}>
                    {reward.title}
                  </p>
                  {reward.unlocked && <Check className="w-3.5 h-3.5 text-neon-green shrink-0" />}
                </div>
                <p className="text-[10px] text-white/30 font-mono truncate uppercase">{reward.description || "Brak opisu"}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg border ${
                  reward.unlocked 
                    ? "bg-neon-green/10 text-neon-green border-neon-green/20" 
                    : isNext 
                      ? "bg-neon-purple/10 text-neon-purple border-neon-purple/20" 
                      : "bg-white/5 text-white/20 border-white/10"
                }`}>
                  LVL {reward.level}
                </span>
                <div className="flex flex-col gap-1">
                  <motion.button onClick={() => handleOpenEdit(reward)} className="p-1.5 rounded-lg text-white/20 hover:text-neon-purple transition-colors" whileTap={{ scale: 0.85 }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button onClick={() => removeReward(reward.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-500 transition-colors" whileTap={{ scale: 0.85 }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl mt-4">
          <Trophy className="w-10 h-10 text-white/5 mx-auto mb-3" />
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">Brak aktywnych nagród</p>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && <RewardModal reward={editingReward} onClose={handleClose} onSave={handleSave} />}
      </AnimatePresence>
    </motion.div>
  )
}