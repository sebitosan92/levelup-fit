'use client';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, CheckCircle2, Circle, Plus, Trash2, Sparkles } from "lucide-react"

interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
}

export default function VitaminsView() {
  const [vitamins, setVitamins] = useState<Vitamin[]>([
    { id: '1', name: 'Witamina D3', dosage: '2000 IU', taken: false },
    { id: '2', name: 'Omega 3', dosage: '1000 mg', taken: false },
    { id: '3', name: 'Magnez', dosage: '400 mg', taken: false },
  ]);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');

  const toggleVitamin = (id: string) => {
    setVitamins(vitamins.map(v => 
      v.id === id ? { ...v, taken: !v.taken } : v
    ));
  };

  const addVitamin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newVit: Vitamin = {
      id: Date.now().toString(),
      name: newName,
      dosage: newDosage,
      taken: false
    };
    setVitamins([...vitamins, newVit]);
    setNewName('');
    setNewDosage('');
  };

  const deleteVitamin = (id: string) => {
    setVitamins(vitamins.filter(v => v.id !== id));
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-black/40 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* HEADER */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Pill className="text-emerald-400 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-white tracking-[0.2em] uppercase leading-none">Bio-Support</h2>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1.5">Optymalizacja mikroelementów</p>
          </div>
        </div>
        <Sparkles size={16} className="text-emerald-400/30" />
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
        <AnimatePresence initial={false}>
          {vitamins.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                v.taken 
                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleVitamin(v.id)}>
                <div className="relative">
                  {v.taken ? (
                    <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                  ) : (
                    <Circle className="text-white/20 w-6 h-6 group-hover:text-white/40" />
                  )}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${v.taken ? 'text-white/40 line-through' : 'text-white'}`}>
                    {v.name}
                  </h3>
                  <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{v.dosage}</p>
                </div>
              </div>
              
              <button 
                onClick={() => deleteVitamin(v.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FORMULARZ DODAWANIA */}
      <div className="p-5 bg-black/60 border-t border-white/10 backdrop-blur-md">
        <form onSubmit={addVitamin} className="space-y-3">
          <div className="flex gap-2">
            <input 
              placeholder="Nazwa witaminy..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-emerald-500/50"
            />
            <input 
              placeholder="Dawka..."
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              className="w-24 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-emerald-500/50"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_5px_20px_rgba(16,185,129,0.2)]"
          >
            <Plus size={14} /> Dodaj do protokołu
          </button>
        </form>
      </div>
    </div>
  )
}