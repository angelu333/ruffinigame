import Link from "next/link"
import { Calculator, GamepadIcon as GameController } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-pulse">Rufini</h1>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Explora el mundo de los polinomios con nuestra calculadora avanzada y pon a prueba tus conocimientos con
          divertidos desafíos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Link href="/calculadora" className="w-full">
            <div className="group h-full bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center">
              <div className="bg-purple-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Calculadora</h2>
              <p className="text-white/80">
                Resuelve ecuaciones polinómicas de cualquier grado utilizando el método de Ruffini.
              </p>
            </div>
          </Link>

          <Link href="/quiz" className="w-full">
            <div className="group h-full bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center">
              <div className="bg-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <GameController className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Quiz</h2>
              <p className="text-white/80">
                Pon a prueba tus conocimientos con ejercicios interactivos de diferentes niveles de dificultad.
              </p>
            </div>
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-white/70 text-sm">
        © {new Date().getFullYear()} Rufini - Todos los derechos reservados
      </footer>
    </div>
  )
}


