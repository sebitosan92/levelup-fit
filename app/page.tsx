'use client';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dashboard } from "@/components/dashboard"
import { BottomNav, TabId } from "@/components/bottom-nav"
import { RewardsView } from "@/components/rewards-view"
import { MotivationVault } from "@/components/motivation-vault"
import { SettingsView } from "@/components/settings-view"
import { AuthScreen } from "@/components/auth-screen"
import { LeaderboardView } from "@/components/leaderboard-view" 
import { SocialView } from "@/components/social-view" 
import { HabitStack } from "@/components/habit-stack" // IMPORT KOMPONENTU
import { useAuth } from "@/lib/fitness-store"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const { user } = useAuth()

  if (!user) {
    return <AuthScreen />
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white relative overflow-x-hidden font-sans">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.2]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #a855f7 1px, transparent 1px),
              linear-gradient(to bottom, #22c55e 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-5%] w-[70%] h-[50%] bg-purple-500/30 rounded-full blur-[110px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#020202_90%)]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 max-w-md mx-auto pt-4 pb-40 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-auto"
          >
            {/* Zakładka HOME (BAZA) */}
            {activeTab === 'home' && (
              <div className="w-full px-4">
                <Dashboard />
              </div>
            )}

            {/* Zakładka DYSCYPLINA (HABITS) - NOWOŚĆ POMIĘDZY BAZĄ A SEJFEM */}
            {activeTab === 'habits' && (
              <div className="w-full px-4 pt-4 space-y-6">
                <div className="px-1">
                  <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    Protokół <span className="text-orange-500 text-glow-orange">Dyscypliny</span>
                  </h1>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
                    Status: Synchronizacja nawyków...
                  </p>
                </div>
                <HabitStack />
              </div>
            )}
            
            {/* Zakładka SEJF (VAULT) */}
            {activeTab === 'vault' && (
              <div className="w-full px-4 pt-4">
                <MotivationVault />
              </div>
            )}

            {/* Zakładka RANKING */}
            {activeTab === 'leaderboard' && (
              <div className="w-full px-4 pt-4">
                <LeaderboardView />
              </div>
            )}

            {/* Zakładka NAGRODY */}
            {activeTab === 'rewards' && (
              <div className="w-full px-4 pt-4">
                <RewardsView />
              </div>
            )}

            {/* Zakładka SOCIAL */}
            {activeTab === 'social' && (
              <div className="w-full px-4 pt-4">
                <SocialView />
              </div>
            )}
            
            {/* Zakładka USTAWIENIA */}
            {activeTab === 'settings' && (
              <div className="w-full px-4 pt-4">
                <SettingsView />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- NAVIGATION --- */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}