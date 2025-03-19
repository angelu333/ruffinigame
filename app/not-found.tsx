import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">Página no encontrada</h2>
      <p className="text-lg mb-8">Lo sentimos, la página que buscas no existe.</p>
      <Link
        href="/"
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
      >
        Volver al inicio
      </Link>
    </div>
  );
}