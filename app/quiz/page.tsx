"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, GamepadIcon as GameController, Trophy, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import { useSound } from 'use-sound'

// Tipos para nuestro quiz
type Dificultad = "facil" | "medio" | "dificil"
type TerminoPolinomio = {
  coeficiente: number
  exponente: number
}
type Pregunta = {
  polinomio: number[]
  divisor: number
  opciones: string[]
  respuestaCorrecta: string
  opcionesOcultas?: boolean[]
}

// Componente para renderizar un término del polinomio con exponentes como superíndices
function TerminoPolinomio({
  coeficiente,
  exponente,
  esInicio,
}: { coeficiente: number; exponente: number; esInicio: boolean }) {
  if (coeficiente === 0) return null

  // Determinar el signo
  const signo = esInicio ? (coeficiente < 0 ? "-" : "") : coeficiente < 0 ? " - " : " + "

  // Valor absoluto del coeficiente (para no mostrar el signo dos veces)
  const valorAbs = Math.abs(coeficiente)

  // Si el coeficiente es 1 y hay variable, no mostramos el 1
  const mostrarCoef = valorAbs === 1 && exponente > 0 ? "" : valorAbs

  // Determinar cómo mostrar la variable y el exponente
  let variable: JSX.Element | string | null = null
  if (exponente === 0) {
    variable = null
  } else if (exponente === 1) {
    variable = "x"
  } else {
    variable = (
      <span>
        x<sup>{exponente}</sup>
      </span>
    )
  }

  return (
    <span>
      {signo}
      {mostrarCoef}
      {variable}
    </span>
  )
}

// Componente para renderizar un polinomio completo
function Polinomio({ terminos }: { terminos: number[] }) {
  if (terminos.length === 0) return <span>0</span>

  return (
    <span>
      {terminos.map((termino, index) => (
        <TerminoPolinomio
          key={index}
          coeficiente={termino}
          exponente={terminos.length - index - 1}
          esInicio={index === 0}
        />
      ))}
    </span>
  )
}

export default function QuizPage() {
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil">("facil")
  const [iniciado, setIniciado] = useState(false)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null)
  const [respuestaEnviada, setRespuestaEnviada] = useState(false)
  const [vidas, setVidas] = useState(3)
  const [puntuacion, setPuntuacion] = useState(0)
  const [juegoTerminado, setJuegoTerminado] = useState(false)
  const [mostrarFeedback, setMostrarFeedback] = useState(false)
  const [particles, setParticles] = useState<Array<{
    x: string;
    y: string;
    symbol: string;
    duration: number;
  }>>([]);
  const [feedbackEmoji, setFeedbackEmoji] = useState<string>("")
  const [powerUpDisponible, setPowerUpDisponible] = useState(true);
  const [musicaActiva, setMusicaActiva] = useState(false);
  const [racha, setRacha] = useState(0)
  const [mejorRacha, setMejorRacha] = useState(0)

  // Efectos de sonido
  const [playAcierto] = useSound('/sounds/success.mp3', { 
    volume: 0.5,
    soundEnabled: true // Habilitar sonido
  });
  const [playError] = useSound('/sounds/error.mp3', { 
    volume: 0.5,
    soundEnabled: true // Habilitar sonido
  });
  const [playMusic, { stop: stopMusic }] = useSound('/sounds/background-music.mp3', {
    volume: 0.2,
    loop: true,
    soundEnabled: true // Habilitar sonido
  });

  // Efecto para la música de fondo
  useEffect(() => {
    if (musicaActiva && iniciado) {
      playMusic();
    }
    return () => stopMusic();
  }, [musicaActiva, iniciado]);

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

  // Función para generar coeficientes aleatorios
  const generarCoeficientes = (grado: number): number[] => {
    // Reducir el rango de coeficientes según el grado para evitar residuos muy grandes
    // Ajustado para mantener residuos menores a 150
    const maxCoef = grado <= 2 ? 3 : grado <= 3 ? 4 : grado <= 4 ? 5 : 3
    const coeficientes = Array.from(
      { length: grado + 1 },
      () => Math.floor(Math.random() * (maxCoef * 2 + 1)) - maxCoef
    )
    // Asegurar que el coeficiente principal no sea 0
    if (coeficientes[0] === 0) coeficientes[0] = 1
    return coeficientes
  }

  // Función para generar un divisor aleatorio
  const generarDivisor = (dificultad: "facil" | "medio" | "dificil"): number => {
    const rango = dificultad === "facil" ? 2 : dificultad === "medio" ? 3 : 4
    let divisor = 0
    while (divisor === 0) {
      divisor = Math.floor(Math.random() * (rango * 2 + 1)) - rango
    }
    return divisor
  }

  // Función para evaluar un polinomio usando Ruffini
  const evaluarRuffini = (coeficientes: number[], divisor: number): number => {
    return coeficientes.reduce((acc, coef) => acc * divisor + coef, 0)
  }

  // Función para generar opciones de respuesta
  const generarOpciones = (resultado: number, dificultad: string): string[] => {
    const rango = dificultad === "facil" ? 2 : dificultad === "medio" ? 3 : 4
    const opcionesBase = new Set([resultado])
    
    while (opcionesBase.size < 4) {
      const opcion = resultado + Math.floor(Math.random() * (rango * 2 + 1)) - rango
      if (opcion !== resultado) {
        opcionesBase.add(opcion)
      }
    }
    
    return Array.from(opcionesBase)
      .sort(() => Math.random() - 0.5)
      .map(String)
  }

  const generarPregunta = (polinomio: number[], divisor: number): JSX.Element => {
    return (
      <div className="space-y-2">
        <p className="text-lg text-white">Calcula el residuo de la división:</p>
        <div className="flex items-center flex-wrap gap-2 text-xl md:text-2xl font-medium text-white">
          <Polinomio terminos={polinomio} />
          <span className="mx-2">÷</span>
          <span>(x - {divisor})</span>
        </div>
      </div>
    );
  };

  // Generar preguntas según la dificultad
  const generarPreguntas = (dificultad: "facil" | "medio" | "dificil"): Pregunta[] => {
    const preguntas: Pregunta[] = []
    const numPreguntas = dificultad === "facil" ? 5 : dificultad === "medio" ? 8 : 10
    
    // Determinar cuántas preguntas con residuo 0 queremos
    const preguntasConResiduo0 = dificultad === "facil" ? 2 : dificultad === "medio" ? 3 : 4

    for (let i = 0; i < numPreguntas; i++) {
      // Ajustar el grado según la dificultad
      const grado = dificultad === "facil" ? 3 
                  : dificultad === "medio" ? 4 
                  : Math.random() < 0.5 ? 5 : 6 // Solo grados 5 y 6 para nivel difícil
      
      let coeficientes: number[]
      let divisor: number
      let resultado: number

      // Decidir si esta pregunta tendrá residuo 0
      const debeSerResiduo0 = i < preguntasConResiduo0

      if (debeSerResiduo0) {
        // Generar un polinomio que sea divisible por el divisor
        divisor = generarDivisor(dificultad)
        const coeficientesCociente = generarCoeficientes(grado - 1) // Un grado menos para el cociente
        
        // Multiplicar por (x - divisor) para garantizar residuo 0
        coeficientes = [coeficientesCociente[0]]
        for (let j = 0; j < coeficientesCociente.length - 1; j++) {
          coeficientes.push(coeficientesCociente[j + 1] - divisor * coeficientes[j])
        }
        coeficientes.push(-divisor * coeficientes[coeficientes.length - 1])
        
        resultado = 0
      } else {
        // Generar un polinomio normal (probablemente con residuo no cero)
        coeficientes = generarCoeficientes(grado)
        divisor = generarDivisor(dificultad)
        resultado = evaluarRuffini(coeficientes, divisor)
        
        // Si el resultado es muy grande, regenerar los coeficientes
        if (Math.abs(resultado) > 150) {
          i--
          continue
        }
      }
      
      const opciones = generarOpciones(resultado, dificultad)
      const respuestaCorrecta = String(resultado)

      preguntas.push({
        polinomio: coeficientes,
        divisor,
        opciones,
        respuestaCorrecta
      })
    }

    // Mezclar el orden de las preguntas
    return preguntas.sort(() => Math.random() - 0.5);
  }

  useEffect(() => {
    if (iniciado) {
      const nuevasPreguntas = generarPreguntas(dificultad);
      setPreguntas(nuevasPreguntas);
      setPreguntaActual(0);
      setRespuestaSeleccionada(null);
      setRespuestaEnviada(false);
      setMostrarFeedback(false);
    }
  }, [iniciado, dificultad]);

  const iniciarJuego = () => {
    setVidas(3);
    setPuntuacion(0);
    setJuegoTerminado(false);
    // Primero generamos las preguntas
    const nuevasPreguntas = generarPreguntas(dificultad);
    setPreguntas(nuevasPreguntas);
    setPreguntaActual(0);
    setRespuestaSeleccionada(null);
    setRespuestaEnviada(false);
    setMostrarFeedback(false);
    // Después marcamos como iniciado
    setIniciado(true);
  };

  const usar5050 = () => {
    if (!powerUpDisponible || respuestaEnviada) return;
    
    const preguntaActualObj = preguntas[preguntaActual];
    const opcionesOcultas = new Array(preguntaActualObj.opciones.length).fill(false);
    
    // Encontrar índices de opciones incorrectas
    const indicesIncorrectos = preguntaActualObj.opciones
      .map((opcion: string, index: number) => opcion !== preguntaActualObj.respuestaCorrecta ? index : -1)
      .filter((index: number) => index !== -1);
    
    // Seleccionar aleatoriamente dos opciones incorrectas para ocultar
    const indicesAOcultar = indicesIncorrectos
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    // Marcar las opciones seleccionadas como ocultas
    indicesAOcultar.forEach((index: number) => {
      opcionesOcultas[index] = true;
    });
    
    // Actualizar el estado de las preguntas
    setPreguntas(prev => [
      ...prev.slice(0, preguntaActual),
      { ...prev[preguntaActual], opcionesOcultas },
      ...prev.slice(preguntaActual + 1)
    ]);
    
    setPowerUpDisponible(false);
  };

  const obtenerEmojiAleatorio = () => {
    const emojisCorrectos = ['✨', '🎉', '🌟', '⭐', '🏆'];
    return emojisCorrectos[Math.floor(Math.random() * emojisCorrectos.length)];
  };

  const verificarRespuesta = (respuesta: string) => {
    if (respuestaEnviada) return;
    
    setRespuestaSeleccionada(respuesta);
    setRespuestaEnviada(true);
    setMostrarFeedback(true);
    
    const esCorrecta = respuesta === preguntas[preguntaActual].respuestaCorrecta;
    
    if (esCorrecta) {
      playAcierto();
      
      // Efectos visuales mejorados para aciertos
      const rachaActual = racha + 1;
      const rachaMultiplier = Math.min(rachaActual, 5);
      
      // Confeti central
      confetti({
        particleCount: 100 * rachaMultiplier,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Confeti lateral para rachas altas
      if (rachaActual >= 2) {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 90,
            origin: { x: 0.1, y: 0.5 },
            colors: ['#FFD700', '#FFA500']
          });
          confetti({
            particleCount: 50,
            spread: 90,
            origin: { x: 0.9, y: 0.5 },
            colors: ['#FFD700', '#FFA500']
          });
        }, 200);
      }
      
      setFeedbackEmoji(obtenerEmojiAleatorio());
      setPuntuacion(prev => prev + 1);
      setRacha(prev => prev + 1);
    } else {
      playError();
      const emojis = ['😢', '😭', '😔', '😞', '😫'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      setFeedbackEmoji(emoji);
      setRacha(0);
      
      // Efecto de shake para respuestas incorrectas
      const element = document.querySelector('.quiz-container');
      element?.classList.add('shake');
      setTimeout(() => element?.classList.remove('shake'), 500);
      
      setVidas(prev => {
        const nuevasVidas = prev - 1;
        if (nuevasVidas <= 0) {
          setTimeout(() => setJuegoTerminado(true), 1500);
        }
        return nuevasVidas;
      });
    }

    setTimeout(() => {
      setMostrarFeedback(false);
    }, 2000);
  };

  const siguientePregunta = () => {
    if (!respuestaEnviada) return; // No permitir avanzar sin responder
    
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1)
      setRespuestaSeleccionada(null)
      setRespuestaEnviada(false)
      setMostrarFeedback(false)
    } else {
      setJuegoTerminado(true)
    }
  }

  const reiniciarJuego = () => {
    setIniciado(false)
    setJuegoTerminado(false)
    setPreguntaActual(0)
    setRespuestaSeleccionada(null)
    setRespuestaEnviada(false)
    setVidas(3)
    setPuntuacion(0)
    setMostrarFeedback(false)
  }

  // Renderizar pantalla de inicio
  if (!iniciado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl relative">
          {/* Fondo animado con partículas matemáticas */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-white text-9xl select-none">
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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8 relative z-10"
          >
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 flex items-center">
              <GameController className="mr-3 h-8 w-8" />
              Quiz de Ruffini
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-10"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Selecciona la dificultad
                </CardTitle>
                <CardDescription className="text-white/80">
                  Elige el nivel de dificultad para comenzar el quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: "facil", label: "Fácil", color: "from-green-500 to-emerald-500" },
                    { value: "medio", label: "Medio", color: "from-yellow-500 to-orange-500" },
                    { value: "dificil", label: "Difícil", color: "from-red-500 to-pink-500" }
                  ].map((opcion) => (
                    <motion.button
                      key={opcion.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setDificultad(opcion.value as Dificultad)
                        iniciarJuego()
                      }}
                      className={`p-6 rounded-xl bg-gradient-to-br ${opcion.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {opcion.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Renderizar pantalla de juego
  if (iniciado && preguntas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl relative">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Cargando...</CardTitle>
              <CardDescription className="text-white/70">
                Preparando las preguntas para ti
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // Renderizar pantalla de fin de juego
  if (juegoTerminado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center">
              <Trophy className="mr-3 h-8 w-8 text-yellow-400" />
              Resultados
            </h1>
            <div className="w-[100px]"></div>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-center text-3xl">
                {vidas > 0 ? "¡Felicitaciones!" : "¡Buen intento!"}
              </CardTitle>
              <CardDescription className="text-white/80 text-center text-lg">
                {vidas > 0
                  ? "Has demostrado tu dominio del método de Ruffini"
                  : "La práctica lleva a la perfección. ¡Inténtalo de nuevo!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <Trophy className="h-32 w-32 text-yellow-400 animate-pulse" />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-3">
                    <span className="text-xl font-bold">{puntuacion}</span>
                  </div>
                </div>
                <p className="text-white/80 mt-4 text-lg">
                  Nivel: {dificultad === "facil" ? "Fácil" : dificultad === "medio" ? "Medio" : "Experto"}
                </p>
                <div className="flex items-center mt-4 space-x-2">
                  {Array.from({ length: vidas }).map((_, i) => (
                    <Heart key={i} className="h-8 w-8 text-red-500 fill-red-500 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                  {Array.from({ length: 3 - vidas }).map((_, i) => (
                    <Heart key={i + vidas} className="h-8 w-8 text-red-500/30" />
                  ))}
                </div>
              </div>

              <div className="bg-white/10 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold text-xl mb-4">Estadísticas Finales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <p className="text-sm text-white/60">Preguntas Completadas</p>
                    <p className="text-2xl font-bold">{preguntaActual + 1}/{preguntas.length}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <p className="text-sm text-white/60">Precisión</p>
                    <p className="text-2xl font-bold">
                      {Math.round((puntuacion / (preguntaActual + 1)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={reiniciarJuego} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg font-bold"
              >
                Intentar de Nuevo
              </Button>
              <Link href="/" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full border-white/30 hover:bg-white/20 text-white text-lg font-bold"
                >
                  Volver al Inicio
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Mostrar feedback en el centro
  const feedbackElement = mostrarFeedback && (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-black/70 text-white p-6 rounded-full"
      >
        <span className="text-6xl">{feedbackEmoji}</span>
      </motion.div>
    </div>
  );

  // Renderizar pantalla de juego activo
  if (iniciado && preguntas.length > 0 && !juegoTerminado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
          .quiz-container {
            max-height: 90vh;
            overflow-y: auto;
          }
          .quiz-content {
            height: auto;
            min-height: 0;
          }
        `}</style>
        <div className="w-full max-w-4xl quiz-container">
          <div className="quiz-content space-y-4">
            {/* Header con botón de regreso y título */}
            <div className="flex justify-between items-center mb-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">
                Quiz de Ruffini
              </h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => setMusicaActiva(!musicaActiva)}
                >
                  {musicaActiva ? '🔊' : '🔈'}
                </Button>
                {powerUpDisponible && (
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 flex items-center gap-2"
                    onClick={usar5050}
                    disabled={respuestaEnviada}
                  >
                    <span>50:50</span>
                    <span className="text-xs">⚡</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Contenido principal */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Pregunta {preguntaActual + 1} de {preguntas.length}</CardTitle>
                    <CardDescription className="text-white/70">
                      Nivel: {dificultad === "facil" ? "Fácil" : dificultad === "medio" ? "Medio" : "Difícil"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-white/10 rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-white">Puntos: {puntuacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-yellow-400">
                        🔥 {racha}
                      </div>
                      <div className="text-sm text-white/70">
                        Mejor: {mejorRacha}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-lg text-white mb-4">
                  {generarPregunta(preguntas[preguntaActual].polinomio, preguntas[preguntaActual].divisor)}
                </div>
                
                <div className="grid gap-3">
                  {preguntas[preguntaActual].opciones.map((opcion, index) => {
                    if (preguntas[preguntaActual].opcionesOcultas?.[index]) {
                      return null;
                    }
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => !respuestaEnviada && verificarRespuesta(opcion)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                          respuestaEnviada
                            ? opcion === preguntas[preguntaActual].respuestaCorrecta
                              ? 'border-green-500 bg-green-500/20 text-white'
                              : respuestaSeleccionada === opcion
                              ? 'border-red-500 bg-red-500/20 text-white'
                              : 'border-white/20 text-white/60'
                            : 'border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                        }`}
                        disabled={respuestaEnviada}
                      >
                        {opcion}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center pt-4">
                <div className="flex items-center">
                  {Array.from({ length: vidas }).map((_, i) => (
                    <Heart key={i} className="h-6 w-6 text-red-500 fill-red-500" />
                  ))}
                  {Array.from({ length: 3 - vidas }).map((_, i) => (
                    <Heart key={i + vidas} className="h-6 w-6 text-red-500/30" />
                  ))}
                </div>
                
                {respuestaEnviada && (
                  <Button
                    onClick={siguientePregunta}
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    Siguiente pregunta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {feedbackElement}
      </div>
    );
  }

  // Si llegamos aquí, devolvemos la pantalla de carga por defecto
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl relative">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Cargando...</CardTitle>
            <CardDescription className="text-white/70">
              Preparando el juego...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

