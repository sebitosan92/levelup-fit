"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Crown, Flame, Shield, Zap, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/fitness-store"

interface Player {
  id: string
  display_name: string | null
  username: string | null
  email: string | null // Dodajemy email do typu
  level: number
  xp: number
  total_minutes: number
  avatar_url?: string
}

export function LeaderboardView() {
  const { user } = useAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    
    // Subskrypcja zmian w czasie rzeczywistym
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLeaderboard = async () => {
    // Pobieramy też email, jeśli jest dostępny w tabeli profiles (zależnie od Twojej konfiguracji bazy)
    // Jeśli nie masz kolumny email w profiles, ta część po prostu zwróci null, co obsłużymy niżej
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, level, xp, total_minutes') 
      .order('level', { ascending: false })
      .order('xp', { ascending: false })
      .limit(50)

    if (!error && data) {
      // @ts-ignore - ignorujemy brak emaila w typowaniu Supabase jeśli go tam nie ma
      setPlayers(data as Player[])
    }
    setLoading(false)
  }

  // Funkcja pomocnicza do wyświetlania nazwy
  const getDisplayName = (player: Player) => {
    // 1. Sprawdź display_name (nick ustawiony w opcjach)
    if (player.display_name && player.display_name.trim() !== "") return player.display_name
    
    // 2. Sprawdź username (alternatywna kolumna)
    if (player.username && player.username.trim() !== "") return player.username
    
    // 3. Ostateczność: Jeśli to Ty, wyświetl "YOU (No Name)"
    if (player.id === user?.id) return "YOU (Set Name!)"

    // 4. Fallback dla innych
    return `Player ${player.id.slice(0, 4)}`
  }

  return (
    <div className="pb-24 px-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2">
            Global Rank <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </h2>
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
            Elite Warriors Database
          </p>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {!loading && players.length >= 3 && (
        <div className="flex justify-center items-end gap-2 mb-8 mt-4">
          {/* 2ND PLACE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-700 border-2 border-slate-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(148,163,184,0.3)]">
              <span className="text-2xl font-black text-slate-300">2</span>
              <div className="absolute -bottom-3 px-2 py-0.5 bg-slate-600 rounded text-[8px] font-bold uppercase">Silver</div>
            </div>
            <p className="mt-2 text-[10px] font-black uppercase text-slate-300 max-w-[80px] truncate text-center">
              {getDisplayName(players[1])}
            </p>
            <p className="text-[9px] font-mono text-white/40">Lvl {players[1].level}</p>
          </motion.div>

          {/* 1ST PLACE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center -mt-6 z-10"
          >
            <div className="w-20 h-20 rounded-2xl bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center relative shadow-[0_0_30px_rgba(250,204,21,0.4)]">
              <Crown className="absolute -top-6 text-yellow-400 w-8 h-8 fill-yellow-400 animate-bounce" />
              <span className="text-4xl font-black text-yellow-400">1</span>
            </div>
            <p className="mt-2 text-xs font-black uppercase text-yellow-400 max-w-[100px] truncate text-center">
              {getDisplayName(players[0])}
            </p>
            <p className="text-[10px] font-mono text-yellow-400/60 font-bold">Lvl {players[0].level}</p>
          </motion.div>

          {/* 3RD PLACE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-700/50 border-2 border-orange-600 flex items-center justify-center relative shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <span className="text-2xl font-black text-orange-400">3</span>
              <div className="absolute -bottom-3 px-2 py-0.5 bg-orange-800 rounded text-[8px] font-bold uppercase">Bronze</div>
            </div>
            <p className="mt-2 text-[10px] font-black uppercase text-orange-400 max-w-[80px] truncate text-center">
              {getDisplayName(players[2])}
            </p>
            <p className="text-[9px] font-mono text-white/40">Lvl {players[2].level}</p>
          </motion.div>
        </div>
      )}

      {/* FULL LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-white/20 animate-pulse font-mono text-xs">Loading data...</div>
        ) : (
          players.map((player, index) => {
            const isMe = user?.id === player.id
            const rank = index + 1
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border ${
                  isMe 
                    ? "bg-purple-600/20 border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.15)]" 
                    : "bg-white/5 border-white/5"
                }`}
              >
                {/* RANK NUMBER */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg ${
                  rank <= 3 ? "bg-white/10 text-white" : "text-white/30 font-mono"
                }`}>
                  {rank}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold truncate uppercase tracking-tight ${isMe ? 'text-purple-300' : 'text-white'}`}>
                      {getDisplayName(player)}
                    </p>
                    {isMe && <span className="text-[8px] bg-purple-500 text-white px-1.5 rounded font-mono uppercase">YOU</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-white/40">
                      <Shield className="w-3 h-3" /> LVL {player.level}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-white/40">
                      <Zap className="w-3 h-3 text-yellow-500" /> {player.total_minutes} MIN
                    </div>
                  </div>
                </div>

                {/* XP BADGE */}
                <div className="text-right">
                  <p className="text-xs font-black text-white/20 font-mono">XP</p>
                  <p className="text-sm font-bold text-white/60 font-mono">{player.xp}</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}