'use client';

import { supabase } from './supabase'
import useSWR, { mutate } from 'swr'
import React from 'react'

// Klucze LocalStorage
const STORAGE_KEY = "levelup-fit-data"
const WATER_KEY = "levelup-fit-water"
const STATUS_KEY = "levelup-fit-status"
const REWARDS_KEY = "levelup-fit-rewards"
const WORKOUT_LOG_KEY = "levelup-fit-workout-log"
const VAULT_IMAGES_KEY = "levelup-fit-vault-images"
const PIN_KEY = "levelup-fit-pin"
const LOOT_BOXES_KEY = "levelup-fit-loot-boxes"
const UNLOCKED_CARDS_KEY = "levelup-fit-unlocked-cards"

// --- Typy ---
export interface Stats { strength: number; speed: number; defense: number; focus: number; xp: number; level: number }
export interface FitnessData { totalMinutes: number; currentLevel: number }
export interface WaterData { date: string; amount: number }
export interface Reward { id: string; level: number; title: string; description: string; unlocked: boolean }
export interface VaultImage { id: string; src: string; title: string; addedAt: string }
export interface WorkoutLog { date: string; minutes: number }

export interface LootReward { 
  id: string; 
  name: string; 
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'; 
  color: string;
  stats: { str: number; spd: number; def: number; foc: number };
  desc: string;
}

export function getTodayString() { return new Date().toISOString().split("T")[0] }

const DEFAULT_REWARDS: Reward[] = [
  { id: "r1", level: 3, title: "Protein Shake", description: "Treat yourself to a shake", unlocked: false },
  { id: "r2", level: 5, title: "New Playlist", description: "Curate a fresh workout mix", unlocked: false },
  { id: "r3", level: 10, title: "Gaming Headset", description: "Level 10 legendary loot", unlocked: false },
];

// --- Pomocniki Storage ---
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
    const audio = new Audio(
      type === 'water' ? '/water.wav' : 
      type === 'levelup' ? '/levelup.wav' : '/loot.wav'
    );
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }
}

// --- Hooki ---

export function useAuth() {
  const [user, setUser] = React.useState<any>(null)
  const [profile, setProfile] = React.useState<any>(null)

  // Funkcja pobierania profilu wyciągnięta na zewnątrz dla ponownego użycia
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (data) setProfile(data)
  }

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Pobieramy display_name z profilu, potem z metadata, potem z maila
  const displayName = profile?.display_name || profile?.username || user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Player"

  return { 
    user, 
    profile,
    display_name: displayName
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

// --- AKCJE GŁÓWNE ---

export async function updateUsername(newName: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    // PRZESTROGA: Wysyłamy do OBU kolumn na wypadek, gdybyś miał jedną z nich w bazie
    // Zapobiega to NULL w username jeśli baza tak nazywa kolumnę.
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: session.user.id, 
        display_name: newName,
        username: newName 
      }, { onConflict: 'id' })
    
    if (!error) {
      // Wymuszamy odświeżenie danych w całej aplikacji
      await mutate("fitness-data")
      window.dispatchEvent(new Event('visibilitychange')) // Trick na odświeżenie SWR
      return { success: true }
    }
    return { success: false, error: error.message }
  }
  return { success: false, error: "No session" }
}

export async function addWater(ml: number) {
  const current = loadFromStorage(WATER_KEY, { date: getTodayString(), amount: 0 })
  const newAmount = current.date !== getTodayString() ? ml : current.amount + ml
  const updated = { date: getTodayString(), amount: newAmount }
  saveToStorage(WATER_KEY, updated)
  mutate("water-data", updated, false)
  playSound('water')

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await supabase.from('profiles').upsert({ id: session.user.id, water_ml: newAmount }, { onConflict: 'id' })
  }
}

export async function addWorkoutMinutes(minutes: number) {
  const current = loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 })
  const newTotal = current.totalMinutes + minutes
  const newLevel = Math.floor(newTotal / 30) + 1
  const updated = { totalMinutes: newTotal, currentLevel: newLevel }
  
  saveToStorage(STORAGE_KEY, updated)
  mutate("fitness-data", updated, false)

  if (newLevel > current.currentLevel) {
    playSound('levelup')
    const currentBoxes = loadFromStorage<number>(LOOT_BOXES_KEY, 0)
    saveToStorage(LOOT_BOXES_KEY, currentBoxes + 1)
    mutate("loot-boxes", currentBoxes + 1, false)
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await supabase.from('profiles').upsert({ id: session.user.id, total_minutes: newTotal, current_level: newLevel }, { onConflict: 'id' })
  }
  
  syncRewardsWithLevel(newLevel)
  return { leveledUp: newLevel > current.currentLevel }
}

export function getTodayWorkoutMinutes(): number {
  const log = loadFromStorage<WorkoutLog[]>(WORKOUT_LOG_KEY, [])
  const today = getTodayString()
  return log.find((l) => l.date === today)?.minutes ?? 0
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

  const rand = Math.random();
  let reward = rand > 0.95 ? rewards[0] : rand > 0.80 ? rewards[1] : rand > 0.50 ? rewards[2] : rewards[3];

  saveToStorage(LOOT_BOXES_KEY, boxes - 1)
  mutate("loot-boxes", boxes - 1, false)

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    const { data: curr } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (curr) {
      await supabase.from('profiles').update({
        strength: (curr.strength || 0) + reward.stats.str,
        speed: (curr.speed || 0) + reward.stats.spd,
        defense: (curr.defense || 0) + reward.stats.def,
        focus: (curr.focus || 0) + reward.stats.foc,
        xp: (curr.xp || 0) + 20,
        level: Math.floor(((curr.xp || 0) + 20) / 100) + 1
      }).eq('id', session.user.id)
    }
  }

  playSound('loot')
  return reward
}

// --- ZARZĄDZANIE NAGRODAMI ---

export function addCustomReward(level: number, title: string, description: string) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const currentLevel = loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 }).currentLevel
  const newReward: Reward = { id: `r-${Date.now()}`, level, title, description, unlocked: level <= currentLevel }
  const updated = [...rewards, newReward].sort((a, b) => a.level - b.level)
  saveToStorage(REWARDS_KEY, updated)
  mutate("rewards", updated, false)
}

export function removeReward(id: string) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const updated = rewards.filter((r) => r.id !== id)
  saveToStorage(REWARDS_KEY, updated)
  mutate("rewards", updated, false)
}

export function editReward(id: string, title: string, description: string, level: number) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const currentLevel = loadFromStorage(STORAGE_KEY, { totalMinutes: 0, currentLevel: 1 }).currentLevel
  const updated = rewards.map((r) => r.id === id ? { ...r, title, description, level, unlocked: level <= currentLevel } : r).sort((a, b) => a.level - b.level)
  saveToStorage(REWARDS_KEY, updated)
  mutate("rewards", updated, false)
}

export function syncRewardsWithLevel(level: number) {
  const rewards = loadFromStorage<Reward[]>(REWARDS_KEY, DEFAULT_REWARDS)
  const updated = rewards.map(r => r.level <= level ? { ...r, unlocked: true } : r)
  saveToStorage(REWARDS_KEY, updated)
  mutate("rewards", updated, false)
}

// --- INNE AKCJE ---

export async function updateStatusMessage(message: string) {
  saveToStorage(STATUS_KEY, message)
  mutate(STATUS_KEY, message, false)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await supabase.from('profiles').upsert({ id: session.user.id, status_message: message }, { onConflict: 'id' })
  }
}

export function addVaultImage(src: string, title: string) {
  const images = loadFromStorage<VaultImage[]>(VAULT_IMAGES_KEY, [])
  const updated = [...images, { id: `img-${Date.now()}`, src, title, addedAt: new Date().toISOString() }]
  saveToStorage(VAULT_IMAGES_KEY, updated)
  mutate("vault-images", updated, false)
}

export function removeVaultImage(id: string) {
  const images = loadFromStorage<VaultImage[]>(VAULT_IMAGES_KEY, [])
  const updated = images.filter((img) => img.id !== id)
  saveToStorage(VAULT_IMAGES_KEY, updated)
  mutate("vault-images", updated, false)
}

export function getStoredPin() { return typeof window !== "undefined" ? localStorage.getItem(PIN_KEY) : null }
export function setStoredPin(pin: string) { if (typeof window !== "undefined") localStorage.setItem(PIN_KEY, pin) }

// --- AUTORYZACJA ---

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

export function resetAllData() {
  if (typeof window !== "undefined") {
    localStorage.clear()
    window.location.reload()
  }
}