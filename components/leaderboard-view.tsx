'use client';

import React from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Zap, Dumbbell, Shield, Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface LeaderboardProfile {
  id: string;
  display_name: string;
  level: number;
  strength: number;
  speed: number;
  defense: number;
  focus: number;
  total_minutes: number;
}

export function LeaderboardView() {
  const [profiles, setProfiles] = React.useState<LeaderboardProfile[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, level, strength, speed, defense, focus, total_minutes')
        .order('level', { ascending: false })
        .limit(10)

      if (!error && data) {
        setProfiles(data as any)
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  if (loading) return <div className="p-8 text-center text-white/50">Loading Legends...</div>

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Global Ranking
        </h2>
      </div>

      <div className="grid gap-4">
        {profiles.map((player, index) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={player.id}
            className={`relative overflow-hidden p-4 rounded-2xl border-2 ${
              index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black ${index === 0 ? 'text-yellow-500' : 'text-white/30'}`}>
                  #{index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{player.display_name || 'Anonymous Player'}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">
                      LVL {player.level || 1}
                    </span>
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded uppercase font-bold">
                      {player.total_minutes || 0} MINS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-white/40">
                <div className="flex flex-col items-center"><Dumbbell className="w-4 h-4"/><span className="text-[10px] font-bold">{player.strength}</span></div>
                <div className="flex flex-col items-center"><Zap className="w-4 h-4"/><span className="text-[10px] font-bold">{player.speed}</span></div>
                <div className="flex flex-col items-center"><Shield className="w-4 h-4"/><span className="text-[10px] font-bold">{player.defense}</span></div>
                <div className="flex flex-col items-center"><Target className="w-4 h-4"/><span className="text-[10px] font-bold">{player.focus}</span></div>
              </div>
            </div>
            
            {/* Dekoracyjne tło dla lidera */}
            {index === 0 && (
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Trophy className="w-16 h-16 text-yellow-500 rotate-12" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}