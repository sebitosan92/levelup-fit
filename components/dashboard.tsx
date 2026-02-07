"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Timer, Zap, TrendingUp, Edit2, BarChart3, 
  Target, Droplets, Dumbbell, Trophy, Gift,
  Database, Users, X, Send, MessageSquare, Cpu, Search, Plus, Activity, UserPlus, UserMinus, User, CheckCircle2
} from "lucide-react"

// Importy komponentów lokalnych - upewnij się, że te pliki istnieją!
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

const getAvatarColor = (name: string) => {
  const colors = [
    'from-cyan-500/40 to-blue-600/40',
    'from-purple-500/40 to-pink-600/40',
    'from-emerald-500/40 to-teal-600/40',
    'from-orange-500/40 to-red-600/40',
    'from-indigo-500/40 to-violet-600/40'
  ]
  const index = name ? name.length % colors.length : 0
  return colors[index]
}

export function Dashboard() {
  const { profile, display_name } = useAuth()
  const fitness = useFitnessData()
  const water = useWaterData() || 0
  const workoutMins = typeof getTodayWorkoutMinutes === 'function' ? getTodayWorkoutMinutes() : 0
  const messages = useMessages() || []
  const friends = useFriends() || []
  const allUsers = useAllUsers() || []
  const lootBoxes = useLootBoxes() || 0
  const { vibe, temp } = useWeather()
  
  const [showVault, setShowVault] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [chatMsg, setChatMsg] = useState("")
  const [prevLevel, setPrevLevel] = useState(fitness?.currentLevel || 1)

  // STATYSTYKI - Zdefiniowane przed użyciem w JSX
  const totalMinutes = fitness?.totalMinutes || 0
  const currentLevel = fitness?.currentLevel || 1
  const minsToNextLevel = 30 - (totalMinutes % 30)

  useEffect(() => {
    if (fitness && fitness.currentLevel > prevLevel) {
      setPrevLevel(fitness.currentLevel)
    }
  }, [fitness?.currentLevel, prevLevel])

  if (!profile && !display_name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-12 h-12 text-cyan-500 animate-pulse" />
        <p className="text-cyan-500/50 font-mono text-[10px] uppercase tracking-widest">Establishing Neural Link...</p>
      </div>
    )
  }

  const weatherColor = vibe === 'rainy' ? 'text-cyan-400' : 
                        vibe === 'sunny' ? 'text-orange-400' : 'text-emerald-400'

  const handleSendMessage = async () => {
    if (!chatMsg.trim()) return
    try {
      if (typeof sendChatMessage === 'function') {
        await sendChatMessage(chatMsg, display_name || "Unknown Operator")
        setChatMsg("")
      }
    } catch (err) {
      console.error("Signal failed:", err)
    }
  }

  return (
    <div className="relative space-y-6 pb-24 px-4 sm:px-0">
      <WeatherEnvironment />
      
      <div className="relative z-10 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className={`text-[10px] font-mono uppercase tracking-widest ${weatherColor}`}>
              {vibe || 'standard'} active {temp !== null && `[${temp}°C]`}
            </p>
            <h1 className="text-xl font-bold font-mono italic text-white uppercase tracking-tighter">Nexus Dashboard</h1>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowSocial(true)} className="p-3 glass-card rounded-xl border border-cyan-500/50 text-cyan-400 bg-cyan-500/10 transition-all hover:bg-cyan-500/20 active:scale-90">
              <Users size={20} />
            </button>
            <button onClick={() => setShowVault(true)} className="relative p-3 glass-card rounded-xl border border-purple-500/50 text-purple-400 bg-purple-500/10 transition-all hover:bg-purple-500/20 active:scale-90">
              <Database size={20} />
              {lootBoxes > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] text-white rounded-full flex items-center justify-center font-bold animate-pulse">
                  {lootBoxes}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DAILY BONUS */}
        <button 
          onClick={() => {
            if (typeof claimQuestReward === 'function') {
              claimQuestReward(50, 'foc', 10)
            }
          }} 
          className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between shadow-lg hover:bg-white/10 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Gift size={18} className="text-yellow-500 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-white uppercase tracking-tight">Neural Link Daily</span>
          </div>
          <span className="text-[10px] font-black text-yellow-500 uppercase">Claim Reward</span>
        </button>

        {/* MAIN STATS RING */}
        <div className="flex justify-center py-4">
          <LevelRing level={currentLevel} totalMinutes={totalMinutes} />
        </div>
        
        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-4">
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl">
              <Timer size={14} className="text-purple-400 mb-2"/>
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Time</p>
              <p className="text-2xl font-black text-white">{totalMinutes}<span className="text-xs ml-1 text-purple-400">m</span></p>
            </div>
          </HoloCard>
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl">
              <TrendingUp size={14} className="text-cyan-400 mb-2"/>
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Next Level</p>
              <p className="text-2xl font-black text-white">
                {minsToNextLevel}
                <span className="text-xs ml-1 text-cyan-400">m</span>
              </p>
            </div>
          </HoloCard>
        </div>

        <WorkoutTimer />
        <WaterTracker />

        {/* BIOMETRICS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <BarChart3 size={14} className="text-cyan-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Biometric Analysis</h2>
          </div>
          <HoloCard>
            <div className="p-6 glass-card rounded-[2.5rem] flex justify-center items-center min-h-[300px] overflow-hidden">
              <StatsRadar />
            </div>
          </HoloCard>
        </div>

        {/* QUESTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Trophy size={14} className="text-yellow-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Active Missions</h2>
          </div>
          <div className="space-y-3">
            {[
              { id: 'q1', title: 'Hydration Protocol', desc: 'Drink 2000ml of water', progress: water, total: 2000, reward: '50 XP' },
              { id: 'q2', title: 'Stamina Build', desc: 'Work out for 30 min', progress: workoutMins, total: 30, reward: '100 XP' }
            ].map(quest => {
              const percentage = Math.min(100, Math.round(((Number(quest.progress) || 0) / (Number(quest.total) || 1)) * 100))
              return (
                <div key={quest.id} className="p-4 glass-card rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{quest.title}</p>
                    <p className="text-[10px] text-white/40">{quest.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-cyan-400">{quest.reward}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="text-[9px] text-white/20 font-mono">{percentage}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SOCIAL POPUP */}
      <AnimatePresence>
        {showSocial && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocial(false)} className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-md" />
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="w-full max-w-[500px] h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,1)] flex flex-col overflow-hidden pointer-events-auto"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg"><Users className="text-cyan-400" size={20} /></div>
                    <h2 className="text-base font-black uppercase italic text-white tracking-widest">Social Link</h2>
                  </div>
                  <button onClick={() => setShowSocial(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 flex flex-col min-h-0 p-5 space-y-6 overflow-y-auto scrollbar-hide">
                  <div className="shrink-0 space-y-3">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-[0.2em]">Active Nodes ({friends.length})</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {friends.length === 0 && <p className="text-[10px] text-white/20 italic">No nodes connected...</p>}
                      {friends.map(f => (
                        <div key={f.id} className="flex-shrink-0 text-center relative group">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(f.display_name)} border border-cyan-500/30 flex items-center justify-center font-black text-white text-xs shadow-lg`}>
                            {f.display_name ? f.display_name[0].toUpperCase() : <User size={14}/>}
                          </div>
                          <button 
                            onClick={() => { if(typeof removeFriend === 'function') removeFriend(f.id) }} 
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 border border-black shadow-lg hover:scale-110 transition-transform"
                          >
                            <UserMinus size={10} />
                          </button>
                          <p className="text-[8px] mt-1.5 text-white/60 font-mono">{f.display_name?.slice(0, 8)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 space-y-3">
                    <p className="text-[10px] text-purple-400 uppercase font-bold tracking-[0.2em]">Global Directory</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                      {allUsers.filter(u => u.id !== profile?.id && !friends.find(f => f.id === u.id)).map(user => (
                        <div key={user.id} className="flex-shrink-0 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(user.display_name || "U")} flex items-center justify-center text-[10px] font-bold text-white`}>
                            {(user.display_name || "U")[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col pr-1">
                            <span className="text-[10px] text-white font-mono leading-none mb-1">{user.display_name || "Unknown"}</span>
                            <span className="text-[8px] text-cyan-500/50 font-black">LVL {user.level || 1}</span>
                          </div>
                          <button 
                            onClick={() => { if(typeof addFriend === 'function') addFriend(user.id) }} 
                            className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-all"
                          >
                            <UserPlus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-hidden">
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Encrypted Comms</p>
                    <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-4 overflow-y-auto space-y-4 scrollbar-hide">
                      {messages.length === 0 && <p className="text-center text-[10px] text-white/10 mt-10 uppercase tracking-[0.3em]">No signals detected</p>}
                      {messages.map(m => (
                        <div key={m.id} className={`flex items-start gap-2 ${m.user_id === profile?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold text-white shadow-lg bg-gradient-to-br ${getAvatarColor(m.display_name || "A")}`}>
                            {(m.display_name || "A")[0].toUpperCase()}
                          </div>
                          <div className={`flex flex-col ${m.user_id === profile?.id ? 'items-end' : 'items-start'}`}>
                            <p className="text-[7px] text-cyan-400/40 uppercase mb-1 font-mono">{m.display_name}</p>
                            <div className={`p-3 rounded-2xl text-[13px] max-w-[240px] leading-relaxed ${m.user_id === profile?.id ? 'bg-cyan-500/20 text-cyan-50 border border-cyan-500/20' : 'bg-white/5 text-white/80 border border-white/5'}`}>
                              {m.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 shrink-0">
                  <div className="flex gap-3">
                    <input 
                      value={chatMsg} 
                      onChange={(e) => setChatMsg(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                      placeholder="Type signal..." 
                      className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-cyan-500/40 transition-all placeholder:text-white/20" 
                    />
                    <button onClick={handleSendMessage} className="p-4 bg-cyan-500 text-black rounded-2xl shadow-[0_0_20px_#06b6d4] active:scale-95 transition-transform group">
                      <Send size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVault && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[200] bg-[#050505] p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8 text-white">
              <div className="flex items-center gap-3">
                <Database className="text-purple-400" />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Neural Vault</h2>
              </div>
              <button onClick={() => setShowVault(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 rounded-[3rem] border border-purple-500/20 bg-purple-500/5 text-white flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-6">
                <Cpu className="text-purple-500 animate-pulse" size={64}/>
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
              </div>
              <p className="text-purple-400 font-mono text-sm uppercase tracking-widest text-center mb-2">Neural Scan Complete</p>
              <p className="text-white/30 text-xs text-center">No active augments or loot boxes detected in this sector.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}