import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main"><Outlet /></main>
    </div>
  )
}

function Guard({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index           element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics"    element={<Analytics />} />
            <Route path="profile"      element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" toastOptions={{
        style: { background:'var(--card)', color:'var(--text)', border:'1px solid var(--bd2)', borderRadius:10, fontSize:14 },
        success: { iconTheme:{ primary:'var(--green)', secondary:'var(--bg)' } },
        error:   { iconTheme:{ primary:'var(--red)',   secondary:'var(--bg)' } },
      }} />
    </AuthProvider>
  )
}

export default App
