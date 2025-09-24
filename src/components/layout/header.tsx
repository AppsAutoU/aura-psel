'use client'

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { User, LogOut, Settings } from "lucide-react"

interface HeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  className?: string
  onLogout?: () => void
}

export function Header({ user, className, onLogout }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-all duration-300",
      className
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cosmic">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-heading-3 font-bold">
            <span className="text-gradient-cosmic">Auto</span>
            <span className="text-neutral-900">U</span>
          </span>
        </Link>


        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-body-small font-medium text-neutral-900">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-cosmic text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Settings */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/candidato/perfil">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>

              {/* Logout */}
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidato/auth/login">Entrar</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/candidato/auth/signup">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}