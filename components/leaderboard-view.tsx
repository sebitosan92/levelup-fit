"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Trophy, Crown, Flame, Shield, AlertCircle, UserPlus, Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth, useFriends, addFriend } from "@/lib/fitness-store"
import { mutate } from "swr"

interface Player {
  id: string
  display_name: string | null
  username: string | null
  email: string | null
  level: number
  xp: number
  total_minutes: number
  discipline_streak: number
}

export function LeaderboardView() {
  const { user } = useAuth()
  const friends = useFriends() || [] // Pobieramy listę znajomych
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('id, display_name, username, level, xp, total_minutes, discipline_streak')
        .order('level', { ascending: false })
        .order('xp', { ascending: false })
        .order('discipline_streak', { ascending: false })
        .limit(50)

      if (supabaseError) throw supabaseError
      if (data) setPlayers(data as Player[])
    } catch (err: any) {
      console.error("Leaderboard fetch error:", err)
      setError("Nie udało się zsynchronizować bazy danych")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => fetchLeaderboard()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchLeaderboard])

  const handleAddFriend = async (friendId: string) => {
    setAddingId(friendId)
    await addFriend(friendId)
    // Odświeżamy cache znajomych, żeby ikona Plus zmieniła się w Check
    mutate(user ? `friends-list-${user.id}` : null)
    setAddingId(null)
  }

  const getDisplayName = (player: Player) => {
    if (player.display_name && player.display_name.trim() !== "") return player.display_name
    if (player.username && player.username.trim() !== "") return player.username
    if (player.id === user?.id) return "TY (USTAW NICK!)"
    return `OPERATOR_${player.id.slice(0, 4).toUpperCase()}`
  }

  return (
    <div className="pb-24 px-4 space-y-6 max-w-2xl mx-auto">
      {/* NAGŁÓWEK */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2 text-white">
            Ranking <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">
            Baza danych jednostek elitarnych
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-500" size={18} />
          <p className="text-xs font-mono text-red-500 uppercase">{error}</p>
        </div>
      )}

      {/* PODIUM TOP 3 */}
      {!loading && players.length > 0 && (
        <div className="flex justify-center items-end gap-3 mb-10 mt-6 px-2">
          {/* 2. MIEJSCE */}
          {players.length >= 2 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center flex-1">
              <div className="w-full aspect-square max-w-[70px] rounded-2xl bg-slate-800 border-2 border-slate-500 flex items-center justify-center relative shadow-[0_0_20px_rgba(148,163,184,0.2)]">
                <span className="text-2xl font-black text-slate-300 italic">2</span>
                <div className="absolute -bottom-3 px-2 py-0.5 bg-slate-600 rounded text-[7px] font-black uppercase tracking-widest text-white whitespace-nowrap">SREBRO</div>
              </div>
              <p className="mt-4 text-[10px] font-black uppercase text-slate-300 truncate w-full text-center px-1">
                {getDisplayName(players[1])}
              </p>
            </motion.div>
          ) : <div className="flex-1" />}

          {/* 1. MIEJSCE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center flex-1 -mt-8 z-10">
            <div className="w-full aspect-square max-w-[85px] rounded-3xl bg-yellow-500/10 border-2 border-yellow-400 flex items-center justify-center relative shadow-[0_0_40px_rgba(250,204,21,0.3)]">
              <Crown className="absolute -top-7 text-yellow-400 w-8 h-8 fill-yellow-400 animate-pulse" />
              <span className="text-4xl font-black text-yellow-400 italic">1</span>
              <div className="absolute -bottom-3 px-3 py-1 bg-yellow-500 rounded text-[8px] font-black uppercase tracking-widest text-black">MISTRZ</div>
            </div>
            <p className="mt-4 text-xs font-black uppercase text-yellow-400 truncate w-full text-center px-1">
              {getDisplayName(players[0])}
            </p>
          </motion.div>

          {/* 3. MIEJSCE */}
          {players.length >= 3 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center flex-1">
              <div className="w-full aspect-square max-w-[70px] rounded-2xl bg-orange-900/20 border-2 border-orange-700 flex items-center justify-center relative shadow-[0_0_20px_rgba(194,65,12,0.2)]">
                <span className="text-2xl font-black text-orange-500 italic">3</span>
                <div className="absolute -bottom-3 px-2 py-0.5 bg-orange-700 rounded text-[7px] font-black uppercase tracking-widest text-white whitespace-nowrap">BRĄZ</div>
              </div>
              <p className="mt-4 text-[10px] font-black uppercase text-orange-500 truncate w-full text-center px-1">
                {getDisplayName(players[2])}
              </p>
            </motion.div>
          ) : <div className="flex-1" />}
        </div>
      )}

      {/* PEŁNA LISTA */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-white/20 uppercase tracking-widest">Skanowanie profilów...</span>
          </div>
        ) : (
          players.map((player, index) => {
            const isMe = user?.id === player.id
            const isFriend = friends.some((f: any) => f.id === player.id)
            const rank = index + 1
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isMe 
                    ? "bg-purple-600/15 border-purple-500/40 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]" 
                    : "bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05]"
                }`}
              >
                <div className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg font-black italic ${
                  rank <= 3 ? "bg-white/10 text-white" : "text-white/20 font-mono"
                }`}>
                  {rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-black truncate uppercase tracking-tight text-sm ${isMe ? 'text-purple-300' : 'text-white/90'}`}>
                      {getDisplayName(player)}
                    </p>
                    {isMe && <span className="text-[7px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">TY</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[9px] font-black font-mono text-white/30 uppercase">
                      <Shield className="w-3 h-3 text-cyan-500/50" /> POZ {player.level || 0}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black font-mono text-orange-500 uppercase">
                      <Flame className="w-3 h-3" /> {player.discipline_streak || 0} DNI
                    </div>
                  </div>
                </div>

                {/* NOWY PRZYCISK DODAWANIA ZNAJOMEGO */}
                <div className="flex items-center gap-4">
                  {!isMe && (
                    <button
                      onClick={() => !isFriend && handleAddFriend(player.id)}
                      disabled={isFriend || addingId === player.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isFriend 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 active:scale-90"
                      }`}
                    >
                      {addingId === player.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isFriend ? (
                        <Check size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                    </button>
                  )}

                  <div className="text-right border-l border-white/5 pl-4 min-w-[60px]">
                    <p className="text-[8px] font-black text-white/20 font-mono uppercase">EXP</p>
                    <p className="text-sm font-black text-white/70 font-mono tracking-tighter">{player.xp || 0}</p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}