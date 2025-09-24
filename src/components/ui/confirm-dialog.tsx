'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

interface ConfirmContextType {
  confirm: (props: Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'>) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialogProps | null>(null)

  const confirm = (props: Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...props,
        onConfirm: () => {
          setDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setDialog(null)
          resolve(false)
        }
      })
    })
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && <ConfirmDialog {...dialog} />}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          titleColor: 'text-red-800'
        }
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          titleColor: 'text-yellow-800'
        }
      default:
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          titleColor: 'text-blue-800'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start space-x-4 mb-4">
          <span className="text-2xl">{styles.icon}</span>
          <div className="flex-1">
            <h3 className={cn("text-lg font-semibold mb-2", styles.titleColor)}>
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-md font-medium transition-colors',
              styles.confirmButton
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}