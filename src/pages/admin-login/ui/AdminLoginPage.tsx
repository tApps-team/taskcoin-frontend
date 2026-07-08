import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setCredentials, useAdminLoginMutation } from '@/entities/session'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/ui'

export function AdminLoginPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [adminLogin, { isLoading }] = useAdminLoginMutation()
  const [email, setEmail] = useState('admin@taskcoin.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await adminLogin({ email, password }).unwrap()
      dispatch(setCredentials(res))
      navigate('/admin/dashboard')
    } catch {
      setError(t('auth.invalidCredentials'))
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-gradient">{t('admin.title')}</CardTitle>
          <p className="text-muted-foreground">{t('auth.adminLogin')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label className="mb-1 block">{t('auth.email')}</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">{t('auth.password')}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin12345"
              />
            </div>
            <Button className="w-full" disabled={isLoading}>
              {t('auth.signIn')}
            </Button>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </form>

          <div className="text-center mt-5">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-brand-teal">
              ← {t('auth.loginTitle')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
