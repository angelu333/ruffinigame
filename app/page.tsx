"use client"

import Image from "next/image";
import { Calculator, BrainCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [particles, setParticles] = useState<Array<{
    x: string;
    y: string;
    symbol: string;
    duration: number;
  }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        symbol: ['∑', '∫', 'π', '∞', '√', '±', '×', '÷'][Math.floor(Math.random() * 8)],
        duration: Math.random() * 10 + 10
      }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-purple-900 to-slate-900 p-4">
      {/* Fondo animado con partículas matemáticas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute text-white text-2xl"
              initial={{ x: particle.x, y: particle.y }}
              animate={{
                x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {particle.symbol}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl w-full space-y-8 text-center"
        >
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            >
              Bienvenido a la Calculadora Ruffini
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-white/80"
            >
              Una herramienta simple y eficiente para resolver polinomios
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/calculadora"
              className="group relative overflow-hidden rounded-xl p-8 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center space-y-4 border border-white/20 hover:border-blue-400"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <span className="relative z-10 text-xl font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">
                Ir a la Calculadora
              </span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/quiz"
              className="group relative overflow-hidden rounded-xl p-8 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center space-y-4 border border-white/20 hover:border-purple-400"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                <BrainCog className="w-8 h-8 text-white" />
              </div>
              <span className="relative z-10 text-xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">
                Practicar Quiz
              </span>
            </motion.a>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
