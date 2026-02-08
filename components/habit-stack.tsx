"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, Trash2, Dumbbell, Pill, Wind, CheckCircle2, 
  Circle, Flame, Activity, ShieldAlert, Brain, Plus, GlassWater,
  Cpu
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

interface Habit {
  id: string
  title: string
  user_id: string
  streak_count?: number
  is_completed_today?: boolean
  history: boolean[] 
}

interface Vitamin {
  id: string
  name: string
  dosage: string
  user_id: string
  last_taken_date?: string | null
  taken_today?: boolean
}

const VITAMIN_SUGGESTIONS = [
  { name: "Witamina A (Retinol) (Wzrok i skóra)", dosage: "800 µg" },
  { name: "Witamina B1 (Tiamina) (Energia i układ nerwowy)", dosage: "100 mg" },
  { name: "Witamina B2 (Ryboflawina) (Wzrok i metabolizm)", dosage: "50 mg" },
  { name: "Witamina B3 (Niacyna) (Układ nerwowy i skóra)", dosage: "16 mg" },
  { name: "Witamina B3 (Nikotynamid) (Energia komórkowa)", dosage: "500 mg" },
  { name: "Witamina B5 (Kwas pantotenowy) (Nadnercza i hormony)", dosage: "200 mg" },
  { name: "Witamina B6 (P-5-P) (Układ nerwowy i krew)", dosage: "20 mg" },
  { name: "Witamina B6 (Chlorowodorek pirydoksyny) (Metabolizm białek)", dosage: "50 mg" },
  { name: "Witamina B7 (Biotyna) (Włosy i paznokcie)", dosage: "5000 µg" },
  { name: "Witamina B9 (Kwas foliowy) (Podział komórek)", dosage: "400 µg" },
  { name: "Witamina B9 (Metylofolian L-5-MTHF) (Metylacja)", dosage: "400 µg" },
  { name: "Witamina B12 (Metylokobalamina) (Krew i mózg)", dosage: "1000 µg" },
  { name: "Witamina B12 (Adenozylokobalamina) (Energia mitochondrialna)", dosage: "500 µg" },
  { name: "Witamina C (Kwas l-askorbinowy) (Odporność i kolagen)", dosage: "1000 mg" },
  { name: "Witamina C (Liposomalna) (Wysoka przyswajalność)", dosage: "1000 mg" },
  { name: "Witamina C (Askorbinian sodu) (Buforowana - żołądek)", dosage: "1000 mg" },
  { name: "Witamina D3 (Cholekalcyferol) (Kości i odporność)", dosage: "2000 IU" },
  { name: "Witamina E (D-alfa-tokoferol) (Antyoksydant)", dosage: "12 mg" },
  { name: "Witamina E (Tokotrienole) (Ochrona serca)", dosage: "50 mg" },
  { name: "Witamina K1 (Filochinon) (Krzepnięcie krwi)", dosage: "100 µg" },
  { name: "Witamina K2 (MK-7) (Zdrowie kości i tętnic)", dosage: "100 µg" },
  { name: "Witamina K2 (MK-4) (Gospodarka wapniowa)", dosage: "500 µg" },
  { name: "Magnez (Cytrynian) (Mięśnie i trawienie)", dosage: "400 mg" },
  { name: "Magnez (Glicynian) (Relaks i sen)", dosage: "400 mg" },
  { name: "Magnez (Taurynian) (Serce i układ krążenia)", dosage: "400 mg" },
  { name: "Magnez (Treonian) (Mózg i funkcje poznawcze)", dosage: "2000 mg" },
  { name: "Magnez (Jabłczan) (Energia i bóle mięśni)", dosage: "400 mg" },
  { name: "Cynk (Pikolinian) (Odporność i hormony)", dosage: "15 mg" },
  { name: "Cynk (Glukonian) (Skóra i gojenie)", dosage: "30 mg" },
  { name: "Cynk (Karnozyna) (Żołądek i śluzówka)", dosage: "75 mg" },
  { name: "Selen (L-selenometionina) (Tarczyca)", dosage: "200 µg" },
  { name: "Selen (Selenin sodu) (Detoks)", dosage: "100 µg" },
  { name: "Jod (Jodek potasu) (Tarczyca i metabolizm)", dosage: "150 µg" },
  { name: "Jod (Kelpie) (Naturalne źródło jodu)", dosage: "150 µg" },
  { name: "Żelazo (Diglicynian) (Krew i energia)", dosage: "18 mg" },
  { name: "Wapń (Węglan) (Kości)", dosage: "1000 mg" },
  { name: "Wapń (Cytrynian) (Kości - lepsza wchłanialność)", dosage: "1000 mg" },
  { name: "Potas (Chlorek) (Elektrolity)", dosage: "300 mg" },
  { name: "Potas (Cytrynian) (Ciśnienie krwi)", dosage: "500 mg" },
  { name: "Miedź (Diglicynian) (Tkanka łączna i żelazo)", dosage: "2 mg" },
  { name: "Chrom (Pikolinian) (Cukier i apetyt)", dosage: "200 µg" },
  { name: "Mangan (Glukonian) (Stawy i chrząstki)", dosage: "2 mg" },
  { name: "Molibden (Detoks siarczynów)", dosage: "50 µg" },
  { name: "Bor (Hormony i kości)", dosage: "3 mg" },
  { name: "Krzem (Kwas ortokrzemowy) (Skóra, włosy, paznokcie)", dosage: "10 mg" },
  { name: "Lit (Orotan) (Stabilizacja nastroju)", dosage: "5 mg" },
  { name: "Siarka organiczna (MSM) (Stawy i stany zapalne)", dosage: "3000 mg" },
  { name: "N-Acetylo L-Cysteina (NAC) (Płuca i glutation)", dosage: "600 mg" },
  { name: "L-Glutamina (Jelita i regeneracja)", dosage: "5000 mg" },
  { name: "L-Teanina (Uspokojenie i skupienie)", dosage: "200 mg" },
  { name: "Kreatyna (Monohydrat) (Siła i mózg)", dosage: "5000 mg" },
  { name: "Kreatyna (HCL) (Siła bez retencji wody)", dosage: "3000 mg" },
  { name: "L-Karnityna (ALCAR) (Mózg i spalanie tłuszczu)", dosage: "1000 mg" },
  { name: "L-Arginina (Pompa mięśniowa i krążenie)", dosage: "3000 mg" },
  { name: "Cytrulina (Wydolność i regeneracja)", dosage: "6000 mg" },
  { name: "Glicyna (Sen i detoks)", dosage: "3000 mg" },
  { name: "L-Tyrozyna (Dopamina i stres)", dosage: "1000 mg" },
  { name: "N-Acetylo L-Tyrozyna (NALT) (Skupienie)", dosage: "350 mg" },
  { name: "Tauryna (Serce i układ nerwowy)", dosage: "2000 mg" },
  { name: "L-Tryptofan (Sen i serotonina)", dosage: "500 mg" },
  { name: "5-HTP (Nastrój i apetyt)", dosage: "100 mg" },
  { name: "BCAA (Mięśnie)", dosage: "5000 mg" },
  { name: "EAA (Synteza białek)", dosage: "10 g" },
  { name: "L-Lizyna (Odporność i opryszczka)", dosage: "1000 mg" },
  { name: "L-Fenyloalanina (Nastrój)", dosage: "500 mg" },
  { name: "L-Metionina (Detoks i wątroba)", dosage: "500 mg" },
  { name: "L-Histydyna (Wchłanianie minerałów)", dosage: "500 mg" },
  { name: "Beta-Alanina (Wytrzymałość)", dosage: "3200 mg" },
  { name: "GABA (Relaksacja)", dosage: "500 mg" },
  { name: "Ashwagandha (KSM-66) (Redukcja stresu i kortyzolu)", dosage: "600 mg" },
  { name: "Ashwagandha (Sensoril) (Sen i spokój)", dosage: "250 mg" },
  { name: "Różeniec górski (Energia i odporność na stres)", dosage: "300 mg" },
  { name: "Bacopa Monnieri (Pamięć i nauka)", dosage: "300 mg" },
  { name: "Żeń-szeń koreański (Witalność i libido)", dosage: "500 mg" },
  { name: "Żeń-szeń syberyjski (Odporność)", dosage: "400 mg" },
  { name: "Kurkumina (Stany zapalne i stawy)", dosage: "500 mg" },
  { name: "Berberyna HCL (Cukier i metabolizm)", dosage: "500 mg" },
  { name: "Ostropest plamisty (Regeneracja wątroby)", dosage: "150 mg" },
  { name: "Gotu Kola (Krążenie i pamięć)", dosage: "400 mg" },
  { name: "Ginkgo Biloba (Krążenie mózgowe)", dosage: "120 mg" },
  { name: "Soplówka jeżowata (Regeneracja neuronów)", dosage: "1000 mg" },
  { name: "Cordyceps (Wydolność płuc i libido)", dosage: "1000 mg" },
  { name: "Reishi (Odporność i wyciszenie)", dosage: "1000 mg" },
  { name: "Chaga (Antyoksydant i odporność)", dosage: "1000 mg" },
  { name: "Shiitake (Serce i odporność)", dosage: "1000 mg" },
  { name: "Maitake (Odporność i cukier)", dosage: "1000 mg" },
  { name: "Zielona herbata (EGCG) (Metabolizm)", dosage: "400 mg" },
  { name: "Resweratrol (Długowieczność)", dosage: "250 mg" },
  { name: "Quercetin (Alergie i odporność)", dosage: "500 mg" },
  { name: "Ruszczyk kolczasty (Naczynia krwionośne)", dosage: "150 mg" },
  { name: "Kasztanowiec (Obrzęki i żylaki)", dosage: "50 mg" },
  { name: "Pokrzywa (Drogi moczowe i prostata)", dosage: "250 mg" },
  { name: "Saw Palmetto (Zdrowie prostaty)", dosage: "320 mg" },
  { name: "Tribulus Terrestris (Libido)", dosage: "500 mg" },
  { name: "Maca (Energia i płodność)", dosage: "3000 mg" },
  { name: "Fenugreek (Trawienie i testosteron)", dosage: "500 mg" },
  { name: "Mucuna Pruriens (L-Dopa) (Nastrój i dopamina)", dosage: "200 mg" },
  { name: "Forskolina (Metabolizm)", dosage: "250 mg" },
  { name: "Sylibina (Wątroba - wysoka moc)", dosage: "120 mg" },
  { name: "Andrographis (Przeziębienie)", dosage: "400 mg" },
  { name: "Echinacea (Odporność infekcyjna)", dosage: "300 mg" },
  { name: "Czosnek (Antybiotyk naturalny)", dosage: "500 mg" },
  { name: "Imbir (Trawienie i nudności)", dosage: "500 mg" },
  { name: "Cynamon (Wrażliwość insulinowa)", dosage: "250 mg" },
  { name: "Boswellia Serrata (Stawy)", dosage: "300 mg" },
  { name: "Czarny bez (Wirusy)", dosage: "500 mg" },
  { name: "Kozłek lekarski (Głęboki sen)", dosage: "400 mg" },
  { name: "Melisa (Uspokojenie)", dosage: "300 mg" },
  { name: "Męczennica (Lęk i stres)", dosage: "200 mg" },
  { name: "Dziurawiec (Lekka depresja)", dosage: "300 mg" },
  { name: "Astragalus (System odpornościowy)", dosage: "500 mg" },
  { name: "Olive Leaf (Bakterie i ciśnienie)", dosage: "500 mg" },
  { name: "Pycnogenol (Krążenie i skóra)", dosage: "100 mg" },
  { name: "Ekstrakt z pestek winogron (Przeciwutleniacz)", dosage: "200 mg" },
  { name: "Omega-3 (EPA) (Stany zapalne i nastrój)", dosage: "1000 mg" },
  { name: "Omega-3 (DHA) (Mózg i wzrok)", dosage: "500 mg" },
  { name: "Olej z kryla (Serce i stawy)", dosage: "500 mg" },
  { name: "ALA (Kwas alfa-liponowy) (Cukier i detoks)", dosage: "600 mg" },
  { name: "R-ALA (Aktywna forma kwasu ALA)", dosage: "100 mg" },
  { name: "CLA (Spalanie tłuszczu)", dosage: "1000 mg" },
  { name: "Lecytyna (Pamięć i wątroba)", dosage: "1200 mg" },
  { name: "Olej MCT (C8) (Szybka energia)", dosage: "15 ml" },
  { name: "Olej z czarnuszki (Odporność i alergie)", dosage: "1000 mg" },
  { name: "Olej z wiesiołka (Hormony kobiece)", dosage: "1000 mg" },
  { name: "Olej z ogórecznika (Skóra)", dosage: "1000 mg" },
  { name: "Fosfatydyloseryna (Kortyzol i pamięć)", dosage: "100 mg" },
  { name: "Alpha-GPC (Skupienie i acetylocholina)", dosage: "300 mg" },
  { name: "CDP-Cholina (Regeneracja mózgu)", dosage: "250 mg" },
  { name: "Huperzyna A (Pamięć krótkotrwała)", dosage: "200 µg" },
  { name: "Winpocetyna (Przepływ krwi w mózgu)", dosage: "10 mg" },
  { name: "Sulbutiamina (Motywacja i energia)", dosage: "200 mg" },
  { name: "Urydyna (Budowa neuronów)", dosage: "250 mg" },
  { name: "PQQ (Mitochondria)", dosage: "20 mg" },
  { name: "Koenzym Q10 (Energia serca)", dosage: "100 mg" },
  { name: "Ubichinol (Aktywny koenzym Q10)", dosage: "100 mg" },
  { name: "NMN (Przeciwstarzeniowe)", dosage: "250 mg" },
  { name: "Melatonina (Rytm dobowy)", dosage: "1 mg" },
  { name: "Inozytol (Hormony i lęk)", dosage: "2000 mg" },
  { name: "Kolagen Typu I (Skóra)", dosage: "5000 mg" },
  { name: "Kolagen Typu II (Stawy)", dosage: "40 mg" },
  { name: "Kwas hialuronowy (Nawilżenie)", dosage: "100 mg" },
  { name: "Glukozamina (Chrząstka stawowa)", dosage: "1500 mg" },
  { name: "Chondroityna (Elastyczność stawów)", dosage: "800 mg" },
  { name: "Astaksantyna (Ochrona przed UV)", dosage: "4 mg" },
  { name: "Luteina (Ochrona siatkówki)", dosage: "20 mg" },
  { name: "Zeaksantyna (Wzrok)", dosage: "2 mg" },
  { name: "Likopen (Prostata)", dosage: "10 mg" },
  { name: "Chlorofil (Oczyszczanie krwi)", dosage: "100 mg" },
  { name: "Spirulina (Superfood i białko)", dosage: "3000 mg" },
  { name: "Chlorella (Detoks z metali ciężkich)", dosage: "3000 mg" },
  { name: "Bromelaina (Trawienie i obrzęki)", dosage: "500 mg" },
  { name: "Betaina HCL (Zakwaszenie żołądka)", dosage: "500 mg" },
  { name: "Enzymy trawienne (Wsparcie trzustki)", dosage: "1 kapsułka" },
  { name: "Maślan sodu (Regeneracja jelit)", dosage: "580 mg" },
  { name: "Węgiel aktywny (Zatrucia)", dosage: "250 mg" },
  { name: "Diosmina (Żyły i nogi)", dosage: "500 mg" },
  { name: "Rutyna (Uszczelnianie naczyń)", dosage: "100 mg" }
]

const HABIT_PRESETS = [
  { title: "Zimny Prysznic", icon: <Wind size={14} />, color: "text-blue-400" },
  { title: "Trening", icon: <Dumbbell size={14} />, color: "text-green-400" },
  { title: "Nawodnienie", icon: <GlassWater size={14} />, color: "text-cyan-400" },
  { title: "Medytacja", icon: <Brain size={14} />, color: "text-purple-400" },
]

export function HabitStack() {
  const [activeTab, setActiveTab] = useState<'habits' | 'vitamins'>('habits')
  const [habits, setHabits] = useState<Habit[]>([])
  const [vitamins, setVitamins] = useState<Vitamin[]>([])
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [newVitName, setNewVitName] = useState("")
  const [newVitDosage, setNewVitDosage] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [timeLeft, setTimeLeft] = useState("00:00:00")
  const [isUrgent, setIsUrgent] = useState(false)

  const DAYS_SHORT = ["P", "W", "Ś", "C", "P", "S", "N"]

  const globalHabitHistory = useMemo(() => {
    const history = Array(7).fill(false)
    if (habits.length === 0) return history
    for (let i = 0; i < 7; i++) {
      history[i] = habits.some(h => h.history[i])
    }
    return history
  }, [habits])

  const stats = useMemo(() => {
    const totalStreak = habits.reduce((acc, h) => acc + (h.streak_count || 0), 0)
    const completedCount = habits.filter(h => h.is_completed_today).length
    const rate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0
    return { totalStreak, rate }
  }, [habits])

  useEffect(() => {
    fetchAll()
    const timer = setInterval(() => {
      const now = new Date(); const eod = new Date(); eod.setHours(23, 59, 59)
      const diff = eod.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000); const m = Math.floor((diff / 60000) % 60); const s = Math.floor((diff / 1000) % 60)
      setIsUrgent(h < 3)
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    
    const { data: h } = await supabase.from('user_habits').select(`*, habit_logs(completed_at)`).eq('user_id', user.id)
    if (h) {
      setHabits((h as any[]).map(item => {
        const history = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i))
          const dateStr = d.toISOString().split('T')[0]
          return item.habit_logs.some((l: any) => l.completed_at === dateStr)
        })
        return { ...item, is_completed_today: item.habit_logs.some((l: any) => l.completed_at === today), history }
      }))
    }

    const { data: v } = await supabase.from('user_vitamins').select('*').eq('user_id', user.id)
    if (v) setVitamins((v as any[]).map(item => ({ ...item, taken_today: item.last_taken_date === today })))
  }

  const toggleHabit = async (habit: Habit) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    if (habit.is_completed_today) {
      await supabase.from('habit_logs').delete().eq('habit_id', habit.id).eq('completed_at', today)
    } else {
      await supabase.from('habit_logs').insert([{ habit_id: habit.id, user_id: user.id, completed_at: today }])
    }
    fetchAll()
  }

  const addHabit = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !title.trim()) return
    await supabase.from('user_habits').insert([{ title, user_id: user.id }])
    setNewHabitTitle(""); fetchAll()
  }

  const addVitamin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !newVitName.trim()) return
    await supabase.from('user_vitamins').insert([{ 
      name: newVitName, 
      dosage: newVitDosage || "1 porcja", 
      user_id: user.id 
    }])
    setNewVitName(""); setNewVitDosage(""); setShowSuggestions(false); fetchAll()
  }

  return (
    <div className="space-y-6 pb-24 max-w-[450px] mx-auto p-4 font-sans text-white min-h-screen">
      
      {/* Tab Switcher */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl">
        <button onClick={() => setActiveTab('habits')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'habits' ? 'bg-orange-500 text-black shadow-lg' : 'text-white/40'}`}>Protokoły</button>
        <button onClick={() => setActiveTab('vitamins')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vitamins' ? 'bg-cyan-500 text-black shadow-lg' : 'text-white/40'}`}>Bio-Matrix</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-[2.5rem] relative overflow-hidden">
          <Flame className="absolute -right-2 -top-2 text-orange-500/10 w-16 h-16" />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Streak</span>
          <p className="text-3xl font-black font-mono mt-1">{stats.totalStreak}</p>
        </div>
        <div className="bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-[2.5rem] relative overflow-hidden">
          <Activity className="absolute -right-2 -top-2 text-cyan-500/10 w-16 h-16" />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Wydajność</span>
          <p className="text-3xl font-black text-cyan-500 font-mono mt-1">{stats.rate}%</p>
        </div>
      </div>

      {/* Timer */}
      <div className={`p-4 rounded-[2rem] border transition-all ${isUrgent ? "bg-red-500/10 border-red-500/40" : "bg-white/[0.02] border-white/5"}`}>
        <div className="flex items-center gap-4">
          <ShieldAlert size={18} className={isUrgent ? "text-red-500 animate-pulse" : "text-white/20"} />
          <div>
            <h4 className="text-[9px] font-black uppercase text-white/40 tracking-widest">Reset Systemu</h4>
            <p className="text-lg font-mono font-bold text-white">{timeLeft}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'habits' ? (
          <motion.div key="habits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-white/40" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Macierz Operacyjna</h3>
                </div>
                <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest animate-pulse">Synchro Ok</span>
              </div>

              <div className="flex justify-between items-center px-1">
                {globalHabitHistory.map((done, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className={`w-8 h-12 sm:w-10 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${done ? 'bg-orange-500/10 border border-orange-500/50' : 'bg-white/[0.02] border border-white/5'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${done ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/10'}`} />
                    </div>
                    <span className={`text-[9px] font-black ${done ? 'text-white/60' : 'text-white/20'}`}>{DAYS_SHORT[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {HABIT_PRESETS.map((p) => (
                <button 
                  key={p.title} 
                  onClick={() => addHabit(p.title)} 
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95"
                >
                  <span className={p.color}>{p.icon}</span> {p.title}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {habits.map((habit) => (
                <div key={habit.id} className={`p-4 rounded-[2.5rem] border flex items-center justify-between transition-all ${habit.is_completed_today ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleHabit(habit)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${habit.is_completed_today ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                      {habit.is_completed_today ? <Zap size={18} fill="currentColor" /> : <Circle size={18} />}
                    </button>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-tight ${habit.is_completed_today ? 'text-white' : 'text-white/40'}`}>{habit.title}</span>
                      <div className="flex gap-1 mt-2">
                        {habit.history.map((done, i) => (
                          <div key={i} className={`h-1 rounded-full transition-all ${done ? 'w-3 bg-orange-500' : 'w-1 bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={async () => {await supabase.from('user_habits').delete().eq('id', habit.id); fetchAll()}} className="p-2 text-white/10"><Trash2 size={14} /></button>
                </div>
              ))}
              <input 
                type="text" placeholder="NOWY PROTOKÓŁ..." value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHabit(newHabitTitle)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-white uppercase tracking-widest focus:outline-none focus:border-orange-500/30 transition-all"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div key="vitamins" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            
            {/* Formularz dodawania - Poprawiony na Mobile */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 space-y-3">
              <div className="relative">
                <input 
                  type="text" placeholder="NAZWA WITAMINY..." value={newVitName}
                  onChange={(e) => {setNewVitName(e.target.value); setShowSuggestions(true)}}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-mono uppercase focus:outline-none focus:border-cyan-500/30"
                />
                {showSuggestions && newVitName && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {VITAMIN_SUGGESTIONS.filter(s => s.name.toLowerCase().includes(newVitName.toLowerCase())).map((s, i) => (
                      <button key={i} onClick={() => {setNewVitName(s.name); setNewVitDosage(s.dosage); setShowSuggestions(false)}} className="w-full text-left p-3 text-[9px] hover:bg-white/5 border-b border-white/5 flex justify-between uppercase">
                        <span className="font-bold text-white">{s.name}</span>
                        <span className="text-cyan-500/50">{s.dosage}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="DAWKA..." value={newVitDosage}
                  onChange={(e) => setNewVitDosage(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-mono uppercase focus:outline-none"
                />
                <button onClick={addVitamin} className="px-6 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 active:scale-95 transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {vitamins.map((vit) => (
                <div key={vit.id} className={`p-4 rounded-[2.5rem] border flex items-center justify-between transition-all ${vit.taken_today ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={async () => {
                        const today = new Date().toISOString().split('T')[0]
                        await supabase.from('user_vitamins').update({ last_taken_date: vit.taken_today ? null : today }).eq('id', vit.id)
                        fetchAll()
                      }} 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${vit.taken_today ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                      {vit.taken_today ? <CheckCircle2 size={18} /> : <Pill size={18} />}
                    </button>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-tight ${vit.taken_today ? 'text-white' : 'text-white/40'}`}>{vit.name}</p>
                      <p className="text-[8px] font-mono text-cyan-500/60 uppercase mt-1 tracking-widest">DAWKA: {vit.dosage}</p>
                    </div>
                  </div>
                  <button onClick={async () => {await supabase.from('user_vitamins').delete().eq('id', vit.id); fetchAll()}} className="p-2 text-white/10"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}