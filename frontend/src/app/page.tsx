import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-800">Cadastro Integrantes Fanfarra</h1>
      <p className="mt-4 text-xl text-gray-600">Bem-vindo ao sistema de gestão.</p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Acessar Sistema
        </Link>
      </div>
    </main>
  )
}
