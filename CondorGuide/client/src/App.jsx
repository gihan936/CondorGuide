import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './components/Home';
import Map from './components/Map';
import AvailableClassrooms from './components/AvailableClassrooms';
import LoginPage from './components/LoginPage'; 
import SignUpPage from './components/SignUp';
import ReportIssue from './components/ReportIssue';

import { ThemeContext } from './context/ThemeContext';
import SuperAdminDashboard from './components/SuperAdminHome';
import ProtectedRoute from './components/ProtectedRoute'

const AppWrapper = () => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const hideHeaderFooter = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className={theme === 'dark' ? 'bg-dark text-light min-vh-100 d-flex flex-column' : 'bg-light text-dark min-vh-100 d-flex flex-column'}>
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/map" element={<Map />} />
          <Route path="/issues" element={<ReportIssue />} />
          <Route path="/classrooms" element={<AvailableClassrooms />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
