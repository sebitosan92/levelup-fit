"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trophy, UserPlus, Check, Loader2 } from "lucide-react"
import { useAuth, useFriends, addFriend } from "@/lib/fitness-store"
import { mutate } from "swr"

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const friends = useFriends() || [] // Zabezpieczenie przed undefined

  const fetchLeaders = async () => {
    setLoading(true)
    // WAŻNE: pobieramy 'id', aby addFriend wiedziało kogo dodać
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, level, strength')
      .order('level', { ascending: false })
      .limit(10)
    
    if (error) console.error("Leaderboard fetch error:", error)
    if (data) setLeaders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaders()
  }, [])

  const handleAddFriend = async (friendId: string) => {
    await addFriend(friendId)
    // Wymuszamy odświeżenie listy znajomych w całym systemie
    mutate(user ? `friends-list-${user.id}` : null)
  }

  return (
    <div className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" size={24} />
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Ranking</h2>
        </div>
        {loading && <Loader2 size={16} className="animate-spin text-white/20" />}
      </div>
      
      <div className="space-y-2.5">
        {leaders.map((player, index) => {
          // SPRAWDZANIE STATUSU
          const isMe = user?.id === player.id
          const isFriend = friends.some((f: any) => f.id === player.id)

          return (
            <div key={player.id || index} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:border-white/20 transition-all group">
              <div className="flex items-center gap-3">
                <span className="font-mono text-white/20 text-[10px] w-4">{index + 1}</span>
                <div className="flex flex-col">
                  <span className="font-black text-white/90 uppercase text-[13px] tracking-tight leading-none mb-1">
                    {player.display_name || player.username || 'Rekrut'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase">
                      POZ {player.level || 1}
                    </span>
                    <span className="text-[8px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-bold uppercase italic">
                      {player.strength || 0} SIŁ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* LOGIKA PRZYCISKU */}
                {!isMe && (
                  isFriend ? (
                    <div className="p-2 text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <Check size={14} />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddFriend(player.id)}
                      className="p-2.5 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 hover:scale-105 active:scale-90 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                      <UserPlus size={14} />
                    </button>
                  )
                )}
                
                {isMe && (
                  <span className="text-[7px] font-black bg-white/10 text-white/30 px-2 py-1 rounded uppercase tracking-widest">Ty</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <button 
          onClick={fetchLeaders}
          className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em] hover:text-white/50 transition-colors"
        >
          Synchronizuj dane systemowe
        </button>
      </div>
    </div>
  )
}