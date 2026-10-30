import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

export function Spinner() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
      <Loader2 className="animate-spin" />
      <span>{t('common.loading')}</span>
    </div>
  )
}

export function EmptyState({
  emoji = '🪙',
  text,
  children,
}: {
  emoji?: string
  text: string
  // Somewhere to say *why* it is empty, and offer the fix. An empty screen
  // that explains nothing is how a VPN user concludes there is no work.
  children?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-5xl mb-3 opacity-80">{emoji}</div>
      <p>{text}</p>
      {children && <div className="mt-5 flex flex-col items-center gap-3">{children}</div>}
    </div>
  )
}

// Convenience wrapper around shadcn Dialog with the app's simple modal API.
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={title ? '' : 'sr-only'}>{title || 'Просмотр'}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
