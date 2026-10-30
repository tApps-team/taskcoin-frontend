import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGetGeoQuery } from '@/entities/geo'
import { setCredentials, useLoginMutation, useRegisterMutation } from '@/entities/session'
import { countryOptions } from '@/shared/lib/countries'
import { getErrorMessage } from '@/shared/lib/errors'
import { detectPlatform } from '@/shared/lib/platform'
import { safeInternalPath } from '@/shared/lib/redirect'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  LogoMark,
  SimpleSelect,
} from '@/shared/ui'

type Mode = 'login' | 'register'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const isValidEmail = (v: string) => EMAIL_RE.test(v.trim())

export function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Arriving on an invite link means they came to sign up, not to sign in.
  const referralCode = (params.get('ref') || '').trim().toUpperCase()
  // Where they were headed before the guard sent them here, or which tab the
  // promo page's button meant to open.
  const next = safeInternalPath(params.get('next'))
  const [mode, setMode] = useState<Mode>(
    referralCode || params.get('mode') === 'register' ? 'register' : 'login',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [login, { isLoading: loggingIn }] = useLoginMutation()
  const [register, { isLoading: registering }] = useRegisterMutation()
  const isLoading = loggingIn || registering

  // The country is what decides which tasks exist for this person, and they
  // may well be on a VPN — so it is shown here, pre-filled from the IP, and
  // saved on every sign-in rather than guessed once at registration.
  const { data: geo } = useGetGeoQuery()
  const [country, setCountry] = useState('')
  const [countryTouched, setCountryTouched] = useState(false)
  useEffect(() => {
    // Adopt the detected country once, and never over an edit they made.
    if (!countryTouched && geo?.country) setCountry(geo.country)
  }, [geo?.country, countryTouched])

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
          ? await login({ email, password, country: country || undefined }).unwrap()
          : await register({
              email,
              password,
              full_name: name || undefined,
              platform: detectPlatform(),
              country: country || undefined,
              referral_code: referralCode || undefined,
            }).unwrap()
      dispatch(setCredentials(res))
      navigate(res.user.role === 'super_admin' ? '/admin' : (next ?? '/app'))
    } catch (e) {
      setError(getErrorMessage(e, t('auth.invalidCredentials')))
    }
  }

  return (
    <div className="min-h-[var(--app-min-h)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center">
          <LogoMark className="size-14 mb-2 animate-float" />
          <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
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
            {referralCode && mode === 'register' && (
              <div className="rounded-xl bg-brand-green/10 ring-1 ring-brand-green/25 px-3 py-2 text-xs text-brand-green">
                {t('auth.invitedBy', { code: referralCode })}
              </div>
            )}
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
            <div>
              <Label>{t('auth.country')}</Label>
              <SimpleSelect
                className="w-full"
                value={country}
                onValueChange={(v) => {
                  setCountryTouched(true)
                  setCountry(v)
                }}
                placeholder={t('auth.countryPlaceholder')}
                options={countryOptions(country)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {geo && !geo.detected ? t('auth.countryUndetected') : t('auth.countryHint')}
              </p>
            </div>
            <Button
              variant="action"
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
