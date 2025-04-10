export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Système de Gestion Hospitalière avec IA
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Une plateforme moderne pour la gestion hospitalière intégrant l'intelligence artificielle
              pour améliorer la qualité des soins et l'efficacité opérationnelle.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/patients"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Gérer les patients
              </a>
              <a href="/appointments" className="text-sm font-semibold leading-6 text-gray-900">
                Voir les rendez-vous <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
