'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  FileText, 
  ClipboardList,
  Settings
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    title: "Painel",
    href: "/candidato",
    icon: Home,
    description: "Visão geral do portal"
  },
  {
    title: "Vagas Disponíveis",
    href: "/candidato/vagas",
    icon: FileText,
    description: "Explore oportunidades"
  },
  {
    title: "Meus Processos",
    href: "/candidato/candidaturas",
    icon: ClipboardList,
    description: "Acompanhe suas candidaturas"
  },
]

const bottomItems = [
  {
    title: "Configurações",
    href: "/candidato/perfil",
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "flex h-full w-64 flex-col bg-white border-r border-neutral-200",
      className
    )}>
      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 p-6">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-cosmic-soft text-violet-700 border border-violet-200"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive 
                    ? "text-violet-600" 
                    : "text-neutral-400 group-hover:text-neutral-600"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className={cn(
                    "text-xs",
                    isActive 
                      ? "text-violet-600/70" 
                      : "text-neutral-400 group-hover:text-neutral-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-neutral-200 p-6 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-cosmic-soft text-violet-700"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5",
                isActive 
                  ? "text-violet-600" 
                  : "text-neutral-400 group-hover:text-neutral-600"
              )} />
              {item.title}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-6">
        <div className="rounded-lg bg-gradient-cosmic-soft p-4 border border-violet-200">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cosmic">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">AutoU</p>
              <p className="text-xs text-violet-600">Portal do Candidato</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}