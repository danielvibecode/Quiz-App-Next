import DashboardLayout from '@/components/ui/DashboardLayout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Willkommen zurück! Hier ist eine Übersicht deiner Volleyball-Quiz Aktivitäten.
          </p>
        </div>

        {/* MVP: Simple Trainer-focused Dashboard */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions for Trainers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">+</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Neue Situation
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Erstellen
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <a
                  href="/situations/create"
                  className="text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  Situation erstellen →
                </a>
              </div>
            </div>
          </div>

          {/* Manage Situations */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Situationen
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Verwalten
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <a
                  href="/situations"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Situationen verwalten →
                </a>
              </div>
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Team
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Übersicht
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <a
                  href="/team"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Team verwalten →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MVP: Simple Welcome Message */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              🏐 Volleyball Quiz App - MVP Version
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Diese Version fokussiert sich auf den Trainer-Workflow. Du kannst Situationen erstellen, 
                verwalten und dein Team organisieren.
              </p>
            </div>
            <div className="mt-5">
              <div className="rounded-md bg-orange-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Nächste Schritte
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Erstelle deine erste Volleyball-Situation</li>
                        <li>Lade Bilder oder Videos hoch</li>
                        <li>Verwalte deine bestehenden Situationen</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
