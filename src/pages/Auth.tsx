import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/context/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { safeRedirect } from '@/lib/redirect'

type Mode = 'signin' | 'signup'

const MIN_PASSWORD_LENGTH = 6

export default function Auth() {
  const { user, isLoading, signIn, signUp } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))
  const mode: Mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)

  useDocumentTitle(mode === 'signup' ? 'Sign Up' : 'Sign In')

  // Signed in (now or already): continue to wherever they were headed
  if (!isLoading && user) return <Navigate to={redirect} replace />

  const switchMode = (next: Mode) => {
    setError(null)
    setConfirmationSentTo(null)
    const params = new URLSearchParams(searchParams)
    if (next === 'signup') params.set('mode', 'signup')
    else params.delete('mode')
    setSearchParams(params, { replace: true })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (mode === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        // AuthContext picks up the new session and the <Navigate> above redirects
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password, redirect)
        if (needsConfirmation) setConfirmationSentTo(email.trim())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-abyss">
      {/* Deep-ocean light: soft blue and cyan glows behind the card */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute -bottom-48 -left-24 size-[32rem] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-[28rem] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-abyss)_75%)]" />
      </div>

      <header className="relative px-4 py-5 sm:px-8 lg:px-12">
        <Link to="/" aria-label="Atlantis home" className="inline-block rounded-md">
          <Logo size="md" />
        </Link>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-black/60 p-8 shadow-2xl shadow-blue-950/50 ring-1 ring-blue-400/20 backdrop-blur-xl sm:p-10">
          {confirmationSentTo ? (
            <div className="space-y-4 text-center" role="status">
              <MailCheck className="mx-auto size-12 text-cyan-400" />
              <h1 className="text-2xl font-bold">Check your inbox</h1>
              <p className="text-white/70">
                We sent a confirmation link to <span className="text-white">{confirmationSentTo}</span>. Open it to
                finish creating your account.
              </p>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div role="tablist" aria-label="Account" className="mb-8 grid grid-cols-2 rounded-lg bg-slate-900/80 p-1 ring-1 ring-white/5">
                {(['signin', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => switchMode(m)}
                    className={`rounded-md py-2 text-sm font-semibold transition ${
                      mode === m
                        ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.45)]'
                        : 'text-white/60 hover:text-blue-300'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Dive in'}
              </h1>
              <p className="mt-1.5 text-sm text-white/60">
                {mode === 'signin'
                  ? 'Sign in to pick up where you left off.'
                  : 'Create an account to save titles to My List.'}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate={false}>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-blue-500/20 bg-slate-900/80 px-4 py-3 text-white placeholder-white/30 transition outline-none hover:border-blue-500/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-white/80">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD_LENGTH} characters` : '••••••••'}
                      className="w-full rounded-lg border border-blue-500/20 bg-slate-900/80 py-3 pr-12 pl-4 text-white placeholder-white/30 transition outline-none hover:border-blue-500/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-white/50 transition hover:text-blue-300"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="size-5 animate-spin" />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-white/60">
                {mode === 'signin' ? 'New to Atlantis?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="font-semibold text-blue-400 transition hover:text-cyan-300"
                >
                  {mode === 'signin' ? 'Sign up now' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
