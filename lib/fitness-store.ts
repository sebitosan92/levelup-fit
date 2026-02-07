'use client';

import { supabase } from './supabase'
import useSWR, { mutate } from 'swr'
import React from 'react'

// --- KLUCZE LOCAL STORAGE ---
const STORAGE_KEY = "levelup-fit-data"
const WATER_KEY = "levelup-fit-water"
const STATUS_KEY = "levelup-fit-status"
const REWARDS_KEY = "levelup-fit-rewards"
const WORKOUT_LOG_KEY = "levelup-fit-workout-log"
const VAULT_IMAGES_KEY = "levelup-fit-vault-images"
const PIN_KEY = "levelup-fit-pin"
const LOOT_BOXES_KEY = "levelup-fit-loot-boxes"

// --- INTERFEJSY ---
export interface Reward { id: string; level: number; title: string; description: string; unlocked: boolean }
export interface VaultImage { id: string; src: string; title: string; addedAt: string }
export interface WorkoutLog { date: string; minutes: number }
export interface LootReward { 
  id: string; name: string; rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'; 
  color: string; stats: { str: number; spd: number; def: number; foc: number }; desc: string;
}
export interface ChatMessage { id: string; user_id: string; display_name: string; text: string; created_at: string; }
export interface Friend { id: string; display_name: string; level: number; status_message: string; }

// --- POMOCNIKI ---
export function getTodayString() { return new Date().toISOString().split("T")[0] }

const DEFAULT_REWARDS: Reward[] = [
  { id: "r1", level: 3, title: "Protein Shake", description: "Treat yourself to a shake", unlocked: false },
  { id: "r2", level: 5, title: "New Playlist", description: "Curate a fresh workout mix", unlocked: false },
  { id: "r3", level: 10, title: "Gaming Headset", description: "Level 10 legendary loot", unlocked: false },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveToStorage(key: string, data: any) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

export function playSound(type: 'water' | 'levelup' | 'loot') {
  if (typeof window !== "undefined") {
    const audio = new Audio(type === 'water' ? '/water.wav' : type === 'levelup' ? '/levelup.wav' : '/loot.wav');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }
}

// --- HOOKI ---

export function useAuth() {
  const [user, setUser] = React.useState<any>(null)
  const [profile, setProfile] = React.useState<any>(null)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (data) setProfile(data)
  }

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { 
    user, profile, 
    display_name: profile?.display_name || profile?.username || user?.email?.split('@')[0] || "Player" 
  }
}

export function useFitnessData() {
  const { data } = useSWR("fitness-data", () => loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 }), { fallbackData: { totalMinutes: 0, currentLevel: 1 } })
  return data!
}

export function useWaterData() {
  const { data } = useSWR("water-data", () => {
    const d = loadFromStorage(WATER_KEY, { date: getTodayString(), amount: 0 })
    return d.date !== getTodayString() ? { date: getTodayString(), amount: 0 } : d
  }, { fallbackData: { date: getTodayString(), amount: 0 } })
  return data!
}

export function useStatusMessage() {
  const { data } = useSWR(STATUS_KEY, () => loadFromStorage(STATUS_KEY, "Train hard!"), { fallbackData: "Train hard!" })
  return data!
}

export function useRewards() {
  const { data } = useSWR<Reward[]>("rewards", () => loadFromStorage(REWARDS_KEY, DEFAULT_REWARDS), { fallbackData: DEFAULT_REWARDS })
  return data!
}

export function useLootBoxes() {
  const { data } = useSWR("loot-boxes", () => loadFromStorage<number>(LOOT_BOXES_KEY, 0), { fallbackData: 0 })
  return data!
}

export function useVaultImages() {
  const { data } = useSWR<VaultImage[]>("vault-images", () => loadFromStorage(VAULT_IMAGES_KEY, []), { fallbackData: [] })
  return data!
}

export function useWorkoutLog() {
  const { data } = useSWR<WorkoutLog[]>("workout-log", () => loadFromStorage(WORKOUT_LOG_KEY, []), { fallbackData: [] })
  return data!
}

export function useMessages() {
  const { data } = useSWR<ChatMessage[]>("global-messages", async () => {
    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(20)
    return msgs ? msgs.reverse() : []
  }, { refreshInterval: 2000 })
  return data || []
}

export function useFriends() {
  const { user } = useAuth()
  const { data } = useSWR<Friend[]>(user ? `friends-list-${user.id}` : null, async () => {
    const { data: friendships } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', user?.id)
    
    if (!friendships || friendships.length === 0) return []
    const friendIds = friendships.map(f => f.friend_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, level, status_message')
      .in('id', friendIds)
    return profiles || []
  })
  return data || []
}

export function useAllUsers() {
  const { data } = useSWR<Friend[]>("all-profiles", async () => {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, display_name, level, status_message')
      .limit(50)
    return users || []
  })
  return data || []
}

// --- AKCJE AUTH ---

export async function signupUser(email: string, password: string) {
  return await supabase.auth.signUp({ email, password })
}

export async function loginUser(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function logoutUser() {
  await supabase.auth.signOut()
  if (typeof window !== "undefined") { localStorage.clear(); window.location.reload() }
}

/**
 * POPRAWIONE: Teraz zwraca obiekt success, aby widok mógł go obsłużyć
 */
export async function updateUsername(name: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { success: false, error: "No session" }
    
    const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', session.user.id)
    if (error) throw error
    
    mutate("auth-user")
    return { success: true }
  } catch (error) {
    console.error("Update username error:", error)
    return { success: false, error }
  }
}

// --- AKCJE ZNAJOMYCH ---

export async function addFriend(friendId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user || session.user.id === friendId) return

  const { error } = await supabase
    .from('friends')
    .insert([{ user_id: session.user.id, friend_id: friendId }])
  
  if (!error) mutate(`friends-list-${session.user.id}`)
}

export async function removeFriend(friendId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('user_id', session.user.id)
    .eq('friend_id', friendId)

  if (!error) mutate(`friends-list-${session.user.id}`)
}

// --- AKCJE REWARDS ---

export function addCustomReward(level: number, title: string, description: string) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const currentLevel = loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 }).currentLevel
  const newReward: Reward = { id: `r-${Date.now()}`, level, title, description, unlocked: level <= currentLevel }
  const updated = [...rewards, newReward].sort((a, b) => a.level - b.level)
  saveToStorage(REWARDS_KEY, updated); mutate("rewards", updated, false)
}

export function removeReward(id: string) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const updated = rewards.filter((r) => r.id !== id)
  saveToStorage(REWARDS_KEY, updated); mutate("rewards", updated, false)
}

export function editReward(id: string, title: string, description: string, level: number) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const currentLevel = loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 }).currentLevel
  const updated = rewards.map((r) => r.id === id ? { ...r, title, description, level, unlocked: level <= currentLevel } : r).sort((a, b) => a.level - b.level)
  saveToStorage(REWARDS_KEY, updated); mutate("rewards", updated, false)
}

export function syncRewardsWithLevel(level: number) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const updated = rewards.map(r => r.level <= level ? { ...r, unlocked: true } : r)
  saveToStorage(REWARDS_KEY, updated); mutate("rewards", updated, false)
}

// --- AKCJE VAULT & SETTINGS ---

export function addVaultImage(src: string, title: string) {
  const images = loadFromStorage<VaultImage[]>(VAULT_IMAGES_KEY, [])
  const updated = [...images, { id: `img-${Date.now()}`, src, title, addedAt: new Date().toISOString() }]
  saveToStorage(VAULT_IMAGES_KEY, updated); mutate("vault-images", updated, false)
}

export function removeVaultImage(id: string) {
  const images = loadFromStorage<VaultImage[]>(VAULT_IMAGES_KEY, [])
  const updated = images.filter(img => img.id !== id)
  saveToStorage(VAULT_IMAGES_KEY, updated); mutate("vault-images", updated, false)
}

export async function resetAllData() {
  if (typeof window === "undefined") return
  localStorage.clear()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await supabase.from('profiles').update({
      strength: 0, speed: 0, defense: 0, focus: 0, xp: 0, level: 1, 
      total_minutes: 0, water_ml: 0
    }).eq('id', session.user.id)
  }
  window.location.reload()
}

// --- AKCJE DANYCH ---

export async function sendChatMessage(text: string, displayName: string) {
  if (!text.trim()) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return
  
  const { error } = await supabase.from('messages').insert([
    { 
      user_id: session.user.id, 
      display_name: displayName || "Warrior", 
      text: text 
    }
  ])

  if (error) {
    console.error("Chat Error:", error)
  } else {
    mutate("global-messages")
  }
}

export async function claimQuestReward(xpReward: number, statType?: 'str' | 'spd' | 'def' | 'foc', statVal: number = 0) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return
  const { data: curr } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  if (curr) {
    const newXp = (curr.xp || 0) + xpReward
    const newLevel = Math.floor(newXp / 100) + 1
    const update: any = { xp: newXp, level: newLevel }
    if (statType === 'str') update.strength = (curr.strength || 0) + statVal
    if (statType === 'spd') update.speed = (curr.speed || 0) + statVal
    if (statType === 'def') update.defense = (curr.defense || 0) + statVal
    if (statType === 'foc') update.focus = (curr.focus || 0) + statVal
    await supabase.from('profiles').update(update).eq('id', session.user.id)
    playSound(newLevel > (curr.level || 1) ? 'levelup' : 'loot')
    mutate("auth-user"); 
    window.dispatchEvent(new Event('visibilitychange'))
  }
}

export async function addWater(ml: number) {
  const current = loadFromStorage(WATER_KEY, { date: getTodayString(), amount: 0 })
  const newAmount = current.date !== getTodayString() ? ml : current.amount + ml
  saveToStorage(WATER_KEY, { date: getTodayString(), amount: newAmount })
  mutate("water-data", { date: getTodayString(), amount: newAmount }, false)
  playSound('water')
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) await supabase.from('profiles').upsert({ id: session.user.id, water_ml: newAmount }, { onConflict: 'id' })
}

export async function addWorkoutMinutes(minutes: number) {
  const current = loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 })
  const newTotal = current.totalMinutes + minutes
  const newLevel = Math.floor(newTotal / 30) + 1
  const log = loadFromStorage<WorkoutLog[]>(WORKOUT_LOG_KEY, [])
  const todayEntry = log.find(e => e.date === getTodayString())
  const newLog = todayEntry ? log.map(e => e.date === getTodayString() ? { ...e, minutes: e.minutes + minutes } : e) : [...log, { date: getTodayString(), minutes }];

  saveToStorage(WORKOUT_LOG_KEY, newLog); mutate("workout-log", newLog, false)
  saveToStorage(STORAGE_KEY, { totalMinutes: newTotal, currentLevel: newLevel }); mutate("fitness-data", { totalMinutes: newTotal, currentLevel: newLevel }, false)

  if (newLevel > current.currentLevel) {
    playSound('levelup')
    const boxes = loadFromStorage<number>(LOOT_BOXES_KEY, 0)
    saveToStorage(LOOT_BOXES_KEY, boxes + 1); mutate("loot-boxes", boxes + 1, false)
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) await supabase.from('profiles').upsert({ id: session.user.id, total_minutes: newTotal, level: newLevel }, { onConflict: 'id' })
  syncRewardsWithLevel(newLevel)
  return { leveledUp: newLevel > current.currentLevel }
}

export function getTodayWorkoutMinutes(): number {
  const log = loadFromStorage<WorkoutLog[]>(WORKOUT_LOG_KEY, [])
  return log.find((l) => l.date === getTodayString())?.minutes ?? 0
}

export async function openLootBox(): Promise<LootReward | null> {
  const boxes = loadFromStorage<number>(LOOT_BOXES_KEY, 0)
  if (boxes <= 0) return null
  const rewards: LootReward[] = [
    { id: '1', name: 'TITAN POWER', rarity: 'Legendary', color: 'from-orange-500 to-red-600', stats: { str: 50, spd: 0, def: 10, foc: 0 }, desc: 'Godly Strength' },
    { id: '2', name: 'NEON SPEED', rarity: 'Epic', color: 'from-cyan-400 to-blue-600', stats: { str: 0, spd: 30, def: 0, foc: 10 }, desc: 'Flash Reflex' },
    { id: '3', name: 'IRON BODY', rarity: 'Rare', color: 'from-slate-400 to-slate-600', stats: { str: 5, spd: 0, def: 20, foc: 0 }, desc: 'Indestructible' },
    { id: '4', name: 'ZEN FOCUS', rarity: 'Common', color: 'from-emerald-400 to-green-600', stats: { str: 0, spd: 0, def: 0, foc: 15 }, desc: 'Quiet mind' },
  ];
  const reward = Math.random() > 0.95 ? rewards[0] : Math.random() > 0.80 ? rewards[1] : Math.random() > 0.50 ? rewards[2] : rewards[3];
  saveToStorage(LOOT_BOXES_KEY, boxes - 1); mutate("loot-boxes", boxes - 1, false)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    const { data: curr } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (curr) {
      await supabase.from('profiles').update({ 
        strength: (curr.strength||0)+reward.stats.str, 
        speed:(curr.speed||0)+reward.stats.spd, 
        defense:(curr.defense||0)+reward.stats.def, 
        focus:(curr.focus||0)+reward.stats.foc, 
        xp:(curr.xp||0)+20, 
        level:Math.floor(((curr.xp||0)+20)/100)+1 
      }).eq('id', session.user.id)
      mutate("auth-user")
    }
  }
  playSound('loot'); return reward
}

export async function updateStatusMessage(message: string) {
  saveToStorage(STATUS_KEY, message); mutate(STATUS_KEY, message, false)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) await supabase.from('profiles').upsert({ id: session.user.id, status_message: message }, { onConflict: 'id' })
}

export function getStoredPin() { return typeof window !== "undefined" ? localStorage.getItem(PIN_KEY) : null }
export function setStoredPin(pin: string) { if (typeof window !== "undefined") localStorage.setItem(PIN_KEY, pin) }