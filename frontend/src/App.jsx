import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

// pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PendingTasks from './pages/PendingTasks';
import CompletedTasks from './pages/CompletedTasks';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';

// layout
import Layout from './components/layout/Layout';

// a simple wrapper that redirects to login if user is not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // still checking token, show nothing
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // not logged in, go to login
  if (!user) return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <Routes>
            {/* public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* protected routes - wrapped in sidebar layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="pending" element={<PendingTasks />} />
              <Route path="completed" element={<CompletedTasks />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

