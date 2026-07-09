import { Coins } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setCredentials, useDevLoginMutation } from '@/entities/session'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/ui'

const TEST_USERS = ['user1@taskcoin.local', 'user2@taskcoin.local', 'user3@taskcoin.local']

export function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [devLogin, { isLoading }] = useDevLoginMutation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const login = async (value: string) => {
    setError('')
    try {
      const res = await devLogin({ email: value }).unwrap()
      dispatch(setCredentials(res))
      navigate('/app')
    } catch {
      setError(t('auth.invalidCredentials'))
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center">
          <Coins className="size-12 mb-1 text-brand-teal animate-float" />
          <CardTitle className="text-2xl text-gradient">{t('auth.loginTitle')}</CardTitle>
          <p className="text-muted-foreground">{t('auth.loginSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full mb-1 opacity-60" disabled title={t('auth.googleSoon')}>
            {t('auth.googleButton')}
          </Button>
          <p className="text-xs text-muted-foreground text-center mb-5">{t('auth.googleSoon')}</p>

          <div className="border-t border-white/10 pt-4">
            <h2 className="font-semibold">{t('auth.devLoginTitle')}</h2>
            <p className="text-sm text-muted-foreground mb-3">{t('auth.devLoginHint')}</p>

            <div className="space-y-2">
              {TEST_USERS.map((u) => (
                <Button key={u} variant="teal" className="w-full" disabled={isLoading} onClick={() => login(u)}>
                  {t('auth.loginAs')} {u}
                </Button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input placeholder="email@taskcoin.local" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button disabled={isLoading || !email} onClick={() => login(email)}>
                {t('auth.signIn')}
              </Button>
            </div>

            {error && <p className="text-destructive text-sm mt-3">{error}</p>}
          </div>

          <div className="text-center mt-6">
            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-brand-teal">
              {t('auth.adminLogin')} →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
