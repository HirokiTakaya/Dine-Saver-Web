// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Logins/AuthContext';

// Screens Import
import AuthScreen from './Logins/AuthScreen';
import LoginScreen from './Logins/LoginScreen';
import SignUp from './Logins/SignUp';
import BottomTabNavigator from './Main/BottomTabNavigator';
import Footer from './Main/Footer'; // Footerのインポート
import './i18n'; // i18n.ts のインポート

/**
 * AppInner Component
 * Handles routing based on authentication state.
 */
function AppInner() {
  const { user } = useAuth(); // Access the authenticated user from AuthContext

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <Routes>
          {user ? (
            // Routes accessible only to authenticated users
            <>
              <Route path="/home" element={<BottomTabNavigator />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          ) : (
            // Routes accessible to unauthenticated users
            <>
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          )}
        </Routes>
      </Router>

      {/* Footer is always displayed */}
      <Footer />
    </div>
  );
}

/**
 * App Component
 * Wraps the application with AuthProvider to provide authentication context.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
