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
    <div className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-500" />
        <h2 className="text-xl font-black text-white uppercase italic">Global Ranking</h2>
      </div>
      
      <div className="space-y-3">
        {leaders.map((player, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-white/20 w-4">{index + 1}.</span>
              <span className="font-bold text-white uppercase text-sm">{player.username || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg font-black">LVL {player.level}</span>
              <span className="text-orange-500 font-black text-sm">{player.strength} STR</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}