"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Timer, Zap, TrendingUp, Edit2, BarChart3, 
  Target, Droplets, Dumbbell, Trophy, Gift,
  Database, Users, X, Send, MessageSquare, Cpu, Search, Plus, Activity, UserPlus, UserMinus
} from "lucide-react"
import { LevelRing } from "./level-ring"
import { WorkoutTimer } from "./workout-timer"
import { WaterTracker } from "./water-tracker"
import { HoloCard } from "./holo-card"
import { WeatherEnvironment } from "./weather-env"
import { StatsRadar } from "./stats-radar"
import { useWeather } from "@/lib/weather-store"
import { 
  useFitnessData, 
  useStatusMessage, 
  updateStatusMessage, 
  useAuth,
  useWaterData,
  getTodayWorkoutMinutes,
  claimQuestReward,
  useMessages,
  useFriends,
  useAllUsers,
  addFriend,
  removeFriend,
  sendChatMessage,
  useLootBoxes
} from "@/lib/fitness-store"

export function Dashboard() {
  const { profile, display_name } = useAuth()
  const fitness = useFitnessData()
  const status = useStatusMessage()
  const water = useWaterData()
  const workoutMins = getTodayWorkoutMinutes()
  const messages = useMessages()
  const friends = useFriends()
  const allUsers = useAllUsers()
  const lootBoxes = useLootBoxes()
  const { vibe, temp } = useWeather()
  
  // Stany UI
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showVault, setShowVault] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [chatMsg, setChatMsg] = useState("")
  const [prevLevel, setPrevLevel] = useState(fitness?.currentLevel || 1)

  // Wykrywanie Level Up
  useEffect(() => {
    if (fitness && fitness.currentLevel > prevLevel) {
      setShowLevelUp(true)
      setPrevLevel(fitness.currentLevel)
    }
  }, [fitness?.currentLevel, prevLevel])

  if (!profile && !display_name) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Activity className="w-12 h-12 text-cyan-500 opacity-20" />
        </motion.div>
      </div>
    )
  }

  const minutesToNext = 30 - ((fitness?.totalMinutes || 0) % 30)
  const isCold = temp !== null && temp < 5
  const weatherColor = vibe === 'rainy' ? 'text-cyan-400' : 
                       vibe === 'sunny' ? 'text-orange-400' : 
                       isCold ? 'text-blue-500' : 'text-neon-green'

  const currentStats = {
    strength: profile?.strength || 0,
    speed: profile?.speed || 0,
    defense: profile?.defense || 0,
    focus: profile?.focus || 0,
    xp: profile?.xp || 0
  }

  const getRank = (lvl: number) => {
    if (lvl >= 20) return "ELITE VANGUARD"
    if (lvl >= 10) return "STRIKER"
    return "RECRUIT"
  }

  const quests = [
    { 
      id: 'q1', title: 'Hydration Protocol', 
      desc: 'Drink 2000ml of water', 
      icon: <Droplets size={16} className="text-cyan-400" />,
      progress: water?.amount || 0, goal: 2000, reward: 15, stat: 'def' as const
    },
    { 
      id: 'q2', title: 'Iron Will', 
      desc: '30 min workout today', 
      icon: <Dumbbell size={16} className="text-purple-400" />,
      progress: workoutMins, goal: 30, reward: 25, stat: 'str' as const
    }
  ]

  const handleSendMessage = async () => {
    if (!chatMsg.trim()) return
    await sendChatMessage(chatMsg, display_name)
    setChatMsg("")
  }

  return (
    <div className="relative px-4 pb-24 space-y-6 pt-8 min-h-screen bg-black overflow-x-hidden">
      <WeatherEnvironment />
      
      <div className="relative z-10 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-[10px] font-mono uppercase tracking-[0.2em] ${weatherColor}`}
            >
              {vibe || 'standard'} protocol active {temp !== null && `[${temp}°C]`}
            </motion.p>
            
            <h1 className="text-xl font-bold font-mono italic">
              <span className="text-neon-purple">LEVEL</span>
              <span className={weatherColor}>UP</span> FIT
            </h1>

            <div 
              onClick={() => { 
                const s = prompt("Update your status:", status); 
                if(s !== null) updateStatusMessage(s); 
              }} 
              className="cursor-pointer flex items-center gap-2 mt-2 group"
            >
              <p className="text-sm font-mono text-muted-foreground italic">"{status || 'Initializing...'}"</p>
              <Edit2 size={10} className="text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSocial(true)}
              className="p-3 glass-card rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              <Users size={20} />
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowVault(true)}
              className="relative p-3 glass-card rounded-xl border border-neon-purple/50 bg-purple-500/10 text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            >
              <Database size={20} />
              {lootBoxes > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-bounce">
                  {lootBoxes}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* DAILY LOGIN BONUS */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const lastClaim = localStorage.getItem('last-daily');
            const today = new Date().toDateString();
            if(lastClaim === today) {
              alert("Daily reward already collected.");
            } else {
              localStorage.setItem('last-daily', today);
              claimQuestReward(50, 'foc', 10);
            }
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-between group overflow-hidden relative"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Gift size={18} className="text-yellow-500 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-500">Daily Neural Link</p>
              <p className="text-[10px] text-white/40 font-mono">Collect daily XP & Focus</p>
            </div>
          </div>
          <div className="text-[10px] font-black px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-500 border border-yellow-500/30 relative z-10">
            CLAIM
          </div>
        </motion.button>

        {/* LEVEL PROGRESS */}
        <div className="flex justify-center py-4">
          <LevelRing level={fitness?.currentLevel || 1} totalMinutes={fitness?.totalMinutes || 0} />
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl h-full flex flex-col items-start">
              <Timer size={14} className="text-neon-purple mb-2" />
              <p className="text-2xl font-black italic">{fitness?.totalMinutes || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">Total Minutes</p>
            </div>
          </HoloCard>
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl h-full flex flex-col items-start">
              <TrendingUp size={14} className={`${weatherColor} mb-2`} />
              <p className="text-2xl font-black italic">{minutesToNext}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">To Next Level</p>
            </div>
          </HoloCard>
        </div>

        {/* RADAR & XP BAR */}
        <motion.div className="rounded-3xl glass-card p-6 border border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-neon-purple" />
              <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Genetic Potential</h3>
            </div>
          </div>
          <StatsRadar stats={currentStats} />
          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Evolution Progress</p>
              <p className="text-[10px] font-mono text-neon-purple font-bold italic">{currentStats.xp % 100} / 100 XP</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div animate={{ width: `${currentStats.xp % 100}%` }} className="h-full bg-gradient-to-r from-purple-800 to-neon-purple rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
            </div>
          </div>
        </motion.div>

        {/* QUESTS */}
        <div className="space-y-4">
          {quests.map(q => {
            const isDone = q.progress >= q.goal
            return (
              <div key={q.id} className={`p-4 rounded-2xl border transition-all duration-500 ${isDone ? 'bg-green-500/5 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDone ? 'bg-green-500/20' : 'bg-black/20'}`}>{q.icon}</div>
                    <div>
                      <p className={`text-sm font-bold ${isDone ? 'text-green-400' : 'text-white'}`}>{q.title}</p>
                      <p className="text-[10px] text-white/40 font-mono italic">{q.desc}</p>
                    </div>
                  </div>
                  {isDone && (
                    <button onClick={() => claimQuestReward(q.reward, q.stat, 5)} className="bg-green-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase">CLAIM</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <WorkoutTimer />
        <WaterTracker />
      </div>

      {/* --- OVERLAYS --- */}

      {/* NEURAL VAULT */}
      <AnimatePresence>
        {showVault && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[150] bg-black p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><Database className="text-neon-purple" /><h2 className="text-2xl font-black italic uppercase">Neural Vault</h2></div>
              <button onClick={() => setShowVault(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
            </div>
            <HoloCard><div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-transparent"><Cpu size={24} className="text-neon-purple mb-4" /><p className="text-lg font-black italic uppercase">Basic Augment</p><p className="text-xs font-mono text-white/40">Open Loot Boxes to find gear.</p></div></HoloCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOCIAL LINK */}
      <AnimatePresence>
        {showSocial && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[150] bg-black flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><Users className="text-cyan-400" /><h2 className="text-2xl font-black italic uppercase">Social Link</h2></div>
              <button onClick={() => setShowSocial(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
            </div>

            {/* TWOI ZNAJOMI */}
            <div className="mb-4 overflow-x-auto flex gap-4 pb-2 border-b border-white/10">
              {friends && friends.length > 0 ? friends.map(f => (
                <div key={f.id} className="flex-shrink-0 text-center space-y-1 relative group">
                  <div className="w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center font-black text-cyan-400">
                    {f.display_name?.[0].toUpperCase()}
                  </div>
                  <p className="text-[8px] font-mono uppercase text-white/60">{f.display_name?.slice(0, 6)}</p>
                  <button onClick={() => removeFriend(f.id)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserMinus size={10} className="text-white" />
                  </button>
                </div>
              )) : (
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest py-4">No active connections...</p>
              )}
            </div>

            {/* WYSZUKIWARKA GLOBALNA */}
            <div className="mb-4">
              <p className="text-[10px] font-mono text-cyan-400 uppercase mb-2 tracking-widest">Global Directory</p>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {allUsers.filter(u => u.id !== profile?.id && !friends.find(f => f.id === u.id)).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {user.display_name?.[0]}
                      </div>
                      <span className="text-xs font-mono">{user.display_name} (Lvl {user.level})</span>
                    </div>
                    <button onClick={() => addFriend(user.id)} className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-all">
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CZAT */}
            <div className="flex-1 flex flex-col min-h-0 bg-white/5 rounded-3xl border border-white/10 p-4 shadow-inner">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map(m => (
                  <div key={m.id} className={`space-y-1 ${m.user_id === profile?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                    <p className="text-[9px] font-mono text-cyan-400 uppercase">{m.display_name}</p>
                    <div className={`p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-white/80 italic max-w-[85%] ${m.user_id === profile?.id ? 'rounded-tr-none bg-cyan-500/5' : 'rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Transmit signal..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-cyan-500/50 text-white"
                />
                <button onClick={handleSendMessage} className="p-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-colors"><Send size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEVEL UP OVERLAY */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="space-y-6">
              <Trophy size={100} className="text-yellow-400 mx-auto" />
              <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">Level Up!</h2>
              <p className="text-xl font-mono text-neon-purple font-bold">STAGE {fitness?.currentLevel || 1} REACHED</p>
              <button onClick={() => setShowLevelUp(false)} className="w-full py-4 bg-white text-black font-black uppercase rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)]">Continue Protocol</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}