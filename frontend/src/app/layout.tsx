import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Système de Gestion Hospitalière',
  description: 'Plateforme de gestion hospitalière avec intelligence artificielle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xl font-bold text-gray-800">HospitalAI</span>
                  </div>
                  <div className="hidden md:ml-6 md:flex md:space-x-8">
                    <a href="/" className="inline-flex items-center px-1 pt-1 text-gray-900">
                      Accueil
                    </a>
                    <a href="/patients" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                      Patients
                    </a>
                    <a href="/appointments" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                      Rendez-vous
                    </a>
                    <a href="/medical-records" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                      Dossiers Médicaux
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
