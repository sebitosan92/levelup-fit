'use client';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dashboard } from "@/components/dashboard"
import { BottomNav, TabId } from "@/components/bottom-nav"
import { RewardsView } from "@/components/rewards-view"
import { MotivationVault } from "@/components/motivation-vault"
import { SettingsView } from "@/components/settings-view"
import { AuthScreen } from "@/components/auth-screen"
import { LeaderboardView } from "@/components/leaderboard-view" // Import nowego widoku
import { useAuth } from "@/lib/fitness-store"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const { user, profile } = useAuth() // Rozpakowanie obiektu z useAuth

  if (!user) {
    return <AuthScreen />
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white pb-32 relative overflow-x-hidden font-sans">
      
      {/* --- BACKGROUND DECORATION: ULTRA-NEON LASER GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        
        {/* 1. Podstawowa Siatka */}
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

        {/* 2. Laserowy Blask */}
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            backgroundPosition: ['0px 0px', '50px 50px']
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.3) 2px, transparent 2px),
              linear-gradient(to bottom, rgba(34, 197, 94, 0.3) 2px, transparent 2px)
            `,
            backgroundSize: '50px 50px',
            filter: 'blur(1px)', 
          }}
        />

        {/* 3. Wielokolorowe Mgławice */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-5%] w-[70%] h-[50%] bg-purple-500/30 rounded-full blur-[110px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[50%] bg-green-500/20 rounded-full blur-[100px]" 
        />
        
        {/* 4. Skanująca Linia */}
        <motion.div 
          animate={{ y: ['-100vh', '100vh'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent shadow-[0_0_20px_#a855f7]"
        />

        {/* 5. Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#020202_90%)]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 max-w-md mx-auto pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === 'home' && <Dashboard />}
            
            {activeTab === 'rewards' && (
              <div className="px-4 pt-4">
                <RewardsView />
              </div>
            )}
            
            {activeTab === 'vault' && (
              <div className="px-4 pt-4">
                <MotivationVault />
              </div>
            )}

            {/* NOWY WIDOK: RANKING */}
            {activeTab === 'leaderboard' && (
              <div className="px-4 pt-4">
                <LeaderboardView />
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="px-4 pt-4">
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