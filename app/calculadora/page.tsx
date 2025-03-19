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
  const [divisor, setDivisor] = useState<number>(0)
  const [resultado, setResultado] = useState<{ cociente: number[]; residuo: number } | null>(null)
  const [error, setError] = useState<string>("")

  // Generar inputs para coeficientes basados en el grado
  const generarInputsCoeficientes = () => {
    const inputs = []
    for (let i = grado; i >= 0; i--) {
      inputs.push(
        <div key={i} className="flex items-center gap-2">
          <Label htmlFor={`coef-${i}`} className="w-24 text-right">
            {i > 0 ? `Coef. x${i > 1 ? `^${i}` : ""}` : "Término ind."}:
          </Label>
          <Input
            id={`coef-${i}`}
            type="number"
            placeholder="0"
            className="max-w-[120px] bg-white/20 text-white"
            onChange={(e) => {
              const newCoeficientes = [...coeficientes]
              newCoeficientes[grado - i] = Number.parseFloat(e.target.value) || 0
              setCoeficientes(newCoeficientes)
            }}
          />
        </div>,
      )
    }
    return inputs
  }

  // Implementación del método de Ruffini
  const calcularRuffini = () => {
    if (divisor === 0) {
      setError("El divisor no puede ser cero")
      return
    }

    if (coeficientes.length !== grado + 1) {
      setError("Por favor, completa todos los coeficientes")
      return
    }

    setError("")

    // Algoritmo de Ruffini
    const cociente = [coeficientes[0]]
    for (let i = 1; i <= grado; i++) {
      cociente[i] = coeficientes[i] + cociente[i - 1] * divisor
    }

    const residuo = cociente.pop() || 0

    setResultado({
      cociente,
      residuo,
    })
  }

  // Mostrar el resultado en formato polinomio
  const mostrarPolinomio = (coefs: number[]) => {
    let polinomio = ""
    const gradoCociente = coefs.length - 1

    coefs.forEach((coef, index) => {
      const exponente = gradoCociente - index

      if (coef !== 0) {
        // Agregar signo
        if (polinomio.length > 0) {
          polinomio += coef > 0 ? " + " : " - "
        } else if (coef < 0) {
          polinomio += "-"
        }

        // Agregar coeficiente (valor absoluto)
        const valorAbs = Math.abs(coef)
        if (exponente === 0 || valorAbs !== 1) {
          polinomio += valorAbs
        }

        // Agregar variable con exponente
        if (exponente > 0) {
          polinomio += "x"
          if (exponente > 1) {
            polinomio += `^${exponente}`
          }
        }
      }
    })

    return polinomio.length > 0 ? polinomio : "0"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Calculator className="mr-2 h-6 w-6" />
            Calculadora de Ruffini
          </h1>
          <div className="w-[100px]"></div> {/* Espaciador para centrar el título */}
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader>
            <CardTitle>División de Polinomios por Ruffini</CardTitle>
            <CardDescription className="text-white/70">
              Ingresa los coeficientes del polinomio y el divisor (x-a) para calcular el resultado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="grado">Grado del polinomio:</Label>
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
                      setResultado(null)
                    }}
                    className="max-w-[100px] bg-white/20 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">{generarInputsCoeficientes()}</div>

                <div className="flex items-center gap-2 mt-6">
                  <Label htmlFor="divisor" className="w-24 text-right">
                    Valor de a en (x-a):
                  </Label>
                  <Input
                    id="divisor"
                    type="number"
                    placeholder="0"
                    className="max-w-[120px] bg-white/20 text-white"
                    onChange={(e) => setDivisor(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={calcularRuffini} className="w-full bg-purple-600 hover:bg-purple-700">
                Calcular
              </Button>

              {resultado && (
                <div className="mt-6 p-4 bg-white/20 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Resultado:</h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Cociente:</strong> {mostrarPolinomio(resultado.cociente)}
                    </p>
                    <p>
                      <strong>Residuo:</strong> {resultado.residuo}
                    </p>
                    <p className="mt-4 text-white/80">
                      P(x) = (x - {divisor}) · ({mostrarPolinomio(resultado.cociente)}) + {resultado.residuo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


