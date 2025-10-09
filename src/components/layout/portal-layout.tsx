'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface PortalLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
  }
  className?: string
  onLogout?: () => void
}

export function PortalLayout({ children, user, className, onLogout }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-pink-50">
      {/* Header */}
      <Header user={user} onLogout={onLogout} />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className={cn("flex-1", className)}>
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}