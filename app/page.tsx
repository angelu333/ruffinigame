import Image from "next/image";
import { Calculator, BrainCog } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <main className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Bienvenido a la Calculadora Ruffini
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Una herramienta simple y eficiente para resolver polinomios
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            <a
              href="/calculadora"
              className="group relative overflow-hidden rounded-xl p-8 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center space-y-4 border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 dark:group-hover:bg-blue-500 transition-colors duration-300">
                <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                Ir a la Calculadora
              </span>
            </a>

            <a
              href="/quiz"
              className="group relative overflow-hidden rounded-xl p-8 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center space-y-4 border border-gray-100 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400"
            >
              <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-500 dark:group-hover:bg-purple-500 transition-colors duration-300">
                <BrainCog className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300">
                Practicar Quiz
              </span>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
