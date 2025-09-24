'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAdminAuth()
  const { addToast } = useToast()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigation = [
    {
      name: 'Visão Geral',
      href: '/admin',
      icon: '📊',
      current: pathname === '/admin'
    },
    {
      name: 'Vagas',
      href: '/admin/vagas',
      icon: '💼',
      current: pathname.startsWith('/admin/vagas')
    },
    {
      name: 'Candidatos',
      href: '/admin/candidatos',
      icon: '👥',
      current: pathname.startsWith('/admin/candidatos')
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: '👤',
      current: pathname.startsWith('/admin/usuarios')
    },
    {
      name: 'Configurações',
      href: '/admin/configuracoes',
      icon: '⚙️',
      current: pathname.startsWith('/admin/configuracoes')
    }
  ]

  const handleSignOut = async () => {
    addToast({
      type: 'info',
      title: 'Saindo...',
      message: 'Você será redirecionado para a página de login.'
    })
    setTimeout(() => {
      logout()
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className={cn(
        'bg-white border-r border-gray-200/60 transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AutoU</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                item.current
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200/60 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.nome?.charAt(0) || 'A'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nome?.split(' ')[0] || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === 'admin' ? 'Administrador' : 'Avaliador'}
                </p>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <button
              onClick={handleSignOut}
              className="w-full mt-3 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Sair
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-16 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <span className={cn(
            'text-xs text-gray-600 transition-transform duration-300',
            sidebarCollapsed ? 'rotate-180' : ''
          )}>
            ←
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200/60 h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {navigation.find(item => item.current)?.name || 'Dashboard'}
            </h2>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.nome || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.departamento || 'Recursos Humanos'}
              </p>
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