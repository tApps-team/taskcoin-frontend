import { Wallet } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, useLoginMutation, useRegisterMutation } from '@/entities/session'
import { detectPlatform } from '@/shared/lib/platform'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/ui'

type Mode = 'login' | 'register'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const isValidEmail = (v: string) => EMAIL_RE.test(v.trim())

export function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [login, { isLoading: loggingIn }] = useLoginMutation()
  const [register, { isLoading: registering }] = useRegisterMutation()
  const isLoading = loggingIn || registering

  const emailInvalid = email.length > 0 && !isValidEmail(email)

  const submit = async () => {
    setError('')
    if (!isValidEmail(email)) {
      setError(t('auth.emailInvalid'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.passwordShort'))
      return
    }
    try {
      const res =
        mode === 'login'
          ? await login({ email, password }).unwrap()
          : await register({
              email,
              password,
              full_name: name || undefined,
              platform: detectPlatform(),
            }).unwrap()
      dispatch(setCredentials(res))
      navigate('/app')
    } catch (e) {
      const detail = (e as { data?: { detail?: string } })?.data?.detail
      setError(detail || t('auth.invalidCredentials'))
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center">
          <Wallet className="size-12 mb-1 text-brand-teal animate-float" />
          <CardTitle className="text-2xl text-gradient">{t('auth.loginTitle')}</CardTitle>
          <p className="text-muted-foreground">{t('auth.loginSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <Button variant={mode === 'login' ? 'default' : 'secondary'} onClick={() => setMode('login')}>
              {t('auth.signIn')}
            </Button>
            <Button variant={mode === 'register' ? 'default' : 'secondary'} onClick={() => setMode('register')}>
              {t('auth.signUp')}
            </Button>
          </div>

          <div className="space-y-3">
            {mode === 'register' && (
              <Input
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <div>
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {emailInvalid && (
                <p className="text-destructive text-xs mt-1">{t('auth.emailInvalid')}</p>
              )}
            </div>
            <Input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && email && password && submit()}
            />
            <Button
              variant="teal"
              className="w-full"
              disabled={isLoading || !isValidEmail(email) || password.length < 6}
              onClick={submit}
            >
              {mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
            </Button>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
