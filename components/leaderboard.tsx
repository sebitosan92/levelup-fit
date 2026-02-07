"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trophy, Medal } from "lucide-react"

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, level, strength')
        .order('level', { ascending: false })
        .limit(10)
      if (data) setLeaders(data)
    }
    fetchLeaders()
  }, [])

  return (
    <div className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-6 px-1">
        <Trophy className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" size={24} />
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Ranking Globalny</h2>
      </div>
      
      <div className="space-y-2.5">
        {leaders.map((player, index) => (
          <div key={index} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono text-white/20 text-xs w-5">{index + 1}.</span>
              <span className="font-black text-white/90 uppercase text-[13px] tracking-tight">
                {player.username || 'Anonimowy'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md font-black tracking-widest">
                POZ {player.level}
              </span>
              <span className="text-orange-500 font-black text-xs min-w-[50px] text-right uppercase italic">
                {player.strength} SIŁ
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">Aktualizacja danych w czasie rzeczywistym</p>
      </div>
    </div>
  )
}