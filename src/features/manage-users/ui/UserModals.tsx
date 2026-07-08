import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminAdjustBalanceMutation,
  useAdminCreateUserMutation,
  useAdminUpdateUserMutation,
  type User,
} from '@/entities/user'
import { formatCoins } from '@/shared/lib/format'
import { Button, Input, Label, Modal, SimpleSelect } from '@/shared/ui'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  )
}

function roleOptions(t: (k: string) => string) {
  return [
    { value: 'user', label: t('admin.users.roleUser') },
    { value: 'super_admin', label: t('admin.users.roleAdmin') },
  ]
}

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const [create, { isLoading }] = useAdminCreateUserMutation()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('user')
  const [balance, setBalance] = useState('0')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    try {
      await create({ email, full_name: name || null, role, balance, password: password || null }).unwrap()
      onClose()
    } catch (e: unknown) {
      setError((e as { data?: { detail?: string } })?.data?.detail || t('common.error'))
    }
  }

  return (
    <Modal title={t('admin.users.create')} onClose={onClose}>
      <div className="space-y-3">
        <Field label={t('admin.users.email')}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t('admin.users.name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('admin.users.role')}>
          <SimpleSelect value={role} onValueChange={setRole} options={roleOptions(t)} />
        </Field>
        <Field label={t('admin.users.balance')}>
          <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </Field>
        <Field label={t('admin.users.password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button className="w-full" onClick={submit} disabled={isLoading || !email}>
          {t('common.create')}
        </Button>
      </div>
    </Modal>
  )
}

export function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { t } = useTranslation()
  const [update, { isLoading }] = useAdminUpdateUserMutation()
  const [name, setName] = useState(user.full_name || '')
  const [role, setRole] = useState<string>(user.role)
  const [blocked, setBlocked] = useState(user.is_blocked)

  const submit = async () => {
    await update({ id: user.id, body: { full_name: name || null, role, is_blocked: blocked } })
    onClose()
  }

  return (
    <Modal title={t('admin.users.edit')} onClose={onClose}>
      <div className="space-y-3">
        <div className="text-muted-foreground text-sm">{user.email}</div>
        <Field label={t('admin.users.name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('admin.users.role')}>
          <SimpleSelect value={role} onValueChange={setRole} options={roleOptions(t)} />
        </Field>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-brand-violet size-4"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
          />
          {t('admin.users.blocked')}
        </label>
        <Button className="w-full" onClick={submit} disabled={isLoading}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}

export function BalanceModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { t } = useTranslation()
  const [adjust, { isLoading }] = useAdminAdjustBalanceMutation()
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    try {
      await adjust({ id: user.id, amount, comment: comment || undefined }).unwrap()
      onClose()
    } catch (e: unknown) {
      setError((e as { data?: { detail?: string } })?.data?.detail || t('common.error'))
    }
  }

  return (
    <Modal title={t('admin.users.adjustBalance')} onClose={onClose}>
      <div className="space-y-3">
        <div className="text-muted-foreground text-sm">
          {user.email} · {formatCoins(user.balance)}
        </div>
        <Field label={t('admin.users.adjustAmount')}>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="+100 / -50" />
        </Field>
        <Field label={t('admin.users.adjustComment')}>
          <Input value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button className="w-full" onClick={submit} disabled={isLoading || !amount}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
