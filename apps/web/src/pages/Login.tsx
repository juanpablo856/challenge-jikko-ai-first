import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Status } from '../components/ui/Status';

export function LoginPage() {
  const { authed, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (authed) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await (mode === 'login' ? login(email, password) : register(email, password));
    } catch {
      // Generic message — never reveal whether the account exists (no user enumeration).
      setError('No pudimos verificar tus datos. Revísalos e intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const heading = mode === 'login' ? 'Iniciar sesión' : 'Registrarse';

  return (
    <form className="card auth-form" onSubmit={submit} noValidate>
      <h1 className="page-title">{heading}</h1>

      <Field
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        label="Contraseña"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        hint="Mínimo 8 caracteres."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />

      {error && <Status tone="error">{error}</Status>}

      <Button type="submit" disabled={busy}>
        {busy ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
      </Button>
      <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </form>
  );
}
