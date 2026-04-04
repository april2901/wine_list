import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import FriendsSidebar from './components/FriendsSidebar'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PublicCellar from './pages/PublicCellar'

function App() {
  return (
    <Router>
      <AuthProvider>
        <FriendsSidebar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/:username" element={<PublicCellar />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
