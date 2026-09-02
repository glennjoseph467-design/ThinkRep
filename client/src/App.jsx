import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Portfolio from './pages/Portfolio';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <>
      {user && <Navbar />}
      <div style={{ paddingBottom: user ? '72px' : '0' }}>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
