'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BasicConfirmProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
}

interface RichConfirmProps {
  type: 'approve' | 'reject'
  title: string
  candidato: string
  etapa: string
  actions: string[]
  warning?: string
}

type ConfirmProps = BasicConfirmProps | RichConfirmProps

interface ConfirmContextType {
  confirm: (props: ConfirmProps) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmProps | null>(null)
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null)

  const confirm = (props: ConfirmProps): Promise<boolean> => {
    return new Promise((res) => {
      setDialog(props)
      setResolve(() => res)
    })
  }

  const handleConfirm = () => {
    if (resolve) resolve(true)
    setDialog(null)
    setResolve(null)
  }

  const handleCancel = () => {
    if (resolve) resolve(false)
    setDialog(null)
    setResolve(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          {'type' in dialog ? (
            <RichConfirmDialog
              {...dialog}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <BasicConfirmDialog
              {...dialog}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

// Rich Confirm Dialog (para aprovação/reprovação de candidatos)
function RichConfirmDialog({
  type,
  title,
  candidato,
  etapa,
  actions,
  warning,
  onConfirm,
  onCancel
}: RichConfirmProps & { onConfirm: () => void; onCancel: () => void }) {
  const isApprove = type === 'approve'

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className={cn(
        "px-6 py-4 rounded-t-xl",
        isApprove
          ? "bg-gradient-to-r from-green-500 to-emerald-600"
          : "bg-gradient-to-r from-red-500 to-rose-600"
      )}>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {isApprove ? '✅' : '⚠️'} {title}
        </h2>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Candidato Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div>
            <span className="text-sm font-semibold text-gray-700">Candidato:</span>
            <p className="text-base font-medium text-gray-900">{candidato}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">Etapa atual:</span>
            <p className="text-base font-medium text-gray-900">{etapa}</p>
          </div>
        </div>

        {/* Actions */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Esta ação irá:</p>
          <ul className="space-y-1.5">
            {actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className={cn(
                  "mt-0.5",
                  isApprove ? "text-green-600" : "text-red-600"
                )}>
                  •
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning */}
        {warning && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
            <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <span>⚠️</span>
              {warning}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors min-w-[100px]"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors min-w-[140px]",
            isApprove
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {isApprove ? 'Confirmar Aprovação' : 'Confirmar Reprovação'}
        </button>
      </div>
    </div>
  )
}

// Basic Confirm Dialog (para confirmações simples)
function BasicConfirmDialog({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  onConfirm,
  onCancel
}: BasicConfirmProps & { onConfirm: () => void; onCancel: () => void }) {
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
      case 'success':
        return {
          icon: '✅',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          titleColor: 'text-green-800'
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
    <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
      <div className="flex items-start space-x-4 mb-4">
        <span className="text-2xl">{styles.icon}</span>
        <div className="flex-1">
          <h3 className={cn("text-lg font-semibold mb-2", styles.titleColor)}>
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
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
  )
}
