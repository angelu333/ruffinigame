import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-background text-foreground font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-3xl font-bold text-center text-foreground">Bienvenido a la Calculadora Ruffini</h1>
        <p className="text-lg text-center text-foreground/80">Una herramienta simple y eficiente para resolver polinomios</p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-primary-foreground gap-2 hover:opacity-90 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/calculadora"
          >
            Ir a la Calculadora
          </a>
          <a
            className="rounded-full border border-solid border-primary/20 transition-colors flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/quiz"
          >
            Practicar Quiz
          </a>
        </div>
      </main>
    </div>
  );
}
