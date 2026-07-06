import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { Button } from './components/ui/Button';
import { LogoutIcon } from './components/ui/Icons';
import { LoginPage } from './pages/Login';
import { ExplorePage } from './pages/Explore';
import { DetailPage } from './pages/Detail';
import { BookmarksPage } from './pages/Bookmarks';
import { SearchesPage } from './pages/Searches';

function Private({ children }: { children: React.ReactNode }) {
  const { authed } = useAuth();
  return authed ? <>{children}</> : <Navigate to="/login" replace />;
}

function Nav() {
  const { authed, logout } = useAuth();
  if (!authed) return null;
  // NavLink sets aria-current="page" on the active route for free.
  return (
    <nav className="nav" aria-label="Navegación principal">
      <NavLink to="/" end>
        Explorar
      </NavLink>
      <NavLink to="/bookmarks">Guardadas</NavLink>
      <NavLink to="/searches">Búsquedas</NavLink>
      <span className="spacer" />
      <Button variant="ghost" icon={<LogoutIcon />} onClick={logout}>
        Cerrar sesión
      </Button>
    </nav>
  );
}

export function App() {
  return (
    <AuthProvider>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Nav />
      <main id="contenido" className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Private><ExplorePage /></Private>} />
          <Route path="/tenders/:uid" element={<Private><DetailPage /></Private>} />
          <Route path="/bookmarks" element={<Private><BookmarksPage /></Private>} />
          <Route path="/searches" element={<Private><SearchesPage /></Private>} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
