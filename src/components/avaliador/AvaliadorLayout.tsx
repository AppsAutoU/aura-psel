'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAvaliadorAuth } from '@/hooks/useAvaliadorAuth'
import { cn } from '@/lib/utils'

interface AvaliadorLayoutProps {
  children: React.ReactNode
}

export function AvaliadorLayout({ children }: AvaliadorLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAvaliadorAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigation = [
    {
      name: 'Cases Práticos A Avaliar',
      href: '/avaliador',
      icon: '📋',
      current: pathname === '/avaliador'
    },
    {
      name: 'Candidatos Na Entrevista Técnica',
      href: '/avaliador/entrevistas',
      icon: '🎯',
      current: pathname.startsWith('/avaliador/entrevistas')
    },
    {
      name: 'Histórico de Candidatos',
      href: '/avaliador/historico',
      icon: '📚',
      current: pathname.startsWith('/avaliador/historico')
    },
    {
      name: 'Configurações',
      href: '/avaliador/configuracoes',
      icon: '⚙️',
      current: pathname.startsWith('/avaliador/configuracoes')
    }
  ]

  const handleSignOut = async () => {
    await logout()
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-sm font-bold text-gray-900">AutoU</h2>
                <p className="text-xs text-gray-500">Portal Avaliador</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                item.current
                  ? "bg-purple-50 text-purple-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
              {user?.nome?.[0]?.toUpperCase() || 'L'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nome || 'Lucca'}
                </p>
                <p className="text-xs text-gray-500">Avaliador</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Portal Avaliador'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {user?.nome || 'Lucca Scarpa'}
              </span>
              <span className="text-xs text-gray-500">Administrador</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
