"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, GamepadIcon as GameController, Trophy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Tipos para nuestro quiz
type Dificultad = "facil" | "medio" | "dificil"
type Pregunta = {
  id: number
  enunciado: string
  opciones: string[]
  respuestaCorrecta: number
  explicacion: string
}

export default function QuizPage() {
  const [dificultad, setDificultad] = useState<Dificultad>("facil")
  const [iniciado, setIniciado] = useState(false)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null)
  const [respuestaEnviada, setRespuestaEnviada] = useState(false)
  const [vidas, setVidas] = useState(3)
  const [puntuacion, setPuntuacion] = useState(0)
  const [juegoTerminado, setJuegoTerminado] = useState(false)
  const [mostrarFeedback, setMostrarFeedback] = useState(false)

  // Generar preguntas según la dificultad
  useEffect(() => {
    if (iniciado) {
      generarPreguntas()
    }
  }, [iniciado, dificultad])

  const generarPreguntas = () => {
    // En un caso real, estas preguntas vendrían de una API o base de datos
    // Aquí las generamos de forma estática para el ejemplo

    const preguntasPorDificultad: Record<Dificultad, Pregunta[]> = {
      facil: [
        {
          id: 1,
          enunciado: "Si dividimos x³ + 2x² - 5x + 2 entre (x - 1) usando Ruffini, ¿cuál es el residuo?",
          opciones: ["0", "2", "4", "6"],
          respuestaCorrecta: 0,
          explicacion:
            "Al aplicar Ruffini con divisor (x-1), obtenemos un residuo de 0, lo que significa que (x-1) es un factor del polinomio.",
        },
        {
          id: 2,
          enunciado: "¿Cuál es el cociente al dividir x³ - 6x² + 11x - 6 entre (x - 2)?",
          opciones: ["x² - 4x + 3", "x² - 4x + 5", "x² - 2x + 3", "x² - 4x - 3"],
          respuestaCorrecta: 0,
          explicacion: "Aplicando Ruffini con divisor (x-2), el cociente es x² - 4x + 3.",
        },
        {
          id: 3,
          enunciado: "Si P(x) = x³ - 3x² + 3x - 1, ¿cuál es el valor de P(1)?",
          opciones: ["0", "1", "2", "3"],
          respuestaCorrecta: 0,
          explicacion: "P(1) es el residuo al dividir P(x) entre (x-1). Aplicando Ruffini, obtenemos un residuo de 0.",
        },
        {
          id: 4,
          enunciado: "¿Cuál es el residuo al dividir x⁴ - 16 entre (x - 2)?",
          opciones: ["0", "8", "16", "32"],
          respuestaCorrecta: 0,
          explicacion:
            "Aplicando Ruffini con divisor (x-2), el residuo es 0, lo que significa que (x-2) es un factor del polinomio.",
        },
        {
          id: 5,
          enunciado: "Si dividimos x³ - 4x² + x + 6 entre (x + 1), ¿cuál es el residuo?",
          opciones: ["0", "2", "4", "6"],
          respuestaCorrecta: 2,
          explicacion: "Al aplicar Ruffini con divisor (x+1) o (x-(-1)), obtenemos un residuo de 4.",
        },
      ],
      medio: [
        {
          id: 1,
          enunciado: "Si P(x) = x⁴ - 2x³ - 3x² + 4x + 4, ¿cuál es el cociente al dividir entre (x + 1)?",
          opciones: ["x³ - 3x² + 0x + 4", "x³ - 3x² - 3x + 1", "x³ - 3x² + 0x + 0", "x³ - 3x² + 0x - 4"],
          respuestaCorrecta: 1,
          explicacion: "Aplicando Ruffini con divisor (x+1) o (x-(-1)), el cociente es x³ - 3x² - 3x + 1.",
        },
        {
          id: 2,
          enunciado: "¿Cuál es el residuo al dividir 2x⁴ - 3x³ + 4x² - 5x + 6 entre (x - 2)?",
          opciones: ["24", "32", "36", "40"],
          respuestaCorrecta: 2,
          explicacion: "Aplicando Ruffini con divisor (x-2), el residuo es 36.",
        },
        {
          id: 3,
          enunciado: "Si dividimos x⁵ - 32 entre (x - 2), ¿cuál es el cociente?",
          opciones: [
            "x⁴ + 2x³ + 4x² + 8x + 16",
            "x⁴ - 2x³ + 4x² - 8x + 16",
            "x⁴ + 2x³ + 4x² + 8x - 16",
            "x⁴ - 2x³ - 4x² - 8x - 16",
          ],
          respuestaCorrecta: 0,
          explicacion: "Aplicando Ruffini con divisor (x-2), el cociente es x⁴ + 2x³ + 4x² + 8x + 16.",
        },
        {
          id: 4,
          enunciado: "¿Cuáles son las raíces del polinomio P(x) = x³ - 6x² + 11x - 6?",
          opciones: ["1, 2 y 3", "1, 2 y -3", "-1, 2 y 3", "-1, -2 y -3"],
          respuestaCorrecta: 0,
          explicacion: "Aplicando Ruffini sucesivamente, encontramos que las raíces son 1, 2 y 3.",
        },
        {
          id: 5,
          enunciado: "Si P(x) = x⁴ - 5x³ + 5x² + 5x - 6, ¿cuál es el valor de P(2)?",
          opciones: ["0", "2", "4", "6"],
          respuestaCorrecta: 0,
          explicacion: "P(2) es el residuo al dividir P(x) entre (x-2). Aplicando Ruffini, obtenemos un residuo de 0.",
        },
      ],
      dificil: [
        {
          id: 1,
          enunciado: "Si P(x) = x⁵ - 3x⁴ + 3x³ - 3x² + 2x - 6, ¿cuál es el residuo al dividir entre (x - 3)?",
          opciones: ["0", "120", "240", "360"],
          respuestaCorrecta: 2,
          explicacion: "Aplicando Ruffini con divisor (x-3), el residuo es 240.",
        },
        {
          id: 2,
          enunciado: "¿Cuál es el cociente al dividir x⁵ - x⁴ - 19x³ + 19x² + 30x - 30 entre (x² - 1)?",
          opciones: ["x³ - x² - 18x + 30", "x³ - 18x + 30", "x³ - x² - 20x + 30", "x³ - 20x + 30"],
          respuestaCorrecta: 0,
          explicacion:
            "Para dividir entre (x² - 1), podemos factorizar como (x-1)(x+1) y aplicar Ruffini dos veces, obteniendo x³ - x² - 18x + 30.",
        },
        {
          id: 3,
          enunciado: "Si P(x) = 2x⁴ - 3x³ + 4x² - 5x + 6, ¿cuál es el valor de P(-1)?",
          opciones: ["10", "14", "18", "20"],
          respuestaCorrecta: 3,
          explicacion:
            "P(-1) es el residuo al dividir P(x) entre (x-(-1)) o (x+1). Aplicando Ruffini, obtenemos un residuo de 20.",
        },
        {
          id: 4,
          enunciado: "¿Cuál es el residuo al dividir x⁵ + 3x⁴ - 5x³ - 15x² + 4x + 12 entre (x + 2)?",
          opciones: ["0", "4", "8", "12"],
          respuestaCorrecta: 0,
          explicacion:
            "Aplicando Ruffini con divisor (x+2) o (x-(-2)), el residuo es 0, lo que significa que (x+2) es un factor del polinomio.",
        },
        {
          id: 5,
          enunciado: "Si dividimos x⁴ - 81 entre (x - 3), ¿cuál es el cociente?",
          opciones: ["x³ + 3x² + 9x + 27", "x³ - 3x² + 9x - 27", "x³ + 3x² + 9x - 27", "x³ - 3x² - 9x - 27"],
          respuestaCorrecta: 0,
          explicacion: "Aplicando Ruffini con divisor (x-3), el cociente es x³ + 3x² + 9x + 27.",
        },
      ],
    }

    // Seleccionar 5 preguntas aleatorias para la dificultad actual
    const preguntasDisponibles = preguntasPorDificultad[dificultad]
    setPreguntas(preguntasDisponibles)
    setPreguntaActual(0)
    setRespuestaSeleccionada(null)
    setRespuestaEnviada(false)
    setMostrarFeedback(false)
  }

  const iniciarJuego = () => {
    setIniciado(true)
    setVidas(3)
    setPuntuacion(0)
    setJuegoTerminado(false)
  }

  const verificarRespuesta = () => {
    if (respuestaSeleccionada === null) return

    setRespuestaEnviada(true)
    setMostrarFeedback(true)

    if (respuestaSeleccionada === preguntas[preguntaActual].respuestaCorrecta) {
      // Respuesta correcta
      const puntosGanados = dificultad === "facil" ? 10 : dificultad === "medio" ? 20 : 30
      setPuntuacion(puntuacion + puntosGanados)
    } else {
      // Respuesta incorrecta
      setVidas(vidas - 1)
      if (vidas <= 1) {
        setJuegoTerminado(true)
      }
    }
  }

  const siguientePregunta = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1)
      setRespuestaSeleccionada(null)
      setRespuestaEnviada(false)
      setMostrarFeedback(false)
    } else {
      // Fin del juego por completar todas las preguntas
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-500 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <GameController className="mr-2 h-6 w-6" />
              Quiz de Ruffini
            </h1>
            <div className="w-[100px]"></div>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle>¡Pon a prueba tus conocimientos!</CardTitle>
              <CardDescription className="text-white/70">
                Responde preguntas sobre el método de Ruffini y división de polinomios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dificultad">Selecciona la dificultad:</Label>
                <Select value={dificultad} onValueChange={(value: Dificultad) => setDificultad(value)}>
                  <SelectTrigger className="bg-white/20 border-white/30">
                    <SelectValue placeholder="Selecciona dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Reglas del juego:</h3>
                <ul className="list-disc list-inside space-y-1 text-white/80">
                  <li>Tienes 3 vidas para completar el quiz</li>
                  <li>Cada respuesta incorrecta te quita una vida</li>
                  <li>Puntos por respuesta correcta: Fácil (10), Medio (20), Difícil (30)</li>
                  <li>Recibirás retroalimentación después de cada respuesta</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={iniciarJuego} className="w-full bg-indigo-600 hover:bg-indigo-700">
                ¡Comenzar Quiz!
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Renderizar pantalla de fin de juego
  if (juegoTerminado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-500 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Trophy className="mr-2 h-6 w-6" />
              Fin del Quiz
            </h1>
            <div className="w-[100px]"></div>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-center">¡Quiz completado!</CardTitle>
              <CardDescription className="text-white/70 text-center">
                {vidas > 0
                  ? "¡Felicidades! Has completado el quiz con éxito."
                  : "Has agotado todas tus vidas. ¡Inténtalo de nuevo!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <Trophy className="h-24 w-24 text-yellow-400 mb-4" />
                <h2 className="text-4xl font-bold mb-2">{puntuacion} puntos</h2>
                <p className="text-white/80">
                  Dificultad: {dificultad === "facil" ? "Fácil" : dificultad === "medio" ? "Medio" : "Difícil"}
                </p>
                <div className="flex items-center mt-2">
                  {Array.from({ length: vidas }).map((_, i) => (
                    <Heart key={i} className="h-6 w-6 text-red-500 fill-red-500 mr-1" />
                  ))}
                  {Array.from({ length: 3 - vidas }).map((_, i) => (
                    <Heart key={i + vidas} className="h-6 w-6 text-red-500/30 mr-1" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-white/20 p-4 rounded-lg">
                <h3 className="font-semibold">Estadísticas:</h3>
                <ul className="space-y-1 text-white/90">
                  <li>
                    Preguntas respondidas: {preguntaActual + 1} de {preguntas.length}
                  </li>
                  <li>Vidas restantes: {vidas} de 3</li>
                  <li>Puntuación final: {puntuacion}</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={reiniciarJuego} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Jugar de nuevo
              </Button>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full border-white/30 hover:bg-white/20">
                  Volver al inicio
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Renderizar pantalla de juego
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-500 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={reiniciarJuego}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir del quiz
          </Button>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <GameController className="mr-2 h-6 w-6" />
            Quiz de Ruffini
          </h1>
          <div className="w-[100px]"></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {Array.from({ length: vidas }).map((_, i) => (
              <Heart key={i} className="h-6 w-6 text-red-500 fill-red-500 mr-1" />
            ))}
            {Array.from({ length: 3 - vidas }).map((_, i) => (
              <Heart key={i + vidas} className="h-6 w-6 text-red-500/30 mr-1" />
            ))}
          </div>
          <div className="text-white font-bold">{puntuacion} puntos</div>
        </div>

        <Progress value={(preguntaActual / preguntas.length) * 100} className="h-2 mb-6 bg-white/20" />

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                Pregunta {preguntaActual + 1} de {preguntas.length}
              </span>
              <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                {dificultad === "facil" ? "Fácil" : dificultad === "medio" ? "Medio" : "Difícil"}
              </span>
            </CardTitle>
            <CardDescription className="text-white/70">Selecciona la respuesta correcta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{preguntas[preguntaActual]?.enunciado}</div>

            <RadioGroup
              value={respuestaSeleccionada?.toString()}
              onValueChange={(value) => {
                if (!respuestaEnviada) {
                  setRespuestaSeleccionada(Number.parseInt(value))
                }
              }}
              className="space-y-3"
              disabled={respuestaEnviada}
            >
              {preguntas[preguntaActual]?.opciones.map((opcion, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 rounded-lg border border-white/30 p-4 transition-colors ${
                    respuestaEnviada
                      ? index === preguntas[preguntaActual].respuestaCorrecta
                        ? "bg-green-500/20 border-green-500/50"
                        : respuestaSeleccionada === index
                          ? "bg-red-500/20 border-red-500/50"
                          : ""
                      : respuestaSeleccionada === index
                        ? "bg-white/20"
                        : "hover:bg-white/10"
                  }`}
                >
                  <RadioGroupItem value={index.toString()} id={`opcion-${index}`} className="border-white" />
                  <Label htmlFor={`opcion-${index}`} className="w-full cursor-pointer font-medium">
                    {opcion}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {mostrarFeedback && (
              <Alert
                className={`${
                  respuestaSeleccionada === preguntas[preguntaActual].respuestaCorrecta
                    ? "bg-green-500/20 border-green-500/50"
                    : "bg-red-500/20 border-red-500/50"
                }`}
              >
                <AlertDescription>
                  <p className="font-bold mb-1">
                    {respuestaSeleccionada === preguntas[preguntaActual].respuestaCorrecta
                      ? "¡Correcto!"
                      : "Incorrecto"}
                  </p>
                  <p>{preguntas[preguntaActual].explicacion}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!respuestaEnviada ? (
              <Button
                onClick={verificarRespuesta}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={respuestaSeleccionada === null}
              >
                Verificar respuesta
              </Button>
            ) : (
              <Button onClick={siguientePregunta} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {preguntaActual < preguntas.length - 1 ? "Siguiente pregunta" : "Ver resultados"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


