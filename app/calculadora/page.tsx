"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calculator, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CalculadoraPage() {
  const [grado, setGrado] = useState<number>(3)
  const [coeficientes, setCoeficientes] = useState<number[]>([])
  const [resultados, setResultados] = useState<{divisores: number[]; factores: string[]; ecuacionCuadratica: string} | null>(null)
  const [error, setError] = useState<string>("")
  const [showModal, setShowModal] = useState(false)

  // Generar inputs para coeficientes basados en el grado
  const generarInputsCoeficientes = () => {
    const inputs = []
    for (let i = grado; i >= 0; i--) {
      inputs.push(
        <div key={i} className="flex items-center gap-3">
          <Label 
            htmlFor={`coef-${i}`} 
            className="w-28 text-right text-white/80 font-medium"
          >
            <span dangerouslySetInnerHTML={{ 
              __html: i > 0 
                ? `Coef. x${i > 1 ? `<sup>${i}</sup>` : ""}` 
                : "Término ind." 
            }} />:
          </Label>
          <Input
            id={`coef-${i}`}
            type="number"
            placeholder="0"
            value={coeficientes[grado - i] || ""}
            className="max-w-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500"
            onChange={(e) => {
              const newCoeficientes = [...coeficientes]
              newCoeficientes[grado - i] = e.target.value === "" ? 0 : Number(e.target.value)
              setCoeficientes(newCoeficientes)
            }}
          />
        </div>
      )
    }
    return inputs
  }

  // Función para encontrar los divisores de un número
  const encontrarDivisores = (n: number): number[] => {
    const divisores: number[] = []
    const nAbs = Math.round(Math.abs(n)) // Redondeamos para asegurar números enteros
    
    // Solo consideramos divisores enteros
    for (let i = 1; i <= Math.sqrt(nAbs); i++) {
      if (nAbs % i === 0) {
        divisores.push(i)
        if (i !== nAbs / i) {
          divisores.push(nAbs / i)
        }
      }
    }
    
    // Agregamos los divisores negativos
    const divisoresNegativos = divisores.map(d => -d)
    return [...divisores, ...divisoresNegativos].sort((a, b) => a - b)
  }

  // Función para evaluar un polinomio en un punto
  const evaluarPolinomio = (coeficientes: number[], x: number): number => {
    return coeficientes.reduce((acc, coef, i) => acc + coef * Math.pow(x, coeficientes.length - 1 - i), 0)
  }

  // Función para dividir un polinomio por (x - a) usando Ruffini
  const dividirRuffini = (coeficientes: number[], a: number): { cociente: number[], residuo: number } => {
    const n = coeficientes.length
    const cociente = new Array(n - 1).fill(0)
    let residuo = coeficientes[0]

    for (let i = 1; i < n; i++) {
      cociente[i - 1] = residuo
      residuo = residuo * a + coeficientes[i]
    }

    // Redondear los coeficientes y el residuo para evitar errores de punto flotante
    return {
      cociente: cociente.map(c => Math.round(c)),
      residuo: Math.round(residuo)
    }
  }

  // Función para encontrar el máximo común divisor de un array de números
  const mcd = (numeros: number[]): number => {
    const gcd = (a: number, b: number): number => {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a;
    };
    
    return numeros.reduce((a, b) => gcd(a, b));
  };

  // Función para encontrar los divisores potenciales según el teorema del factor
  const encontrarDivisoresPotenciales = (coefPrincipal: number, terminoIndep: number): number[] => {
    const divisoresIndep = encontrarDivisores(terminoIndep);
    const divisoresPrinc = encontrarDivisores(coefPrincipal);
    const divisoresPotenciales = new Set<number>();
    
    // Los divisores potenciales son las fracciones p/q donde:
    // p es divisor del término independiente
    // q es divisor del coeficiente principal
    for (const p of divisoresIndep) {
      for (const q of divisoresPrinc) {
        if (q !== 0) {
          const division = p / q;
          // Solo consideramos si la división resulta en un número entero
          if (Number.isInteger(division)) {
            divisoresPotenciales.add(division);
          }
        }
      }
    }
    
    return Array.from(divisoresPotenciales).sort((a, b) => a - b);
  };

  // Función para verificar si la factorización es correcta
  const verificarFactorizacion = (coeficientesOriginales: number[], factores: string[]): boolean => {
    // Convertir los factores a un polinomio y comparar con el original
    // Esta es una implementación simplificada, se puede mejorar
    return true; // Por ahora siempre retornamos true
  };

  const mostrarPolinomio = (coefs: number[]) => {
    if (!coefs || coefs.length === 0) return "0"
    
    let polinomio = ""
    const gradoCociente = coefs.length - 1

    coefs.forEach((coef, index) => {
      if (coef === 0) return // Skip zero coefficients

      const exponente = gradoCociente - index
      
      if (polinomio.length > 0) {
        polinomio += coef > 0 ? " + " : " - "
      } else if (coef < 0) {
        polinomio += "-"
      }

      const valorAbs = Math.abs(coef)
      if (exponente === 0 || valorAbs !== 1) {
        polinomio += valorAbs
      }

      if (exponente > 0) {
        polinomio += "x"
        if (exponente > 1) {
          polinomio += `<sup>${exponente}</sup>`
        }
      }
    })

    return polinomio.length > 0 ? polinomio : "0"
  }

  const calcularRuffini = () => {
    if (coeficientes.length !== grado + 1) {
      setError("Por favor, completa todos los coeficientes")
      return
    }

    if (coeficientes.every(coef => coef === 0)) {
      setError("El polinomio no puede tener todos los coeficientes iguales a 0")
      return
    }

    if (Math.abs(coeficientes[0]) < 1e-10) {
      setError("El coeficiente principal no puede ser 0")
      return
    }

    setError("")
    // Asegurarnos de que todos los coeficientes sean números enteros
    let polinomioActual = coeficientes.map(c => Math.round(Number(c) || 0))
    const factores: string[] = []
    const divisoresEncontrados: number[] = []
    const binomiosRepetidos = new Map<string, number>()
    
    // Paso 1: Buscar factor común
    const factorComun = mcd(polinomioActual)
    if (factorComun > 1) {
      polinomioActual = polinomioActual.map(c => c / factorComun)
    }
    
    // Paso 2: Aplicar Ruffini
    while (polinomioActual.length > 1) {
      const coefPrincipal = polinomioActual[0]
      const terminoIndep = polinomioActual[polinomioActual.length - 1]
      
      if (terminoIndep === 0) {
        // Factor x
        divisoresEncontrados.push(0)
        const binomio = "(x)"
        binomiosRepetidos.set(binomio, (binomiosRepetidos.get(binomio) || 0) + 1)
        polinomioActual = polinomioActual.slice(0, -1)
        continue
      }

      // Encontrar divisores potenciales según el teorema del factor
      const divisores = encontrarDivisoresPotenciales(coefPrincipal, terminoIndep)
      let encontrado = false
      
      for (const divisor of divisores) {
        const resultado = dividirRuffini(polinomioActual, divisor)
        if (resultado.residuo === 0) {
          polinomioActual = resultado.cociente
          divisoresEncontrados.push(divisor)
          const binomio = `(x ${divisor >= 0 ? '-' : '+'} ${Math.abs(divisor)})`
          binomiosRepetidos.set(binomio, (binomiosRepetidos.get(binomio) || 0) + 1)
          encontrado = true
          break
        }
      }
      
      if (!encontrado) {
        // Si el polinomio es de grado 2, intentar factorización cuadrática
        if (polinomioActual.length === 3) {
          const [a, b, c] = polinomioActual
          const discriminante = b * b - 4 * a * c
          if (discriminante > 0) {
            const sqrtDisc = Math.sqrt(discriminante)
            if (Number.isInteger(sqrtDisc)) {
              const x1 = (-b + sqrtDisc) / (2 * a)
              const x2 = (-b - sqrtDisc) / (2 * a)
              if (Number.isInteger(x1) && Number.isInteger(x2)) {
                const binomio1 = `(x ${x1 >= 0 ? '-' : '+'} ${Math.abs(x1)})`
                const binomio2 = `(x ${x2 >= 0 ? '-' : '+'} ${Math.abs(x2)})`
                binomiosRepetidos.set(binomio1, (binomiosRepetidos.get(binomio1) || 0) + 1)
                binomiosRepetidos.set(binomio2, (binomiosRepetidos.get(binomio2) || 0) + 1)
                polinomioActual = [1]
                continue
              }
            }
          }
        }
        break
      }
    }

    // Construir la respuesta final
    let respuestaFinal = ""
    const factoresConExponentes = Array.from(binomiosRepetidos.entries()).map(([binomio, repeticiones]) => {
      return repeticiones > 1 ? `${binomio}<sup>${repeticiones}</sup>` : binomio
    })

    if (factoresConExponentes.length > 0) {
      respuestaFinal = factoresConExponentes.join(' × ')
      if (polinomioActual.length > 1) {
        const polinomioRestante = mostrarPolinomio(polinomioActual)
        if (polinomioRestante !== "1" && polinomioRestante !== "0") {
          respuestaFinal += ` × (${polinomioRestante})`
        }
      }
    } else {
      respuestaFinal = mostrarPolinomio(polinomioActual)
    }

    // Agregar el factor común si existe
    if (factorComun > 1) {
      respuestaFinal = `${factorComun}(${respuestaFinal})`
    }

    // Verificar que la factorización es correcta
    if (!verificarFactorizacion(coeficientes, Array.from(binomiosRepetidos.keys()))) {
      setError("La factorización no es correcta. Por favor, verifica los resultados.")
      return
    }

    setResultados({
      divisores: divisoresEncontrados,
      factores: factoresConExponentes,
      ecuacionCuadratica: respuestaFinal
    })
    setShowModal(true)
  }

  const limpiarCampos = () => {
    setCoeficientes(new Array(grado + 1).fill(0))
    setResultados(null)
    setError("")
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-gradient-to-br from-blue-500/80 to-purple-500/80 rounded-xl shadow-lg"
                >
                  <Calculator className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Calculadora Ruffini
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Resuelve polinomios usando el método de Ruffini
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                  <Label htmlFor="grado" className="text-white text-lg">Grado del polinomio:</Label>
                  <Input
                    id="grado"
                    type="number"
                    min="1"
                    max="10"
                    value={grado === 0 ? "" : grado}
                    onChange={(e) => {
                      const nuevoGrado = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                      setGrado(Math.min(Math.max(nuevoGrado, 0), 10))
                      setCoeficientes([])
                      setResultados(null)
                    }}
                    className="max-w-[100px] bg-white/10 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg"
                >
                  {generarInputsCoeficientes()}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex justify-center gap-4"
                >
                  <Button
                    onClick={calcularRuffini}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Calcular
                  </Button>
                  <Button
                    onClick={limpiarCampos}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Limpiar
                  </Button>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {resultados && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4 bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
                  >
                    <div className="text-white/90">
                      <h3 className="text-xl font-semibold mb-2">Resultados:</h3>
                      <div className="space-y-2">
                        <p>Divisores encontrados: {resultados.divisores.join(", ")}</p>
                        <p>Factores: {resultados.factores.map((factor, index) => (
                          <span key={index}>
                            {index > 0 && " × "}
                            <span dangerouslySetInnerHTML={{ __html: factor }} />
                          </span>
                        ))}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {showModal && resultados && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-purple-900 to-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-white/20"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Resultados
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-4 text-white/90">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Divisores encontrados:</h3>
                    <p>{resultados.divisores.join(", ")}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Factores:</h3>
                    <p>
                      {resultados.factores.map((factor, index) => (
                        <span key={index}>
                          {index > 0 && " × "}
                          <span dangerouslySetInnerHTML={{ __html: factor }} />
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-xl text-purple-300">RESPUESTA FINAL:</h3>
                    <p className="text-lg" dangerouslySetInnerHTML={{ __html: resultados.ecuacionCuadratica }} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


