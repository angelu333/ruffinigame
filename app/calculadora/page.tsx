"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calculator } from "lucide-react"

export default function CalculadoraPage() {
  const [grado, setGrado] = useState<number>(3)
  const [coeficientes, setCoeficientes] = useState<number[]>([])
  const [resultados, setResultados] = useState<{divisores: number[]; factores: string[]; ecuacionCuadratica: string} | null>(null)
  const [error, setError] = useState<string>("");

  // Generar inputs para coeficientes basados en el grado
  const generarInputsCoeficientes = () => {
    const inputs = []
    for (let i = grado; i >= 0; i--) {
      inputs.push(
        <div key={i} className="flex items-center gap-2">
          <Label htmlFor={`coef-${i}`} className="w-24 text-right text-gray-700 dark:text-gray-300">
            {i > 0 ? `Coef. x${i > 1 ? `<sup>${i}</sup>` : ""}` : "Término ind."}:
          </Label>
          <Input
            id={`coef-${i}`}
            type="number"
            placeholder="0"
            className="max-w-[120px] bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
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

  const encontrarDivisores = (numero: number): number[] => {
    const divisores: number[] = []
    const absNumero = Math.abs(numero)
    
    for (let i = 1; i <= absNumero; i++) {
      if (absNumero % i === 0) {
        divisores.push(i)
        divisores.push(-i)
        if (i !== absNumero) {
          divisores.push(absNumero / i)
          divisores.push(-absNumero / i)
        }
      }
    }
    
    return [...new Set(divisores)].sort((a, b) => a - b)
  }

  const evaluarRuffini = (coefs: number[], divisor: number): { cociente: number[]; residuo: number } => {
    const cociente = [coefs[0]]
    for (let i = 1; i <= coefs.length - 1; i++) {
      cociente[i] = coefs[i] + cociente[i - 1] * divisor
    }
    return {
      cociente: cociente.slice(0, -1),
      residuo: cociente[cociente.length - 1]
    }
  }

  const calcularRuffini = () => {
    if (coeficientes.length !== grado + 1) {
      setError("Por favor, completa todos los coeficientes")
      return
    }

    setError("")
    let polinomioActual = [...coeficientes]
    const factores: string[] = []
    const divisoresEncontrados: number[] = []
    const binomiosRepetidos = new Map<string, number>()
    
    while (polinomioActual.length > 2) { // Continuar hasta llegar a lineal
      const terminoIndependiente = polinomioActual[polinomioActual.length - 1]
      if (terminoIndependiente === 0) {
        divisoresEncontrados.push(0)
        const binomio = "(x)"
        binomiosRepetidos.set(binomio, (binomiosRepetidos.get(binomio) || 0) + 1)
        polinomioActual = polinomioActual.slice(0, -1)
        continue
      }

      const divisores = encontrarDivisores(terminoIndependiente)
      let encontrado = false
      
      for (const divisor of divisores) {
        const resultado = evaluarRuffini(polinomioActual, divisor)
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
        break
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
  }

  const mostrarPolinomio = (coefs: number[]) => {
    let polinomio = ""
    const gradoCociente = coefs.length - 1

    coefs.forEach((coef, index) => {
      const exponente = gradoCociente - index

      if (coef !== 0) {
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
      }
    })

    return polinomio.length > 0 ? polinomio : "0"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calculadora Ruffini</CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Ingresa los coeficientes del polinomio y el divisor para calcular usando el método de Ruffini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="grado" className="text-gray-700 dark:text-gray-300">Grado del polinomio:</Label>
                <Input
                  id="grado"
                  type="number"
                  min="1"
                  max="10"
                  value={grado}
                  onChange={(e) => {
                    const nuevoGrado = Number.parseInt(e.target.value) || 1
                    setGrado(Math.min(Math.max(nuevoGrado, 1), 10))
                    setCoeficientes([])
                    setResultados(null)
                  }}
                  className="max-w-[100px] bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{generarInputsCoeficientes()}</div>


            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={calcularRuffini}
              className="w-full bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white font-semibold py-6"
            >
              Calcular
            </Button>

            {resultados && (
              <div className="space-y-4 p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Divisores encontrados:</strong> {resultados.divisores.join(", ")}
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Factorización:</strong> {resultados.factores.join(" ")}
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Ecuación cuadrática restante:</strong> {resultados.ecuacionCuadratica}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


