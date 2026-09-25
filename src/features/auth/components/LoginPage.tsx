import { useState, type FormEvent } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      // Deliberately vague: saying which half was wrong tells a stranger which e-mails exist.
      if (signInError) setError(signInError.status ? 'Forkert e-mail eller adgangskode.' : 'Kunne ikke nå login-tjenesten. Prøv igen.');
    } catch {
      setError('Kunne ikke nå login-tjenesten. Prøv igen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="safe-x flex min-h-dvh flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Engestofte Gods</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Bryllupsbooking</h1>
        <p className="mt-2 text-ink-muted">Log ind med din arbejds-e-mail.</p>

        {!isSupabaseConfigured ? (
          <Alert tone="danger" title="Login er ikke sat op" className="mt-8">
            VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY mangler i denne build.
          </Alert>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <Field
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Adgangskode"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Skjul adgangskode' : 'Vis adgangskode'}
                  aria-pressed={showPassword}
                  className="grid size-11 cursor-pointer place-items-center rounded-control text-ink-muted hover:text-ink"
                >
                  {showPassword ? <EyeSlash className="size-5" /> : <Eye className="size-5" />}
                </button>
              }
            />
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" loading={busy} disabled={!email || !password} className="w-full">
              Log ind
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
