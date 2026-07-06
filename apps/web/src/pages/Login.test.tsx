import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth';
import { LoginPage } from './Login';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  it('renders login and toggles to register', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
    fireEvent.click(screen.getByText(/Regístrate/));
    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeTruthy();
  });
});
