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
              newCoeficientes[grado - i] = Number.parseFloat(e.target.value) || 0
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
    const nAbs = Math.abs(n)
    
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

    return { cociente, residuo }
  }

  // Función para factorizar un polinomio
  const factorizarPolinomio = (coeficientes: number[]): { factores: string[], explicacion: string[] } => {
    const factores: string[] = []
    const explicacion: string[] = []
    let polinomioActual = [...coeficientes]
    let grado = polinomioActual.length - 1

    // Si el polinomio es de grado 0, retornamos el polinomio original
    if (grado === 0) {
      return {
        factores: [coeficientes[0].toString()],
        explicacion: ["El polinomio es una constante y no puede factorizarse más."]
      }
    }

    // Encontrar divisores del término independiente
    const divisores = encontrarDivisores(polinomioActual[polinomioActual.length - 1])
    explicacion.push(`Buscando divisores del término independiente (${polinomioActual[polinomioActual.length - 1]}): ${divisores.join(", ")}`)

    // Intentar cada divisor
    for (const divisor of divisores) {
      const { residuo } = dividirRuffini(polinomioActual, divisor)
      
      if (Math.abs(residuo) < 0.0001) { // Usamos una pequeña tolerancia para comparaciones de punto flotante
        // Encontramos una raíz
        const factor = divisor >= 0 ? `(x - ${divisor})` : `(x + ${Math.abs(divisor)})`
        factores.push(factor)
        explicacion.push(`Encontramos una raíz: x = ${divisor}`)
        
        // Actualizar el polinomio para seguir factorizando
        const { cociente } = dividirRuffini(polinomioActual, divisor)
        polinomioActual = cociente
        grado--
        
        // Si el polinomio resultante es de grado 1, agregamos el último factor
        if (grado === 1) {
          const a = polinomioActual[0]
          const b = polinomioActual[1]
          if (Math.abs(a) > 0.0001) {
            const factor = `(${a}x ${b >= 0 ? '+' : ''} ${b})`
            factores.push(factor)
            explicacion.push(`El polinomio restante es de grado 1: ${factor}`)
          }
          break
        }
      }
    }

    // Si no encontramos factores, el polinomio es irreducible
    if (factores.length === 0) {
      return {
        factores: [coeficientes.map((coef, i) => 
          `${coef > 0 && i > 0 ? '+' : ''}${coef}${i < coeficientes.length - 1 ? 'x^' + (coeficientes.length - 1 - i) : ''}`
        ).join('')],
        explicacion: ["El polinomio es irreducible sobre los números enteros."]
      }
    }

    return { factores, explicacion }
  }

  // Función para resolver ecuación cuadrática
  const resolverEcuacionCuadratica = (a: number, b: number, c: number): number[] => {
    if (Math.abs(a) < 1e-10) return []; // Evitar división por cero
    const discriminante = b * b - 4 * a * c;
    if (discriminante < 0) return [];
    
    const x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    return [x1, x2].filter(x => !isNaN(x) && isFinite(x));
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
    let polinomioActual = [...coeficientes]
    const factores: string[] = []
    const divisoresEncontrados: number[] = []
    const binomiosRepetidos = new Map<string, number>()
    
    while (polinomioActual.length > 2) { // Continuar hasta llegar a lineal
      const terminoIndependiente = polinomioActual[polinomioActual.length - 1]
      if (Math.abs(terminoIndependiente) < 1e-10) {
        divisoresEncontrados.push(0)
        const binomio = "(x)"
        binomiosRepetidos.set(binomio, (binomiosRepetidos.get(binomio) || 0) + 1)
        polinomioActual = polinomioActual.slice(0, -1)
        continue
      }

      const divisores = encontrarDivisores(terminoIndependiente)
      let encontrado = false
      
      for (const divisor of divisores) {
        const resultado = dividirRuffini(polinomioActual, divisor)
        if (Math.abs(resultado.residuo) < 0.0001) { // Usamos una pequeña tolerancia
          polinomioActual = resultado.cociente
          divisoresEncontrados.push(divisor)
          const binomio = `(x ${divisor >= 0 ? '-' : '+'} ${Math.abs(divisor)})`
          binomiosRepetidos.set(binomio, (binomiosRepetidos.get(binomio) || 0) + 1)
          encontrado = true
          break
        }
      }
      
      if (!encontrado) {
        if (polinomioActual.length === 3) {
          // Resolver ecuación cuadrática restante
          const [a, b, c] = polinomioActual;
          const raices = resolverEcuacionCuadratica(a, b, c);
          raices.forEach((raiz: number) => {
            if (!isNaN(raiz) && Number.isInteger(raiz)) { // Solo consideramos raíces enteras
              divisoresEncontrados.push(raiz);
              const binomio = `(x ${raiz >= 0 ? '-' : '+'} ${Math.abs(raiz)})`;
              binomiosRepetidos.set(binomio, (binomiosRepetidos.get(binomio) || 0) + 1);
            }
          });
        }
        break;
      }
    }

    // Si quedó un polinomio de grado 1, lo agregamos como factor
    if (polinomioActual.length === 2) {
      const [a, b] = polinomioActual;
      if (Math.abs(a) > 0.0001) {
        const factor = `(${a}x ${b >= 0 ? '+' : ''} ${b})`;
        factores.push(factor);
      }
    }

    const factoresConExponentes = Array.from(binomiosRepetidos.entries()).map(([binomio, repeticiones]) => {
      return repeticiones > 1 ? `${binomio}<sup>${repeticiones}</sup>` : binomio
    })

    setResultados({
      divisores: divisoresEncontrados,
      factores: factoresConExponentes,
      ecuacionCuadratica: mostrarPolinomio(polinomioActual)
    })
    setShowModal(true)
  }

  const mostrarPolinomio = (coefs: number[]) => {
    if (!coefs || coefs.length === 0) return "0"
    
    let polinomio = ""
    const gradoCociente = coefs.length - 1

    coefs.forEach((coef, index) => {
      const exponente = gradoCociente - index
      if (Math.abs(coef) < 1e-10) return // Skip terms with coefficient ≈ 0

      if (polinomio.length > 0) {
        polinomio += coef > 0 ? " + " : " - "
      } else if (coef < 0) {
        polinomio += "-"
      }

      const valorAbs = Math.abs(coef)
      // Show coefficient if it's not 1 or if it's the constant term
      if (exponente === 0 || Math.abs(valorAbs - 1) > 1e-10) {
        polinomio += valorAbs.toFixed(Math.abs(valorAbs) < 1 ? 2 : 0)
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
                            {factor.includes("<sup>") ? (
                              <span dangerouslySetInnerHTML={{ __html: factor }} />
                            ) : (
                              factor
                            )}
                          </span>
                        ))}</p>
                        <p>Ecuación cuadrática: <span dangerouslySetInnerHTML={{ __html: resultados.ecuacionCuadratica }} /></p>
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
                          {factor.includes("<sup>") ? (
                            <span dangerouslySetInnerHTML={{ __html: factor }} />
                          ) : (
                            factor
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ecuación cuadrática:</h3>
                    <p dangerouslySetInnerHTML={{ __html: resultados.ecuacionCuadratica }} />
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


