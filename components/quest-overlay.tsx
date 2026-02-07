"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Trophy, Zap, Droplets, Dumbbell } from "lucide-react"
import React from "react"
import { claimQuestReward, useWaterData, getTodayWorkoutMinutes } from "@/lib/fitness-store"

export function QuestSystem() {
  const water = useWaterData()
  const workoutMins = getTodayWorkoutMinutes()
  const [showLevelUp, setShowLevelUp] = React.useState(false)

  const quests = [
    { 
      id: 'q1', title: 'Hydration Protocol', 
      desc: 'Drink 2000ml of water', 
      icon: <Droplets className="text-blue-400" />,
      progress: water.amount, goal: 2000, reward: 10, stat: 'def' as const
    },
    { 
      id: 'q2', title: 'Iron Will', 
      desc: '30 min workout today', 
      icon: <Dumbbell className="text-purple-400" />,
      progress: workoutMins, goal: 30, reward: 20, stat: 'str' as const
    }
  ]

  return (
    <div className="space-y-4 px-4">
      <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">Daily Operations</h3>
      {quests.map(q => {
        const isDone = q.progress >= q.goal
        return (
          <div key={q.id} className={`p-4 rounded-2xl border transition-all ${isDone ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/20 rounded-lg">{q.icon}</div>
                <div>
                  <p className="text-sm font-bold">{q.title}</p>
                  <p className="text-[10px] text-white/40">{q.desc}</p>
                </div>
              </div>
              {isDone ? (
                <button 
                  onClick={() => claimQuestReward(q.reward, q.stat, 5)}
                  className="bg-green-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase"
                >
                  Claim +{q.reward}XP
                </button>
              ) : (
                <p className="text-[10px] font-mono text-white/40">{q.progress}/{q.goal}</p>
              )}
            </div>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((q.progress / q.goal) * 100, 100)}%` }}
                className={`h-full ${isDone ? 'bg-green-500' : 'bg-white/20'}`}
              />
            </div>
          </div>
        )
      })}

      {/* LEVEL UP NOTIFICATION */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            onClick={() => setShowLevelUp(false)}
          >
            <div className="text-center space-y-4">
              <Trophy size={80} className="text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Level Up!</h2>
              <p className="text-neon-purple font-mono">Neural Link Upgraded</p>
              <button className="px-8 py-3 bg-white text-black font-black uppercase rounded-xl">Continue Training</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}