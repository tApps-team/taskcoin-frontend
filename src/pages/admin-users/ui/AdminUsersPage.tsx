import { ChevronLeft, ChevronRight, Coins, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminDeleteUserMutation, useAdminGetUsersQuery, type User } from '@/entities/user'
import { BalanceModal, CreateUserModal, EditUserModal } from '@/features/manage-users'
import {
  Badge,
  Button,
  Card,
  CoinAmount,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

const PAGE = 20

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const { data, isLoading } = useAdminGetUsersQuery({ search: search || undefined, limit: PAGE, offset })

  const [creating, setCreating] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [balanceUser, setBalanceUser] = useState<User | null>(null)
  const [deleteUser] = useAdminDeleteUserMutation()

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.users.title')}</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus /> {t('admin.users.create')}
        </Button>
      </div>

      <Input
        className="max-w-sm mb-4"
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setOffset(0)
        }}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>{t('admin.users.name')}</TableHead>
                <TableHead>{t('admin.users.role')}</TableHead>
                <TableHead>{t('admin.users.balance')}</TableHead>
                <TableHead></TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.full_name || '—'}</TableCell>
                  <TableCell>
                    {u.role === 'super_admin' ? t('admin.users.roleAdmin') : t('admin.users.roleUser')}
                  </TableCell>
                  <TableCell>
                    <CoinAmount value={u.balance} className="text-brand-teal" />
                  </TableCell>
                  <TableCell>{u.is_blocked && <Badge variant="destructive">blocked</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => setEditUser(u)}>
                        {t('common.edit')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setBalanceUser(u)} title={t('admin.users.adjustBalance')}>
                        <Coins />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirm(t('admin.users.confirmDelete')) && deleteUser(u.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {data && data.total > PAGE && (
        <div className="flex items-center gap-3 mt-4">
          <Button size="icon" variant="secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>
            <ChevronLeft />
          </Button>
          <span className="text-muted-foreground text-sm">
            {offset + 1}–{Math.min(offset + PAGE, data.total)} / {data.total}
          </span>
          <Button size="icon" variant="secondary" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)}>
            <ChevronRight />
          </Button>
        </div>
      )}

      {creating && <CreateUserModal onClose={() => setCreating(false)} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
      {balanceUser && <BalanceModal user={balanceUser} onClose={() => setBalanceUser(null)} />}
    </div>
  )
}
