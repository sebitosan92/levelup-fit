"use client"

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
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-border/60 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, hsl(240 12% 11%), hsl(240 15% 8%))",
          boxShadow:
            "0 0 40px hsl(270 80% 65% / 0.12), 0 0 80px hsl(270 80% 65% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
      >
        {/* Ambient top glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(270 80% 65% / 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-purple/15 flex items-center justify-center neon-purple-glow">
              {isEditing ? (
                <Pencil className="w-4 h-4 text-neon-purple" />
              ) : (
                <Sparkles className="w-4 h-4 text-neon-purple" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-mono">
                {isEditing ? "Edit Reward" : "New Reward"}
              </h3>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                {isEditing ? "Modify your goal" : "Create a custom goal"}
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Body */}
        <motion.div
          className="relative px-6 pb-6 space-y-4"
          animate={shakeError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Reward Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Running Shoes"
              className="w-full px-4 py-3 rounded-xl bg-secondary/40 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm border border-border/40 transition-all duration-300 focus:outline-none focus:border-neon-purple/60 focus:shadow-[0_0_12px_hsl(270_80%_65%_/_0.2),inset_0_0_12px_hsl(270_80%_65%_/_0.05)]"
              autoFocus
            />
          </div>

          {/* Level input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Required Level
            </label>
            <input
              type="number"
              min={1}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 rounded-xl bg-secondary/40 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm border border-border/40 transition-all duration-300 focus:outline-none focus:border-neon-green/60 focus:shadow-[0_0_12px_hsl(142_72%_50%_/_0.2),inset_0_0_12px_hsl(142_72%_50%_/_0.05)]"
            />
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Description{" "}
              <span className="text-muted-foreground/40">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="w-full px-4 py-3 rounded-xl bg-secondary/40 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm border border-border/40 transition-all duration-300 focus:outline-none focus:border-neon-purple/60 focus:shadow-[0_0_12px_hsl(270_80%_65%_/_0.2),inset_0_0_12px_hsl(270_80%_65%_/_0.05)]"
            />
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-neon-purple text-primary-foreground font-mono text-sm font-semibold neon-purple-glow"
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 0 25px hsl(270 80% 65% / 0.5), 0 0 50px hsl(270 80% 65% / 0.2)" }}
          >
            {isEditing ? "Save Changes" : "Create Reward"}
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
    setModalOpen(false)
    setEditingReward(null)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingReward(null)
  }

  const unlockedCount = rewards.filter((r) => r.unlocked).length

  return (
    <motion.div
      className="px-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-neon-green/15 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-mono">
              Rewards
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {unlockedCount}/{rewards.length} unlocked
            </p>
          </div>
        </div>
      </div>

      {/* Add New Reward button */}
      <motion.button
        onClick={handleOpenAdd}
        className="w-full flex items-center justify-center gap-2 py-3.5 mb-5 rounded-2xl border border-dashed border-neon-purple/30 text-sm font-mono font-medium text-neon-purple hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all"
        whileTap={{ scale: 0.97 }}
      >
        <Plus className="w-4 h-4" />
        Add New Reward
      </motion.button>

      {/* Progress overview */}
      <motion.div
        className="rounded-2xl glass-card p-5 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-mono text-muted-foreground">
              Level Progress
            </span>
          </div>
          <span className="text-sm font-mono font-bold text-neon-purple neon-purple-text">
            LVL {fitnessData.currentLevel}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(270 80% 65%), hsl(142 72% 50%))",
            }}
            animate={{
              width: `${Math.min(((fitnessData.totalMinutes % 30) / 30) * 100, 100)}%`,
            }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-2 text-center">
          {30 - (fitnessData.totalMinutes % 30)} min until next level
        </p>
      </motion.div>

      {/* Rewards list */}
      <div className="space-y-2.5">
        {rewards.map((reward, i) => {
          const isNext =
            !reward.unlocked && (i === 0 || rewards[i - 1]?.unlocked)
          return (
            <motion.div
              key={reward.id}
              className={`rounded-2xl p-4 flex items-center gap-4 transition-all ${
                reward.unlocked
                  ? "glass-card"
                  : isNext
                    ? "glass-card border-neon-purple/30"
                    : "bg-secondary/30 border border-border/30"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  reward.unlocked
                    ? "bg-neon-green/15 neon-green-glow"
                    : isNext
                      ? "bg-neon-purple/15"
                      : "bg-secondary/50"
                }`}
              >
                {reward.unlocked ? (
                  <Star className="w-5 h-5 text-neon-green" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/40" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold font-mono truncate ${
                      reward.unlocked
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {reward.title}
                  </p>
                  {reward.unlocked && (
                    <Check className="w-3.5 h-3.5 text-neon-green shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {reward.description}
                </p>
              </div>

              {/* Level badge + actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                    reward.unlocked
                      ? "bg-neon-green/15 text-neon-green"
                      : isNext
                        ? "bg-neon-purple/15 text-neon-purple"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  LVL {reward.level}
                </span>
                <motion.button
                  onClick={() => handleOpenEdit(reward)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-neon-purple transition-colors"
                  whileTap={{ scale: 0.85 }}
                  aria-label={`Edit ${reward.title}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  onClick={() => removeReward(reward.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  whileTap={{ scale: 0.85 }}
                  aria-label={`Remove ${reward.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">
            No rewards yet.
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Tap "Add New Reward" to create your first goal!
          </p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <RewardModal
            reward={editingReward}
            onClose={handleClose}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
