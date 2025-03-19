"use client"

import { useState, useEffect, useCallback } from "react"
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
type TerminoPolinomio = {
  coeficiente: number
  exponente: number
}
type Pregunta = {
  id: number
  polinomio: TerminoPolinomio[]
  divisor: number
  opciones: string[]
  respuestaCorrecta: number
  explicacion: string
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
function Polinomio({ terminos }: { terminos: TerminoPolinomio[] }) {
  if (terminos.length === 0) return <span>0</span>

  return (
    <span>
      {terminos.map((termino, index) => (
        <TerminoPolinomio
          key={index}
          coeficiente={termino.coeficiente}
          exponente={termino.exponente}
          esInicio={index === 0}
        />
      ))}
    </span>
  )
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
  const generarPreguntas = useCallback(() => {
    try {
      // Generamos preguntas dinámicamente
      const generarPreguntaAleatoria = (dificultad: Dificultad): Pregunta => {
        const grado = dificultad === "facil" ? 3 : dificultad === "medio" ? 4 : 5
        const maxCoef = dificultad === "facil" ? 5 : dificultad === "medio" ? 8 : 10

        // Generar coeficientes aleatorios
        const coeficientes = Array.from(
          { length: grado + 1 },
          () => Math.floor(Math.random() * (maxCoef * 2 + 1)) - maxCoef,
        )

        // Asegurar que el coeficiente principal no sea 0
        if (coeficientes[0] === 0) coeficientes[0] = 1

        // Generar un divisor aleatorio que no sea 0
        let divisor = 0
        while (divisor === 0) {
          divisor = Math.floor(Math.random() * 5) - 2
        }

        // Calcular el resultado usando Ruffini
        const resultado = coeficientes.reduce((acc, coef) => acc * divisor + coef, 0)

        // Generar opciones aleatorias únicas
        const opcionesBase = new Set([resultado])
        while (opcionesBase.size < 4) {
          const opcion = resultado + Math.floor(Math.random() * 8) - 4
          if (opcion !== resultado) {
            opcionesBase.add(opcion)
          }
        }

        // Mezclar opciones
        const opciones = Array.from(opcionesBase)
          .sort(() => Math.random() - 0.5)
          .map(String)
        const respuestaCorrecta = opciones.indexOf(String(resultado))

        // Crear términos del polinomio para renderizado
        const terminosPolinomio: TerminoPolinomio[] = coeficientes
          .map((coef, index) => ({
            coeficiente: coef,
            exponente: grado - index,
          }))
          .filter((termino) => termino.coeficiente !== 0)

        if (terminosPolinomio.length === 0) {
          terminosPolinomio.push({ coeficiente: 0, exponente: 0 })
        }

        return {
          id: Math.random(),
          polinomio: terminosPolinomio,
          divisor,
          opciones,
          respuestaCorrecta,
          explicacion: `Al aplicar Ruffini con divisor (x${divisor >= 0 ? "-" : "+"}${Math.abs(divisor)}), el residuo es ${resultado}.`,
        }
      }

      // Generar conjunto de preguntas según la dificultad
      const nuevasPreguntas = Array.from({ length: 5 }, () => generarPreguntaAleatoria(dificultad))
      setPreguntas(nuevasPreguntas)
      setPreguntaActual(0)
      setRespuestaSeleccionada(null)
      setRespuestaEnviada(false)
      setMostrarFeedback(false)
    } catch (error) {
      console.error("Error al generar preguntas:", error)
    }
  }, [dificultad])

  useEffect(() => {
    if (iniciado) {
      generarPreguntas()
    }
  }, [iniciado, generarPreguntas])

  const iniciarJuego = () => {
    setIniciado(true)
    setVidas(3)
    setPuntuacion(0)
    setJuegoTerminado(false)
  }

  const verificarRespuesta = () => {
    if (respuestaSeleccionada === null || respuestaEnviada) return

    setRespuestaEnviada(true)
    setMostrarFeedback(true)

    if (respuestaSeleccionada === preguntas[preguntaActual]?.respuestaCorrecta) {
      // Respuesta correcta
      const puntosGanados = dificultad === "facil" ? 10 : dificultad === "medio" ? 20 : 30
      setPuntuacion((prevPuntuacion) => prevPuntuacion + puntosGanados)
    } else {
      // Respuesta incorrecta
      setVidas((prevVidas) => {
        const nuevasVidas = prevVidas - 1
        if (nuevasVidas <= 0) {
          setJuegoTerminado(true)
        }
        return nuevasVidas
      })
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
      <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl relative">
          {/* Decorative math symbols background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-white text-9xl select-none">
            ∑ ∫ π ∞
          </div>

          <div className="flex justify-between items-center mb-8 relative z-10">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center">
              <GameController className="mr-3 h-8 w-8" />
              Quiz de Ruffini
            </h1>
            <div className="w-[100px]"></div>
          </div>

          <Card className="w-full bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="space-y-4">
              <CardTitle className="text-3xl text-center text-white">¡Bienvenido al Quiz de Ruffini!</CardTitle>
              <CardDescription className="text-lg text-center text-white/80">
                Demuestra tu dominio del método de Ruffini resolviendo ejercicios matemáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-white text-lg">Selecciona tu nivel de desafío</Label>
                <Select value={dificultad} onValueChange={(value: Dificultad) => setDificultad(value)}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Selecciona la dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil - Polinomios de grado 3</SelectItem>
                    <SelectItem value="medio">Medio - Polinomios de grado 4</SelectItem>
                    <SelectItem value="dificil">Difícil - Polinomios de grado 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-white">Reglas del juego:</h3>
                <ul className="list-disc list-inside space-y-1 text-white/80">
                  <li>Tienes 3 vidas para completar el desafío</li>
                  <li>Cada respuesta correcta suma puntos según la dificultad</li>
                  <li>Fácil: 10 puntos | Medio: 20 puntos | Difícil: 30 puntos</li>
                  <li>¡Demuestra tu maestría en el método de Ruffini!</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={iniciarJuego} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Comenzar el Desafío
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
      <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm">
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
                      {Math.round((puntuacion / ((preguntaActual + 1) * (dificultad === "facil" ? 10 : dificultad === "medio" ? 20 : 30))) * 100)}%
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

  // Renderizar pregunta actual
  const preguntaActualObj = preguntas[preguntaActual]

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={reiniciarJuego} className="text-white hover:bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir del Quiz
          </Button>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-6 w-6 transition-all duration-300 ${
                    i < vidas 
                      ? "text-red-500 fill-current animate-bounce" 
                      : "text-gray-400"
                  }`}
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <div className="text-white font-bold text-lg bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
              {puntuacion} puntos
            </div>
          </div>
          <div className="w-[100px]"></div>
        </div>

        <div className="space-y-6">
          <Progress 
            value={(preguntaActual + 1) * 20} 
            className="w-full h-2 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500"
          />
          
          <Card className="w-full bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex justify-between items-center">
                <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
                <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                  {dificultad === "facil" ? "Nivel Fácil" : dificultad === "medio" ? "Nivel Medio" : "Nivel Experto"}
                </span>
              </CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Encuentra el residuo al dividir el siguiente polinomio entre (x{preguntaActualObj?.divisor >= 0 ? "-" : "+"}{Math.abs(preguntaActualObj?.divisor || 0)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-3xl font-mono text-center text-white bg-white/5 p-6 rounded-lg">
                <Polinomio terminos={preguntaActualObj?.polinomio || []} />
              </div>

              <RadioGroup
                value={respuestaSeleccionada?.toString()}
                onValueChange={(value) => setRespuestaSeleccionada(parseInt(value))}
                className="space-y-3"
                disabled={respuestaEnviada}
              >
                {preguntaActualObj?.opciones.map((opcion, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 rounded-lg border border-white/30 p-4 transition-all duration-300 ${
                      respuestaEnviada
                        ? index === preguntaActualObj.respuestaCorrecta
                          ? "bg-green-500/20 border-green-500/50"
                          : respuestaSeleccionada === index
                          ? "bg-red-500/20 border-red-500/50"
                          : "bg-white/5"
                        : respuestaSeleccionada === index
                        ? "bg-white/20 border-white/50"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <RadioGroupItem 
                      value={index.toString()} 
                      id={`opcion-${index}`} 
                      className="border-white"
                    />
                    <Label 
                      htmlFor={`opcion-${index}`} 
                      className="w-full cursor-pointer font-medium text-white text-lg"
                    >
                      {opcion}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {mostrarFeedback && (
                <Alert
                  className={`${
                    respuestaSeleccionada === preguntaActualObj?.respuestaCorrecta
                      ? "bg-green-500/20 border-green-500/50"
                      : "bg-red-500/20 border-red-500/50"
                  }`}
                >
                  <AlertDescription className="text-white text-lg">
                    {respuestaSeleccionada === preguntaActualObj?.respuestaCorrecta
                      ? "¡Correcto! " + preguntaActualObj?.explicacion
                      : "Incorrecto. " + preguntaActualObj?.explicacion}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button
                onClick={verificarRespuesta}
                disabled={respuestaSeleccionada === null || respuestaEnviada}
                className={`${
                  !respuestaEnviada
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    : "bg-gray-500"
                } text-white font-bold py-2 px-6 text-lg`}
              >
                Verificar
              </Button>
              {respuestaEnviada && (
                <Button 
                  onClick={siguientePregunta}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-6 text-lg"
                >
                  {preguntaActual < preguntas.length - 1 ? "Siguiente" : "Finalizar"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

